import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import {
  getFallbackState,
  loadOpsStateWithMode,
  persistOpsState,
} from '@/lib/opsStore';
import {
  automateQueue,
  opsStateSignature,
  syncProfessionalsFromProfiles,
  syncQueueFromLeads,
  type OpsState,
} from '@/lib/operations';

type StorageMode = 'supabase' | 'local';
let globalOpsCache: OpsState | null = null;
let globalMode: StorageMode = 'local';

export function useOpsState() {
  const { leads, profilesMeta } = useLeadsCache();
  const [opsState, setOpsState] = useState<OpsState>(globalOpsCache || getFallbackState());
  const [storageMode, setStorageMode] = useState<StorageMode>(globalMode);
  const [loadingOps, setLoadingOps] = useState(false);

  const syncWithCrm = useCallback((state: OpsState) => {
    return automateQueue(syncQueueFromLeads(syncProfessionalsFromProfiles(state, profilesMeta), leads));
  }, [leads, profilesMeta]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoadingOps(true);
      const { state, mode } = await loadOpsStateWithMode();
      if (!alive) return;
      const merged = syncWithCrm(state);
      globalOpsCache = merged;
      globalMode = mode;
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
    const merged = syncWithCrm(opsState);
    const changed = opsStateSignature(merged) !== opsStateSignature(opsState);
    if (!changed) return;
    globalOpsCache = merged;
    setOpsState(merged);
    persistOpsState(merged, storageMode);
  }, [leads.length, Object.keys(profilesMeta).length]);

  useEffect(() => {
    const timer = setInterval(() => {
      const automated = automateQueue(opsState);
      if (opsStateSignature(automated) === opsStateSignature(opsState)) return;
      globalOpsCache = automated;
      setOpsState(automated);
      persistOpsState(automated, storageMode);
    }, 60000);
    return () => clearInterval(timer);
  }, [opsState, storageMode]);

  const setAndPersist = useCallback(async (next: OpsState) => {
    globalOpsCache = next;
    setOpsState(next);
    await persistOpsState(next, storageMode);
  }, [storageMode]);

  const updateAndPersist = useCallback(async (updater: (prev: OpsState) => OpsState) => {
    const next = updater(opsState);
    globalOpsCache = next;
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
