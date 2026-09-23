#!/bin/bash
set -e

export PATH="/Users/zeyelvis/.local/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
PROJECT_DIR="/Users/zeyelvis/KVideo"

cd "$PROJECT_DIR"
exec /Users/zeyelvis/.local/bin/npx tsx scripts/cron/autonomous-seo-daemon.mjs
