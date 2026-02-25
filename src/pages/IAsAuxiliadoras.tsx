import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, ExternalLink, AlertTriangle, Sparkles } from 'lucide-react';

const GPTS = [
  {
    id: 'prospector-pro',
    name: 'PROSPECTOR PRO - ESPECIALISTA EM PROSPECCAO',
    link: 'https://chatgpt.com/g/g-699f56a16f6481919bdf94a39d0331be-prospector-pro-especialista-em-prospeccao',
    description:
      'Focado em prospeccao para design grafico, logos, social media, web design, edicao de video e motion. Tambem ensina como prospectar na pratica.',
    useCases: [
      'Criar abordagens de prospeccao por nicho',
      'Montar mensagens de follow-up',
      'Identificar dor comercial e gerar gancho de conversa',
      'Ensinar como achar leads qualificados em canais gratuitos',
      'Explicar metodos free de prospeccao (Instagram, Google Maps, OSM e pesquisa manual)',
    ],
  },
  {
    id: 'tr-designer-crm',
    name: 'TR Designer - CRM',
    link: 'https://chatgpt.com/g/g-699f58d5b3c88191b25a960d4f033712-tr-designer-crm',
    description:
      'GPT professor para explicar como o CRM TR Designer funciona na pratica (fluxo, paginas e regras).',
    useCases: [
      'Treinar novos prospectadores no CRM',
      'Explicar como usar Leads, Kanban, Comissoes e Fila',
      'Tirar duvidas de operacao com passo a passo',
    ],
  },
];

export default function IAsAuxiliadoras() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">IAs Auxiliadoras</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Dois GPTs especializados para acelerar prospeccao e suporte de operacao do CRM.
        </p>
      </div>

      <Card className="border-border/40 bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Como usar os GPTs
          </CardTitle>
          <CardDescription>
            Ambos podem ser usados gratuitamente no ChatGPT, clicando diretamente nos botoes abaixo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Cada GPT foi criado para um objetivo especifico. Para melhor resultado, use cada um apenas no tema
            dele.
          </p>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="flex items-start gap-2 text-amber-300">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              No plano free do ChatGPT existem limites de uso. Evite gastar mensagens com assuntos fora do foco de
              cada GPT para nao acabar seu limite rapidamente.
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
            <p className="text-primary text-sm font-medium">No PROSPECTOR PRO, voce tambem pode pedir:</p>
            <p className="text-xs text-muted-foreground mt-1">
              metodos gratuitos de prospeccao, como encontrar leads, filtros por nicho/cidade, roteiros de abordagem
              e sequencia de follow-up para fechar mais.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {GPTS.map((gpt) => (
          <Card key={gpt.id} className="border-border/40 bg-card">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  {gpt.name}
                </CardTitle>
                <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10">
                  GPT
                </Badge>
              </div>
              <CardDescription>{gpt.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {gpt.useCases.map((item) => (
                  <p key={item} className="text-xs text-muted-foreground">
                    - {item}
                  </p>
                ))}
              </div>

              <Button asChild className="w-full">
                <a href={gpt.link} target="_blank" rel="noreferrer">
                  Abrir {gpt.name}
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
