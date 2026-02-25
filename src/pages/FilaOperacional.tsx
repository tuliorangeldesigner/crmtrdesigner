import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Clock3, PlayCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import {
  addManualQueueItem,
  assignNextInQueue,
  OPS_QUEUE_SPECIALTIES,
  updateQueueStatus,
  type OpsQueueSpecialty,
} from '@/lib/operations';
import { useOpsState } from '@/hooks/useOpsState';
import { useLeadsCache } from '@/hooks/useLeadsCache';

export default function FilaOperacional() {
  const { opsState, loadingOps, modeLabel, setAndPersist } = useOpsState();
  const { leads } = useLeadsCache();
  const [manualSpecialty, setManualSpecialty] = useState<OpsQueueSpecialty>('design');
  const [manualLeadId, setManualLeadId] = useState('');
  const [manualServiceType, setManualServiceType] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const queueBySpecialty = useMemo(() => {
    const map: Record<string, typeof opsState.queue> = {};
    OPS_QUEUE_SPECIALTIES.forEach((s) => {
      map[s.value] = opsState.queue.filter((q) => q.specialty === s.value && q.status !== 'entregue');
    });
    return map;
  }, [opsState.queue]);

  const assignNext = (specialty: OpsQueueSpecialty) => {
    const next = assignNextInQueue(opsState, specialty);
    if (next === opsState) {
      toast.error('Nao foi possivel atribuir: sem fila ou sem profissional elegivel.');
      return;
    }
    setAndPersist(next);
    toast.success(`Proximo job de ${specialty} atribuido por fila.`);
  };

  const markStatus = (queueId: string, status: 'em_producao' | 'entregue') => {
    const next = updateQueueStatus(opsState, queueId, status);
    setAndPersist(next);
    toast.success(status === 'entregue' ? 'Entrega concluida.' : 'Job iniciado em producao.');
  };

  const refreshQueue = () => {
    setAndPersist(opsState);
    toast.success('Fila sincronizada.');
  };

  const addManual = () => {
    if (!manualLeadId) {
      toast.error('Selecione um lead para criar job manual.');
      return;
    }
    const lead = leads.find((l) => l.id === manualLeadId);
    if (!lead) {
      toast.error('Lead nao encontrado.');
      return;
    }

    const next = addManualQueueItem(opsState, {
      leadId: lead.id,
      leadName: lead.nome_empresa || lead.nome_cliente,
      serviceType: manualServiceType || lead.tipo_servico || 'Servico manual',
      specialty: manualSpecialty,
      notes: manualNotes || 'Criado manualmente pelo admin',
    });

    if (next === opsState) {
      toast.error('Ja existe job ativo desse lead nesta especialidade.');
      return;
    }

    const assigned = assignNextInQueue(next, manualSpecialty);
    setAndPersist(assigned);
    toast.success('Job manual criado e processado na fila.');
    setManualNotes('');
    setManualServiceType('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Fila de Producao</h1>
          <p className="text-muted-foreground text-sm mt-1">Distribuicao operacional por especialidade, com fila justa e controle de status.</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{modeLabel}</Badge>
            {loadingOps && <span className="text-[11px] text-muted-foreground">Sincronizando...</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={manualSpecialty} onValueChange={(v) => setManualSpecialty(v as OpsQueueSpecialty)}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {OPS_QUEUE_SPECIALTIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => assignNext(manualSpecialty)}>
            <PlayCircle className="w-4 h-4" /> Atribuir proximo
          </Button>
          <Button variant="outline" onClick={refreshQueue}>
            <RefreshCw className="w-4 h-4" /> Sincronizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-3 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Criar job manual</CardTitle>
            <CardDescription>Use quando quiser iniciar a producao sem depender de lead fechado/pago.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="space-y-2 lg:col-span-2">
              <Label>Lead</Label>
              <Select value={manualLeadId} onValueChange={setManualLeadId}>
                <SelectTrigger><SelectValue placeholder="Selecione um lead" /></SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {(lead.nome_empresa || lead.nome_cliente)} - {lead.status_pipeline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Select value={manualSpecialty} onValueChange={(v) => setManualSpecialty(v as OpsQueueSpecialty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {OPS_QUEUE_SPECIALTIES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Servico</Label>
              <Input value={manualServiceType} onChange={(e) => setManualServiceType(e.target.value)} placeholder="Ex: Landing Page + criativos" />
            </div>
            <div className="space-y-2 lg:col-span-3">
              <Label>Observacoes</Label>
              <Textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} placeholder="Briefing rapido do job..." />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={addManual}>
                <PlayCircle className="w-4 h-4" /> Criar e processar
              </Button>
            </div>
          </CardContent>
        </Card>

        {OPS_QUEUE_SPECIALTIES.map((specialty) => {
          const items = queueBySpecialty[specialty.value] || [];
          return (
            <Card key={specialty.value} className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{specialty.label}</CardTitle>
                <CardDescription>{items.length} job(s) ativos na fila</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button size="sm" variant="outline" className="w-full" onClick={() => assignNext(specialty.value)}>
                  <PlayCircle className="w-4 h-4" /> Distribuir por fila
                </Button>

                {items.length === 0 && <p className="text-xs text-muted-foreground">Sem jobs nesta especialidade.</p>}

                {items.map((item) => {
                  const prof = item.assignedProfessionalId ? opsState.professionals[item.assignedProfessionalId] : null;
                  return (
                    <div key={item.id} className="rounded-lg border border-border/50 p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold">{item.leadName}</p>
                          <p className="text-xs text-muted-foreground">{item.serviceType}</p>
                        </div>
                        <Badge variant="outline" className={
                          item.status === 'aguardando'
                            ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                            : item.status === 'atribuido'
                              ? 'border-blue-500/30 text-blue-400 bg-blue-500/10'
                              : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }>
                          {item.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">Responsavel: {prof?.name || 'Aguardando atribuicao'}</p>

                      <div className="flex gap-2">
                        {item.status === 'atribuido' && (
                          <Button size="sm" variant="outline" onClick={() => markStatus(item.id, 'em_producao')}>
                            <Clock3 className="w-3.5 h-3.5" /> Em producao
                          </Button>
                        )}
                        {(item.status === 'atribuido' || item.status === 'em_producao') && (
                          <Button size="sm" onClick={() => markStatus(item.id, 'entregue')}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

