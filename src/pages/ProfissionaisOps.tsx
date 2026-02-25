import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { UsersRound, Briefcase, SlidersHorizontal, Save } from 'lucide-react';
import {
  normalizePercentages,
  OPS_SPECIALTIES,
  type OpsProfessionalSpecialty,
  type OpsProfessional,
  type OpsSettings,
} from '@/lib/operations';
import { useOpsState } from '@/hooks/useOpsState';

function toggleSpecialty(prof: OpsProfessional, specialty: OpsProfessionalSpecialty): OpsProfessional {
  const has = prof.specialties.includes(specialty);
  const specialties = has ? prof.specialties.filter((s) => s !== specialty) : [...prof.specialties, specialty];
  return { ...prof, specialties: specialties.length > 0 ? specialties : ['design'] };
}

export default function ProfissionaisOps() {
  const { opsState, loadingOps, modeLabel, setAndPersist } = useOpsState();

  const professionals = useMemo(() => Object.values(opsState.professionals), [opsState.professionals]);

  const updateProfessional = (id: string, patch: Partial<OpsProfessional>) => {
    const next = {
      ...opsState,
      professionals: {
        ...opsState.professionals,
        [id]: { ...opsState.professionals[id], ...patch },
      },
    };
    setAndPersist(next);
  };

  const updateSettings = (patch: Partial<OpsSettings>) => {
    const normalized = normalizePercentages({ ...opsState.settings, ...patch });
    const next = { ...opsState, settings: normalized };
    setAndPersist(next);
  };

  const saveAll = () => {
    setAndPersist(opsState);
    toast.success('Configuracoes operacionais salvas.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Profissionais e Capacidade</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestao de especialistas, distribuicao justa e limites de fila por profissional.</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline">{modeLabel}</Badge>
            {loadingOps && <span className="text-[11px] text-muted-foreground">Sincronizando...</span>}
          </div>
        </div>
        <Button onClick={saveAll}>
          <Save className="w-4 h-4" /> Salvar configuracoes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><UsersRound className="w-4 h-4" /> Time operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{professionals.length}</p>
            <p className="text-xs text-muted-foreground">Profissionais monitorados no sistema</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4" /> Carga ativa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{professionals.reduce((s, p) => s + p.activeJobs, 0)}</p>
            <p className="text-xs text-muted-foreground">Jobs em producao neste momento</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><SlidersHorizontal className="w-4 h-4" /> Split de receita</CardTitle>
            <CardDescription>Regra base de distribuicao financeira</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Prospector %</Label>
                <Input type="number" value={opsState.settings.prospectorPercent} onChange={(e) => updateSettings({ prospectorPercent: Number(e.target.value || 0) })} />
              </div>
              <div>
                <Label className="text-xs">Executor %</Label>
                <Input type="number" value={opsState.settings.executorPercent} onChange={(e) => updateSettings({ executorPercent: Number(e.target.value || 0) })} />
              </div>
              <div>
                <Label className="text-xs">Agencia %</Label>
                <Input type="number" value={opsState.settings.agencyPercent} onChange={(e) => updateSettings({ agencyPercent: Number(e.target.value || 0) })} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Modo atual: {opsState.settings.distributionMode === 'fila' ? 'Fila justa' : 'Primeiro que pegar'}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Matriz de especialistas</CardTitle>
          <CardDescription>Ative especialidades, limite de jobs simultaneos e disponibilidade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {professionals.map((prof) => (
            <div key={prof.id} className="rounded-lg border border-border/30 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{prof.name}</p>
                  <p className="text-xs text-muted-foreground">{prof.email || 'sem email'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={prof.isAvailable ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}>
                    {prof.isAvailable ? 'Disponivel' : 'Pausado'}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={() => updateProfessional(prof.id, { isAvailable: !prof.isAvailable })}>
                    {prof.isAvailable ? 'Pausar' : 'Ativar'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {OPS_SPECIALTIES.map((s) => {
                  const selected = prof.specialties.includes(s.value);
                  return (
                    <Button
                      key={s.value}
                      size="sm"
                      variant={selected ? 'default' : 'outline'}
                      onClick={() => updateProfessional(prof.id, toggleSpecialty(prof, s.value))}
                    >
                      {s.label}
                    </Button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Jobs ativos</Label>
                  <Input type="number" value={prof.activeJobs} onChange={(e) => updateProfessional(prof.id, { activeJobs: Math.max(0, Number(e.target.value || 0)) })} />
                </div>
                <div>
                  <Label className="text-xs">Max jobs simultaneos</Label>
                  <Input type="number" value={prof.maxActiveJobs} onChange={(e) => updateProfessional(prof.id, { maxActiveJobs: Math.max(1, Number(e.target.value || 1)) })} />
                </div>
                <div>
                  <Label className="text-xs">Score qualidade (0-100)</Label>
                  <Input type="number" value={prof.qualityScore} onChange={(e) => updateProfessional(prof.id, { qualityScore: Math.max(0, Math.min(100, Number(e.target.value || 0))) })} />
                </div>
                <div>
                  <Label className="text-xs">Score SLA (0-100)</Label>
                  <Input type="number" value={prof.slaScore} onChange={(e) => updateProfessional(prof.id, { slaScore: Math.max(0, Math.min(100, Number(e.target.value || 0))) })} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

