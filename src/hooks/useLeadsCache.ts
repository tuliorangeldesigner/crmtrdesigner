import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { OPS_QUEUE_SPECIALTIES, guessSpecialtyFromService } from '@/lib/operations';
import { triggerLeadClosedPush } from '@/lib/webPush';

// Memória Global (Persiste entre as páginas)
export let globalLeadsCache: Lead[] | null = null;
export let globalProfilesCache: Record<string, any> = {};
let lastFetchTime = 0;
let globalSubscription: any = null;
let notificationPermissionRequested = false;`r`nlet lastSlowConnectionToastAt = 0;

const specialtyLabelMap: Record<string, string> = OPS_QUEUE_SPECIALTIES.reduce((acc, s) => {
    acc[s.value] = s.label;
    return acc;
}, {} as Record<string, string>);

function playLeadClosedChime() {
    try {
        const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99];

        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.0001, now + index * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.12 + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + index * 0.12);
            osc.stop(now + index * 0.12 + 0.24);
        });

        setTimeout(() => {
            try { ctx.close(); } catch { }
        }, 800);
    } catch {
        // Ignora bloqueios de autoplay/áudio do navegador.
    }
}

async function notifyBrowser(title: string, body: string) {
    try {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, { body });
            return;
        }

        if (Notification.permission === 'default' && !notificationPermissionRequested) {
            notificationPermissionRequested = true;
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                new Notification(title, { body });
            }
        }
    } catch {
        // Ignora erros de contexto/permissão.
    }
}

export function clearLeadsCache() {
    globalLeadsCache = null;
    globalProfilesCache = {};
    lastFetchTime = 0;
    if (globalSubscription) {
        supabase.removeChannel(globalSubscription);
        globalSubscription = null;
    }
}

export function updateLeadInCache(updatedLead: Lead) {
    if (globalLeadsCache) {
        globalLeadsCache = globalLeadsCache.map(l => l.id === updatedLead.id ? updatedLead : l);
    }
}

export function removeLeadFromCache(leadId: string) {
    if (globalLeadsCache) {
        globalLeadsCache = globalLeadsCache.filter(l => l.id !== leadId);
    }
}

export function removeProfileFromCache(profileId: string) {
    if (globalProfilesCache[profileId]) {
        delete globalProfilesCache[profileId];
    }
}

export function useLeadsCache() {
    const { user, isAdmin } = useAuth();
    const [leads, setLeads] = useState<Lead[]>(globalLeadsCache || []);
    const [profilesMeta, setProfilesMeta] = useState<Record<string, any>>(globalProfilesCache);
    const [loading, setLoading] = useState(!globalLeadsCache);

    const fetchData = useCallback(async (options: { forceReload?: boolean, silent?: boolean } = {}) => {
        if (!user) {
            setLoading(false);
            return;
        }

        const { forceReload = false, silent = false } = options;

        // Regra de Ouro: Se já temos dados e não faz 1 minuto, e não é reload forçado,
        // não precisa de loading e nem de fetch novo ao navegar entre menus.
        const now = Date.now();
        if (!forceReload && globalLeadsCache && (now - lastFetchTime < 60000)) {
            console.log('[LeadsCache] Navegação Instantânea: Usando cache global.');
            setLoading(false);
            return;
        }

        // Só mostra o loading se não tivermos dados NENHUM ou se o usuário pediu recarga forçada explícita
        // Se for um refresh silencioso (via Realtime), NUNCA mostra loading.
        if (!silent && (!globalLeadsCache || forceReload)) {
            setLoading(true);
        }

        // Fallback de segurança: Se a chamada travar, libera a tela após 8 segundos
        const safetyTimeout = setTimeout(() => {
            console.warn('[LeadsCache] Timeout de sincronização.');
            setLoading(false);
            const nowTs = Date.now();
            const shouldNotifySlowConnection = !silent && (nowTs - lastSlowConnectionToastAt > 120000);
            if (shouldNotifySlowConnection) {
                toast.error('A conex�o com o servidor est� lenta ou bloqueada.');
                lastSlowConnectionToastAt = nowTs;
            }
        }, 8000);

        try {
            console.time('[LeadsCache] Sincronização');

            // 1. Sincroniza Leads
            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (!isAdmin) {
                query = query.eq('owner_id', user.id);
            }
            const { data, error } = await query;

            if (error) throw error;

            if (data) {
                const typedData = data as unknown as Lead[];

                // Lógica de Confetti em Tempo Real (apenas se mudou pra Fechado)
                if (globalLeadsCache && globalLeadsCache.length > 0) {
                    typedData.forEach(newLead => {
                        if (newLead.status_pipeline === 'Fechado') {
                            const oldLead = globalLeadsCache!.find(l => l.id === newLead.id);
                            if (!oldLead || oldLead.status_pipeline !== 'Fechado') {
                                const ownerName = globalProfilesCache[newLead.owner_id]?.full_name || globalProfilesCache[newLead.owner_id]?.email || 'um talento';
                                const area = specialtyLabelMap[guessSpecialtyFromService(newLead.tipo_servico)] || 'Design Grafico';
                                confetti({
                                    particleCount: 150,
                                    spread: 70,
                                    origin: { y: 0.6 },
                                    colors: ['#10b981', '#fbbf24', '#3b82f6', '#ffffff']
                                });
                                toast.success('Lead fechado e enviado para producao', {
                                    description: `Prospectador: ${ownerName} | Lead: ${newLead.nome_cliente} | Area: ${area}`,
                                    duration: 10000,
                                });
                                playLeadClosedChime();
                                notifyBrowser(
                                    'Novo lead fechado',
                                    `${newLead.nome_cliente} foi direcionado para ${area}.`
                                );
                                triggerLeadClosedPush({
                                    leadId: newLead.id,
                                    leadName: newLead.nome_cliente,
                                    area,
                                    ownerName,
                                });
                            }
                        }
                    });
                }

                globalLeadsCache = typedData;
                setLeads(typedData);
            }

            // 2. Sincroniza Profiles (Meta) - Só se for Admin ou se o cache estiver vazio
            if (isAdmin || Object.keys(globalProfilesCache).length === 0) {
                const queryProf = isAdmin
                    ? supabase.from('profiles').select('*')
                    : supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();

                const { data: profs } = await queryProf;
                if (profs) {
                    const profArray = Array.isArray(profs) ? profs : [profs];
                    // Se for Admin, reconstrói o mapa do zero para remover perfis que foram deletados
                    const map: Record<string, any> = isAdmin ? {} : { ...globalProfilesCache };
                    profArray.forEach(p => { map[p.id] = p; });
                    globalProfilesCache = map;
                    setProfilesMeta(map);
                }
            }

            lastFetchTime = Date.now();
            console.timeEnd('[LeadsCache] Sincronização');
        } catch (error) {
            console.error('[LeadsCache] Crash:', error);
            toast.error('Erro ao carregar dados do funil.');
        } finally {
            clearTimeout(safetyTimeout);
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        // Primeira busca (ou usa o cache se for recente)
        fetchData();

        // Singleton da Inscrição Realtime (Fica ativo enquanto o site estiver aberto)
        if (!globalSubscription) {
            console.log('[LeadsCache] Conectando monitoramento em tempo real...');

            // Canal para Leads
            globalSubscription = supabase.channel('leads-global-sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                    fetchData({ forceReload: true, silent: true });
                })
                .subscribe();

            // Canal para Perfis/Equipe
            supabase.channel('profiles-global-sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                    fetchData({ forceReload: true, silent: true });
                })
                .subscribe();
        }
    }, [fetchData]);

    const refetch = useCallback(() => fetchData({ forceReload: true }), [fetchData]);

    return { leads, profilesMeta, loading, refetch };
}



