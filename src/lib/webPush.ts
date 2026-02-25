import { supabase } from '@/lib/supabase';

const PUBLIC_VAPID_KEY = import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (error) {
    console.error('[webPush] Falha ao registrar service worker:', error);
    return null;
  }
}

export async function subscribeWebPush(userId: string) {
  if (!userId || !PUBLIC_VAPID_KEY) return;
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });
  }

  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh || '';
  const auth = json.keys?.auth || '';

  if (!endpoint || !p256dh || !auth) return;

  const { error } = await supabase.from('web_push_subscriptions').upsert(
    {
      endpoint,
      user_id: userId,
      p256dh,
      auth,
      user_agent: navigator.userAgent,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );

  if (error) {
    console.error('[webPush] Falha ao salvar subscription:', error);
  }
}

export async function triggerLeadClosedPush(payload: { leadId: string; leadName: string; area: string; ownerName: string }) {
  try {
    const { error } = await supabase.functions.invoke('send-web-push', {
      body: {
        event_key: `lead-closed:${payload.leadId}`,
        title: 'Novo lead fechado',
        body: `${payload.leadName} foi para ${payload.area}. Prospectador: ${payload.ownerName}.`,
        url: '/fila-operacional',
      },
    });

    if (error) {
      console.error('[webPush] Falha ao invocar função de push:', error);
    }
  } catch (error) {
    console.error('[webPush] Erro ao enviar push:', error);
  }
}
