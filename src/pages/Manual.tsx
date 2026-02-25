import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
    BookOpen, Target, ArrowRight, DollarSign, AlertCircle,
    CheckCircle2, MessageSquare, Search, MapPin, Instagram, Smartphone,
    Bot, TrendingUp, Flame, Star, XCircle, Mic, Clock, Users, Zap, Copy,
    Columns3, LayoutDashboard
} from 'lucide-react';

const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Script copiado!');
};

export default function Manual() {
    return (
        <div className="space-y-8 max-w-4xl pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">📘 Manual do Prospectador</h1>
                <p className="text-muted-foreground mt-1">
                    Captação de clientes para serviços digitais (Design / Sites / Vídeos)
                </p>
            </div>

            {/* Menu de Navegação Interna */}
            <div className="flex flex-wrap gap-2 pt-2 border-b border-border pb-4">
                <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href="#como-usar-crm">Como Usar o CRM</a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href="#scripts">Scripts de Abordagem</a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href="#comissoes">Regras de Comissão</a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href="#uso-ia">Uso de IA</a>
                </Button>
                <Button variant="outline" size="sm" asChild className="text-xs">
                    <a href="#mapa-prospeccao">Mapa de Prospeccao</a>
                </Button>
            </div>

            {/* =================== SEÇÃO 1: OBJETIVO =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Seu Objetivo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        Você <strong className="text-foreground">NÃO</strong> vai vender diretamente. Seu papel é:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Encontrar empresas', 'Iniciar conversa', 'Gerar interesse', 'Levar ao fechamento'].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm bg-primary/5 rounded-lg p-3">
                                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                                <span className="text-foreground text-xs font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="bg-secondary/5 rounded-lg p-3 mt-2">
                        <p className="text-xs text-secondary font-medium">💡 Lembre-se: Você não está vendendo design. Você está vendendo <strong>mais clientes, mais dinheiro e mais autoridade</strong> para o negócio deles.</p>
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 2: SERVIÇOS =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <CardTitle className="text-base">O Que Você Oferece</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            'Identidade visual / Logo',
                            'Sites e Landing Pages',
                            'Posts para Instagram',
                            'Criativos em Vídeo (Reels/Anúncios)',
                        ].map((serv, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{serv}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 3: ONDE PROSPECTAR =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Search className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-base">Onde Prospectar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-lg border border-border p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium"><Instagram className="w-4 h-4 text-pink-400" /> Instagram</div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Buscar perfis por nicho</li>
                                <li>• Entrar no perfil e analisar rapidamente</li>
                                <li>• Enviar DM com o script</li>
                            </ul>
                        </div>
                        <div className="rounded-lg border border-border p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium"><MapPin className="w-4 h-4 text-red-400" /> Google Maps</div>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>• Pesquisar: "dentista + cidade", "hamburgueria + cidade"</li>
                                <li>• Abrir empresas e copiar nome, Instagram, tipo</li>
                                <li>• Pegar WhatsApp ou Instagram e abordar</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

                        {/* =================== SEÇÃO 4: NICHOS =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Nichos Prioritários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {['🦷 Dentistas', '💅 Estética / Salão / Lash', '🍔 Restaurantes / Hamburguerias', '🏋️ Academia / Personal', '🏠 Imobiliária / Corretores'].map(n => (
                            <Badge key={n} className="bg-emerald-500/10 text-emerald-400 border-transparent">{n}</Badge>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs text-muted-foreground mr-1">⚠️ Evite:</span>
                        {['Advogados', 'Empresas grandes', 'Negócios muito estruturados'].map(n => (
                            <Badge key={n} variant="outline" className="bg-red-500/10 text-red-400 border-transparent text-xs">{n}</Badge>
                        ))}
                    </div>
                    <div className="rounded-lg border border-border p-3 bg-background/40 space-y-3">
                        <p className="text-xs font-semibold text-foreground">Estados e cidades para priorizar (com motivo)</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-md border border-border/50 p-2">
                                <p className="text-xs font-medium text-foreground">SP: Sao Paulo, Campinas, Guarulhos, Osasco</p>
                                <p className="text-xs text-muted-foreground mt-1">Maior volume de empresas locais e alta competicao digital. Dor forte de conversao e apresentacao visual.</p>
                            </div>
                            <div className="rounded-md border border-border/50 p-2">
                                <p className="text-xs font-medium text-foreground">MG: Belo Horizonte, Uberlandia, Contagem</p>
                                <p className="text-xs text-muted-foreground mt-1">Mercado em crescimento com boa resposta para servicos remotos. Excelente para saude, estetica e servicos locais.</p>
                            </div>
                            <div className="rounded-md border border-border/50 p-2">
                                <p className="text-xs font-medium text-foreground">RJ: Rio de Janeiro, Niteroi, Duque de Caxias</p>
                                <p className="text-xs text-muted-foreground mt-1">Mercado muito visual (Instagram forte). Bons resultados para beleza, gastronomia e nichos de alto apelo visual.</p>
                            </div>
                            <div className="rounded-md border border-border/50 p-2">
                                <p className="text-xs font-medium text-foreground">PR/SC/RS: Curitiba, Joinville, Porto Alegre</p>
                                <p className="text-xs text-muted-foreground mt-1">Empresas mais estruturadas e previsiveis. Melhor taxa de fechamento com follow-up consistente.</p>
                            </div>
                            <div className="rounded-md border border-border/50 p-2 md:col-span-2">
                                <p className="text-xs font-medium text-foreground">GO/DF: Goiania e Brasilia</p>
                                <p className="text-xs text-muted-foreground mt-1">Regiao com forte crescimento e muitos negocios buscando posicionamento rapido para ganhar mercado.</p>
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                            Dica pratica: comece pelas capitais e cidades acima de 300 mil habitantes, depois avance para cidades satelite onde o mesmo nicho ja mostrou conversao.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border border-blue-500/20" id="mapa-prospeccao"> 
                <CardHeader className="flex flex-row items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-base">Mapa de Prospeccao (Regioes, Estados, Cidades e Dores)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Priorize mercados com alta concentracao de pequenas e medias empresas, maior ticket de servicos e forte competicao digital.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-lg border border-border p-3 bg-background/40">
                            <p className="text-xs font-semibold text-foreground mb-2">Melhores regioes</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>1. Sudeste (maior volume e ticket)</li>
                                <li>2. Sul (alta maturidade e recorrencia)</li>
                                <li>3. Centro-Oeste (crescimento acelerado)</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border p-3 bg-background/40">
                            <p className="text-xs font-semibold text-foreground mb-2">Estados para priorizar</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>SP, MG, RJ</li>
                                <li>PR, SC, RS</li>
                                <li>GO e DF</li>
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border p-3 bg-background/40">
                            <p className="text-xs font-semibold text-foreground mb-2">Cidades com alto potencial</p>
                            <ul className="text-xs text-muted-foreground space-y-1">
                                <li>Sao Paulo, Campinas, Guarulhos</li>
                                <li>Belo Horizonte, Uberlandia, Contagem</li>
                                <li>Rio de Janeiro, Niteroi, Duque de Caxias</li>
                                <li>Curitiba, Joinville, Porto Alegre</li>
                                <li>Goiania, Brasilia</li>
                            </ul>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-amber-500/5">
                        <p className="text-xs font-semibold text-foreground mb-2">Nichos com maior dor (prioridade alta)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <p><strong className="text-foreground">Saude e estetica local:</strong> dependem de agenda diaria, perfil fraco reduz confianca e conversao.</p>
                            <p><strong className="text-foreground">Restaurantes e delivery:</strong> guerra por atencao no feed e anuncio, criativo ruim derruba pedidos.</p>
                            <p><strong className="text-foreground">Imobiliarias e corretores:</strong> precisam de autoridade visual e videos para acelerar visitas.</p>
                            <p><strong className="text-foreground">Academias e studios:</strong> precisam de constancia, prova social e oferta clara para fechar planos.</p>
                            <p><strong className="text-foreground">Clinicas odontologicas:</strong> alto LTV por paciente, mas pouca estrategia de conteudo e funil.</p>
                            <p><strong className="text-foreground">Comercio local premium:</strong> ticket medio alto, mas marca despadronizada e baixa percepcao de valor.</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-primary/5">
                        <p className="text-xs font-semibold text-foreground mb-2">Cidades que valem teste imediato (expansao)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <p><strong className="text-foreground">Sudeste:</strong> Sao Paulo, Campinas, Ribeirao Preto, Sao Jose dos Campos, Rio de Janeiro, Niteroi, Belo Horizonte.</p>
                            <p><strong className="text-foreground">Sul:</strong> Curitiba, Florianopolis e Porto Alegre (boa conversao e menor pressao de preco).</p>
                            <p><strong className="text-foreground">Nordeste:</strong> Recife, Fortaleza e Salvador (crescimento digital e concorrencia menos estruturada).</p>
                            <p><strong className="text-foreground">Regra de ouro:</strong> onde ha empresa + digitalizacao + dinheiro circulando, o fechamento tende a ser mais rapido.</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-emerald-500/5">
                        <p className="text-xs font-semibold text-foreground mb-2">Nichos que mais compram e pagam melhor</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                            <p><strong className="text-foreground">Infoprodutores / Experts:</strong> ticket alto, recompra e necessidade constante de landing, criativos e videos.</p>
                            <p><strong className="text-foreground">Clinicas esteticas e odontologicas:</strong> precisam parecer premium para converter agenda.</p>
                            <p><strong className="text-foreground">Empresas locais estruturadas:</strong> imobiliarias, construtoras e contabilidades compram recorrencia.</p>
                            <p><strong className="text-foreground">E-commerce / Dropshipping:</strong> demanda alta por criativos e paginas para escalar.</p>
                            <p><strong className="text-foreground">Food premium:</strong> entrada simples e dor visual imediata em redes sociais.</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-background/40">
                        <p className="text-xs font-semibold text-foreground mb-2">Perspectivas estrategicas para aumentar conversao</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>1. Interior forte pode fechar melhor que capital (menos leilao de preco e mais fidelidade).</li>
                            <li>2. Nicho certo pesa mais que localizacao: foque em dor urgente + capacidade de pagamento.</li>
                            <li>3. Quem ja anuncia e lead quente: entende ROI e compra mais rapido.</li>
                            <li>4. Venda resultado, nao arte: mais clientes, autoridade e faturamento.</li>
                        </ul>
                    </div>

                    <div className="rounded-lg border border-border p-3 bg-secondary/10">
                        <p className="text-xs font-semibold text-foreground mb-2">Plano de acao imediato (5 passos)</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>1. Escolha 2 nichos para dominar (ex.: infoprodutores + clinicas esteticas).</li>
                            <li>2. Escolha 3 regioes foco (ex.: Sao Paulo, Curitiba e Belo Horizonte).</li>
                            <li>3. Faca prospeccao cirurgica em Instagram, Google Maps e Ads Library.</li>
                            <li>4. Aborde pela dor de conversao: visual atual nao performa no potencial do negocio.</li>
                            <li>5. Ofereca pacote (identidade + landing + criativos), nao servico isolado.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 5: SCRIPTS =================== */}
            <Card className="bg-card border-border" id="scripts">
                <CardHeader className="flex flex-row items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Scripts de Abordagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Abordagem Inicial Instagram */}
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Instagram className="w-4 h-4 text-pink-400" /> Abordagem Inicial (Instagram – DM)
                        </h3>
                        <div className="grid gap-3">
                            {[
                                { label: 'Modelo Padrão', text: 'Fala, tudo bem?\n\nVi o perfil de vocês e achei o trabalho bem interessante 👏\n\nNotei alguns pontos que poderiam melhorar a apresentação e ajudar a atrair mais clientes.\n\nVocê que cuida do Instagram aí?' },
                                { label: 'Modelo Direto', text: 'Oi, tudo bem?\n\nDei uma olhada no perfil de vocês e vi que dá pra melhorar bastante a parte visual pra atrair mais clientes.\n\nVocê que cuida disso por aí?' },
                                { label: 'Modelo Leve', text: 'Oi! Tudo bem?\n\nPassei pelo perfil de vocês e gostei do trabalho 👏\n\nFiquei com algumas ideias de melhoria que podem ajudar a trazer mais clientes.\n\nVocê que gerencia o Instagram?' },
                            ].map((m, i) => (
                                <div key={i} className="bg-muted/20 rounded-lg p-3 border border-border/50 group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-primary/10 text-primary border-transparent text-[10px]">{m.label}</Badge>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => copyToClipboard(m.text)}
                                        >
                                            <Copy className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground whitespace-pre-line">{m.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Abordagem Google Maps / WhatsApp */}
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Smartphone className="w-4 h-4 text-green-400" /> Abordagem (Google Maps / WhatsApp)
                        </h3>
                        <div className="bg-muted/20 rounded-lg p-3 border border-border/50 group relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard('Olá, tudo bem?\n\nEncontrei sua empresa no Google e dei uma olhada no perfil de vocês.\n\nTrabalho ajudando empresas a melhorar a presença digital (logo, Instagram, site e criativos).\n\nVi algumas oportunidades que podem aumentar a entrada de clientes.\n\nVocê é o responsável pela parte de marketing?')}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{'Olá, tudo bem?\n\nEncontrei sua empresa no Google e dei uma olhada no perfil de vocês.\n\nTrabalho ajudando empresas a melhorar a presença digital (logo, Instagram, site e criativos).\n\nVi algumas oportunidades que podem aumentar a entrada de clientes.\n\nVocê é o responsável pela parte de marketing?'}</p>
                        </div>
                    </div>

                    {/* Continuação */}
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <ArrowRight className="w-4 h-4 text-secondary" /> Se Responder → Continuação
                        </h3>
                        <div className="bg-muted/20 rounded-lg p-3 border border-border/50 space-y-2 group relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(`Top 👌\n\nHoje o Instagram é um dos principais canais pra atrair cliente, mas muita gente acaba perdendo oportunidade por causa da apresentação.\n\nEu ajudo empresas com:\n• Identidade visual\n• Posts estratégicos\n• Vídeos e criativos\n\nTudo focado em gerar mais clientes.\n\nPosso te mostrar algumas ideias rápidas pro seu perfil, sem compromisso. Quer?`)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground">Top 👌</p>
                            <p className="text-xs text-muted-foreground">Hoje o Instagram é um dos principais canais pra atrair cliente, mas muita gente acaba perdendo oportunidade por causa da apresentação.</p>
                            <p className="text-xs text-muted-foreground">Eu ajudo empresas com:</p>
                            <ul className="text-xs text-muted-foreground list-disc ml-4">
                                <li>Identidade visual</li>
                                <li>Posts estratégicos</li>
                                <li>Vídeos e criativos</li>
                            </ul>
                            <p className="text-xs text-muted-foreground">Tudo focado em gerar mais clientes.</p>
                            <p className="text-xs text-primary font-medium">Posso te mostrar algumas ideias rápidas pro seu perfil, sem compromisso. Quer?</p>
                        </div>
                    </div>

                    {/* Se demonstrar interesse */}
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Flame className="w-4 h-4 text-orange-400" /> Se Demonstrar Interesse
                        </h3>
                        <div className="bg-muted/20 rounded-lg p-3 border border-border/50 space-y-2 group relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(`Boa! Olhando rapidamente seu perfil:\n\nDá pra melhorar o visual dos posts\nFalta padronização\nDá pra explorar melhor conteúdo que gera cliente\n\nSe quiser, te explico como eu faria no seu caso e te passo um valor. Aí você vê se faz sentido.`)}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground">Boa! Olhando rapidamente seu perfil:</p>
                            <ul className="text-xs text-muted-foreground list-disc ml-4">
                                <li>Dá pra melhorar o visual dos posts</li>
                                <li>Falta padronização</li>
                                <li>Dá pra explorar melhor conteúdo que gera cliente</li>
                            </ul>
                            <p className="text-xs text-primary font-medium">Se quiser, te explico como eu faria no seu caso e te passo um valor. Aí você vê se faz sentido.</p>
                        </div>
                    </div>

                    {/* Chamar o Closer */}
                    <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
                            <Zap className="w-4 h-4 text-yellow-400" /> Passar para o Gestor (Closer)
                        </h3>
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 group relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard('Se quiser, posso te colocar em contato direto com quem faz essa parte aqui comigo.\n\nEle analisa seu perfil e já te mostra o que pode ser melhorado.')}
                            >
                                <Copy className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground">Se quiser, posso te colocar em contato direto com quem faz essa parte aqui comigo.</p>
                            <p className="text-xs text-muted-foreground">Ele analisa seu perfil e já te mostra o que pode ser melhorado.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 6: SCRIPTS POR NICHO =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Target className="w-5 h-5 text-secondary" />
                    <CardTitle className="text-base">Abordagem Personalizada por Nicho</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {[
                            { nicho: '🦷 Dentista', msg: 'Vi que vocês trabalham com estética/implante.\n\nHoje o Instagram influencia muito na decisão do paciente.\n\nNotei que dá pra deixar o perfil mais profissional e atrair mais pacientes.\n\nVocê cuida dessa parte?' },
                            { nicho: '💅 Estética', msg: 'Vi seu trabalho e tá muito bom 👏\n\nMas seu Instagram não tá valorizando isso como poderia.\n\nCom alguns ajustes, dá pra atrair muito mais clientes.\n\nVocê mesma que cuida do perfil?' },
                            { nicho: '🍔 Restaurante', msg: 'Vi o perfil de vocês e deu até fome 😅\n\nMas dá pra melhorar bastante a apresentação dos produtos.\n\nIsso impacta direto nas vendas.\n\nVocê cuida do marketing aí?' },
                            { nicho: '🏋️ Fitness', msg: 'Vi seu conteúdo e você tem potencial pra crescer mais.\n\nMas o perfil ainda não passa toda a autoridade que poderia.\n\nCom ajustes, dá pra atrair mais alunos.\n\nVocê que gerencia isso?' },
                            { nicho: '🏠 Imobiliária', msg: 'Vi alguns imóveis que vocês postaram.\n\nMas a apresentação ainda não valoriza o potencial.\n\nIsso impacta nas vendas.\n\nVocê cuida disso?' },
                        ].map((n, i) => (
                            <div key={i} className="bg-muted/20 rounded-lg p-3 border border-border/50 group relative">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge className="bg-secondary/10 text-secondary border-transparent text-[10px]">{n.nicho}</Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => copyToClipboard(n.msg)}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground whitespace-pre-line">{n.msg}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 7: OBJEÇÕES =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <CardTitle className="text-base">Respostas para Objeções</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {[
                            { obj: '💸 "Não tenho dinheiro agora"', resp: 'Tranquilo, entendo. Mas hoje você pode estar perdendo mais cliente do que imagina por causa disso. Às vezes um pequeno ajuste já começa a trazer retorno rápido.' },
                            { obj: '⏳ "Depois vejo isso"', resp: 'Perfeito. Mas quanto mais você adia, mais clientes acabam indo pra concorrência. Se quiser, te mostro agora rapidinho e você decide depois com calma.' },
                            { obj: '🤔 "Vou pensar"', resp: 'Claro, sem problema. Só me diz: o que te deixou em dúvida? Assim consigo te explicar melhor.' },
                            { obj: '💰 "Tá caro"', resp: 'Entendo. Mas isso não é custo, é investimento pra trazer mais cliente. Se voltar 1 ou 2 clientes já se paga.' },
                            { obj: '🙅 "Não tenho interesse"', resp: 'Tranquilo. Só por curiosidade: hoje você já está satisfeito com a quantidade de clientes que chegam?' },
                        ].map((o, i) => (
                            <div key={i} className="bg-muted/20 rounded-lg p-3 border border-border/50 group relative">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => copyToClipboard(`${o.obj}\n${o.resp}`)}
                                >
                                    <Copy className="w-3 h-3" />
                                </Button>
                                <p className="text-xs font-semibold text-foreground mb-1">{o.obj}</p>
                                <p className="text-xs text-muted-foreground">{o.resp}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 8: FOLLOW-UP =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <CardTitle className="text-base">Sequência de Follow-Up</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3">
                        {[
                            { dia: 'Dia 1', msg: 'Conseguiu ver o que te falei? Tem alguns pontos no seu perfil que podem melhorar bastante o resultado.' },
                            { dia: 'Dia 2', msg: 'Passei aqui de novo e vi mais algumas melhorias que dariam resultado rápido. Se quiser te explico.' },
                            { dia: 'Dia 3', msg: 'Normalmente quem aplica essas melhorias começa a ver diferença rápido. Se quiser, ainda posso te mostrar.' },
                            { dia: 'Dia 5', msg: 'Se não for prioridade agora, tranquilo. Mas quando quiser melhorar essa parte, me chama.' },
                        ].map((f, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <Badge className="bg-blue-500/10 text-blue-400 border-transparent shrink-0 text-[10px]">{f.dia}</Badge>
                                <p className="text-xs text-muted-foreground">{f.msg}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 9: ÁUDIOS =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Roteiro de Áudios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                    <p><strong className="text-foreground">Áudio 1:</strong> "Fala, tudo bem? Dei uma olhada no seu perfil e vi que tem bastante potencial. Mas tem alguns pontos que podem estar te fazendo perder cliente."</p>
                    <p><strong className="text-foreground">Áudio 2:</strong> "Hoje muita gente perde cliente por causa da apresentação. Perfil desorganizado, visual fraco… Isso impacta direto na decisão."</p>
                    <p><strong className="text-foreground">Áudio 3:</strong> "Se quiser, posso te mostrar exatamente o que dá pra melhorar. Aí você decide se faz sentido."</p>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 10: USO DE IA =================== */}
            <Card className="bg-card border-border border-secondary/30" id="uso-ia">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Bot className="w-5 h-5 text-secondary" />
                    <CardTitle className="text-base">Usando IA para Prospectar (ChatGPT / Gemini)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        Use IA para: encontrar leads mais rápido, criar mensagens personalizadas, identificar oportunidades e aumentar sua produtividade.
                    </p>

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Prompts prontos para copiar:</h4>

                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <Badge className="bg-secondary/10 text-secondary border-transparent text-[10px] mb-2">Analisar Empresa</Badge>
                            <p className="text-xs text-muted-foreground font-mono whitespace-pre-line">{'Analise essa empresa:\n\nNome: [nome]\nInstagram: [@perfil]\nNicho: [tipo de negócio]\n\nMe diga:\n1. Se o perfil tem potencial de melhoria\n2. O que pode ser melhorado no visual\n3. Uma abordagem personalizada para esse negócio'}</p>
                        </div>

                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <Badge className="bg-secondary/10 text-secondary border-transparent text-[10px] mb-2">Gerar Mensagem</Badge>
                            <p className="text-xs text-muted-foreground font-mono whitespace-pre-line">{'Crie uma mensagem de prospecção para essa empresa:\n\nNicho: [ex: dentista]\nNome: [nome]\nProblema: perfil desorganizado\n\nA mensagem deve ser natural, curta e gerar interesse.'}</p>
                        </div>

                        <div className="bg-background/50 rounded-lg p-3 border border-border/50">
                            <Badge className="bg-secondary/10 text-secondary border-transparent text-[10px] mb-2">Responder Cliente</Badge>
                            <p className="text-xs text-muted-foreground font-mono whitespace-pre-line">{'Aqui está a conversa com um potencial cliente:\n\n[cole a conversa]\n\nMe diga a melhor resposta para continuar a conversa e gerar interesse.'}</p>
                        </div>
                    </div>

                    <div className="bg-secondary/5 rounded-lg p-3">
                        <p className="text-xs text-secondary font-medium">⚠️ Regras: Não copie sem ler • Não use mensagem robótica • Sempre adapte • IA é apoio, você executa.</p>
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 11: COMISSÕES =================== */}
            <Card className="bg-card border-border border-emerald-500/30" id="comissoes">
                <CardHeader className="flex flex-row items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <CardTitle className="text-base">Modelo de Comissão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Você ganha por <strong className="text-foreground">cliente fechado</strong> + <strong className="text-foreground">pagamento confirmado</strong>.</p>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { range: '1 a 3 vendas', pct: '10%', color: 'text-blue-400 bg-blue-500/10' },
                            { range: '4 a 10 vendas', pct: '15%', color: 'text-primary bg-primary/10' },
                            { range: '+10 vendas', pct: '20%', color: 'text-emerald-400 bg-emerald-500/10' },
                        ].map((c, i) => (
                            <div key={i} className={`rounded-lg p-3 text-center ${c.color}`}>
                                <p className="text-2xl font-bold">{c.pct}</p>
                                <p className="text-[10px] mt-1">{c.range}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                            { label: 'Logo R$300', val10: 'R$30', val20: 'R$60' },
                            { label: 'Venda R$500', val10: 'R$50', val20: 'R$100' },
                            { label: 'Site R$800', val10: 'R$80', val20: 'R$160' },
                            { label: '10x R$500', val10: '', val20: 'R$1.000 (20%)' },
                        ].map((ex, i) => (
                            <div key={i} className="bg-muted/20 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-muted-foreground">{ex.label}</p>
                                <p className="text-xs font-bold text-emerald-400">{ex.val20 || `${ex.val10} a ${ex.val20}`}</p>
                                {ex.val10 && ex.val20 && <p className="text-[10px] text-muted-foreground">{ex.val10} ~ {ex.val20}</p>}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-start gap-2 bg-emerald-500/5 rounded-lg p-3">
                        <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-muted-foreground"><strong className="text-emerald-400">Ganho realista:</strong> 1 venda/dia × R$50 = até <strong className="text-emerald-400">R$1.500/mês</strong>. Sem limite de ganhos!</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border border-primary/30">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Fluxo com Especialistas e Fila Operacional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs text-muted-foreground">
                    <p>Quando o lead fechar, ele entra na fila operacional por especialidade (Design, Video, Motion, Web, Social ou Trafego).</p>
                    <ul className="list-disc ml-5 space-y-2">
                        <li><strong className="text-foreground">Distribuicao padrao:</strong> por fila justa (menor carga ativa, maior tempo sem job e melhor score).</li>
                        <li><strong className="text-foreground">Transparencia obrigatoria:</strong> abrir grupo no WhatsApp com cliente + gestor + prospectador dono do lead.</li>
                        <li><strong className="text-foreground">Registro no CRM:</strong> valor fechado, responsavel da entrega, prazo e status do job.</li>
                        <li><strong className="text-foreground">Comissao:</strong> so conta quando o cliente estiver com pagamento confirmado.</li>
                    </ul>
                    <p>As regras completas ficam na pagina <strong className="text-foreground">Politicas Internas</strong>.</p>
                </CardContent>
            </Card>
            {/* =================== SEÇÃO 12: META DIÁRIA =================== */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Meta Diária e Fluxo de Trabalho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Mensagens/dia', val: '50-100', icon: '📩' },
                            { label: 'Respostas esperadas', val: '~10', icon: '💬' },
                            { label: 'Interessados', val: '~2', icon: '🔥' },
                            { label: 'Potencial cliente', val: '~1', icon: '🎯' },
                        ].map((m, i) => (
                            <div key={i} className="bg-muted/20 rounded-lg p-3 text-center">
                                <p className="text-lg">{m.icon}</p>
                                <p className="text-lg font-bold text-foreground">{m.val}</p>
                                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Fluxo:</span>
                        {['Enviar mensagem', 'Cliente responde', 'Continuar conversa', 'Interesse confirmado', 'Chamar o gestor'].map((step, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground/50" />}
                                <span>{step}</span>
                            </span>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 13: ERROS E REGRAS =================== */}
            <Card className="bg-card border-border border-red-500/20">
                <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <CardTitle className="text-base">Regras e Erros a Evitar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-red-400">❌ NÃO FAÇA:</p>
                            {['Vender diretamente', 'Mandar preço', 'Forçar a venda', 'Mandar tudo de uma vez', 'Copiar e colar sem adaptar', 'Mensagem genérica tipo spam', 'Desistir rápido', 'Demorar para responder'].map(r => (
                                <div key={r} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                                    <span>{r}</span>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-emerald-400">✅ FAÇA:</p>
                            {['Ser natural na conversa', 'Esperar resposta antes de continuar', 'Adaptar mensagem ao perfil', 'Gerar interesse, não vender', 'Anotar observações no CRM', 'Preencher valor do serviço', 'Atualizar status do pipeline', 'Registrar todo lead no sistema'].map(r => (
                                <div key={r} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                                    <span>{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* =================== SEÇÃO 14: COMO USAR O CRM =================== */}
            <Card className="bg-card border-border" id="como-usar-crm">
                <CardHeader className="flex flex-row items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">Guia Completo: Como Usar o CRM Passo a Passo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm text-foreground font-medium">O CRM (Customer Relationship Management) é o seu escritório central. É aqui que você organiza todos os contatos com as empresas e acompanha o que vai virar dinheiro. Veja as telas principais:</p>
                    </div>

                    <div className="grid gap-4">
                        <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-primary"><Users className="w-5 h-5" /> 1. Tela de Leads (A sua base de clientes)</h4>
                            <p className="text-xs text-muted-foreground">Aqui ficam todos os clientes que você está abordando ou já abordou.</p>
                            <ul className="text-xs text-muted-foreground list-disc ml-5 space-y-2">
                                <li><strong>Cadastrar um novo lead:</strong> Achou uma empresa no Instagram? Antes de fazer qualquer coisa, clique em <code>+ Novo Lead</code>. Coloque o Nome, o Contato, a Origem (Instagram/Google) e defina o Status Inicial (ex: Contatado).</li>
                                <li><strong>Por que registrar tudo?</strong> O cérebro esquece, o CRM não. Se você mandar 50 mensagens por dia e não registrar, não vai saber para quem precisa mandar segunda mensagem amanhã (o famoso Follow-up).</li>
                                <li><strong>Acessar detalhes:</strong> A qualquer momento, se você clicar no nome do Lead na tabela, vai abrir a ficha dele para você alterar telefone, nome ou adicionar observações.</li>
                            </ul>
                        </div>

                        <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-blue-400"><Columns3 className="w-5 h-5" /> 2. Tela Kanban (Seu funil de fechamento visual)</h4>
                            <p className="text-xs text-muted-foreground">Para quem prefere um visual de "quadro", aqui você enxerga claramente quem tá perto de fechar.</p>
                            <ul className="text-xs text-muted-foreground list-disc ml-5 space-y-2">
                                <li><strong>Arraste os cartões:</strong> Cada cliente é um cartãozinho. Se você mandou mensagem, ele tá em "Contatado". O cliente respondeu? <strong>Clique e arraste</strong> para a coluna "Respondeu".</li>
                                <li><strong>Mova para a direita:</strong> O seu objetivo todos os dias é olhar esse quadro e pensar "Como eu empurro essa pessoa pra próxima coluna da direita?". O objetivo final é levá-lo para "Fechado".</li>
                            </ul>
                        </div>

                        <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-emerald-400"><DollarSign className="w-5 h-5" /> 3. Fechamento e Comissões (Recebendo a Grana)</h4>
                            <p className="text-xs text-muted-foreground">Aqui é a consolidação do seu trabalho. Quando o gestor fecha o projeto e o cliente paga.</p>
                            <ul className="text-xs text-muted-foreground list-disc ml-5 space-y-2">
                                <li>Mova o lead na tabela ou no Kanban para a coluna <strong>"Fechado"</strong>.</li>
                                <li>Abra a ficha do lead e preencha exatamente o <strong>Valor do Serviço</strong> (Ex: se fechou um site por R$ 1.500, coloque 1500 na caixinha).</li>
                                <li>Altere o status de Pagamento para <strong>"Pago"</strong>.</li>
                                <li>Assim que o cliente demonstrar interesse real e entrar em fechamento, o prospectador deve abrir um grupo no WhatsApp com o cliente, comigo e com o prospectador responsavel pelo lead. Esse grupo e obrigatorio para acompanhar todo o desfecho, registrar valor final fechado e manter total transparencia entre nos.</li>
                                <li>Assim que o sistema identificar que está Pago, o sistema lançará a sua <strong>comissão automaticamente</strong>. Vá no menu "Comissões" para conferir o saldo gerado do seu mês!</li>
                            </ul>
                        </div>

                        <div className="bg-muted/10 border border-border/50 rounded-lg p-4 space-y-3">
                            <h4 className="font-bold flex items-center gap-2 text-indigo-400"><LayoutDashboard className="w-5 h-5" /> 4. Dashboard e Gamificação (Sua evolução)</h4>
                            <ul className="text-xs text-muted-foreground list-disc ml-5 space-y-2">
                                <li><strong>Dashboard:</strong> A sua tela inicial resume o seu sucesso. Mostra a sua Taxa de Conversão (quantos daqueles leads abordados viraram dinheiro) e os seus totais.</li>
                                <li><strong>Gamificação:</strong> No CRM você ganha Pontos, Medalhas e passa de Níveis! Clicando em "Gamificação", você vê desafios como 'Fazer 100 Leads', 'Sua primeira venda'. Bater esses marcos desbloqueia recompensas visuais e ajuda a acompanhar seu profissionalismo.</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sinais de Cliente Bom */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <CardTitle className="text-base">Sinais de um Bom Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                        {['Responde rápido', 'Demonstra interesse', 'Faz perguntas', 'Reclama do próprio marketing'].map(s => (
                            <div key={s} className="flex items-center gap-2 text-sm bg-emerald-500/5 rounded-lg p-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span className="text-xs">{s}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pipeline visual */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="py-6">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                            { s: 'Contatado', c: 'bg-blue-500/20 text-blue-400' },
                            { s: 'Respondeu', c: 'bg-indigo-500/20 text-indigo-400' },
                            { s: 'Interessado', c: 'bg-yellow-500/20 text-yellow-400' },
                            { s: 'Em Negociação', c: 'bg-orange-500/20 text-orange-400' },
                            { s: 'Fechado ✅', c: 'bg-emerald-500/20 text-emerald-400' },
                        ].map((p, i) => (
                            <span key={i} className="flex items-center gap-1">
                                {i > 0 && <ArrowRight className="w-4 h-4 text-muted-foreground/40" />}
                                <Badge className={`${p.c} border-transparent`}>{p.s}</Badge>
                            </span>
                        ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-3 font-medium">
                        Quanto mais você produz, mais você ganha. Sem limite! 🚀
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}



