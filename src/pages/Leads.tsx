import { useState } from 'react';
import type { Lead } from '@/types';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeadFormDialog from '@/components/leads/LeadFormDialog';
import LeadDetailDialog from '@/components/leads/LeadDetailDialog';
import PriorityLegend, { PriorityBadge } from '@/components/leads/PriorityLegend';
import { toast } from 'sonner';

const statusColors: Record<string, string> = {
    'Contatado': 'bg-blue-500/20 text-blue-400',
    'Respondeu': 'bg-indigo-500/20 text-indigo-400',
    'Interessado': 'bg-yellow-500/20 text-yellow-400',
    'Em negociação': 'bg-orange-500/20 text-orange-400',
    'Fechado': 'bg-emerald-500/20 text-emerald-400',
    'Perdido': 'bg-red-500/20 text-red-400',
};

export default function Leads() {
    const { isAdmin } = useAuth();
    const { leads, profilesMeta: profileNames, refetch: fetchLeads, loading } = useLeadsCache();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [ownerFilter, setOwnerFilter] = useState('all');
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Obter lista única de prospectadores a partir dos leads
    const uniqueOwners = isAdmin
        ? [...new Set(leads.map(l => l.owner_id))].map(id => ({ id, name: profileNames[id]?.full_name || profileNames[id]?.email || id }))
        : [];

    const filteredLeads = leads.filter((lead) => {
        const matchesSearch =
            lead.nome_cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (lead.nome_empresa && lead.nome_empresa.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || lead.status_pipeline === statusFilter;
        const matchesOwner = ownerFilter === 'all' || lead.owner_id === ownerFilter;
        return matchesSearch && matchesStatus && matchesOwner;
    });

    const exportCSV = () => {
        if (filteredLeads.length === 0) {
            toast.error('Nenhum lead para exportar.');
            return;
        }
        const headers = ['Cliente', 'Empresa', 'Nicho', 'Contato', 'Origem', 'Serviço', 'Valor', 'Pipeline', 'Pagamento', 'Observações', 'Cadastrado', ...(isAdmin ? ['Prospectador'] : [])];
        const rows = filteredLeads.map(l => [
            l.nome_cliente,
            l.nome_empresa || '',
            l.nicho || '',
            l.contato || '',
            l.origem,
            l.tipo_servico || '',
            l.valor_servico?.toString() || '0',
            l.status_pipeline,
            l.status_pagamento,
            (l.observacoes || '').replace(/"/g, '""'),
            format(new Date(l.created_at), 'dd/MM/yyyy', { locale: ptBR }),
            ...(isAdmin ? [profileNames[l.owner_id]?.full_name || profileNames[l.owner_id]?.email || l.owner_id] : []),
        ]);

        const csv = [headers.join(';'), ...rows.map(r => r.map(v => `"${v}"`).join(';'))].join('\n');
        const bom = '\uFEFF';
        const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success(`${filteredLeads.length} leads exportados!`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start xl:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gerenciamento de Leads</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {filteredLeads.length} de {leads.length} lead{leads.length !== 1 ? 's' : ''}.
                    </p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={exportCSV} className="flex items-center gap-2">
                        <Download className="w-4 h-4" /> CSV
                    </Button>
                    <LeadFormDialog onLeadCreated={fetchLeads} />
                </div>
            </div>

            <PriorityLegend />
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-4 rounded-xl border border-border">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar lead ou empresa..."
                        className="pl-9 w-full bg-background/50 border-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px] bg-background/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos Status</SelectItem>
                            <SelectItem value="Contatado">Contatado</SelectItem>
                            <SelectItem value="Respondeu">Respondeu</SelectItem>
                            <SelectItem value="Interessado">Interessado</SelectItem>
                            <SelectItem value="Em negociação">Em negociação</SelectItem>
                            <SelectItem value="Fechado">Fechado</SelectItem>
                            <SelectItem value="Perdido">Perdido</SelectItem>
                        </SelectContent>
                    </Select>
                    {isAdmin && uniqueOwners.length > 0 && (
                        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-background/50">
                                <SelectValue placeholder="Prospectador" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos Prospectadores</SelectItem>
                                {uniqueOwners.map(o => (
                                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="font-semibold">Cliente</TableHead>
                                <TableHead className="font-semibold hidden md:table-cell">Empresa</TableHead>
                                {isAdmin && <TableHead className="font-semibold hidden lg:table-cell">Prospectador</TableHead>}
                                <TableHead className="font-semibold hidden lg:table-cell">Origem</TableHead>
                                <TableHead className="font-semibold text-center">Prioridade</TableHead>
                                <TableHead className="font-semibold text-center">Pipeline</TableHead>
                                <TableHead className="font-semibold text-center hidden xl:table-cell">Pagamento</TableHead>
                                <TableHead className="font-semibold text-right hidden sm:table-cell">Data</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-24 text-center">
                                        <div className="flex justify-center items-center h-full">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 7 : 6} className="h-32 text-center text-muted-foreground">
                                        Nenhum lead encontrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLeads.map((lead) => (
                                    <TableRow key={lead.id} className="border-border hover:bg-accent/20 cursor-pointer transition-colors" onClick={() => { setSelectedLead(lead); setDetailOpen(true); }}>
                                        <TableCell>
                                            <p className="font-medium text-sm">{lead.nome_cliente}</p>
                                            <p className="text-xs text-muted-foreground md:hidden">{lead.nome_empresa || lead.origem}</p>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{lead.nome_empresa || '-'}</TableCell>
                                        {isAdmin && (
                                            <TableCell className="hidden lg:table-cell">
                                                <span className="text-xs text-muted-foreground">{profileNames[lead.owner_id]?.full_name || profileNames[lead.owner_id]?.email || 'Desconhecido'}</span>
                                            </TableCell>
                                        )}
                                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{lead.origem}</TableCell>
                                        <TableCell className="text-center">
                                            <PriorityBadge lead={lead} />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className={`border-transparent font-medium text-[11px] ${statusColors[lead.status_pipeline] || 'bg-muted'}`}>
                                                {lead.status_pipeline}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center hidden xl:table-cell">
                                            <Badge variant="outline" className={`border-transparent text-[11px] ${lead.status_pagamento === 'Pago' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {lead.status_pagamento}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                                            {format(new Date(lead.created_at), "d 'de' MMM", { locale: ptBR })}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <LeadDetailDialog
                lead={selectedLead}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUpdated={fetchLeads}
            />
        </div>
    );
}
