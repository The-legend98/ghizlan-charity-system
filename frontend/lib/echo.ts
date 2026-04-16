import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

let echo: any = null;

export function getEcho(): any {
  if (echo) return echo;

  (window as any).Pusher = Pusher;

  echo = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY!,
    wsHost: 'localhost',
    wsPort: 8080,
    wssPort: 8080,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws'],
});

  return echo;
}

export default getEcho;