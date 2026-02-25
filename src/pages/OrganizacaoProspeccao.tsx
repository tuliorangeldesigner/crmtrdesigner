import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  type ProspectedCity,
  type ProspectionTask,
  type ProspectorWorkspace,
  type TargetCity,
  generateWorkspaceId,
  loadProspectorWorkspace,
  saveProspectorWorkspace,
} from '@/lib/prospectorWorkspace';

function emptyWorkspace(): ProspectorWorkspace {
  return {
    citiesProspected: [],
    targetCities: [],
    tasks: [],
    notes: '',
    updatedAt: new Date().toISOString(),
  };
}

export default function OrganizacaoProspeccao() {
  const { user, isAdmin } = useAuth();
  const { profilesMeta } = useLeadsCache();
  const [selectedProspectorId, setSelectedProspectorId] = useState<string>('');
  const [workspace, setWorkspace] = useState<ProspectorWorkspace>(emptyWorkspace());

  const [cityForm, setCityForm] = useState<Omit<ProspectedCity, 'id'>>({
    city: '',
    state: '',
    status: 'em_contato',
    niche: '',
    lastAction: '',
    notes: '',
  });
  const [targetForm, setTargetForm] = useState<Omit<TargetCity, 'id'>>({
    city: '',
    state: '',
    priority: 'media',
    potential: 3,
    channels: '',
    notes: '',
  });
  const [taskForm, setTaskForm] = useState<Omit<ProspectionTask, 'id'>>({
    title: '',
    status: 'todo',
    dueDate: '',
    notes: '',
  });

  const prospectors = useMemo(() => (
    Object.values(profilesMeta)
      .filter((profile: any) => profile?.id && profile?.role === 'prospectador')
      .map((profile: any) => ({
        id: profile.id as string,
        name: (profile.full_name || profile.email || profile.id) as string,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  ), [profilesMeta]);

  useEffect(() => {
    if (!user) return;
    if (prospectors.length === 0) return;
    if (!selectedProspectorId) {
      const fallback = isAdmin ? prospectors[0]?.id : user.id;
      if (fallback) setSelectedProspectorId(fallback);
    }
  }, [isAdmin, prospectors, selectedProspectorId, user]);

  useEffect(() => {
    if (!selectedProspectorId) return;
    setWorkspace(loadProspectorWorkspace(selectedProspectorId));
  }, [selectedProspectorId]);

  const persistWorkspace = (next: ProspectorWorkspace) => {
    if (!selectedProspectorId) return;
    setWorkspace(next);
    saveProspectorWorkspace(selectedProspectorId, next);
  };

  const addProspectedCity = () => {
    if (!cityForm.city.trim() || !cityForm.state.trim()) {
      toast.error('Informe cidade e estado para registrar prospecÃ§Ã£o.');
      return;
    }
    const next: ProspectorWorkspace = {
      ...workspace,
      citiesProspected: [
        {
          id: generateWorkspaceId('city'),
          ...cityForm,
          city: cityForm.city.trim(),
          state: cityForm.state.trim().toUpperCase(),
        },
        ...workspace.citiesProspected,
      ],
    };
    persistWorkspace(next);
    setCityForm({ city: '', state: '', status: 'em_contato', niche: '', lastAction: '', notes: '' });
  };

  const addTargetCity = () => {
    if (!targetForm.city.trim() || !targetForm.state.trim()) {
      toast.error('Informe cidade e estado da oportunidade.');
      return;
    }
    const next: ProspectorWorkspace = {
      ...workspace,
      targetCities: [
        {
          id: generateWorkspaceId('target'),
          ...targetForm,
          city: targetForm.city.trim(),
          state: targetForm.state.trim().toUpperCase(),
        },
        ...workspace.targetCities,
      ],
    };
    persistWorkspace(next);
    setTargetForm({ city: '', state: '', priority: 'media', potential: 3, channels: '', notes: '' });
  };

  const addTask = () => {
    if (!taskForm.title.trim()) {
      toast.error('Informe o titulo da tarefa.');
      return;
    }
    const next: ProspectorWorkspace = {
      ...workspace,
      tasks: [
        {
          id: generateWorkspaceId('task'),
          ...taskForm,
          title: taskForm.title.trim(),
        },
        ...workspace.tasks,
      ],
    };
    persistWorkspace(next);
    setTaskForm({ title: '', status: 'todo', dueDate: '', notes: '' });
  };

  const removeItem = (type: 'citiesProspected' | 'targetCities' | 'tasks', id: string) => {
    const next = {
      ...workspace,
      [type]: workspace[type].filter((item: any) => item.id !== id),
    } as ProspectorWorkspace;
    persistWorkspace(next);
  };

  const updateTaskStatus = (taskId: string, status: ProspectionTask['status']) => {
    const next = {
      ...workspace,
      tasks: workspace.tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    };
    persistWorkspace(next);
  };

  const saveNotes = () => {
    persistWorkspace(workspace);
    toast.success('AnotaÃ§Ãµes salvas.');
  };

  const selectedName = prospectors.find((p) => p.id === selectedProspectorId)?.name || 'Prospectador';

  if (prospectors.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OrganizaÃ§Ã£o da ProspecÃ§Ã£o</h1>
        <Card className="border-border/40">
          <CardContent className="py-8 text-sm text-muted-foreground">
            Nenhum prospectador encontrado na equipe. Defina usuarios com cargo "Prospectador" em Equipe para usar este modulo.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">OrganizaÃ§Ã£o da ProspecÃ§Ã£o</h1>
          <p className="text-muted-foreground text-sm mt-1">Base operacional individual para cada prospectador trabalhar com previsibilidade e controle.</p>
        </div>
        <div className="w-full lg:w-[320px]">
          <Label className="text-xs mb-1 block">Prospectador</Label>
          <Select
            value={selectedProspectorId}
            onValueChange={setSelectedProspectorId}
            disabled={!isAdmin}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {prospectors.map((prospector) => (
                <SelectItem key={prospector.id} value={prospector.id}>
                  {prospector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cidades JÃ¡ Prospectadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{workspace.citiesProspected.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cidades EstratÃ©gicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{workspace.targetCities.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tarefas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{workspace.tasks.filter((t) => t.status !== 'done').length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Ãšltima AtualizaÃ§Ã£o</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{new Date(workspace.updatedAt).toLocaleString('pt-BR')}</p>
            <Badge variant="outline" className="mt-2">{selectedName}</Badge>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Cidades JÃ¡ Prospectadas</CardTitle>
            <CardDescription>HistÃ³rico das cidades e status para evitar retrabalho.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="Cidade" value={cityForm.city} onChange={(e) => setCityForm((p) => ({ ...p, city: e.target.value }))} />
              <Input placeholder="UF" value={cityForm.state} onChange={(e) => setCityForm((p) => ({ ...p, state: e.target.value }))} />
              <Input placeholder="Nicho (ex: clinicas)" value={cityForm.niche} onChange={(e) => setCityForm((p) => ({ ...p, niche: e.target.value }))} />
              <Input placeholder="Ãšltima aÃ§Ã£o (ex: 2 follow-ups)" value={cityForm.lastAction} onChange={(e) => setCityForm((p) => ({ ...p, lastAction: e.target.value }))} />
            </div>
            <Select value={cityForm.status} onValueChange={(v: ProspectedCity['status']) => setCityForm((p) => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="em_contato">Em contato</SelectItem>
                <SelectItem value="retornar">Retornar depois</SelectItem>
                <SelectItem value="sem_retorno">Sem retorno</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="ObservaÃ§Ãµes rÃ¡pidas..." value={cityForm.notes} onChange={(e) => setCityForm((p) => ({ ...p, notes: e.target.value }))} />
            <Button onClick={addProspectedCity}>Adicionar cidade prospectada</Button>

            <div className="space-y-2">
              {workspace.citiesProspected.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/30 p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.city} - {item.state}</p>
                    <p className="text-xs text-muted-foreground">Nicho: {item.niche || '-'} | Ãšltima aÃ§Ã£o: {item.lastAction || '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.notes || '-'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{item.status.replace('_', ' ')}</Badge>
                    <Button size="sm" variant="outline" onClick={() => removeItem('citiesProspected', item.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Cidades e Estados com Potencial</CardTitle>
            <CardDescription>Mapa tÃ¡tico do que vale a pena prospectar primeiro.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="Cidade alvo" value={targetForm.city} onChange={(e) => setTargetForm((p) => ({ ...p, city: e.target.value }))} />
              <Input placeholder="UF" value={targetForm.state} onChange={(e) => setTargetForm((p) => ({ ...p, state: e.target.value }))} />
              <Input placeholder="Canais (ex: OSM + Insta)" value={targetForm.channels} onChange={(e) => setTargetForm((p) => ({ ...p, channels: e.target.value }))} />
              <Input type="number" min="1" max="5" placeholder="Potencial 1-5" value={targetForm.potential} onChange={(e) => setTargetForm((p) => ({ ...p, potential: Math.max(1, Math.min(5, Number(e.target.value || 1))) }))} />
            </div>
            <Select value={targetForm.priority} onValueChange={(v: TargetCity['priority']) => setTargetForm((p) => ({ ...p, priority: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Prioridade Alta</SelectItem>
                <SelectItem value="media">Prioridade MÃ©dia</SelectItem>
                <SelectItem value="baixa">Prioridade Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Racional da oportunidade..." value={targetForm.notes} onChange={(e) => setTargetForm((p) => ({ ...p, notes: e.target.value }))} />
            <Button onClick={addTargetCity}>Adicionar oportunidade</Button>

            <div className="space-y-2">
              {workspace.targetCities.map((item) => (
                <div key={item.id} className="rounded-lg border border-border/30 p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.city} - {item.state}</p>
                    <p className="text-xs text-muted-foreground">Potencial: {item.potential}/5 | Canais: {item.channels || '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.notes || '-'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{item.priority}</Badge>
                    <Button size="sm" variant="outline" onClick={() => removeItem('targetCities', item.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Planejamento de Tarefas</CardTitle>
            <CardDescription>Controle semanal de follow-ups, testes e metas de contato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input placeholder="TÃ­tulo da tarefa" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} />
              <Input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <Select value={taskForm.status} onValueChange={(v: ProspectionTask['status']) => setTaskForm((p) => ({ ...p, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">A Fazer</SelectItem>
                <SelectItem value="doing">Em andamento</SelectItem>
                <SelectItem value="done">ConcluÃ­da</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Detalhes da tarefa..." value={taskForm.notes} onChange={(e) => setTaskForm((p) => ({ ...p, notes: e.target.value }))} />
            <Button onClick={addTask}>Adicionar tarefa</Button>

            <div className="space-y-2">
              {workspace.tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-border/30 p-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{task.title}</p>
                    <p className="text-xs text-muted-foreground">Prazo: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '-'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{task.notes || '-'}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Select value={task.status} onValueChange={(v: ProspectionTask['status']) => updateTaskStatus(task.id, v)}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">A Fazer</SelectItem>
                        <SelectItem value="doing">Em andamento</SelectItem>
                        <SelectItem value="done">ConcluÃ­da</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" onClick={() => removeItem('tasks', task.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Bloco de AnotaÃ§Ãµes EstratÃ©gicas</CardTitle>
            <CardDescription>Script vencedor, objeÃ§Ãµes recorrentes, gatilhos de fechamento e aprendizados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={workspace.notes}
              onChange={(e) => setWorkspace((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Exemplo:
- Cidades com maior resposta no nicho de clÃ­nicas.
- ObjeÃ§Ãµes mais comuns da semana.
- Ajustes de mensagem que aumentaram resposta."
              className="min-h-[300px]"
            />
            <Button onClick={saveNotes}>Salvar anotaÃ§Ãµes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

