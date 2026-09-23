#!/bin/bash
set -e

PROJECT_DIR="/Users/zeyelvis/KVideo"
PLIST_SRC="$PROJECT_DIR/scripts/cron/com.ikanpp.seo.daemon.plist"
PLIST_DEST="$HOME/Library/LaunchAgents/com.ikanpp.seo.daemon.plist"

echo "========================================================"
echo "🚀 [iKanPP] 正在部署 macOS LaunchAgent SEO 自主闭环守护..."
echo "========================================================"

mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$HOME/Library/LaunchAgents"

if launchctl list | grep -q "com.ikanpp.seo.daemon"; then
  echo "🔄 检测到已有守护进程在运行，正在优雅注销..."
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
  sleep 1
fi

echo "📋 复制守护配置到 LaunchAgents 目录..."
cp -f "$PLIST_SRC" "$PLIST_DEST"

echo "⚡ 激活 launchd 守护任务..."
launchctl load "$PLIST_DEST"

sleep 1

if launchctl list | grep -q "com.ikanpp.seo.daemon"; then
  echo "✅ 守护进程已成功安装并启动！"
  echo "🕒 执行周期: 每 2 小时自动巡检 (7200秒)"
  echo "📄 实时日志: $PROJECT_DIR/logs/seo-daemon.log"
  echo "--------------------------------------------------------"
  echo "💡 查看状态: npm run seo:daemon:status"
  echo "💡 实时日志: npm run seo:daemon:logs"
  echo "💡 停止卸载: npm run seo:daemon:uninstall"
  echo "========================================================"
else
  echo "⚠️ 守护进程安装后状态异常，请检查 launchctl list。"
fi
