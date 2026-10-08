import { permanentRedirect } from 'next/navigation';

/** 旧设置地址：设置页在 /profile。 */
export default function SettingsRedirect() {
  permanentRedirect('/profile?tab=player');
}
