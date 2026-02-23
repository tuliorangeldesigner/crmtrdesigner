import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLeadsCache, updateLeadInCache } from '@/hooks/useLeadsCache';
import { openWhatsApp } from '@/lib/whatsapp';
import confetti from 'canvas-confetti';
import type { Lead, LeadStatusPipeline } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { DollarSign, GripVertical, Building2, Phone, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import LeadDetailDialog from '@/components/leads/LeadDetailDialog';
import PriorityLegend, { PriorityBadge } from '@/components/leads/PriorityLegend';

const pipelineColumns: { status: LeadStatusPipeline; label: string; color: string; bgColor: string; textColor: string }[] = [
    { status: 'Contatado', label: 'Contatado', color: 'border-blue-500', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400' },
    { status: 'Respondeu', label: 'Respondeu', color: 'border-indigo-500', bgColor: 'bg-indigo-500/10', textColor: 'text-indigo-400' },
    { status: 'Interessado', label: 'Interessado', color: 'border-yellow-500', bgColor: 'bg-yellow-500/10', textColor: 'text-yellow-400' },
    { status: 'Em negociação', label: 'Em Negociação', color: 'border-orange-500', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400' },
    { status: 'Fechado', label: 'Fechado ✅', color: 'border-emerald-500', bgColor: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
    { status: 'Perdido', label: 'Perdido', color: 'border-red-500', bgColor: 'bg-red-500/10', textColor: 'text-red-400' },
];

export default function Kanban() {
    const { user, isAdmin } = useAuth();
    const { leads: originalLeads, profilesMeta: profileNames, refetch: fetchOriginalLeads, loading } = useLeadsCache();
    // Maintain a local mutable copy of leads for instantaneous drag & drop interactions
    const [leads, setLeads] = useState<Lead[]>(originalLeads);
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
    const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({});
    const [mobileMoveLead, setMobileMoveLead] = useState<Lead | null>(null);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Sincronizar cache com estado local APENAS quando o cache do banco mudar de verdade
    useEffect(() => {
        setLeads(originalLeads);
    }, [originalLeads]);

    const getLeadsByStatus = (status: LeadStatusPipeline) => {
        return leads.filter(lead => lead.status_pipeline === status);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
        setDraggedLead(lead);
        e.dataTransfer.effectAllowed = 'move';
        const target = e.currentTarget;
        setTimeout(() => { target.style.opacity = '0.4'; }, 0);
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.opacity = '1';
        setDraggedLead(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(status);
    };

    const handleDragLeave = () => { setDragOverColumn(null); };

    const moveLead = async (lead: Lead, newStatus: LeadStatusPipeline) => {
        if (lead.status_pipeline === newStatus) return;
        const oldStatus = lead.status_pipeline;

        // Update local state IMMEDIATELY
        const updatedLead = { ...lead, status_pipeline: newStatus, updated_at: new Date().toISOString() };
        const updatedLeads = leads.map(l => l.id === lead.id ? updatedLead : l);
        setLeads(updatedLeads);

        // Update GLOBAL cache immediately so navigating away doesn't reset it
        updateLeadInCache(updatedLead);

        try {
            const { error } = await supabase.from('leads')
                .update({ status_pipeline: newStatus, updated_at: new Date().toISOString() })
                .eq('id', lead.id);
            if (error) throw error;

            // Feedback instantâneo de "GOL" caso mova para Fechado
            if (newStatus === 'Fechado') {
                confetti({
                    particleCount: 200,
                    spread: 90,
                    origin: { y: 0.7 },
                    colors: ['#10b981', '#fbbf24', '#ffffff']
                });
            }

            toast.success(`${lead.nome_cliente} → "${newStatus}"`);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao mover lead.');
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status_pipeline: oldStatus } : l));
        }
        setMobileMoveLead(null);
    };

    const handleDrop = async (e: React.DragEvent, newStatus: LeadStatusPipeline) => {
        e.preventDefault();
        setDragOverColumn(null);
        if (!draggedLead) return;
        await moveLead(draggedLead, newStatus);
        setDraggedLead(null);
    };

    const getTotalValue = (status: LeadStatusPipeline) => {
        return getLeadsByStatus(status).reduce((sum, lead) => sum + (lead.valor_servico || 0), 0);
    };

    const toggleColumn = (status: string) => {
        setExpandedColumns(prev => ({ ...prev, [status]: !prev[status] }));
    };

    if (loading && leads.length === 0) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Funil de Vendas</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Arraste os leads entre as colunas para atualizar o status.</p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    // Componente de Card do lead (reutilizado em desktop e mobile)
    const LeadCard = ({ lead, isMobile = false }: { lead: Lead; isMobile?: boolean }) => (
        <div
            key={lead.id}
            draggable={!isMobile}
            onDragStart={!isMobile ? (e) => handleDragStart(e, lead) : undefined}
            onDragEnd={!isMobile ? handleDragEnd : undefined}
            className={`group bg-background border border-border rounded-lg p-3 transition-all duration-150 ${isMobile ? 'active:bg-accent/20' : 'cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md hover:shadow-primary/5'
                }`}
            onClick={() => {
                if (isMobile) {
                    setMobileMoveLead(mobileMoveLead?.id === lead.id ? null : lead);
                } else {
                    setSelectedLead(lead);
                    setDetailOpen(true);
                }
            }}
        >
            <div className="flex items-start gap-2">
                {!isMobile && <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground" />}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lead.nome_cliente}</p>
                    {lead.nome_empresa && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{lead.nome_empresa}</span>
                        </div>
                    )}
                    {isAdmin && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20 truncate max-w-full">
                                👤 {profileNames[lead.owner_id]?.full_name || profileNames[lead.owner_id]?.email || 'Desconhecido'}
                            </span>
                        </div>
                    )}
                    {lead.contato && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground w-full">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span className="truncate flex-1">{lead.contato}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openWhatsApp(lead.contato, lead.nome_cliente, user?.user_metadata?.full_name || user?.email || 'Nossa Equipe');
                                }}
                                className="p-1 min-w-[24px] flex items-center justify-center bg-green-500/10 text-green-500 rounded hover:bg-green-500/20 transition-colors shrink-0"
                                title="Chamar no WhatsApp"
                            >
                                <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                        <PriorityBadge lead={lead} />
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            {lead.origem}
                        </span>
                        {lead.valor_servico > 0 && (
                            <span className="text-xs font-medium text-emerald-400">
                                R$ {lead.valor_servico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* Mobile: select para mover */}
            {isMobile && mobileMoveLead?.id === lead.id && (
                <div className="mt-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
                    <Select value={lead.status_pipeline} onValueChange={(v) => moveLead(lead, v as LeadStatusPipeline)}>
                        <SelectTrigger className="h-8 text-xs bg-background/50">
                            <SelectValue placeholder="Mover para..." />
                        </SelectTrigger>
                        <SelectContent>
                            {pipelineColumns.map(c => (
                                <SelectItem key={c.status} value={c.status} className="text-xs">{c.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Funil de Vendas</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    {leads.length} lead{leads.length !== 1 ? 's' : ''} no total.
                    <span className="hidden sm:inline"> Arraste os cards entre as colunas.</span>
                    <span className="sm:hidden"> Toque no card para mover.</span>
                </p>
            </div>

            <PriorityLegend />

            {/* ===== DESKTOP: Kanban horizontal ===== */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4" style={{ minHeight: '70vh' }}>
                {pipelineColumns.map((col) => {
                    const columnLeads = getLeadsByStatus(col.status);
                    const totalValue = getTotalValue(col.status);
                    const isOver = dragOverColumn === col.status;

                    return (
                        <div
                            key={col.status}
                            className={`flex-shrink-0 w-[280px] flex flex-col rounded-xl border-2 transition-all duration-200 ${isOver ? `${col.color} ${col.bgColor} scale-[1.02]` : 'border-border bg-card/50'
                                }`}
                            onDragOver={(e) => handleDragOver(e, col.status)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, col.status)}
                        >
                            <div className={`p-3 border-b-2 ${col.color} rounded-t-xl`}>
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-sm">{col.label}</h3>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">{columnLeads.length}</span>
                                </div>
                                {totalValue > 0 && (
                                    <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                                        <DollarSign className="w-3 h-3" />
                                        R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                                {columnLeads.length === 0 ? (
                                    <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isOver ? `${col.color} ${col.bgColor}` : 'border-border/50'}`}>
                                        <p className="text-xs text-muted-foreground">{isOver ? 'Soltar aqui!' : 'Vazio'}</p>
                                    </div>
                                ) : (
                                    columnLeads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ===== MOBILE/TABLET: Lista acordeão ===== */}
            <div className="md:hidden space-y-3">
                {pipelineColumns.map((col) => {
                    const columnLeads = getLeadsByStatus(col.status);
                    const totalValue = getTotalValue(col.status);
                    const isExpanded = expandedColumns[col.status] ?? (columnLeads.length > 0);

                    return (
                        <div key={col.status} className={`rounded-xl border-2 ${col.color} overflow-hidden transition-all`}>
                            <button
                                onClick={() => toggleColumn(col.status)}
                                className={`w-full flex items-center justify-between p-3 ${col.bgColor} transition-colors`}
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-semibold text-sm ${col.textColor}`}>{col.label}</h3>
                                    <Badge className="bg-muted text-muted-foreground border-transparent text-[10px]">{columnLeads.length}</Badge>
                                    {totalValue > 0 && (
                                        <span className="text-xs text-muted-foreground ml-1 flex items-center gap-0.5">
                                            <DollarSign className="w-3 h-3" />
                                            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    )}
                                </div>
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                            </button>
                            {isExpanded && (
                                <div className="p-2 space-y-2 bg-background/30">
                                    {columnLeads.length === 0 ? (
                                        <p className="text-center py-4 text-xs text-muted-foreground italic">Nenhum lead nesta etapa</p>
                                    ) : (
                                        columnLeads.map((lead) => <LeadCard key={lead.id} lead={lead} isMobile />)
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <LeadDetailDialog
                lead={selectedLead}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUpdated={fetchOriginalLeads}
            />
        </div>
    );
}
