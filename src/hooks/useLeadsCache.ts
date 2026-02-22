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
            setLoading(false);
            return;
        }

        const shouldShowLoading = !globalLeadsCache || forceReload;
        if (shouldShowLoading) {
            setLoading(true);
        }

        try {
            // Sincroniza Leads
            let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
            if (!isAdmin) {
                query = query.eq('owner_id', user.id);
            }
            const { data, error } = await query;

            if (error) {
                console.error('Erro sincronizando leads', error);
                toast.error('Erro ao carregar dados do banco.');
            } else if (data) {
                const typedData = data as unknown as Lead[];

                // Disparo de Meta / Venda Fechada (Confetti e Toasts em Real-time)
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
        } catch (error) {
            console.error('Crash no fetchData:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id, isAdmin]);

    useEffect(() => {
        let isMounted = true;
        fetchData();

        const channel = supabase.channel('leads-realtime-update')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
                if (isMounted) fetchData(true);
            })
            .subscribe();

        return () => {
            isMounted = false;
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    const refetch = useCallback(() => fetchData(true), [fetchData]);

    return { leads, profilesMeta, loading, refetch };
}
