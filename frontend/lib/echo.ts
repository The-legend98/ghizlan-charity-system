import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo: any = null;

export function getEcho(): any {
  if (echo) return echo;

  (window as any).Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws'],
  });

  return echo;
}

export default getEcho;