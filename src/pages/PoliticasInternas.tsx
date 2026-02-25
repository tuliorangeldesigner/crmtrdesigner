import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, ShieldCheck, Users, Wallet, Workflow, Gavel } from 'lucide-react';

export default function PoliticasInternas() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Politicas Internas da Operacao</h1>
        <p className="text-muted-foreground text-sm mt-1">Regimento operacional para captação, distribuicao, entrega e repasse.</p>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <CardTitle className="text-base">Modelo de governanca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Lead pertence ao primeiro registro valido no CRM.</p>
          <p>2. Comissao e repasse so existem com pagamento confirmado.</p>
          <p>3. Toda alteracao de escopo, valor e split precisa de registro no CRM.</p>
          <p>4. Excecoes de fila exigem justificativa operacional.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-base">Distribuicao dos jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Fila por especialidade: design, video, motion, web, social e trafego.</p>
            <p>Prioridade: menor carga ativa, maior tempo sem job, melhor score.</p>
            <p>Sem capacidade disponivel: job permanece em aguardando.</p>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">Modo recomendado: fila justa</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-base">Split financeiro padrao</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Prospector: 10% da receita liquida.</p>
            <p>Executor(es): 45% da receita liquida.</p>
            <p>Agencia: 45% da receita liquida.</p>
            <p>Ajustes sao permitidos com aprovacao do admin e motivo registrado.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="w-5 h-5 text-secondary" />
          <CardTitle className="text-base">Transparencia obrigatoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Ao entrar em fechamento, abrir grupo no WhatsApp com cliente + gestor + prospectador dono do lead.</p>
          <p>No CRM devem constar: valor fechado, prazo, executor responsavel e status da entrega.</p>
          <p>Todos os envolvidos acompanham o desfecho e evitam conflito de informacao.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-base">Seguranca operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>RBAC: prospectador nao altera financeiro, executor nao altera comissao.</p>
            <p>Aprovacao dupla para desconto fora da politica.</p>
            <p>Historico de alteracoes deve ser auditavel.</p>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2">
            <Gavel className="w-5 h-5 text-red-400" />
            <CardTitle className="text-base">Disputa e penalidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Disputa deve ser aberta em ate 7 dias corridos.</p>
            <p>Decisao do admin em ate 5 dias uteis, com registro final.</p>
            <p>Fura-fila sem log e alteracao indevida de dados geram bloqueio operacional.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

