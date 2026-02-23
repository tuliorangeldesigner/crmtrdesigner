import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Lead, LeadOrigem, LeadStatusPipeline, LeadStatusPagamento } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, MessageCircle, Clock, Plus, Copy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { openWhatsApp } from '@/lib/whatsapp';

const origemOptions: LeadOrigem[] = ['Instagram', 'Google Maps', 'Indicação', 'WhatsApp', 'Outros'];
const pipelineOptions: LeadStatusPipeline[] = ['Contatado', 'Respondeu', 'Interessado', 'Em negociação', 'Fechado', 'Perdido'];
const pagamentoOptions: LeadStatusPagamento[] = ['Pendente', 'Pago'];
const prioridadeOptions: string[] = ['Baixa', 'Média', 'Alta'];

interface LeadDetailDialogProps {
    lead: Lead | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}

export default function LeadDetailDialog({ lead, open, onOpenChange, onUpdated }: LeadDetailDialogProps) {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [novaNota, setNovaNota] = useState('');

    const [nomeCliente, setNomeCliente] = useState('');
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [nicho, setNicho] = useState('');
    const [contato, setContato] = useState('');
    const [origem, setOrigem] = useState<LeadOrigem>('Instagram');
    const [observacoes, setObservacoes] = useState('');
    const [valorServico, setValorServico] = useState('');
    const [tipoServico, setTipoServico] = useState('');
    const [statusPipeline, setStatusPipeline] = useState<LeadStatusPipeline>('Contatado');
    const [statusPagamento, setStatusPagamento] = useState<LeadStatusPagamento>('Pendente');
    const [prioridade, setPrioridade] = useState<any>('Média');

    // Preencher campos quando o lead mudar
    const populateFields = (l: Lead) => {
        setNomeCliente(l.nome_cliente);
        setNomeEmpresa(l.nome_empresa || '');
        setNicho(l.nicho || '');
        setContato(l.contato || '');
        setOrigem(l.origem as LeadOrigem);
        setObservacoes(l.observacoes || '');
        setValorServico(l.valor_servico ? String(l.valor_servico) : '');
        setTipoServico(l.tipo_servico || '');
        setStatusPipeline(l.status_pipeline as LeadStatusPipeline);
        setStatusPagamento(l.status_pagamento as LeadStatusPagamento);
        setPrioridade(l.prioridade || 'Média');
        setConfirmDelete(false);
        setNovaNota('');
    };

    // Sincronizar campos quando o lead mudar ou o modal abrir
    useEffect(() => {
        if (open && lead) {
            populateFields(lead);
        }
    }, [open, lead]);

    // Chamado quando o dialog fecha/abre pelo componente
    const handleOpenChange = (isOpen: boolean) => {
        onOpenChange(isOpen);
    };

    const handleSave = async () => {
        if (!lead) return;
        if (!nomeCliente.trim()) {
            toast.error('Nome do cliente é obrigatório.');
            return;
        }

        setSaving(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const valorTratado = valorServico ? parseFloat(valorServico.toString().replace(',', '.')) : 0;

            const { error } = await supabase.from('leads').update({
                nome_cliente: nomeCliente.trim(),
                nome_empresa: nomeEmpresa.trim() || null,
                nicho: nicho.trim() || null,
                contato: contato.trim() || null,
                origem,
                observacoes: observacoes.trim() || null,
                valor_servico: isNaN(valorTratado) ? 0 : valorTratado,
                tipo_servico: tipoServico.trim() || null,
                status_pipeline: statusPipeline,
                status_pagamento: statusPagamento,
                prioridade: prioridade,
                updated_at: new Date().toISOString(),
            }).eq('id', lead.id).select().abortSignal(controller.signal);

            clearTimeout(timeoutId);

            if (error) throw error;
            toast.success('Lead atualizado com sucesso!');
            onOpenChange(false);
            onUpdated();
        } catch (error: any) {
            clearTimeout(timeoutId);
            console.error('Erro ao atualizar:', error);

            let errMsg = 'Erro na conexão com o banco.';
            if (error?.name === 'AbortError') {
                errMsg = 'O servidor demorou muito para responder (Timeout).';
            } else if (error?.message) {
                errMsg = error.message;
            }

            toast.error('Erro ao atualizar o lead: ' + errMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!lead) return;
        setDeleting(true);
        console.log('[LeadDetail] Tentando deletar lead:', lead.id);

        try {
            // .select() é importante para o Supabase retornar o que foi deletado
            // e sabermos se a política de segurança (RLS) permitiu
            const { data, error } = await supabase
                .from('leads')
                .delete()
                .eq('id', lead.id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                console.warn('[LeadDetail] Nenhuma linha deletada. RLS bloqueou ou lead não existe.');
                toast.error('Não autorizado: Você não tem permissão para excluir este lead.');
                return;
            }

            console.log('[LeadDetail] Lead deletado com sucesso do banco.');

            // Remove do cache local IMEDIATAMENTE para a UI refletir a mudança
            const { removeLeadFromCache } = await import('@/hooks/useLeadsCache');
            removeLeadFromCache(lead.id);

            toast.success('Lead removido com sucesso.');
            onOpenChange(false);
            onUpdated();
        } catch (error: any) {
            console.error('[LeadDetail] Erro ao deletar:', error);
            toast.error(`Erro: ${error.message || 'Falha ao remover o lead'}`);
        } finally {
            setDeleting(false);
        }
    };

    const handleAddNota = () => {
        if (!novaNota.trim()) return;
        const author = user?.user_metadata?.full_name || user?.email || 'SDR';
        const timestamp = new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
        const noteEntry = `[${timestamp}] ${author}:\n${novaNota.trim()}`;
        setObservacoes(prev => prev ? `${noteEntry}\n\n${prev}` : noteEntry);
        setNovaNota('');
    };

    if (!lead) return null;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-xl">Editar Lead</DialogTitle>
                    <DialogDescription>Atualize as informações ou exclua o lead.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome do Cliente *</Label>
                            <Input value={nomeCliente} onChange={(e) => setNomeCliente(e.target.value)} className="bg-background/50" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Empresa</Label>
                            <Input value={nomeEmpresa} onChange={(e) => setNomeEmpresa(e.target.value)} className="bg-background/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nicho</Label>
                            <Input value={nicho} onChange={(e) => setNicho(e.target.value)} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Contato</Label>
                            <div className="flex gap-2">
                                <Input value={contato} onChange={(e) => setContato(e.target.value)} className="bg-background/50 flex-1" />
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="shrink-0 bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-600 border-green-500/20 shadow-none px-2.5"
                                    onClick={() => openWhatsApp(contato, nomeCliente, user?.user_metadata?.full_name || user?.email || 'Nossa Equipe')}
                                    title="Chamar no WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Scripts Rápidos */}
                    <div className="bg-primary/5 rounded-lg p-3 space-y-2 border border-primary/10">
                        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Scripts Rápidos (Clique para copiar)</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Abordagem', text: `Olá ${nomeCliente}, vi o perfil da sua empresa e achei o trabalho muito bom 👏. Notei alguns pontos que poderiam melhorar a apresentação e ajudar a atrair mais clientes. Você que cuida do Instagram aí?` },
                                { label: 'Follow-up', text: `Oi ${nomeCliente}, conseguiu ver a mensagem que te mandei antes? 😊` },
                                { label: 'Agenda', text: `Legal! Podemos marcar uma conversa rápida de 5 min por aqui mesmo ou por call para eu te mostrar como ajudamos outras empresas de ${nicho || 'seu nicho'}?` },
                            ].map((s, i) => (
                                <Button
                                    key={i}
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="h-7 text-[10px] bg-background border border-border hover:bg-primary/10 hover:text-primary transition-all"
                                    onClick={() => {
                                        navigator.clipboard.writeText(s.text);
                                        toast.success('Script copiado!');
                                    }}
                                >
                                    <Copy className="w-3 h-3 mr-1" /> {s.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Origem</Label>
                            <Select value={origem} onValueChange={(v) => setOrigem(v as LeadOrigem)}>
                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {origemOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo de Serviço</Label>
                            <Input value={tipoServico} onChange={(e) => setTipoServico(e.target.value)} className="bg-background/50" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input type="number" step="0.01" min="0" value={valorServico} onChange={(e) => setValorServico(e.target.value)} className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                            <Label>Pipeline</Label>
                            <Select value={statusPipeline} onValueChange={(v) => setStatusPipeline(v as LeadStatusPipeline)}>
                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {pipelineOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Pagamento</Label>
                            <Select value={statusPagamento} onValueChange={(v) => setStatusPagamento(v as LeadStatusPagamento)}>
                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {pagamentoOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Prioridade</Label>
                            <Select value={prioridade} onValueChange={(v) => setPrioridade(v)}>
                                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {prioridadeOptions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-semibold">Histórico & Notas</Label>
                        </div>
                        <div className="flex gap-2 items-start">
                            <Textarea
                                value={novaNota}
                                onChange={(e) => setNovaNota(e.target.value)}
                                placeholder="Registre uma ligação, negociação ou avanço..."
                                className="bg-background/50 min-h-[60px] resize-none"
                            />
                            <Button type="button" onClick={handleAddNota} className="shrink-0 mt-2 px-3 shadow-md border border-primary/20" disabled={!novaNota.trim()}>
                                <Plus className="w-4 h-4 mr-1" /> Inserir
                            </Button>
                        </div>
                        <Textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Nenhum histórico... (Você pode editar manualmente aqui se errar)."
                            className="bg-accent/10 min-h-[140px] text-xs font-medium text-muted-foreground leading-relaxed"
                        />
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <div className="flex-1">
                        {!confirmDelete ? (
                            <Button type="button" variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 border-destructive/30" onClick={() => setConfirmDelete(true)}>
                                <Trash2 className="w-4 h-4 mr-1" /> Excluir
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                                    {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
