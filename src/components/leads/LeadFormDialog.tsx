import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { LeadOrigem, LeadStatusPipeline, LeadStatusPagamento } from '@/types';

const origemOptions: LeadOrigem[] = ['Instagram', 'Google Maps', 'Indicação', 'WhatsApp', 'Outros'];
const pipelineOptions: LeadStatusPipeline[] = ['Contatado', 'Respondeu', 'Interessado', 'Em negociação', 'Fechado', 'Perdido'];
const pagamentoOptions: LeadStatusPagamento[] = ['Pendente', 'Pago'];
const prioridadeOptions: string[] = ['Baixa', 'Média', 'Alta'];

interface LeadFormDialogProps {
    onLeadCreated: () => void;
}

export default function LeadFormDialog({ onLeadCreated }: LeadFormDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const resetForm = () => {
        setNomeCliente('');
        setNomeEmpresa('');
        setNicho('');
        setContato('');
        setOrigem('Instagram');
        setObservacoes('');
        setValorServico('');
        setTipoServico('');
        setStatusPipeline('Contatado');
        setStatusPagamento('Pendente');
        setPrioridade('Média');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!nomeCliente.trim()) {
            toast.error('O nome do cliente é obrigatório.');
            return;
        }

        setSaving(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        try {
            const valorTratado = valorServico ? parseFloat(valorServico.toString().replace(',', '.')) : 0;

            const { data, error } = await supabase.from('leads').insert({
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
                owner_id: user.id,
            }).select().abortSignal(controller.signal);

            clearTimeout(timeoutId);

            if (error) throw error;

            console.log('Lead criado:', data);
            toast.success('Lead cadastrado com sucesso!');
            resetForm();
            setOpen(false);
            onLeadCreated();
        } catch (error: any) {
            clearTimeout(timeoutId);
            console.error('Erro ao criar lead:', error);

            let errMsg = 'Erro desconhecido. A conexão com o banco pode estar instável.';
            if (error?.name === 'AbortError') {
                errMsg = 'O servidor demorou muito para responder (Timeout). Tente novamente.';
            } else if (error?.message) {
                errMsg = error.message;
            } else if (typeof error === 'string') {
                errMsg = error;
            }

            toast.error('Erro: ' + errMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="shrink-0 flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Novo Lead
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Cadastrar Novo Lead</DialogTitle>
                        <DialogDescription>
                            Preencha as informações do novo contato comercial.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-6">
                        {/* Dados Principais */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomeCliente">Nome do Cliente *</Label>
                                <Input
                                    id="nomeCliente"
                                    placeholder="Ex: João Silva"
                                    value={nomeCliente}
                                    onChange={(e) => setNomeCliente(e.target.value)}
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomeEmpresa">Empresa</Label>
                                <Input
                                    id="nomeEmpresa"
                                    placeholder="Ex: Padaria do João"
                                    value={nomeEmpresa}
                                    onChange={(e) => setNomeEmpresa(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nicho">Nicho</Label>
                                <Input
                                    id="nicho"
                                    placeholder="Ex: Alimentação"
                                    value={nicho}
                                    onChange={(e) => setNicho(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contato">Contato (Telefone/Insta)</Label>
                                <Input
                                    id="contato"
                                    placeholder="Ex: (11) 99999-9999"
                                    value={contato}
                                    onChange={(e) => setContato(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        {/* Origem e Serviço */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Origem do Lead</Label>
                                <Select value={origem} onValueChange={(v) => setOrigem(v as LeadOrigem)}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {origemOptions.map(o => (
                                            <SelectItem key={o} value={o}>{o}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tipoServico">Tipo de Serviço</Label>
                                <Input
                                    id="tipoServico"
                                    placeholder="Ex: Social Media"
                                    value={tipoServico}
                                    onChange={(e) => setTipoServico(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="valorServico">Valor (R$)</Label>
                                <Input
                                    id="valorServico"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="0.00"
                                    value={valorServico}
                                    onChange={(e) => setValorServico(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status Pipeline</Label>
                                <Select value={statusPipeline} onValueChange={(v) => setStatusPipeline(v as LeadStatusPipeline)}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pipelineOptions.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Pagamento</Label>
                                <Select value={statusPagamento} onValueChange={(v) => setStatusPagamento(v as LeadStatusPagamento)}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {pagamentoOptions.map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Prioridade</Label>
                                <Select value={prioridade} onValueChange={(v) => setPrioridade(v)}>
                                    <SelectTrigger className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {prioridadeOptions.map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="observacoes">Observações</Label>
                            <Textarea
                                id="observacoes"
                                placeholder="Anotações sobre o lead..."
                                value={observacoes}
                                onChange={(e) => setObservacoes(e.target.value)}
                                className="bg-background/50 min-h-[80px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Salvando...' : 'Cadastrar Lead'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
