# spectra

**Spec** → **Trace** → **Spectra**。\
近代的な spec-driven SDLC ツールチェイン。双方向トレーサビリティを備えています。

[cc-sdd](https://github.com/gotalab/cc-sdd) — _spec-as-contract_（仕様＝契約）という哲学を基盤に、**code-review-graph (CRG)** 統合でパワーアップ。`@impl` / `@verifies` / `@spec` タグを通じて要件→設計→実装→テストをトレースし、影響範囲分析、仕様ドリフト検出、境界検証を実現します。17言語・8つのAIコーディングエージェントに対応。

### 🏷️ 名前の由来

**Spectra** = **Spec** + **Trace**。\
プリズムが光をスペクトルに分けるように、spectra は開発を要件・設計・コード・テストというトレーサブルな層に分解し、それらの繋がりを照らし出します。この名前にはプロジェクトの出自 — **cc**（Contract Code）、**sdd**（Spec-Driven Development）、**graph**（code-review-graph） — を一つのアイデンティティに昇華する意味も込められています。

## クイックスタート

### macOS / Linux
```bash
bash <(curl -s https://raw.githubusercontent.com/nekolife1984/spectra/main/scripts/quickstart.sh)
```

### Windows (PowerShell)
```powershell
Invoke-WebRequest -Uri https://raw.githubusercontent.com/nekolife1984/spectra/main/scripts/quickstart.ps1 -OutFile quickstart.ps1
.\quickstart.ps1
```

このスクリプトが以下を自動で行います:
1. spectra スキルのインストール（エージェント・言語を選択）
2. code-review-graph のインストールと MCP 設定
3. コードグラフの初回ビルド
4. `.trace-mapping.yaml` の初期化
5. pre-commit hook のセットアップ（コミット時にスナップショット自動更新）
6. 初回スナップショットの保存

## 個別セットアップ

```bash
# スキルのみ
npx github:nekolife1984/spectra

# CRG のみ（スキルインストール後）
bash .agents/scripts/setup-crg.sh --yes
```

## 特徴

### 20の spectra スキル
| フェーズ | スキル |
|---------|--------|
| 企画 | `spectra-discovery`, `spectra-steering` |
| 仕様定義 | `spectra-init`, `spectra-requirements`, `spectra-design`, `spectra-tasks` |
| 一括生成 | `spectra-batch`, `spectra-quick` |
| 実装 | `spectra-impl` |
| レビュー | `spectra-review`, `spectra-validate-design`, `spectra-validate-gap`, `spectra-validate-impl` |
| デバッグ | `spectra-debug` |
| 完了検証 | `spectra-verify-completion` |
| 進捗 | `spectra-status` |
| **CRG トレーサビリティ** | **`spectra-trace`**, **`spectra-impact`**, **`spectra-validate-boundary`** |

### CRG 対応スキル（20中15）
ほとんどのスキルが code-review-graph と連携し、コードグラフを活用した分析・検証を実行します:

| スキル | CRG 連携 |
|--------|---------|
| `spectra-discovery` | 既存拡張時に影響範囲を自動表示 |
| `spectra-design` | コードグラフ分析で設計を強化 |
| `spectra-tasks` | `_Boundary:_` を CRG で機械検証 |
| `spectra-init` | `.trace-mapping.yaml` スケルトン自動生成 |
| `spectra-batch` | `.trace-mapping.yaml` 一括生成 |
| `spectra-review` | CRG 強化された境界検証 |
| `spectra-impl` | `@impl` タグ自動スキャン + `.trace-mapping.yaml` 更新 |
| `spectra-validate-impl` | CRG フロー検証 |
| `spectra-debug` | CRG グラフ調査 |
| `spectra-verify-completion` | CRG アーキテクチャ整合性チェック |
| `spectra-validate-design` | 設計書コンポーネントの実在検証 |
| `spectra-validate-gap` | `@impl` タグ vs コードのギャップ検出 |
| `spectra-trace` | 仕様ID → コード影響トレース |
| `spectra-impact` | コード変更 → 仕様影響トレース |
| `spectra-validate-boundary` | `_Boundary:_` と CRG グラフの機械検証 |

### その他
- **8エージェント対応**: Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf, OpenCode, Antigravity
- **13言語対応**: `--lang` でテンプレートを選択可能
- **日本語テンプレート**: `--lang ja` で要件定義書・設計書・タスク計画を日本語で生成
- **pre-commit hook**: `setup-crg.sh` がコミット時のスナップショット自動更新を設定
- **CI/CD ゲート**: `python3 .agents/scripts/check_drift.py --diff --gate` で仕様ドリフトを自動検出

## ドキュメント

- [Package README (English)](./tools/cc-sdd/README.md)
- [Package README (日本語)](./tools/cc-sdd/README_ja.md)
- [Package README (繁體中文)](./tools/cc-sdd/README_zh-TW.md)
- [セットアップガイド](./.agents/scripts/README.md)

## ライセンス

MIT
