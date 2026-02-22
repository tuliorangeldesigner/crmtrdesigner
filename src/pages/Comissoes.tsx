import type { Lead } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Percent, TrendingUp, Calculator } from 'lucide-react';

const COMISSAO_PERCENT = 10; // 10% fixo de comissão

export default function Comissoes() {
    const { isAdmin } = useAuth();
    const { leads: rawLeads, profilesMeta, loading } = useLeadsCache();

    // Filtra localmente apenas leads que dão comissão
    const leads = rawLeads.filter(l => l.status_pipeline === 'Fechado' && l.status_pagamento === 'Pago');

    const totalVendas = leads.reduce((s, l) => s + (l.valor_servico || 0), 0);
    const totalComissao = leads.reduce((s, l) => {
        const p = profilesMeta[l.owner_id]?.comissao_percentual ?? COMISSAO_PERCENT;
        return s + ((l.valor_servico || 0) * (p / 100));
    }, 0);

    // Agrupar por prospectador (admin)
    const byOwner = isAdmin ? leads.reduce<Record<string, Lead[]>>((acc, l) => {
        if (!acc[l.owner_id]) acc[l.owner_id] = [];
        acc[l.owner_id].push(l);
        return acc;
    }, {}) : {};

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Comissões</h1>
                <p className="text-muted-foreground mt-1">
                    {isAdmin ? 'Comissões de toda a equipe sobre vendas fechadas e pagas.' : 'Suas comissões sobre vendas fechadas e pagas.'}
                </p>
            </div>

            {/* Global Setting Removed in favor of Individual Settings */}

            {/* Cards de resumo */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total em Vendas</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-400">
                            R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{leads.length} vendas fechadas e pagas</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Comissões a Pagar</CardTitle>
                        <Percent className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">
                            R$ {totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">a pagar em comissões</p>
                    </CardContent>
                </Card>

                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Médio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-secondary">
                            R$ {leads.length > 0 ? (totalVendas / leads.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">por venda fechada</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela por Prospectador (Admin) */}
            {isAdmin && Object.keys(byOwner).length > 0 && (
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <Calculator className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">Comissões por Prospectador</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>Prospectador</TableHead>
                                    <TableHead className="text-center">Vendas</TableHead>
                                    <TableHead className="text-center">% Taxa</TableHead>
                                    <TableHead className="text-right">Total (R$)</TableHead>
                                    <TableHead className="text-right">Comissão (R$)</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(byOwner).map(([ownerId, ownerLeads]) => {
                                    const meta = profilesMeta[ownerId] || {};
                                    const percentual = meta.comissao_percentual ?? COMISSAO_PERCENT;
                                    const total = ownerLeads.reduce((s, l) => s + (l.valor_servico || 0), 0);
                                    const comissao = total * (percentual / 100);
                                    return (
                                        <TableRow key={ownerId} className="border-border">
                                            <TableCell className="font-medium">{meta.full_name || meta.email || ownerId}</TableCell>
                                            <TableCell className="text-center">{ownerLeads.length}</TableCell>
                                            <TableCell className="text-center">{percentual}%</TableCell>
                                            <TableCell className="text-right">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right font-bold text-primary">
                                                R$ {comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Lista de vendas */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Detalhamento de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                    {leads.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma venda fechada e paga ainda.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border">
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="hidden md:table-cell">Serviço</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                    <TableHead className="text-right">Comissão</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map(lead => (
                                    <TableRow key={lead.id} className="border-border">
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{lead.nome_cliente}</p>
                                                <p className="text-xs text-muted-foreground">{lead.nome_empresa || '-'}</p>
                                                {isAdmin && <span className="text-[10px] bg-secondary/10 text-secondary border border-secondary/20 px-1.5 py-0.5 rounded-full ml-2">👤 {profilesMeta[lead.owner_id]?.full_name || profilesMeta[lead.owner_id]?.email || lead.owner_id}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{lead.tipo_servico || '-'}</TableCell>
                                        <TableCell className="text-right font-medium">R$ {(lead.valor_servico || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        <TableCell className="text-right text-emerald-400 font-medium">
                                            R$ {((lead.valor_servico || 0) * (profilesMeta[lead.owner_id]?.comissao_percentual ?? COMISSAO_PERCENT) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
