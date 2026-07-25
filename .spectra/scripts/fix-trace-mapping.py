#!/usr/bin/env python3
"""
fix-trace-mapping.py — trace-mapping.yaml 自動修復ツール

検出したトレーサビリティの問題を機械的に修正する。
check-trace-completeness.py の後処理として、または pre-commit フックで
自動実行することを想定。

Usage:
  # プロジェクトルートで実行（.spectra/trace-mapping.yaml を修正）
  python3 .spectra/scripts/fix-trace-mapping.py

  # ドライラン（何も変更せずレポートのみ）
  python3 .spectra/scripts/fix-trace-mapping.py --dry-run

  # プロジェクトディレクトリを明示指定
  python3 .spectra/scripts/fix-trace-mapping.py --project-dir /path/to/project

  # 特定の修正のみ実行
  python3 .spectra/scripts/fix-trace-mapping.py --fix impl_tags,code_files,management_entries

Exit code: 0 = all fixable issues resolved, 1 = unresolved issues remain after fixes
"""

import argparse
import re
import sys
from pathlib import Path
from copy import deepcopy

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML is required. Install with: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


# ── 定数 ──
TRACE_MAPPING_PATH = Path(".spectra/trace-mapping.yaml")

# 除外ディレクトリ（check-trace-completeness.py と統一）
EXCLUDE_DIRS = {".git", "node_modules", ".venv", "__pycache__", "dist",
                "build", ".artgraph", ".trace", ".spectra"}

# ソースコード拡張子
EXTENSIONS = {".py", ".ts", ".tsx", ".js", ".jsx", ".go", ".rs", ".rb",
              ".java", ".kt", ".swift", ".c", ".h", ".cpp", ".hpp", ".cs"}

# @impl タグ正規表現
IMPL_TAG_RE = re.compile(r'(?:#|//)\s*@impl\s+(.+?)(?:$|#|//)', re.MULTILINE)

# 管理エントリとして識別するIDパターン
MANAGEMENT_ID_PATTERNS = re.compile(r'^(trace-root|tasks-root|placeholder)$')


def load_mapping(project_dir: Path) -> list[dict]:
    """trace-mapping.yaml を読み込む。"""
    path = project_dir / TRACE_MAPPING_PATH
    if not path.exists():
        print(f"⚠  trace-mapping.yaml not found at {path}")
        return []
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data.get("mappings", []) if data else []


def save_mapping(project_dir: Path, mappings: list[dict]) -> None:
    """trace-mapping.yaml を書き込む。"""
    path = project_dir / TRACE_MAPPING_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump({"mappings": mappings}, f, default_flow_style=False, allow_unicode=True)
    print(f"✅ trace-mapping.yaml updated: {path}")


def scan_code_impl_tags(project_dir: Path) -> dict[str, set[Path]]:
    """
    プロジェクト内の全 @impl タグをスキャン。
    戻り値: { impl_id: {filepath, ...} }
    """
    impl_map: dict[str, set[Path]] = {}
    for ext in EXTENSIONS:
        for fpath in sorted(project_dir.rglob(f"*{ext}")):
            if any(part.startswith("__") or part in EXCLUDE_DIRS for part in fpath.parts):
                continue
            try:
                content = fpath.read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            for match in IMPL_TAG_RE.finditer(content):
                ids_str = match.group(1).strip()
                for single_id in [i.strip() for i in ids_str.replace("，", ",").split(",")]:
                    if single_id:
                        impl_map.setdefault(single_id, set()).add(fpath.resolve())
    return impl_map


def is_management_entry(entry: dict) -> bool:
    """管理用エントリ（管理IDパターンに一致するか）"""
    eid = entry.get("id", "")
    return bool(MANAGEMENT_ID_PATTERNS.match(eid))


# ── 各修正関数 ──

def fix_management_entry_impl_tags(mappings: list[dict], dry_run: bool) -> list[str]:
    """
    Fix 1: 管理エントリ (trace-root, tasks-root, placeholder 等) から
    @impl タグを外す。
    """
    changes = []
    for entry in mappings:
        if not is_management_entry(entry):
            continue
        tags = entry.get("tags", [])
        if "@impl" in tags:
            if not dry_run:
                entry["tags"] = [t for t in tags if t != "@impl"]
            changes.append(
                f"  🟢 {entry['id']}: @impl タグを除去（管理エントリは @impl 非推奨）"
            )
    return changes


def fix_missing_files_in_code(mappings: list[dict], code_impls: dict, dry_run: bool) -> list[str]:
    """
    Fix 2: @impl エントリの code.files に、対応する @impl タグを持つ
    ファイルが不足している場合に補完する。
    """
    changes = []
    for entry in mappings:
        eid = entry.get("id", "")
        tags = entry.get("tags", [])
        if "@impl" not in tags or not eid:
            continue

        # このエントリの @impl に対応するコードファイル
        expected_files = code_impls.get(eid, set())
        if not expected_files:
            continue

        current_files = set()
        for pattern in entry.get("code", {}).get("files", []):
            p = Path(pattern)
            if p.exists() and p.resolve():
                current_files.add(p.resolve())

        # 不足ファイルを検出
        missing = expected_files - current_files
        if not missing:
            continue

        if not dry_run:
            for fpath in sorted(missing):
                rel = fpath.relative_to(fpath.anchor)  # fallback
                try:
                    # プロジェクトルートからの相対パスに変換
                    for ancestor in fpath.parents:
                        if (ancestor / ".spectra").exists() or (ancestor / ".git").exists():
                            rel = fpath.relative_to(ancestor)
                            break
                except ValueError:
                    rel = fpath.name
                entry.setdefault("code", {}).setdefault("files", []).append(str(rel))

        for fpath in sorted(missing):
            try:
                for ancestor in fpath.parents:
                    if (ancestor / ".spectra").exists() or (ancestor / ".git").exists():
                        rel = fpath.relative_to(ancestor)
                        break
                else:
                    rel = fpath.name
            except ValueError:
                rel = fpath.name
            changes.append(f"  ➕ {eid}: code.files に {rel} を追加")

    return changes


def promote_spec_entries_to_impl(mappings: list[dict], code_impls: dict, project_dir: Path, dry_run: bool) -> list[str]:
    """
    Fix 3: @spec 専用エントリで、コードに @impl タグがある場合に
    @impl タグと code.files を追加する。
    ただし管理エントリは対象外。
    """
    changes = []
    impl_ids_in_code = set(code_impls.keys())

    for entry in mappings:
        eid = entry.get("id", "")
        tags = entry.get("tags", [])
        if not eid or is_management_entry(entry):
            continue
        if "@impl" in tags:
            continue  # 既に @impl あり
        if eid not in impl_ids_in_code:
            continue  # コードに対応する @impl なし

        # @spec のみエントリで、コードに @impl がある → 昇格
        if not dry_run:
            entry.setdefault("tags", []).append("@impl")

        # code.files も補完
        expected_files = code_impls[eid]
        if not dry_run:
            for fpath in sorted(expected_files):
                try:
                    for ancestor in fpath.parents:
                        if (ancestor / ".spectra").exists() or (ancestor / ".git").exists():
                            rel = fpath.relative_to(ancestor)
                            break
                    else:
                        rel = fpath.name
                except ValueError:
                    rel = fpath.name
                entry.setdefault("code", {}).setdefault("files", []).append(str(rel))

        changes.append(
            f"  🔄 {eid}: @spec → @spec + @impl に昇格（コードに @impl タグあり）"
        )

    return changes


def remove_stale_impl_entries(mappings: list[dict], code_impls: dict, dry_run: bool) -> list[str]:
    """
    Fix 4: @impl エントリなのにコードに @impl タグがまったくないエントリから
    @impl タグを除去する（管理エントリは別処理）。
    """
    changes = []
    for entry in mappings:
        eid = entry.get("id", "")
        tags = entry.get("tags", [])
        if "@impl" not in tags or not eid:
            continue
        if is_management_entry(entry):
            continue
        if eid in code_impls:
            continue  # コードにタグあり → 問題なし

        if not dry_run:
            entry["tags"] = [t for t in tags if t != "@impl"]
        changes.append(
            f"  🗑  {eid}: @impl タグを除去（対応するコードの @impl タグなし）"
        )

    return changes


def remove_empty_code_files(mappings: list[dict], dry_run: bool) -> list[str]:
    """
    Fix 5: @impl エントリの code.files が空リストのままで、
    コードにも対応する @impl がない場合に削除。code キー自体は維持。
    """
    changes = []
    for entry in mappings:
        tags = entry.get("tags", [])
        if "@impl" not in tags:
            continue
        cfiles = entry.get("code", {}).get("files", [])
        if cfiles:  # 空じゃなければOK
            continue
        # 空リストのまま → 削除
        if not dry_run:
            if "code" in entry:
                del entry["code"]
        changes.append(f"  ✂️  {entry.get('id', '?')}: 空の code.files を削除")

    return changes


# ── メイン ──

def main():
    parser = argparse.ArgumentParser(
        description="fix-trace-mapping.py — trace-mapping.yaml 自動修復ツール"
    )
    parser.add_argument("--project-dir", default=".",
                        help="プロジェクトルートディレクトリ（デフォルト: カレント）")
    parser.add_argument("--dry-run", action="store_true",
                        help="ドライランモード（変更せずレポートのみ）")
    parser.add_argument("--fix", default="all",
                        help="修正カテゴリ（カンマ区切り）: "
                             "management_entries, code_files, spec_promotion, "
                             "stale_impl, empty_files, all")
    args = parser.parse_args()

    project_dir = Path(args.project_dir).resolve()
    dry_run = args.dry_run

    # 許可する修正カテゴリ
    fix_set = set(args.fix.split(","))

    print("🔧 fix-trace-mapping.py")
    print(f"   プロジェクト: {project_dir}")
    print(f"   モード: {'DRY RUN (no changes)' if dry_run else 'LIVE'}")
    print()

    # マッピング読み込み
    mappings = load_mapping(project_dir)
    if not mappings:
        print("⚠  No trace-mapping entries to fix.")
        return

    original = deepcopy(mappings)

    # コードの @impl タグをスキャン
    code_impls = scan_code_impl_tags(project_dir)
    print(f"📊 コード上の @impl タグ: {len(code_impls)} 種類")
    for impl_id, files in sorted(code_impls.items()):
        print(f"   {impl_id}: {len(files)} file(s)")
    print()

    all_changes: list[str] = []

    # Fix 1: 管理エントリの @impl 除去
    if "all" in fix_set or "management_entries" in fix_set:
        changes = fix_management_entry_impl_tags(mappings, dry_run)
        all_changes.extend(changes)
        if changes:
            print(f"📋 管理エントリの @impl 整理 ({len(changes)} 件):")
            for c in changes:
                print(c)
            print()

    # Fix 2: code.files の不足補完
    if "all" in fix_set or "code_files" in fix_set:
        changes = fix_missing_files_in_code(mappings, code_impls, dry_run)
        all_changes.extend(changes)
        if changes:
            print(f"📋 code.files 補完 ({len(changes)} 件):")
            for c in changes:
                print(c)
            print()

    # Fix 3: @spec → @spec + @impl 昇格
    if "all" in fix_set or "spec_promotion" in fix_set:
        changes = promote_spec_entries_to_impl(mappings, code_impls, project_dir, dry_run)
        all_changes.extend(changes)
        if changes:
            print(f"📋 @spec → @impl 昇格 ({len(changes)} 件):")
            for c in changes:
                print(c)
            print()

    # Fix 4: スタブ @impl 除去
    if "all" in fix_set or "stale_impl" in fix_set:
        changes = remove_stale_impl_entries(mappings, code_impls, dry_run)
        all_changes.extend(changes)
        if changes:
            print(f"📋 スタブ @impl 除去 ({len(changes)} 件):")
            for c in changes:
                print(c)
            print()

    # Fix 5: 空 code.files 削除
    if "all" in fix_set or "empty_files" in fix_set:
        changes = remove_empty_code_files(mappings, dry_run)
        all_changes.extend(changes)
        if changes:
            print(f"📋 空 code.files 削除 ({len(changes)} 件):")
            for c in changes:
                print(c)
            print()

    # 結果
    if not all_changes:
        print("✅ 修正すべき問題はありません。")
        return

    if dry_run:
        print(f"🔍 DRY RUN: {len(all_changes)} 件の修正を検出しましたが、"
              f"何も変更していません。")
        print("   --dry-run を外して再実行すると修正が適用されます。")
        return

    # 実際の変更を保存
    if mappings != original:
        save_mapping(project_dir, mappings)
        print(f"✅ {len(all_changes)} 件の修正を適用しました。")
    else:
        print("⚠  修正は検出されましたが、マッピングに変更はありません。")


if __name__ == "__main__":
    main()
