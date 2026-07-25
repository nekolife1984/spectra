#!/bin/sh
# pre-push hook: プッシュ前にトレーサビリティ完全性チェックを実行
#
# 有効化: ln -sf ../../.spectra/scripts/pre-push.sh .git/hooks/pre-push
#
# ci-check.sh（3段階ゲート + 自動修復）を実行し、いずれか失敗でプッシュを中断する。
#
# スキップ: SKIP_TRACE=1 git push

if [ "${SKIP_TRACE:-0}" = "1" ]; then
    exit 0
fi

PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo '.')"
SCRIPT_DIR="$PROJECT_ROOT/.spectra/scripts"

# 自動修復
if [ -f "$SCRIPT_DIR/fix-trace-mapping.py" ]; then
    python3 "$SCRIPT_DIR/fix-trace-mapping.py" --project-dir "$PROJECT_ROOT" 2>/dev/null || true
fi

if [ -f "$SCRIPT_DIR/ci-check.sh" ]; then
    exec sh "$SCRIPT_DIR/ci-check.sh"
elif [ -f "$SCRIPT_DIR/check-trace-completeness.py" ]; then
    echo "[trace] Running trace completeness check..."
    python3 "$SCRIPT_DIR/check-trace-completeness.py"
fi
