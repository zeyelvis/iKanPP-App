#!/usr/bin/env bash
# ==============================================================================
# iKanPP 本地 AI 穿透守护脚本 (方案 A)
# 作用：保持本地 8080 Codex 进程与 Cloudflare 隧道常驻，保障云端 Actions 随时调用
# ==============================================================================

set -e

PORT=8080
CLOUDFLARED="/opt/homebrew/bin/cloudflared"

if [ ! -f "$CLOUDFLARED" ]; then
  CLOUDFLARED=$(which cloudflared || true)
fi

if [ -z "$CLOUDFLARED" ]; then
  echo "❌ 未检测到 cloudflared，请先安装: brew install cloudflared"
  exit 1
fi

# 1. 检查本地 8080 Codex 代理是否在运行
if ! nc -z 127.0.0.1 $PORT 2>/dev/null; then
  echo "⚠️ 警告: 本地端口 $PORT 未处于监听状态，请确保本地 Codex / AI 服务已启动！"
else
  echo "✅ 本地 AI 服务 (127.0.0.1:$PORT) 正常监听中"
fi

# 2. 检查是否已有 cloudflared 隧道在运行
RUNNING_PID=$(pgrep -f "cloudflared tunnel.*http://127.0.0.1:$PORT" || true)
if [ -n "$RUNNING_PID" ]; then
  echo "ℹ️ Cloudflare 隧道已经在后台运行中 (PID: $RUNNING_PID)"
  exit 0
fi

echo "🚀 正在启动 Cloudflare 隧道..."
exec "$CLOUDFLARED" tunnel --url "http://127.0.0.1:$PORT"
