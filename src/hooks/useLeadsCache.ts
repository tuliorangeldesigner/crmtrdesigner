import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export let globalLeadsCache: Lead[] | null = null;
export let globalProfilesCache: Record<string, any> = {};

export function clearLeadsCache() {
    globalLeadsCache = null;
    globalProfilesCache = {};
}

export function updateLeadInCache(updatedLead: Lead) {
    if (globalLeadsCache) {
        globalLeadsCache = globalLeadsCache.map(l => l.id === updatedLead.id ? updatedLead : l);
    }
}

export function useLeadsCache() {
    const { user, isAdmin } = useAuth();
    const [leads, setLeads] = useState<Lead[]>(globalLeadsCache || []);
    const [profilesMeta, setProfilesMeta] = useState<Record<string, any>>(globalProfilesCache);
    const [loading, setLoading] = useState(!globalLeadsCache);

    const fetchData = useCallback(async (forceReload = false) => {
        if (!user) {
            console.log('[LeadsCache] Sem usuário logado, abortando fetch.');
            setLoading(false);
            return;
        }

        const shouldShowLoading = !globalLeadsCache || forceReload;
        if (shouldShowLoading) {
            setLoading(true);
        }

        // Timer de segurança para soltar o loading em no máximo 8 segundos
        // caso o Supabase ou rede demore demais
        const safetyTimer = setTimeout(() => {
            setLoading(false);
        }, 8000);

        try {
            console.log('[LeadsCache] Iniciando busca de leads...');
            // Sincroniza Leads
            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (!isAdmin) {
                query = query.eq('owner_id', user.id);
            }
            const { data, error } = await query;

            if (error) {
                console.error('[LeadsCache] Erro sincronizando leads:', error);
                toast.error('Erro ao carregar dados do banco.');
            } else if (data) {
                console.log(`[LeadsCache] ${data.length} leads recebidos.`);
                const typedData = data as unknown as Lead[];

                // Disparo de Meta / Venda Fechada
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

            // Sincroniza Profiles (Meta)
            console.log('[LeadsCache] Sincronizando perfis...');
            if (isAdmin) {
                const { data: profs } = await supabase.from('profiles').select('*');
                if (profs) {
                    const map: Record<string, any> = {};
                    profs.forEach(p => { map[p.id] = p; });
                    globalProfilesCache = map;
                    setProfilesMeta(map);
                }
            } else {
                const { data: myProf } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
                if (myProf) {
                    const map = { [user.id]: myProf };
                    globalProfilesCache = map;
                    setProfilesMeta(map);
                }
            }
            console.log('[LeadsCache] Busca finalizada com sucesso.');
        } catch (error) {
            console.error('[LeadsCache] Crash no fetchData:', error);
        } finally {
            clearTimeout(safetyTimer);
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        let isMounted = true;
        fetchData();

        console.log('[LeadsCache] Ativando canal Realtime...');
        const channel = supabase.channel('leads-realtime-update')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                if (isMounted) {
                    console.log('[LeadsCache] Mudança detectada no banco via Realtime, recarregando...');
                    fetchData(true);
                }
            })
            .subscribe((status) => {
                console.log('[LeadsCache] Status do canal Realtime:', status);
            });

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return { leads, profilesMeta, loading, refetch };
}
