import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useTimeTracker() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        // Roda a cada 1 minuto exato (60000ms)
        const interval = setInterval(async () => {
            try {
                // Tenta buscar as colunas de tempo
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('online_minutes_today, online_minutes_total, last_online_date')
                    .eq('id', user.id)
                    .single();

                // Se houver erro (colunas não existem, por exemplo), abortamos silenciosamente
                if (error || !profile) return;

                // Data de hoje (YYYY-MM-DD no fuso local)
                const today = new Date();
                const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

                const isNewDay = profile.last_online_date !== todayStr;

                const newToday = isNewDay ? 1 : (profile.online_minutes_today || 0) + 1;
                const newTotal = (profile.online_minutes_total || 0) + 1;

                await supabase.from('profiles').update({
                    online_minutes_today: newToday,
                    online_minutes_total: newTotal,
                    last_online_date: todayStr
                }).eq('id', user.id);

            } catch (err) {
                // Abortar silenciosamente (aguardando criação das colunas no banco)
            }
        }, 60000);

        return () => clearInterval(interval);
    }, [user]);
}
