import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface OnlineUser {
    id: string;
    email: string;
    onlineAt: string;
    isAdmin: boolean;
}

export function usePresence() {
    const { user, isAdmin } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

    useEffect(() => {
        if (!user) return;

        // Canal dedicado para rastrear presencia online
        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: user.id, // Chave única por usuário conectado
                },
            },
        });

        // Sincroniza o estado toda vez que alguém entra ou sai
        channel.on('presence', { event: 'sync' }, () => {
            const newState = channel.presenceState();

            const users: OnlineUser[] = [];
            for (const id in newState) {
                const presences = newState[id] as any[];
                if (presences.length > 0) {
                    const p = presences[0];
                    users.push({
                        id,
                        email: p.email || 'Usuário Desconhecido',
                        onlineAt: p.onlineAt,
                        isAdmin: p.isAdmin || false
                    });
                }
            }

            // Ordena por email
            setOnlineUsers(users.sort((a, b) => a.email.localeCompare(b.email)));
        });

        // Inscreve no canal e avisa que o usuário atual está online
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                const trackStatus = await channel.track({
                    email: user.email,
                    onlineAt: new Date().toISOString(),
                    isAdmin: isAdmin
                });

                if (trackStatus !== 'ok') {
                    console.error('[Presence] Falha ao registrar presença online.');
                }
            }
        });

        // Limpa a inscrição quando o usuário sai ou o componente desmonta
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isAdmin]);

    return { onlineUsers };
}
