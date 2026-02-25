import { useEffect } from 'react';
import { registerServiceWorker, subscribeWebPush } from '@/lib/webPush';

export function useWebPush(userId: string | undefined) {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await registerServiceWorker();
        if (mounted && userId) {
          await subscribeWebPush(userId);
        }
      } catch (error) {
        // Push is optional. Never block or crash auth/session flow.
        console.warn('[webPush] Registro ignorado por falha nao critica:', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId]);
}
