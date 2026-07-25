# Claude Code Subagents ワークフロー（spectra-quick 特化）


> ⚠️ **本フォーク注記**: このガイドは **spectra** プロジェクト（`gotalab/cc-sdd` v3.0.2 からフォーク）の一部として保守されています。ツール名とコマンド例は spectra 名に更新済みです。`gotalab/cc-sdd` への PR リンクは歴史的参照として残しています。`npx cc-sdd@...` 形式の legacy コマンド例は書かれた当時のバージョンを反映しており、連続性のためにそのまま残しています。

> 📖 **English guide:** [Claude Code Subagents Workflow](../claude-subagents.md)

> **対象**: このページはレガシーの **`--claude-agent` / `--claude-code-agent`** インストール先について解説する。`.claude/agents/spec/*.md` の静的 Subagent ファイルで `spectra-quick` を加速する仕組み。`--claude-skills`（あるいは他の `--*-skills` フラグ）でインストールして Skills モードの implementer / reviewer / debugger の dispatch 詳細を知りたい場合は、[スキルリファレンス](skill-reference.md) の「`/spectra-impl` の内部」「Skills モードと `--claude-agent` の比較」節を参照すること。

このガイドでは、`npx cc-sdd@latest --claude-agent`（または `--claude-code-agent`）で提供される **Claude Code Subagents** の中で、独自の制御ロジックを持つ `spectra-quick` コマンドに焦点を当てて解説する。その他の `/spectra-*` コマンドも同じ Subagent を再利用するが、動作は標準版と変わらないため、ここでの説明は省略する。

## インストールの確認

- `npx cc-sdd@latest --claude-agent --lang <言語コード>` を実行する。
- 展開されるファイルは以下の通りである。
  - `.claude/commands/spec/`: Spec/Steering/Validation 関連のコマンド（12個）
  - `.claude/agents/spec/`: 詳細分析用の Subagent 定義ファイル（9個）
  - `CLAUDE.md`: クイックスタートガイド

## spectra-quick による Subagent の連携フロー

`spectra-quick` は、`spectra-init`（インライン実装）、`spectra-requirements`、`spectra-design`、`spectra-tasks` の4つのフェーズを自動で連続実行するマクロコマンドである。この機能の実装は `tools/spectra/templates/agents/claude-code-agent/commands/spectra-quick.md` に定義されている。

### モード

- **インタラクティブモード（デフォルト）**: 各フェーズの完了後に実行を続けるか確認する。初回実行時や、複雑な機能開発に適している。
- **自動モード (`--auto`)**: TodoWrite で進捗 (4/4) を追跡しながら、確認なしで最後まで実行する。リスクの低い機能のドラフト作成に適している。

どちらのモードでも `/spectra-validate-gap` と `/spectra-validate-design` はスキップされる。完了時のメッセージで手動実行が推奨されるため、既存のプロジェクト（Brownfield）に機能追加する場合は、忘れずに追加実行すること。

### 各フェーズの動作

| フェーズ | 呼び出す Subagent | 主な処理 |
| --- | --- | --- |
| 1. 初期化 | インライン（Subagent なし） | `.spectra/specs/{feature}/` ディレクトリを作成し、テンプレートから `spec.json` と `requirements.md` の骨子を生成する。TodoWrite の最初の項目を完了ステータスに更新する。 |
| 2. Requirements | `agents/spectra-requirements.md` | `/spectra-requirements {feature}` を実行し、ユーザーとの質疑応答を通じて要件の草案を作成する。自動モードの場合、Subagent が提示する「次のステップ」を無視して、直ちにフェーズ3へ進む。 |
| 3. Design | `agents/spectra-design.md` | `/spectra-design {feature} -y` を呼び出し、必要に応じて `research.md` と `design.md` を更新する。TodoWrite の進捗が 3/4 完了になる。 |
| 4. Tasks | `agents/spectra-tasks.md` | `/spectra-tasks {feature} -y` を実行し、`tasks.md` を出力する。このタスクリストには、要件カバレッジと並列実行可能性を示す `(P)` ラベルが含まれる。完了後、TodoWrite が 4/4 となり、サマリーが表示される。 |

自動モードでは、Subagent が示すガイダンスに関わらず、自動的に次のフェーズへ進む。一方、インタラクティブモードでは、各フェーズの間に「要件定義へ進みますか？」「設計へ進みますか？」といった確認が入る。

### 出力とスキップされるゲート

出力されるファイル:
- `spec.json`
- `requirements.md`
- `design.md`（必要に応じて `research.md` 更新）
- `tasks.md`（並列実行可能性を示す `(P)` ラベル付き）

スキップされるもの:
- `/spectra-validate-gap`
- `/spectra-validate-design`
- `/spectra-validate-impl`

### Subagent の手動実行

特定のフェーズのみを再実行したい場合は、Claude Code のチャットで `@agents-spectra-design` や `@agents-spectra-tasks` のようにメンションすることで、対応する Subagent を直接呼び出すことができる。このとき、インストール時に作成された `.claude/agents/spec/*.md` 内のプロンプトが使用される。

## 推奨ユースケース

1. `npx cc-sdd@latest --claude-agent --lang <code>` を実行して、Subagent をワークスペースに展開する。
2. `/spectra-steering`（または必要に応じて `/spectra-steering-custom`）を実行し、プロジェクトの記憶（Project Memory）を最新の状態にしてから作業を開始する。
3. `spectra-quick <feature> [--auto]` を使って仕様のドラフトを生成し、`requirements.md`、`design.md`、`tasks.md` の内容を確認する。
4. 変更が既存システムに影響を与える可能性がある場合は、`/spectra-validate-gap` と `/spectra-validate-design` を必ず追加で実行すること。
5. 仕様が承認されたら、`/spectra-impl` や `/spectra-status` を使って実装と進捗管理を進める。

## Subagent のカスタマイズ

1. **テンプレートとルールの更新**: `{{SPECTRA_DIR}}/settings/templates/*.md` や `{{SPECTRA_DIR}}/settings/rules/*.md` に共通のチェックリストなどを記載することで、Subagent を含むすべてのエージェントが同じ基本情報を参照するようになる。
2. **Subagent プロンプトの編集**: `.claude/agents/spec/*.md` ファイルを編集し、独自のヒューリスティック（優先度付け、リスク分類、テスト方針など）をプロンプトに追加する。
3. **コマンドによる起動条件の制御**: `.claude/commands/spec/*.md` ファイル内の `call_subagent` セクションを調整することで、Subagent を呼び出すタイミングを細かく制御できる。
4. **プロンプトの簡潔化**: Task Tool の表示領域は限られているため、長文の指示はテンプレートやルールファイルに記述し、Subagent のプロンプトは要点に絞ることで、動作が安定しやすくなる。

## トラブルシューティング

| 症状 | 原因 | 解決策 |
| --- | --- | --- |
| Subagent が呼び出されない | `--claude-agent` を使ってインストールしていない、または `.claude/agents/spec/` ディレクトリが存在しない。 | `npx cc-sdd@latest --claude-agent` で再インストールし、ディレクトリ構成を確認すること。 |
| 解析範囲が広すぎる | ファイル検索パターンが広すぎる（例: `*.*`）。 | 該当する Subagent のプロンプトを編集し、検索パターンをより具体的に絞り込むこと。 |
| 出力がテンプレートと一致しない | Subagent が古いテンプレートを参照している。 | `{{SPECTRA_DIR}}/settings/templates` を最新の内容に更新し、Subagent がそれを正しく参照しているか確認すること。 |

## 関連リンク

- [スキルリファレンス](skill-reference.md) — Skills モードのワークフロー、`/spectra-impl` の内部 dispatch、Skills モードと `--claude-agent` の比較
- [Spec-Driven Development ワークフロー](spec-driven.md)
- [Docs README](../README.md)
- [Project README — 対応エージェント](../../README.md#supported-agents)
