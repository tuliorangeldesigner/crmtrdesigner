import { useAuth } from '@/contexts/AuthContext';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, Target, ArrowUpRight, ArrowDownRight, BarChart3, Trophy } from 'lucide-react';

interface ProspectorStats {
    id: string;
    email: string;
    full_name: string | null;
    total: number;
    fechados: number;
    vendas: number;
    conversao: number;
}

const statusColors: Record<string, string> = {
    'Contatado': 'bg-blue-500',
    'Respondeu': 'bg-indigo-500',
    'Interessado': 'bg-yellow-500',
    'Em negociação': 'bg-orange-500',
    'Fechado': 'bg-emerald-500',
    'Perdido': 'bg-red-500',
};

export default function Dashboard() {
    const { isAdmin } = useAuth();
    const { leads, profilesMeta, loading } = useLeadsCache();

    // Se Admin buscar ranking dos prospectadores a partir do cache
    const prospectors: ProspectorStats[] = isAdmin ? Object.values(profilesMeta).map(p => {
        const userLeads = leads.filter(l => l.owner_id === p.id);
        const fechados = userLeads.filter(l => l.status_pipeline === 'Fechado');
        const vendas = fechados
            .filter(l => l.status_pagamento === 'Pago')
            .reduce((sum, l) => sum + (l.valor_servico || 0), 0);
        return {
            id: p.id,
            email: p.email,
            full_name: p.full_name || p.email,
            total: userLeads.length,
            fechados: fechados.length,
            vendas,
            conversao: userLeads.length > 0 ? Math.round((fechados.length / userLeads.length) * 100) : 0,
        };
    }).filter(p => p.total > 0).sort((a, b) => b.vendas - a.vendas) : [];

    // Métricas calculadas
    const totalLeads = leads.length;
    const leadsFechados = leads.filter(l => l.status_pipeline === 'Fechado').length;
    const leadsAtivos = leads.filter(l => !['Fechado', 'Perdido'].includes(l.status_pipeline)).length;
    const leadsPerdidos = leads.filter(l => l.status_pipeline === 'Perdido').length;
    const vendasTotais = leads
        .filter(l => l.status_pipeline === 'Fechado' && l.status_pagamento === 'Pago')
        .reduce((sum, l) => sum + (l.valor_servico || 0), 0);
    const vendasPendentes = leads
        .filter(l => l.status_pipeline === 'Fechado' && l.status_pagamento === 'Pendente')
        .reduce((sum, l) => sum + (l.valor_servico || 0), 0);
    const taxaConversao = totalLeads > 0 ? Math.round((leadsFechados / totalLeads) * 100) : 0;

    // Distribuição por status
    const statusDistribution = [
        'Contatado', 'Respondeu', 'Interessado', 'Em negociação', 'Fechado', 'Perdido'
    ].map(status => ({
        status,
        count: leads.filter(l => l.status_pipeline === status).length,
        percent: totalLeads > 0 ? Math.round((leads.filter(l => l.status_pipeline === status).length / totalLeads) * 100) : 0,
    }));

    // Leads recentes (últimos 5)
    const recentLeads = [...leads].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ).slice(0, 5);

    if (loading && leads.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin ? 'Visão geral de toda a equipe.' : 'Suas métricas de prospecção.'}
                </p>
            </div>

            {/* Metric Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total de Leads</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">{totalLeads}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            <span className="text-emerald-400">{leadsAtivos} ativos</span> · <span className="text-red-400">{leadsPerdidos} perdidos</span>
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border hover:border-emerald-500/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Vendas Realizadas</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-3xl font-bold text-emerald-400">
                            R$ {vendasTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {vendasPendentes > 0 && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3 text-yellow-400" />
                                R$ {vendasPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} pendente
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Leads Fechados</CardTitle>
                        <Target className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold">{leadsFechados}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            de {totalLeads} leads totais
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border hover:border-secondary/30 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Conversão</CardTitle>
                        <TrendingUp className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl sm:text-3xl font-bold text-secondary">{taxaConversao}%</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            {taxaConversao >= 20 ? (
                                <><ArrowUpRight className="w-3 h-3 text-emerald-400" /> Boa performance!</>
                            ) : (
                                <><ArrowDownRight className="w-3 h-3 text-red-400" /> Pode melhorar</>
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pipeline Distribution + Recent Leads */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Distribuição do Pipeline */}
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Distribuição do Pipeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {totalLeads === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead cadastrado ainda.</p>
                        ) : (
                            <>
                                {/* Barra visual */}
                                <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                                    {statusDistribution.filter(s => s.count > 0).map(s => (
                                        <div
                                            key={s.status}
                                            className={`${statusColors[s.status]} transition-all duration-500`}
                                            style={{ width: `${s.percent}%` }}
                                            title={`${s.status}: ${s.count} (${s.percent}%)`}
                                        />
                                    ))}
                                </div>
                                {/* Legenda */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                    {statusDistribution.map(s => (
                                        <div key={s.status} className="flex items-center gap-2">
                                            <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s.status]}`} />
                                            <span className="text-xs text-muted-foreground">{s.status}</span>
                                            <span className="text-xs font-bold ml-auto">{s.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Leads Recentes */}
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="text-base">Leads Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentLeads.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum lead ainda.</p>
                        ) : (
                            <div className="space-y-3">
                                {recentLeads.map(lead => (
                                    <div key={lead.id} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-accent/20 transition-colors">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{lead.nome_cliente}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {lead.nome_empresa || lead.origem}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className={`border-transparent shrink-0 text-[10px] ${statusColors[lead.status_pipeline]
                                            ? statusColors[lead.status_pipeline].replace('bg-', 'bg-') + '/20 ' + statusColors[lead.status_pipeline].replace('bg-', 'text-').replace('-500', '-400')
                                            : 'bg-muted'
                                            }`}>
                                            {lead.status_pipeline}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ranking de Prospectadores (Admin Only) */}
            {isAdmin && prospectors.length > 0 && (
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-base">Ranking de Prospectadores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {prospectors.map((p, index) => (
                                <div key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-lg bg-background/50 border border-border hover:border-primary/20 transition-colors">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                        index === 1 ? 'bg-gray-400/20 text-gray-400' :
                                            index === 2 ? 'bg-orange-700/20 text-orange-400' :
                                                'bg-muted text-muted-foreground'
                                        }`}>
                                        {index + 1}º
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{p.full_name || p.email}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {p.total} leads · {p.fechados} fechados · {p.conversao}% conversão
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-bold text-emerald-400">
                                            R$ {p.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">em vendas</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
