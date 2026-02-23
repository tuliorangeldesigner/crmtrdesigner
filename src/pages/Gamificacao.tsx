import { useState } from 'react';
import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Medal, Crown, Flame, Swords } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Gamificacao() {
    const { user, isAdmin } = useAuth();
    const { leads, profilesMeta, loading } = useLeadsCache();
    const [bonusPoolPercent, setBonusPoolPercent] = useState(5);

    const calculatePoints = (lead: Lead) => {
        let pts = 1; // Lead gerado
        const activeStatuses = ['Respondeu', 'Interessado', 'Em negociação', 'Fechado'];
        if (activeStatuses.includes(lead.status_pipeline)) pts += 5; // Conversa iniciada

        const qualifiedStatuses = ['Interessado', 'Em negociação', 'Fechado'];
        if (qualifiedStatuses.includes(lead.status_pipeline)) pts += 3; // Qualificado

        if (lead.status_pipeline === 'Fechado') pts += 10; // Fechado
        return pts;
    };

    // Calculate Leaderboard
    const leaderboardMap: Record<string, { id: string; name: string; score: number; vendas_pagas: number }> = {};
    Object.keys(profilesMeta).forEach(id => {
        leaderboardMap[id] = { id, name: profilesMeta[id].name, score: 0, vendas_pagas: 0 };
    });

    leads.forEach(l => {
        if (!leaderboardMap[l.owner_id]) {
            leaderboardMap[l.owner_id] = { id: l.owner_id, name: profilesMeta[l.owner_id]?.full_name || profilesMeta[l.owner_id]?.email || profilesMeta[l.owner_id]?.name || l.owner_id, score: 0, vendas_pagas: 0 };
        }
        leaderboardMap[l.owner_id].score += calculatePoints(l);

        if (l.status_pipeline === 'Fechado' && l.status_pagamento === 'Pago') {
            leaderboardMap[l.owner_id].vendas_pagas += (l.valor_servico || 0);
        }
    });

    const leaderboard = Object.values(leaderboardMap)
        .filter(p => p.score > 0 || p.vendas_pagas > 0)
        .sort((a, b) => b.score - a.score);

    const totalFaturamento = leads
        .filter(l => l.status_pipeline === 'Fechado' && l.status_pagamento === 'Pago')
        .reduce((sum, l) => sum + (l.valor_servico || 0), 0);

    const valueBonusPool = totalFaturamento * (bonusPoolPercent / 100);

    const bonuses = [
        valueBonusPool * 0.50, // 1st Place
        valueBonusPool * 0.30, // 2nd Place
        valueBonusPool * 0.20  // 3rd Place
    ];

    if (loading && leads.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Gamificação</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Cabecalho */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-card p-6 rounded-xl border border-border relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20">
                            <Flame className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                            A Arena de Prospecção
                        </h1>
                    </div>
                    <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
                        Nosso sistema funciona como um jogo de performance. Cada ação gera pontos e define o ranking semanal da equipe.
                        O objetivo do ranking é gerar competitividade, consistência e alta performance.
                    </p>
                </div>
                {/* Graphics */}
                <div className="absolute top-[-50px] right-[-20px] opacity-10 pointer-events-none rotate-12">
                    <Swords className="w-48 h-48" />
                </div>
            </div>

            {/* Main Layout: Leaderboard + Rules */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Ranking Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bônus Admin Config */}
                    {isAdmin && (
                        <Card className="bg-card border-orange-500/20 shadow-lg shadow-orange-500/5">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-orange-400" />
                                        Configuração do Caixote de Bônus
                                    </CardTitle>
                                    <CardDescription>Defina a % do faturamento total que será distribuída (Apenas visível para Admin).</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4">
                                <div className="flex flex-col gap-1.5 w-32">
                                    <Label className="text-xs">Porcentagem (Ex: 5%)</Label>
                                    <Input
                                        type="number"
                                        value={bonusPoolPercent}
                                        onChange={(e) => setBonusPoolPercent(Number(e.target.value))}
                                        className="h-9"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground mb-1">Faturamento Validado: R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-xl font-black text-orange-400">
                                        Total do Bônus: R$ {valueBonusPool.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-card border-border shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <Crown className="w-5 h-5 text-yellow-400" />
                                Leaderboard Semanal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border">
                                        <TableHead className="w-16 text-center">Pos</TableHead>
                                        <TableHead>Prospectador</TableHead>
                                        <TableHead className="text-center font-black text-primary">Pontos</TableHead>
                                        <TableHead className="text-right">Prêmio Estimado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                A arena está vazia. Comecem a prospectar!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        leaderboard.map((p, index) => {
                                            const isTop1 = index === 0;
                                            const isTop2 = index === 1;
                                            const isTop3 = index === 2;
                                            const rankMedal = isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `${index + 1}º`;
                                            const colorClass = isTop1 ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                : isTop2 ? 'bg-slate-300/10 text-slate-300 border-slate-400/20'
                                                    : isTop3 ? 'bg-amber-600/10 text-amber-500 border-amber-600/20'
                                                        : 'bg-transparent text-muted-foreground border-transparent';

                                            const projectedBonus = index < 3 ? bonuses[index] : 0;

                                            return (
                                                <TableRow key={p.id} className={`${isTop1 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''} border-border`}>
                                                    <TableCell className="text-center font-bold text-lg">
                                                        <Badge className={`px-2 py-1 text-sm ${colorClass}`}>{rankMedal}</Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-bold">{p.name} {p.id === user?.id && <span className="text-xs font-normal text-muted-foreground ml-2">(Você)</span>}</div>
                                                    </TableCell>
                                                    <TableCell className="text-center text-lg font-black text-primary">
                                                        {p.score} pts
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {projectedBonus > 0 ? (
                                                            <span className="text-emerald-400 font-bold tracking-tight">
                                                                R$ {projectedBonus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground/50">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                            {valueBonusPool === 0 && (
                                <p className="text-xs text-center mt-4 text-muted-foreground">
                                    * O bônus só será liberado caso haja faturamento (clientes fechados e pagos) na semana atual.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Rules Section */}
                <div className="space-y-6">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary" />
                                Sistema de Pontuação
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border">
                                <span className="text-sm font-medium">Lead Gerado</span>
                                <Badge variant="secondary" className="font-bold">+1 pt</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border">
                                <span className="text-sm font-medium">Conversa Iniciada</span>
                                <Badge variant="secondary" className="font-bold">+5 pts</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border">
                                <span className="text-sm font-medium">Lead Qualificado</span>
                                <Badge variant="secondary" className="font-bold">+3 pts</Badge>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                                <span className="text-sm font-bold text-primary">Venda Fechada</span>
                                <Badge className="bg-primary hover:bg-primary font-bold shadow-md shadow-primary/20">+10 pts</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                * Pela regra da gamificação do nosso CRM, o Lead vai ganhando pontos conforme avança nas etapas. Ex: Uma venda fechada gera todos os bônus anteriores acumulados.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Medal className="w-5 h-5 text-secondary" />
                                Como Funciona o Bônus?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-foreground/80 leading-relaxed">
                            <p>
                                A pontuação e o ranking <b>NÃO</b> garantem pagamento automático.
                                O bônus só será liberado caso haja faturamento real.
                            </p>

                            <div>
                                <h4 className="font-bold text-foreground mb-1">💰 Distribuição do Prêmio:</h4>
                                <ul className="space-y-1.5 list-disc list-inside text-muted-foreground ml-1">
                                    <li><b>1º lugar:</b> 50% do valor do bônus</li>
                                    <li><b>2º lugar:</b> 30% do valor do bônus</li>
                                    <li><b>3º lugar:</b> 20% do valor do bônus</li>
                                </ul>
                            </div>

                            <div className="pt-3 border-t border-border">
                                <h4 className="font-bold text-foreground mb-1">⚖️ Regras Gerais</h4>
                                <ul className="space-y-1.5 text-xs text-muted-foreground">
                                    <li>• Apenas leads válidos pontuam.</li>
                                    <li>• Leads duplicados não serão considerados.</li>
                                    <li>• Vendas só contam e liberam premiações após o pagamento do cliente.</li>
                                    <li>• O lead e a comissão pertencem a quem registrou primeiro no CRM.</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
