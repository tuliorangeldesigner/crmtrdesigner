import { supabase } from '@/lib/supabase';
import {
  loadOpsState,
  saveOpsState,
  type OpsProfessional,
  type OpsQueueItem,
  type OpsSettings,
  type OpsState,
} from '@/lib/operations';

type StorageMode = 'supabase' | 'local';

function defaultState(): OpsState {
  return {
    professionals: {},
    queue: [],
    settings: {
      distributionMode: 'fila',
      prospectorPercent: 10,
      executorPercent: 45,
      agencyPercent: 45,
    },
  };
}

function mapSettingsRow(row: any): OpsSettings {
  return {
    distributionMode: row?.distribution_mode === 'primeiro' ? 'primeiro' : 'fila',
    prospectorPercent: Number(row?.prospector_percent ?? 10),
    executorPercent: Number(row?.executor_percent ?? 45),
    agencyPercent: Number(row?.agency_percent ?? 45),
  };
}

function mapProfessionalRow(row: any): OpsProfessional {
  return {
    id: row.id,
    name: row.name || row.email || row.id,
    email: row.email || '',
    specialties: Array.isArray(row.specialties) ? row.specialties : ['design'],
    activeJobs: Number(row.active_jobs ?? 0),
    maxActiveJobs: Number(row.max_active_jobs ?? 2),
    qualityScore: Number(row.quality_score ?? 80),
    slaScore: Number(row.sla_score ?? 80),
    isAvailable: Boolean(row.is_available ?? true),
    lastAssignedAt: row.last_assigned_at || null,
  };
}

function mapQueueRow(row: any): OpsQueueItem {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    serviceType: row.service_type,
    specialty: row.specialty,
    status: row.status,
    assignedProfessionalId: row.assigned_professional_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    notes: row.notes || '',
  };
}

function toSettingsRow(settings: OpsSettings) {
  return {
    id: 'default',
    distribution_mode: settings.distributionMode,
    prospector_percent: settings.prospectorPercent,
    executor_percent: settings.executorPercent,
    agency_percent: settings.agencyPercent,
    updated_at: new Date().toISOString(),
  };
}

function toProfessionalRow(p: OpsProfessional) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    specialties: p.specialties,
    active_jobs: p.activeJobs,
    max_active_jobs: p.maxActiveJobs,
    quality_score: p.qualityScore,
    sla_score: p.slaScore,
    is_available: p.isAvailable,
    last_assigned_at: p.lastAssignedAt,
    updated_at: new Date().toISOString(),
  };
}

function toQueueRow(q: OpsQueueItem) {
  return {
    id: q.id,
    lead_id: q.leadId,
    lead_name: q.leadName,
    service_type: q.serviceType,
    specialty: q.specialty,
    status: q.status,
    assigned_professional_id: q.assignedProfessionalId,
    notes: q.notes,
    created_at: q.createdAt,
    updated_at: q.updatedAt,
  };
}

function isMissingTableError(err: any) {
  const msg = `${err?.message || ''} ${err?.details || ''}`.toLowerCase();
  return err?.code === '42P01' || msg.includes('does not exist') || msg.includes('could not find the table');
}

export async function loadOpsStateWithMode(): Promise<{ state: OpsState; mode: StorageMode }> {
  const [settingsRes, profRes, queueRes] = await Promise.all([
    supabase.from('ops_settings').select('*').eq('id', 'default').maybeSingle(),
    supabase.from('ops_professionals').select('*'),
    supabase.from('ops_queue').select('*').order('created_at', { ascending: true }),
  ]);

  const possibleErr = settingsRes.error || profRes.error || queueRes.error;
  if (possibleErr) {
    if (isMissingTableError(possibleErr)) {
      return { state: loadOpsState(), mode: 'local' };
    }
    return { state: loadOpsState(), mode: 'local' };
  }

  const professionals: Record<string, OpsProfessional> = {};
  (profRes.data || []).forEach((row: any) => {
    professionals[row.id] = mapProfessionalRow(row);
  });

  const queue = (queueRes.data || []).map(mapQueueRow);
  const settings = mapSettingsRow(settingsRes.data);

  return {
    state: {
      professionals,
      queue,
      settings,
    },
    mode: 'supabase',
  };
}

export async function persistOpsState(state: OpsState, mode: StorageMode) {
  saveOpsState(state);
  if (mode !== 'supabase') return;

  const settingsRow = toSettingsRow(state.settings);
  const professionalsRows = Object.values(state.professionals).map(toProfessionalRow);
  const queueRows = state.queue.map(toQueueRow);

  const settingsUp = supabase.from('ops_settings').upsert(settingsRow, { onConflict: 'id' });
  const professionalsUp = professionalsRows.length > 0
    ? supabase.from('ops_professionals').upsert(professionalsRows, { onConflict: 'id' })
    : Promise.resolve({ error: null } as any);

  const queueUp = queueRows.length > 0
    ? supabase.from('ops_queue').upsert(queueRows, { onConflict: 'id' })
    : Promise.resolve({ error: null } as any);

  const [sErr, pErr, qErr] = await Promise.all([settingsUp, professionalsUp, queueUp]);

  if (sErr.error || pErr.error || qErr.error) {
    const err = sErr.error || pErr.error || qErr.error;
    if (!isMissingTableError(err)) {
      console.error('[opsStore] Falha ao persistir no Supabase:', err);
    }
  }

  // Remove itens que nao existem mais no estado local
  const currentQueueIds = new Set(state.queue.map((q) => q.id));
  const currentProfIds = new Set(Object.keys(state.professionals));

  const existingQueue = await supabase.from('ops_queue').select('id');
  if (!existingQueue.error && existingQueue.data) {
    const toDelete = existingQueue.data.map((r: any) => r.id).filter((id: string) => !currentQueueIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from('ops_queue').delete().in('id', toDelete);
    }
  }

  const existingProf = await supabase.from('ops_professionals').select('id');
  if (!existingProf.error && existingProf.data) {
    const toDelete = existingProf.data.map((r: any) => r.id).filter((id: string) => !currentProfIds.has(id));
    if (toDelete.length > 0) {
      await supabase.from('ops_professionals').delete().in('id', toDelete);
    }
  }
}

export function getFallbackState() {
  return loadOpsState() || defaultState();
}
