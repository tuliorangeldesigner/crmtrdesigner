import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const WEB_PUSH_SUBJECT = Deno.env.get('WEB_PUSH_SUBJECT') || 'mailto:admin@example.com';
const WEB_PUSH_PUBLIC_KEY = Deno.env.get('WEB_PUSH_PUBLIC_KEY') || '';
const WEB_PUSH_PRIVATE_KEY = Deno.env.get('WEB_PUSH_PRIVATE_KEY') || '';

if (WEB_PUSH_PUBLIC_KEY && WEB_PUSH_PRIVATE_KEY) {
  webpush.setVapidDetails(WEB_PUSH_SUBJECT, WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Payload = {
  event_key: string;
  title: string;
  body: string;
  url?: string;
};

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const payload = (await req.json()) as Payload;

    if (!payload?.event_key || !payload?.title || !payload?.body) {
      return new Response(JSON.stringify({ error: 'Payload invalido' }), { status: 400 });
    }

    const insertEvent = await supabase
      .from('web_push_events')
      .insert({ event_key: payload.event_key })
      .select('event_key')
      .single();

    if (insertEvent.error) {
      // Evento ja tratado (dedupe)
      return new Response(JSON.stringify({ ok: true, deduped: true }), { status: 200 });
    }

    const subsRes = await supabase
      .from('web_push_subscriptions')
      .select('endpoint, p256dh, auth');

    if (subsRes.error) {
      return new Response(JSON.stringify({ error: subsRes.error.message }), { status: 500 });
    }

    const subscriptions = subsRes.data || [];

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/fila-operacional',
      tag: payload.event_key,
    });

    await Promise.all(
      subscriptions.map(async (s: any) => {
        const subscription = {
          endpoint: s.endpoint,
          keys: {
            p256dh: s.p256dh,
            auth: s.auth,
          },
        };

        try {
          await webpush.sendNotification(subscription, notificationPayload);
        } catch (error: any) {
          const statusCode = error?.statusCode || 0;
          if (statusCode === 404 || statusCode === 410) {
            await supabase.from('web_push_subscriptions').delete().eq('endpoint', s.endpoint);
          }
        }
      })
    );

    return new Response(JSON.stringify({ ok: true, sent: subscriptions.length }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Erro interno' }), { status: 500 });
  }
});
