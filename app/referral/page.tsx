import { permanentRedirect } from 'next/navigation';

/** 邀请返利已随会员系统去掉（2026-10-08），旧链接回首页。 */
export default function ReferralRedirect() {
  permanentRedirect('/');
}
