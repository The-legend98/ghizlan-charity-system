import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo: any = null;

export function getEcho(): any {
  if (echo) return echo;

  (window as any).Pusher = Pusher;

  const isSecure = process.env.NEXT_PUBLIC_REVERB_SCHEME === 'wss';

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST!,
    wsPort: isSecure ? 443 : Number(process.env.NEXT_PUBLIC_REVERB_PORT),
    wssPort: 443,
    forceTLS: isSecure,
    disableStats: true,
    enabledTransports: isSecure ? ['wss'] : ['ws'],
  });

  return echo;
}

export default getEcho;