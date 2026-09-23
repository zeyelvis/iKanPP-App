#!/bin/bash

PROJECT_DIR="/Users/zeyelvis/KVideo"
LOG_FILE="$PROJECT_DIR/logs/seo-daemon.log"
ERR_FILE="$PROJECT_DIR/logs/seo-daemon-error.log"

echo "========================================================"
echo "📊 [iKanPP] SEO 自主闭环守护进程状态"
echo "========================================================"

DAEMON_INFO=$(launchctl list | grep "com.ikanpp.seo.daemon" || true)

if [ -n "$DAEMON_INFO" ]; then
  echo "🟢 守护状态: 已加载并处于激活监听中"
  echo "   launchd 状态行: $DAEMON_INFO"
else
  echo "🔴 守护状态: 未运行 (未加载到 launchd)"
fi

echo "--------------------------------------------------------"
echo "📜 最近标准输出日志 (最后 20 行):"
if [ -f "$LOG_FILE" ]; then
  tail -n 20 "$LOG_FILE"
else
  echo "   (暂无日志记录，等待首次触发)"
fi

if [ -f "$ERR_FILE" ] && [ -s "$ERR_FILE" ]; then
  echo "--------------------------------------------------------"
  echo "⚠️ 最近错误输出日志:"
  tail -n 10 "$ERR_FILE"
fi

echo "========================================================"
