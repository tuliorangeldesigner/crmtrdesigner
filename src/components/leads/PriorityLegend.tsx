import { Badge } from '@/components/ui/badge';
import { differenceInHours } from 'date-fns';
import type { Lead } from '@/types';

export const priorityColors: Record<string, string> = {
    'Alta': 'bg-orange-600/20 text-orange-400 border-orange-500/30',
    'Média': 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30',
    'Baixa': 'bg-blue-600/20 text-blue-400 border-blue-500/30',
    'Atrasado': 'bg-red-600/20 text-red-400 border-red-500/30 animate-pulse',
};

export function isLeadDelayed(lead: Lead) {
    if (lead.status_pipeline === 'Fechado' || lead.status_pipeline === 'Perdido') return false;
    const lastUpdate = new Date(lead.updated_at || lead.created_at);
    const hoursSinceUpdate = differenceInHours(new Date(), lastUpdate);
    return hoursSinceUpdate >= 48;
}

export function PriorityBadge({ lead }: { lead: Lead }) {
    const delayed = isLeadDelayed(lead);
    const priority = lead.prioridade || 'Média';

    if (delayed) {
        return (
            <Badge variant="outline" className={`${priorityColors['Atrasado']} font-bold text-[10px]`}>
                Atrasado (48h+)
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className={`${priorityColors[priority]} font-bold text-[10px]`}>
            {priority}
        </Badge>
    );
}

export default function PriorityLegend() {
    return (
        <div className="bg-card/30 border border-border p-3 rounded-lg flex flex-col gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Legenda de Urgência</span>
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                    <span className="text-xs text-muted-foreground">Atrasado (48h+)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                    <span className="text-xs text-muted-foreground">Alta</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.4)]"></div>
                    <span className="text-xs text-muted-foreground">Média</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                    <span className="text-xs text-muted-foreground">Baixa</span>
                </div>
            </div>
        </div>
    );
}
