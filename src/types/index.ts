export type LeadPrioridade = 'Baixa' | 'Média' | 'Alta';
export type LeadStatusPipeline = 'Contatado' | 'Respondeu' | 'Interessado' | 'Em negociação' | 'Fechado' | 'Perdido';
export type LeadOrigem = 'Instagram' | 'Google Maps' | 'Indicação' | 'WhatsApp' | 'Outros';
export type LeadStatusPagamento = 'Pendente' | 'Pago';

export interface Lead {
    id: string;
    nome_cliente: string;
    nome_empresa: string | null;
    nicho: string | null;
    contato: string | null;
    origem: LeadOrigem;
    observacoes: string | null;
    valor_servico: number;
    tipo_servico: string | null;
    status_pipeline: LeadStatusPipeline;
    status_pagamento: LeadStatusPagamento;
    prioridade: LeadPrioridade;
    owner_id: string;
    created_at: string;
    updated_at: string;
}
