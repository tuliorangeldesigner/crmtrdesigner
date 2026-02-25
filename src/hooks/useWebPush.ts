import { useEffect } from 'react';
import { registerServiceWorker, subscribeWebPush } from '@/lib/webPush';

export function useWebPush(userId: string | undefined) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      await registerServiceWorker();
      if (mounted && userId) {
        await subscribeWebPush(userId);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);
}
