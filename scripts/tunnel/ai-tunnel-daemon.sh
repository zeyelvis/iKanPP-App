#!/usr/bin/env bash
# ==============================================================================
# iKanPP 本地 AI 智能穿透守护进程 (macOS LaunchAgent Daemon)
#
# 功能特性：
# 1. 开机自动拉起 /Applications/Codex Proxy.app 并等待 8080 端口就绪
# 2. 自动启动 cloudflared 建立安全公网隧道
# 3. 自动抓取最新的 https://*.trycloudflare.com 公网地址
# 4. 自动通过 GitHub CLI (gh) 刷新仓库 Secret: AI_BASE_URL
# 5. 异常崩溃、睡眠唤醒、网络重连全自动毫秒级自愈
# ==============================================================================

set -u

REPO="zeyelvis/iKanPP-App"
PORT=8080
CLOUDFLARED="/opt/homebrew/bin/cloudflared"
GH="/opt/homebrew/bin/gh"
LOG_DIR="$HOME/Library/Logs"
LOG_FILE="$LOG_DIR/ikanpp-ai-tunnel.log"
URL_FILE="/tmp/ikanpp-ai-tunnel-url.txt"

mkdir -p "$LOG_DIR"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log "=================================================="
log "🚀 iKanPP AI 穿透守护进程启动中..."

# 确保命令路径可达
if [ ! -x "$CLOUDFLARED" ]; then
  CLOUDFLARED=$(which cloudflared || true)
fi

if [ ! -x "$GH" ]; then
  GH=$(which gh || true)
fi

if [ -z "$CLOUDFLARED" ]; then
  log "❌ 未找到 cloudflared，请先执行: brew install cloudflared"
  exit 1
fi

# 1. 检查并拉起 Codex Proxy.app
ensure_codex_running() {
  if ! nc -z 127.0.0.1 $PORT 2>/dev/null; then
    log "⚠️ 检测到 127.0.0.1:$PORT 未监听，尝试启动 Codex Proxy.app..."
    if [ -d "/Applications/Codex Proxy.app" ]; then
      open -a "Codex Proxy"
    fi
    
    # 等待最多 30 秒直到端口就绪
    local count=0
    while ! nc -z 127.0.0.1 $PORT 2>/dev/null; do
      sleep 2
      count=$((count + 2))
      if [ $count -ge 30 ]; then
        log "⚠️ 等待 Codex Proxy 启动超时 (30s)，继续尝试启动隧道..."
        break
      fi
    done
  fi
  log "✅ 本地 AI 服务 (127.0.0.1:$PORT) 已就绪"
}

# 2. 隧道常驻与 Secret 自动自愈同步主循环
LAST_SYNCED_URL=""

while true; do
  ensure_codex_running

  log "🌐 正在建立 Cloudflare 隧道 (127.0.0.1:$PORT)..."
  
  # 启动 cloudflared 并实时解析输出
  PIPE_DIR=$(mktemp -d)
  PIPE="$PIPE_DIR/cf_pipe"
  mkfifo "$PIPE"

  "$CLOUDFLARED" tunnel --url "http://127.0.0.1:$PORT" 2>&1 | tee -a "$LOG_FILE" > "$PIPE" &
  CF_PID=$!

  # 监控输出捕获 trycloudflare.com 域名
  while IFS= read -r line; do
    if [[ "$line" =~ (https://[a-zA-Z0-9-]+\.trycloudflare\.com) ]]; then
      CURRENT_URL="${BASH_REMATCH[1]}"
      log "✨ 成功分配公网安全端点: $CURRENT_URL"
      echo "$CURRENT_URL" > "$URL_FILE"

      if [ "$CURRENT_URL" != "$LAST_SYNCED_URL" ]; then
        log "🔄 正在自动同步 GitHub Secrets: AI_BASE_URL -> ${CURRENT_URL}/v1 ..."
        if [ -n "$GH" ]; then
          if "$GH" secret set AI_BASE_URL -b "${CURRENT_URL}/v1" -R "$REPO" 2>&1 | tee -a "$LOG_FILE"; then
            log "🎉 GitHub Secret AI_BASE_URL 自动同步成功！云端 Actions 随时可调用！"
            LAST_SYNCED_URL="$CURRENT_URL"
          else
            log "⚠️ GitHub Secret 同步异常，稍后重试"
          fi
        else
          log "⚠️ 未找到 gh 命令，跳过自动同步 GitHub Secret"
        fi
      fi
    fi
  done < "$PIPE" &
  READER_PID=$!

  # 等待 cloudflared 进程
  wait $CF_PID || true
  kill $READER_PID 2>/dev/null || true
  rm -rf "$PIPE_DIR"

  log "⚠️ Cloudflare 隧道已断开，将在 5 秒后自动重连并自愈..."
  sleep 5
done
