export type ProspectedCity = {
  id: string;
  city: string;
  state: string;
  status: 'em_contato' | 'sem_retorno' | 'retornar' | 'fechado';
  niche: string;
  lastAction: string;
  notes: string;
};

export type TargetCity = {
  id: string;
  city: string;
  state: string;
  priority: 'alta' | 'media' | 'baixa';
  potential: number;
  channels: string;
  notes: string;
};

export type ProspectionTask = {
  id: string;
  title: string;
  status: 'todo' | 'doing' | 'done';
  dueDate: string;
  notes: string;
};

export type ProspectorWorkspace = {
  citiesProspected: ProspectedCity[];
  targetCities: TargetCity[];
  tasks: ProspectionTask[];
  notes: string;
  updatedAt: string;
};

function defaultWorkspace(): ProspectorWorkspace {
  return {
    citiesProspected: [],
    targetCities: [],
    tasks: [],
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}

function workspaceKey(userId: string) {
  return `crm_prospector_workspace_v1:${userId}`;
}

export function loadProspectorWorkspace(userId: string): ProspectorWorkspace {
  if (typeof window === 'undefined' || !userId) return defaultWorkspace();
  try {
    const raw = window.localStorage.getItem(workspaceKey(userId));
    if (!raw) return defaultWorkspace();
    const parsed = JSON.parse(raw) as ProspectorWorkspace;
    return {
      citiesProspected: parsed.citiesProspected || [],
      targetCities: parsed.targetCities || [],
      tasks: parsed.tasks || [],
      notes: parsed.notes || '',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return defaultWorkspace();
  }
}

export function saveProspectorWorkspace(userId: string, data: ProspectorWorkspace) {
  if (typeof window === 'undefined' || !userId) return;
  const payload: ProspectorWorkspace = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(workspaceKey(userId), JSON.stringify(payload));
}

export function generateWorkspaceId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
