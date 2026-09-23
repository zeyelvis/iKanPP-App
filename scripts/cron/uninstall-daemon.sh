#!/bin/bash

PROJECT_DIR="/Users/zeyelvis/KVideo"
PLIST_DEST="$HOME/Library/LaunchAgents/com.ikanpp.seo.daemon.plist"

echo "========================================================"
echo "🛑 [iKanPP] 正在停止并卸载 SEO 自主闭环守护进程..."
echo "========================================================"

if launchctl list | grep -q "com.ikanpp.seo.daemon"; then
  launchctl unload "$PLIST_DEST" 2>/dev/null || true
  echo "✅ 已成功停止 launchd 守护任务！"
else
  echo "ℹ️ 守护任务未在运行。"
fi

if [ -f "$PLIST_DEST" ]; then
  rm -f "$PLIST_DEST"
  echo "🗑️ 已清理 LaunchAgents 配置文件。"
fi

echo "========================================================"
echo "🎉 卸载完成。若需重新启用，请执行: npm run seo:daemon:install"
echo "========================================================"
