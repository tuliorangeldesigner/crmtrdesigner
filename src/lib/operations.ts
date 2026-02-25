export type OpsSpecialty = 'design' | 'video' | 'motion' | 'web' | 'social' | 'trafego';
export type OpsQueueStatus = 'aguardando' | 'atribuido' | 'em_producao' | 'entregue';

export type OpsProfessional = {
  id: string;
  name: string;
  email: string;
  specialties: OpsSpecialty[];
  activeJobs: number;
  maxActiveJobs: number;
  qualityScore: number;
  slaScore: number;
  isAvailable: boolean;
  lastAssignedAt: string | null;
};

export type OpsQueueItem = {
  id: string;
  leadId: string;
  leadName: string;
  serviceType: string;
  specialty: OpsSpecialty;
  status: OpsQueueStatus;
  assignedProfessionalId: string | null;
  createdAt: string;
  updatedAt: string;
  notes: string;
};

export type OpsSettings = {
  distributionMode: 'fila' | 'primeiro';
  prospectorPercent: number;
  executorPercent: number;
  agencyPercent: number;
};

export type OpsState = {
  professionals: Record<string, OpsProfessional>;
  queue: OpsQueueItem[];
  settings: OpsSettings;
};

const STORAGE_KEY = 'crm_ops_state_v1';

export const OPS_SPECIALTIES: { value: OpsSpecialty; label: string }[] = [
  { value: 'design', label: 'Design Grafico' },
  { value: 'video', label: 'Edicao de Video' },
  { value: 'motion', label: 'Motion' },
  { value: 'web', label: 'Web Design' },
  { value: 'social', label: 'Social Media' },
  { value: 'trafego', label: 'Trafego Pago' },
];

const DEFAULT_SETTINGS: OpsSettings = {
  distributionMode: 'fila',
  prospectorPercent: 10,
  executorPercent: 45,
  agencyPercent: 45,
};

function nowIso() {
  return new Date().toISOString();
}

function safeJsonParse(value: string | null): OpsState | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as OpsState;
  } catch {
    return null;
  }
}

export function loadOpsState(): OpsState {
  if (typeof window === 'undefined') {
    return { professionals: {}, queue: [], settings: DEFAULT_SETTINGS };
  }
  const parsed = safeJsonParse(window.localStorage.getItem(STORAGE_KEY));
  if (!parsed) return { professionals: {}, queue: [], settings: DEFAULT_SETTINGS };
  return {
    professionals: parsed.professionals || {},
    queue: parsed.queue || [],
    settings: parsed.settings || DEFAULT_SETTINGS,
  };
}

export function saveOpsState(state: OpsState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function normalizePercentages(settings: OpsSettings): OpsSettings {
  const total = settings.prospectorPercent + settings.executorPercent + settings.agencyPercent;
  if (total === 100) return settings;
  return {
    ...settings,
    agencyPercent: Math.max(0, 100 - settings.prospectorPercent - settings.executorPercent),
  };
}

export function guessSpecialtyFromService(service: string | null | undefined): OpsSpecialty {
  const text = (service || '').toLowerCase();
  if (text.includes('traf')) return 'trafego';
  if (text.includes('social')) return 'social';
  if (text.includes('web') || text.includes('site') || text.includes('landing')) return 'web';
  if (text.includes('motion')) return 'motion';
  if (text.includes('video') || text.includes('reels') || text.includes('edicao')) return 'video';
  return 'design';
}

export function syncProfessionalsFromProfiles(
  state: OpsState,
  profilesMeta: Record<string, any>,
  includeRoles: string[] = ['prospectador', 'executor', 'freelancer', 'admin']
): OpsState {
  const next = { ...state, professionals: { ...state.professionals } };
  Object.values(profilesMeta).forEach((profile: any) => {
    if (!profile?.id) return;
    if (!includeRoles.includes(profile.role || 'prospectador')) return;
    if (!next.professionals[profile.id]) {
      next.professionals[profile.id] = {
        id: profile.id,
        name: profile.full_name || profile.email || profile.id,
        email: profile.email || '',
        specialties: ['design'],
        activeJobs: 0,
        maxActiveJobs: 2,
        qualityScore: 80,
        slaScore: 80,
        isAvailable: true,
        lastAssignedAt: null,
      };
    } else {
      next.professionals[profile.id] = {
        ...next.professionals[profile.id],
        name: profile.full_name || profile.email || profile.id,
        email: profile.email || next.professionals[profile.id].email,
      };
    }
  });
  return next;
}

export function syncQueueFromLeads(state: OpsState, leads: any[]): OpsState {
  const nextQueue = [...state.queue];
  const validLeadIds = new Set<string>();

  leads
    .filter((lead) => lead.status_pipeline === 'Fechado' && lead.status_pagamento !== 'Pago')
    .forEach((lead) => {
      validLeadIds.add(lead.id);
      const existing = nextQueue.find((q) => q.leadId === lead.id);
      if (existing) return;
      nextQueue.push({
        id: `q-${lead.id}`,
        leadId: lead.id,
        leadName: lead.nome_empresa || lead.nome_cliente,
        serviceType: lead.tipo_servico || 'Servico nao informado',
        specialty: guessSpecialtyFromService(lead.tipo_servico),
        status: 'aguardando',
        assignedProfessionalId: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        notes: lead.observacoes || '',
      });
    });

  const filteredQueue = nextQueue.filter((q) => validLeadIds.has(q.leadId) || q.status === 'entregue');
  return { ...state, queue: filteredQueue };
}

export function sortProfessionalsForQueue(professionals: OpsProfessional[]) {
  return [...professionals].sort((a, b) => {
    if (a.activeJobs !== b.activeJobs) return a.activeJobs - b.activeJobs;
    const aLast = a.lastAssignedAt ? new Date(a.lastAssignedAt).getTime() : 0;
    const bLast = b.lastAssignedAt ? new Date(b.lastAssignedAt).getTime() : 0;
    if (aLast !== bLast) return aLast - bLast;
    return b.qualityScore - a.qualityScore;
  });
}

export function assignNextInQueue(state: OpsState, specialty: OpsSpecialty): OpsState {
  const queueItem = state.queue
    .filter((q) => q.specialty === specialty && q.status === 'aguardando')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];

  if (!queueItem) return state;

  const eligible = sortProfessionalsForQueue(
    Object.values(state.professionals).filter(
      (p) => p.isAvailable && p.specialties.includes(specialty) && p.activeJobs < p.maxActiveJobs
    )
  );

  if (eligible.length === 0) return state;

  const selected = eligible[0];

  return {
    ...state,
    professionals: {
      ...state.professionals,
      [selected.id]: {
        ...selected,
        activeJobs: selected.activeJobs + 1,
        lastAssignedAt: nowIso(),
      },
    },
    queue: state.queue.map((q) =>
      q.id === queueItem.id
        ? {
            ...q,
            status: 'atribuido',
            assignedProfessionalId: selected.id,
            updatedAt: nowIso(),
          }
        : q
    ),
  };
}

export function updateQueueStatus(state: OpsState, queueId: string, status: OpsQueueStatus): OpsState {
  const item = state.queue.find((q) => q.id === queueId);
  if (!item) return state;

  const next = {
    ...state,
    professionals: { ...state.professionals },
    queue: state.queue.map((q) => (q.id === queueId ? { ...q, status, updatedAt: nowIso() } : q)),
  };

  if (status === 'entregue' && item.assignedProfessionalId) {
    const prof = next.professionals[item.assignedProfessionalId];
    if (prof) {
      next.professionals[item.assignedProfessionalId] = {
        ...prof,
        activeJobs: Math.max(0, prof.activeJobs - 1),
      };
    }
  }

  return next;
}
