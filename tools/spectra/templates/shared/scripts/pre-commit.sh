#!/bin/sh
# pre-commit hook: コード変更時のトレーサビリティチェック
#
# 有効化: ln -sf ../../.spectra/scripts/pre-commit.sh .git/hooks/pre-commit
#
# 以下の処理を実行する:
#   1. trace-mapping.yaml の自動修復（fix-trace-mapping.py）
#   2. @impl タグの完全性チェック（check-impl-completeness.py）
#   3. トレーサビリティ完全性チェック（check-trace-completeness.py）
#   4. コード変更のスナップショット更新（check_drift.py --snapshot）

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo '.')"
SCRIPT_DIR="$PROJECT_ROOT/.spectra/scripts"
EXIT_CODE=0

echo "🔍 [pre-commit] Running traceability checks..."

# ── 0. 自動修復: fix-trace-mapping.py ──
if [ -f "$SCRIPT_DIR/fix-trace-mapping.py" ] && [ -f "$PROJECT_ROOT/.spectra/trace-mapping.yaml" ]; then
    echo "  → Auto-fixing trace-mapping.yaml..."
    python3 "$SCRIPT_DIR/fix-trace-mapping.py" --project-dir "$PROJECT_ROOT" 2>&1 | sed 's/^/    /'
fi

# ── 1. @impl タグの完全性チェック ──
if [ -f "$SCRIPT_DIR/check-impl-completeness.py" ] && [ -f "$PROJECT_ROOT/.spectra/trace-mapping.yaml" ]; then
    echo "  → Checking @impl tag completeness..."
    python3 "$SCRIPT_DIR/check-impl-completeness.py" --project-dir "$PROJECT_ROOT"
    if [ $? -ne 0 ]; then
        echo "  ❌ @impl tag check FAILED"
        EXIT_CODE=1
    else
        echo "  ✅ @impl tags OK"
    fi
elif [ -f "$SCRIPT_DIR/extract_tags.py" ]; then
    # フォールバック: extract_tags.py で基本チェック
    python3 "$SCRIPT_DIR/extract_tags.py" --check-missing --dir "$PROJECT_ROOT" 2>/dev/null && \
        echo "  ✅ @impl tags OK (legacy check)" || true
fi

# ── 2. トレーサビリティ完全性チェック ──
if [ -f "$SCRIPT_DIR/check-trace-completeness.py" ] && [ -f "$PROJECT_ROOT/.spectra/trace-mapping.yaml" ]; then
    echo "  → Running traceability completeness check..."
    python3 "$SCRIPT_DIR/check-trace-completeness.py" --project-dir "$PROJECT_ROOT"
    if [ $? -ne 0 ]; then
        echo "  ❌ Traceability check FAILED"
        EXIT_CODE=1
    else
        echo "  ✅ Traceability checks passed"
    fi
fi

# ── 3. スナップショット更新（コード変更を記録） ──
if [ -f "$SCRIPT_DIR/check_drift.py" ] && [ -f "$PROJECT_ROOT/.spectra/trace-mapping.yaml" ]; then
    echo "  → Updating traceability snapshot..."
    python3 "$SCRIPT_DIR/check_drift.py" --snapshot 2>/dev/null || true
fi

# ── 終了 ──
if [ $EXIT_CODE -ne 0 ]; then
    echo ""
    echo "❌ [pre-commit] Traceability gate BLOCKED the commit."
    echo "   Fix the issues above, or use --no-verify to bypass."
fi

exit $EXIT_CODE
