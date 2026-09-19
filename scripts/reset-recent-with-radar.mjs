#!/usr/bin/env node
import { spawn } from 'child_process';
import path from 'path';

/**
 * 生产环境「最新上线」全域净化与雷达重置脚本
 * 
 * 执行逻辑：
 * 直接调用 scripts/sync-release-radar.mjs（生产写入模式），
 * 自动刷新密钥、融合爱壹帆+采集站+TMDB最新排期流，
 * 覆写生产环境 KV recent:* 所有专区键并更新预烘焙文件。
 */

console.log('================================================================');
console.log('🧹 iKanPP「最新上线」全域净化与发行雷达一键重置流水线启动');
console.log('================================================================');

const scriptPath = path.resolve('scripts/sync-release-radar.mjs');
const child = spawn('node', [scriptPath], {
  stdio: 'inherit',
  env: process.env,
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ [Reset] 全站「最新上线」已彻底清洗并重新注入当季真实热播片单！');
    process.exit(0);
  } else {
    console.error(`\n❌ [Reset] 执行失败，退出码: ${code}`);
    process.exit(code || 1);
  }
});
