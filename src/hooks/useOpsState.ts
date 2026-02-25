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
      if (alive) {
        setLoadingOps(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [syncWithCrm]);

  const syncedOpsState = useMemo(() => {
    const merged = syncWithCrm(opsState);
    return opsStateSignature(merged) === opsStateSignature(opsState) ? opsState : merged;
  }, [opsState, syncWithCrm]);

  useEffect(() => {
    if (syncedOpsState === opsState) return;
    globalOpsCache = syncedOpsState;
    void persistOpsState(syncedOpsState, storageMode);
  }, [opsState, storageMode, syncedOpsState]);

  useEffect(() => {
    const timer = setInterval(() => {
      setOpsState((prev) => {
        const automated = automateQueue(prev);
        if (opsStateSignature(automated) === opsStateSignature(prev)) return prev;
        globalOpsCache = automated;
        void persistOpsState(automated, storageMode);
        return automated;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [storageMode]);

  const setAndPersist = useCallback(async (next: OpsState) => {
    const merged = syncWithCrm(next);
    globalOpsCache = merged;
    setOpsState(merged);
    await persistOpsState(merged, storageMode);
  }, [storageMode, syncWithCrm]);

  const updateAndPersist = useCallback(async (updater: (prev: OpsState) => OpsState) => {
    const next = updater(globalOpsCache || opsState);
    const merged = syncWithCrm(next);
    globalOpsCache = merged;
    setOpsState(merged);
    await persistOpsState(merged, storageMode);
  }, [opsState, storageMode, syncWithCrm]);

  const modeLabel = useMemo(() => (storageMode === 'supabase' ? 'Supabase' : 'Local (fallback)'), [storageMode]);

  return {
    opsState: syncedOpsState,
    loadingOps,
    storageMode,
    modeLabel,
    setAndPersist,
    updateAndPersist,
  };
}
