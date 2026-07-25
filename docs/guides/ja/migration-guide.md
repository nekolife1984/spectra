# spectra マイグレーションガイド


> ⚠️ **本フォーク注記**: このガイドは **spectra** プロジェクト（`gotalab/cc-sdd` v3.0.2 からフォーク）の一部として保守されています。ツール名とコマンド例は spectra 名に更新済みです。`gotalab/cc-sdd` への PR リンクは歴史的参照として残しています。`npx cc-sdd@...` 形式の legacy コマンド例は書かれた当時のバージョンを反映しており、連続性のためにそのまま残しています。

> 📖 **English guide:** [Migration Guide](../migration-guide.md)

v1系（特に1.1.5）とv2.0.0は、**コマンドや agentic SDLC の基本思想は共通**であるものの、設計テンプレートやステアリング（steering）の構造が大幅に変更されている。このガイドでは、「v1.1.5をそのまま使い続ける」か、「非連続的なアップデートと割り切りv2へ移行する」かの選択肢を提示する。後者を選択した場合に、テンプレートとルール（rules）を用いて迅速にカスタマイズを行う手順を解説する。

---

## TL;DR – どちらを選ぶ？

| 目的 | 推奨アクション |
| --- | --- |
| 既存の1.x系ワークフローを維持したい | `npx cc-sdd@1.1.5` を明示的に指定し、旧バージョンのCLIを継続利用する。エージェント固有のプロンプトを直接編集する従来のスタイルを維持できるが、利用可能なコマンドは旧来の8つに限られる。 |
| 8種類のエージェントで共通のテンプレートや、調査（Research）と設計（Design）の分離といった新機能を利用したい | `npx github:nekolife1984/spectra`（v2.0.0相当）を再インストールし、`.spectra/settings/templates/*` と `rules/` のみをカスタマイズする。これにより、`validate-*` コマンド群を含む全11コマンドが利用可能になる。 |

> ⚠️ 1.x系と2.x系の `.spectra` ディレクトリ構成の混在は推奨されない。リポジトリやブランチ単位で、使用するバージョンをどちらか一方に固定すること。

### 変わらないもの

- 既存の `.spectra/specs/<feature>/` ディレクトリは、そのまま利用可能である。必要であれば、新しいテンプレートを用いて再生成すればよい。
- `.spectra/steering/` ディレクトリ（または単一の `steering.md` ファイル）の内容は、従来通りプロジェクトメモリ（Project Memory）として読み込まれる。
- 11 個のコマンド群（`spec-*`, `validate-*`, `steering*`）と、「仕様→設計→タスク→実装」という大まかな開発プロセスは共通である。主な変更点は、テンプレート内部が agentic かつ just-in-time な設計思想に基づいて刷新されたことにある。

---

## 1. spectra 1.1.5 を使い続ける (フォールバック)

1.1.5は `@latest` タグの対象外だが、バージョンを直接指定することで呼び出し可能である。

```bash
npx cc-sdd@1.1.5 --claude-code  # 例: Claude Code (旧フラグ名)
npx cc-sdd@1.1.5 --lang ja      # 旧来の言語オプション
```

- `.claude/commands/*` や `.cursor/prompts/*` といったエージェント固有のディレクトリを直接編集する、従来の運用を継続できる。
- エージェント固有のディレクトリ（例: `.claude/commands/*`）も、v1の構造がそのまま維持される。
- ただし、新機能は `@latest`（v2系）にのみ追加され、v1.1.5へのバックポートは行われない。
- `/spectra-validate-gap`、`/spectra-validate-design`、`/spectra-validate-impl` といった検証コマンドはv1.1.5には存在しない。これらの機能が必要な場合は、v2への移行が必須となる。

---

## 2. v2.0.0 へ進むメリット

> 基本的な流れ（仕様策定 → 設計 → タスク化 → 実装 + 検証）は不変である。**主な変更点は、カスタマイズの対象箇所と、生成される設計書の構造化の度合い**にある。

- **テンプレートとルールによる一元的なカスタマイズ**: コマンドのプロンプトを直接編集する必要はなくなり、`.spectra/settings/templates/` と `.spectra/settings/rules/` を修正するだけで、すべてのエージェントに設定が反映される。
- **仕様駆動開発（Spec-Driven Development）の一貫性向上**: `research.md` が調査ログ、`design.md` がレビュー可能な一次情報（要約、要件カバレッジ、参考文献、適切な粒度に調整されたコンポーネント定義など）として、それぞれの役割を明確に担う。
- **プロジェクトメモリとしてのステアリング**: `.spectra/steering/*.md` のように、ドメイン知識を複数のファイルに分割して体系的に管理できるようになった。
- **既存プロジェクト（Brownfield）への安全な機能追加**: `/spectra-validate-gap`、`validate-design`、`validate-impl` といった検証コマンドや、調査と設計の分離により、既存機能の追加・改修時の安全性が向上する。
- **v2で対応する8種類のエージェントで共通の体験**: Claude Code、Cursor、Codex CLI、Gemini CLI、GitHub Copilot、Qwen Code、OpenCode、Windsurfが同じ11個のコマンドを共有する。これにより、例えばClaudeとCursorを併用する場合でも、追加のテンプレート修正は不要である。Claude Code では、`spectra-quick` に Subagent を組み込む `--claude-agent` オプションも選択できる。

---

## 3. v2.0.0 への移行ステップ

1. **バックアップ**
   ```bash
   cp -r .spec .spec.backup
      cp -r .claude .claude.backup   # 利用中のエージェントに応じてバックアップ
   ```

2. **v2 をクリーンインストール（対話的オプションを活用）**
   ```bash
   npx github:nekolife1984/spectra                 # デフォルト (Claude Code)
   npx github:nekolife1984/spectra --cursor        # その他エージェント
   npx github:nekolife1984/spectra --claude-agent  # Subagents モード
   ```
   - インストーラがファイル群ごとに「上書き(overwrite)」「追記(append)」「保持(keep)」のいずれかを選択するよう尋ねる。既存のステアリング情報や仕様書を維持したい場合は “keep” を、差分を追加したい場合は “append” を選択できる。

3. **テンプレート／rules の再生成 & 差分マージ**
   - 新構成: `.spectra/settings/templates/` (中央集約) と `.spectra/settings/rules/`。
   - 旧バージョンでエージェント固有のプロンプトに直接記述していたロジックは、必要に応じて新しいテンプレートやルールファイル側へ移植すること。

4. **カスタムルールを移植**
   - `.spectra/settings/rules/*.md` にMarkdown形式でルールを記述すると、仕様、設計、タスク生成のすべてのプロセスでそのルールが参照される。
   - 従来、コマンドのプロンプトに直接記述していたガイドラインは、ルールファイルに集約することで、すべてのエージェント間で共有可能になる。

5. **Steering (Project Memory) を再構成**
   - `project-context.md` や `architecture.md` のように、情報を目的別にファイル分割し、AIが参照する一次情報として整備する。
   - 調査・設計フェーズのテンプレートもステアリング情報を参照するため、既存のメモや覚書はここへ移行することが望ましい。

6. **自動化スクリプトを更新**
   - CI/CDスクリプトなどは、すべて `npx github:nekolife1984/spectra` を基準とするように統一し、旧式の `@next` 指定は削除する。
   - 旧バージョンのCLIを直接実行していた箇所は、v2で提供される11個のコマンド (`spec-*`, `validate-*`, `steering*`) を使用するように置き換える。

---

## 4. 旧→新 カスタマイズ対応表

| v1.x で編集していた場所 | v2.0.0 での置き換え先 | ポイント |
| --- | --- | --- |
| `.claude/commands/spectra-design.prompt.md` など、エージェント固有のコマンドプロンプト | `.spectra/settings/templates/specs/design.md` | `.spectra/settings/templates/` に統一されたテンプレートを配置する。要約（Summary）や参考文献（Supporting References）が自動で出力されるようになる。 |
| `.claude/commands/<cmd>.prompt`, `.cursor/prompts/*` など | `.spectra/settings/rules/*.md` | プロンプトへの直接的な指示記述は非推奨。「〜すべきこと（DO）」「〜すべきでないこと（DO NOT）」といったルールをルールファイルに記述することで、全エージェントがその指示を共有する。 |
| `.spectra/steering/`（単一ファイルまたは複数ファイル） | `.spectra/steering/*.md` に原則やガイドラインを整理 | ディレクトリパスは同じだが、v2ではプロジェクトメモリとしての役割が強化され、複数ファイルへの分割が推奨される。 |
| `design.md` 内に直接記述していた調査メモ | `.spectra/specs/<feature>/research.md` と `Supporting References` セクション | 設計書（Design）はレビュー対象の成果物、調査ログ（Research）は補助的な記録として明確に分離し、設計書の可読性を保つ。 |

---

## 5. v2.x → v3.0

> v3.0 は全 `--*-skills` インストールに適用。Skills モードは8プラットフォームで利用可能: Claude Code, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, Antigravity。コマンドベースのエージェント（`--claude`, `--cursor` 等）は引き続き動作するが非推奨、将来削除予定。

| 領域 | v2.x | v3.0 |
| --- | --- | --- |
| スキル数 | 12-13 | **17** |
| `/spectra-discovery` | 基本的なアイデア整理 | **ルーティング/スコープ整理のエントリポイント**; `brief.md` を作成し、必要な場合のみ `roadmap.md` も書き出す |
| `/spectra-batch` | なし | 並列マルチスペック作成 + cross-spec レビュー |
| `/spectra-impl` | `spectra-impl`（単一パス） | 統合スキル（implementer + reviewer + debugger） |
| 失敗時デバッグ | なし | **Debug subagent** — フレッシュコンテキストで根本原因調査（最大2ラウンド） |
| 知見引き継ぎ | なし | **Implementation Notes** がタスク間で次の implementer に注入される |
| Skills 対応 | Claude Code, Codex | **8プラットフォーム**: Claude, Codex, Cursor, Copilot, Windsurf, OpenCode, Gemini CLI, Antigravity |
| TDD | 基本 TDD | **Feature Flag TDD**: RED → GREEN プロトコル |
| セッション永続化 | なし | **`brief.md`** がセッション間で永続化 |

### 主な移行手順

1. **再インストール**（お使いのプラットフォームの Skills モードで）:
   ```bash
   npx github:nekolife1984/spectra --claude-skills     # Claude Code（デフォルト）
   npx github:nekolife1984/spectra --codex-skills      # Codex
   npx github:nekolife1984/spectra --cursor-skills     # Cursor IDE
   npx github:nekolife1984/spectra --copilot-skills    # GitHub Copilot
   npx github:nekolife1984/spectra --windsurf-skills   # Windsurf IDE
   npx github:nekolife1984/spectra --opencode-skills   # OpenCode
   npx github:nekolife1984/spectra --gemini-skills     # Gemini CLI
   npx github:nekolife1984/spectra --antigravity       # Antigravity
   ```
2. **レガシーモードから移行** — `--claude`, `--cursor`, `--copilot`, `--windsurf`, `--opencode`, `--gemini` は非推奨。`--codex` はブロック済み。対応する `--*-skills` フラグを使用。
3. **`/spectra-discovery`** をエントリポイントとして使用 — `brief.md` + `roadmap.md` が下流スキルに引き継がれる。
4. **`/spectra-batch`** をマルチフィーチャー作業に使用。

---

## 6. FAQ / トラブルシューティング

**Q. v2で旧バージョンのテンプレートをそのまま使用したい**  
テンプレートファイルのコピーは可能だが、要件カバレッジ（Req Coverage）や参考文献（Supporting References）といったv2の構造化データが欠落するため、生成物の品質が低下する可能性がある。新テンプレートへ内容を移植する方が安全である。

**Q. v1.1.5とv2.0.0を同一リポジトリ内で切り替えて使用したい**  
`.spectra` ディレクトリの構成が両バージョンで異なるため、バージョンごとにブランチを分けるか、`.spectra` ディレクトリ自体を切り替えるスクリプトを用意する必要がある。

**Q. テンプレート更新後に最低限実行すべきコマンドは？**  
`/spectra-steering`、`/spectra-init`、`/spectra-design` の順に一度実行し、新しい書式の調査・設計・タスクファイルが生成されることを確認する。

---

## 7. まとめ

- **v1.1.5の継続利用者**: `npx cc-sdd@1.1.5` のようにバージョンを固定し、従来通りテンプレートやコマンドプロンプトを直接編集する。
- **v2.xの利用者**: Skills モード（`--*-skills`）への移行を推奨。レガシーコマンドモードは将来削除予定。
- **v3.0への移行者**: Skills モードで再インストールし、`/spectra-discovery` → `/spectra-batch` → `/spectra-impl` のワークフローを活用する。8プラットフォーム対応、デバッグ自動化、タスク間知見引き継ぎが利用可能。
