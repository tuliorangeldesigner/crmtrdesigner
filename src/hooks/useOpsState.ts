import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import {
  getFallbackState,
  loadOpsStateWithMode,
  persistOpsState,
} from '@/lib/opsStore';
import {
  syncProfessionalsFromProfiles,
  syncQueueFromLeads,
  type OpsState,
} from '@/lib/operations';

type StorageMode = 'supabase' | 'local';

export function useOpsState() {
  const { leads, profilesMeta } = useLeadsCache();
  const [opsState, setOpsState] = useState<OpsState>(getFallbackState());
  const [storageMode, setStorageMode] = useState<StorageMode>('local');
  const [loadingOps, setLoadingOps] = useState(true);

  const syncWithCrm = useCallback((state: OpsState) => {
    return syncQueueFromLeads(syncProfessionalsFromProfiles(state, profilesMeta), leads);
  }, [leads, profilesMeta]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { state, mode } = await loadOpsStateWithMode();
      if (!alive) return;
      const merged = syncWithCrm(state);
      setStorageMode(mode);
      setOpsState(merged);
      await persistOpsState(merged, mode);
      if (alive) setLoadingOps(false);
    })();
    return () => {
      alive = false;
    };
  }, [syncWithCrm]);

  useEffect(() => {
    if (loadingOps) return;
    const merged = syncWithCrm(opsState);
    const changed = JSON.stringify(merged) !== JSON.stringify(opsState);
    if (!changed) return;
    setOpsState(merged);
    persistOpsState(merged, storageMode);
  }, [leads.length, Object.keys(profilesMeta).length]);

  const setAndPersist = useCallback(async (next: OpsState) => {
    setOpsState(next);
    await persistOpsState(next, storageMode);
  }, [storageMode]);

  const updateAndPersist = useCallback(async (updater: (prev: OpsState) => OpsState) => {
    const next = updater(opsState);
    setOpsState(next);
    await persistOpsState(next, storageMode);
  }, [opsState, storageMode]);

  const modeLabel = useMemo(() => (storageMode === 'supabase' ? 'Supabase' : 'Local (fallback)'), [storageMode]);

  return {
    opsState,
    loadingOps,
    storageMode,
    modeLabel,
    setAndPersist,
    updateAndPersist,
  };
}
