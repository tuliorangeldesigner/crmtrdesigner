import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

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

export function useLeadsCache() {
    const { user, isAdmin } = useAuth();
    const [leads, setLeads] = useState<Lead[]>(globalLeadsCache || []);
    const [profilesMeta, setProfilesMeta] = useState<Record<string, any>>(globalProfilesCache);
    const [loading, setLoading] = useState(!globalLeadsCache);

    const fetchData = useCallback(async (forceReload = false) => {
        if (!user) {
            setLoading(false);
            return;
        }

        // Cache de 30 segundos para evitar loads ao navegar entre menus
        const now = Date.now();
        if (!forceReload && globalLeadsCache && (now - lastFetchTime < 30000)) {
            console.log('[LeadsCache] Usando cache para navegação instantânea.');
            setLoading(false);
            return;
        }

        const shouldShowLoading = !globalLeadsCache || forceReload;
        if (shouldShowLoading) {
            setLoading(true);
        }

        const safetyTimer = setTimeout(() => setLoading(false), 8000);

        try {
            console.time('[LeadsCache] Carregamento');
            console.log('[LeadsCache] Buscando dados novos...');

            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (!isAdmin) {
                query = query.eq('owner_id', user.id);
            }
            const { data, error } = await query;

            if (error) {
                console.error('[LeadsCache] Erro:', error);
                toast.error('Erro ao carregar dados do banco.');
            } else if (data) {
                const typedData = data as unknown as Lead[];

                // Confetti em tempo real
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

            // Perfis
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

            lastFetchTime = Date.now();
            console.timeEnd('[LeadsCache] Carregamento');
        } catch (error) {
            console.error('[LeadsCache] Crash:', error);
        } finally {
            clearTimeout(safetyTimer);
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        fetchData();

        if (!globalSubscription) {
            console.log('[LeadsCache] Ativando Realtime Global...');
            globalSubscription = supabase.channel('leads-global-sync')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                    fetchData(true);
                })
                .subscribe();
        }
        // Nota: Não removemos o canal no cleanup para manter o singleton ativo entre rotas
    }, [fetchData]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return { leads, profilesMeta, loading, refetch };
}
