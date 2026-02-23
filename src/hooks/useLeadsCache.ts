import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

// Memória Global (Persiste entre as páginas)
export let globalLeadsCache: Lead[] | null = null;
export let globalProfilesCache: Record<string, any> = {};
let lastFetchTime = 0;
let globalSubscription: any = null;

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
                                confetti({
                                    particleCount: 150,
                                    spread: 70,
                                    origin: { y: 0.6 },
                                    colors: ['#10b981', '#fbbf24', '#3b82f6', '#ffffff']
                                });
                                toast.success(`🎉 GOL! VENDA CONQUISTADA!`, {
                                    description: `O prospectador ${ownerName} acabou de fechar o lead "${newLead.nome_cliente}"! 🚀`,
                                    duration: 10000,
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
        } finally {
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
