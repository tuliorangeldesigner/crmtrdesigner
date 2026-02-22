import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLeadsCache } from '@/hooks/useLeadsCache';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, Shield, TrendingUp, Eye, EyeOff, Trash2 } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: string;
    created_at: string;
    lead_count?: number;
    fechados?: number;
    vendas?: number;
    comissao_percentual?: number;
}

export default function Equipe() {
    const { user, isAdmin } = useAuth();
    const { leads, profilesMeta, loading, refetch: fetchTeam } = useLeadsCache();

    // Formulário de novo prospectador
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newName, setNewName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [creating, setCreating] = useState(false);

    const profiles: Profile[] = isAdmin ? Object.values(profilesMeta).map(p => {
        const userLeads = leads.filter(l => l.owner_id === p.id);
        const fechados = userLeads.filter(l => l.status_pipeline === 'Fechado');
        const vendas = fechados
            .filter(l => l.status_pagamento === 'Pago')
            .reduce((sum, l) => sum + (l.valor_servico || 0), 0);
        return {
            ...p,
            lead_count: userLeads.length,
            fechados: fechados.length,
            vendas,
        } as Profile;
    }).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : [];

    // Só admin acessa — DEPOIS de todos os hooks
    // Fallback: se estiver na dúvida, mostre uma tela indicando acesso negado em vez de redirecionar instantaneamente
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] bg-card border border-border rounded-xl mt-6">
                <Shield className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                    O sistema identificou que a sua conta atual (<b>{user?.email}</b>) não possui o cargo de administrador na tabela `profiles`.
                </p>
                <div className="flex flex-col gap-3 items-center">
                    <Button onClick={() => window.location.href = '/dashboard'}>
                        Voltar para o Dashboard
                    </Button>

                    <div className="pt-6 border-t border-border w-full max-w-sm mt-4">
                        <p className="text-xs text-muted-foreground mb-3 text-center">🛠️ Ferramenta de Suporte (Dono):</p>
                        <Button
                            variant="secondary"
                            className="w-full font-bold shadow-md shadow-secondary/20"
                            onClick={async () => {
                                if (!user) return;
                                toast.info('Tentando promover sua conta...')
                                const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id)
                                if (error) {
                                    toast.error('Restrito pelo banco! Ajuste manualmente no Supabase (auth/users ou SQL/Profile).', { duration: 10000 })
                                    console.error(error)
                                } else {
                                    toast.success('Pronto! Dê F5 daqui a 1s para ativar.', { duration: 5000 })
                                    setTimeout(() => window.location.reload(), 1500)
                                }
                            }}
                        >
                            Promover minha conta para Admin
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const handleCreateProspector = async () => {
        if (!newEmail.trim() || !newPassword.trim()) {
            toast.error('Preencha email e senha.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setCreating(true);
        try {
            // Criar cliente Supabase separado para não deslogar o admin
            const signupClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY,
                {
                    auth: {
                        persistSession: false,
                        autoRefreshToken: false,
                    }
                }
            );

            const { data, error } = await signupClient.auth.signUp({
                email: newEmail.trim(),
                password: newPassword.trim(),
                options: {
                    data: { full_name: newName.trim() || undefined }
                }
            });

            if (error) throw error;

            // Atualizar o nome no perfil se fornecido
            if (data?.user?.id && newName.trim()) {
                await supabase.from('profiles').update({
                    full_name: newName.trim(),
                    role: 'prospectador'
                }).eq('id', data.user.id);
            }

            toast.success(`Prospectador ${newEmail.trim()} criado com sucesso!`);
            setNewEmail('');
            setNewPassword('');
            setNewName('');
            setDialogOpen(false);
            fetchTeam();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Erro desconhecido';
            console.error(error);
            toast.error('Erro ao criar conta: ' + msg);
        } finally {
            setCreating(false);
        }
    };

    const handleChangeRole = async (profileId: string, newRole: string) => {
        if (profileId === user?.id) {
            toast.error('Você não pode alterar seu próprio cargo.');
            return;
        }
        try {
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profileId);
            if (error) throw error;
            toast.success(`Cargo atualizado para ${newRole}.`);
            fetchTeam();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar cargo.');
        }
    };

    const handleUpdateComissao = async (profileId: string, percentual: number) => {
        try {
            const { error } = await supabase.from('profiles')
                .update({ comissao_percentual: percentual })
                .eq('id', profileId);

            if (error) {
                if (error.message.includes('comissao_percentual') || error.code === 'PGRST204') {
                    toast.error('Coluna não existe! Você precisa ir no painel do Supabase, clicar na tabela "profiles" e criar uma nova coluna "comissao_percentual" (tipo int4, default 10).', { duration: 15000 });
                } else {
                    throw error;
                }
                return;
            }
            toast.success(`Comissão salva com sucesso (${percentual}%)!`);
            fetchTeam();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar comissão.');
        }
    };

    const handleDeleteMember = async (profileId: string, email: string) => {
        if (profileId === user?.id) {
            toast.error('Você não pode deletar sua própria conta.');
            return;
        }

        if (!confirm(`Tem certeza que deseja remover ${email} da equipe?\n\nAtenção: Isso não deleta a conta de autenticação (por segurança do Supabase), mas remove o acesso e o perfil do CRM.`)) {
            return;
        }

        try {
            console.log('Tentando deletar perfil:', profileId);

            // Verifica se tem leads antes (opcional, o banco já travaria)
            const userLeads = leads.filter(l => l.owner_id === profileId);
            if (userLeads.length > 0) {
                toast.error(`Não é possível remover: Este membro possui ${userLeads.length} leads vinculados. Transfira os leads antes de remover.`);
                return;
            }

            const { error } = await supabase.from('profiles').delete().eq('id', profileId);

            if (error) {
                console.error('Erro Supabase ao deletar:', error);
                toast.error(`Erro: ${error.message || 'Ação restrita pelo banco de dados'}`);
                return;
            }

            toast.success('Membro removido com sucesso.');
            fetchTeam();
        } catch (error: any) {
            console.error('Erro inesperado ao deletar:', error);
            toast.error('Ocorreu um erro interno ao tentar remover o membro.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Equipe</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Gerencie seus prospectadores. {profiles.length} membro{profiles.length !== 1 ? 's' : ''}.
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 shrink-0">
                            <UserPlus className="w-4 h-4" /> Novo Prospectador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-card border-border">
                        <DialogHeader>
                            <DialogTitle>Criar Conta de Prospectador</DialogTitle>
                            <DialogDescription>
                                O prospectador poderá fazer login com estas credenciais.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ex: João Silva"
                                    className="bg-background/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email *</Label>
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="prospectador@email.com"
                                    className="bg-background/50"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Senha *</Label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="bg-background/50 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateProspector} disabled={creating}>
                                {creating ? 'Criando...' : 'Criar Conta'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Cards resumo */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total na Equipe</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profiles.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Prospectadores</CardTitle>
                        <UserPlus className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profiles.filter(p => p.role === 'prospectador').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Admins</CardTitle>
                        <Shield className="h-4 w-4 text-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profiles.filter(p => p.role === 'admin').length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Leads Totais</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{profiles.reduce((s, p) => s + (p.lead_count || 0), 0)}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabela da equipe */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="text-base">Membros da Equipe</CardTitle>
                    <CardDescription>Clique no cargo para alterar entre Admin e Prospectador.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border">
                                        <TableHead>Nome / Email</TableHead>
                                        <TableHead className="text-center">Cargo</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">% Comissão</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Leads</TableHead>
                                        <TableHead className="text-center hidden sm:table-cell">Fechados</TableHead>
                                        <TableHead className="text-right hidden md:table-cell">Vendas</TableHead>
                                        <TableHead className="text-right">Ação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {profiles.map(p => (
                                        <TableRow key={p.id} className="border-border">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-sm">{p.full_name || '(sem nome)'}</p>
                                                    <p className="text-xs text-muted-foreground">{p.email}</p>
                                                    {p.id === user?.id && (
                                                        <Badge className="bg-primary/10 text-primary border-transparent text-[9px] mt-1">Você</Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {p.id === user?.id ? (
                                                    <Badge className="bg-secondary/20 text-secondary border-transparent">Admin</Badge>
                                                ) : (
                                                    <Select value={p.role} onValueChange={(v) => handleChangeRole(p.id, v)}>
                                                        <SelectTrigger className="w-[140px] h-8 text-xs mx-auto bg-background/50">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="prospectador">Prospectador</SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Input
                                                        type="number"
                                                        defaultValue={p.comissao_percentual ?? 10}
                                                        className="w-16 h-8 text-xs text-center bg-background/50 px-1"
                                                        onBlur={(e) => {
                                                            const val = Number(e.target.value);
                                                            if (val !== p.comissao_percentual && !isNaN(val)) {
                                                                handleUpdateComissao(p.id, val);
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-xs text-muted-foreground">%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center hidden sm:table-cell font-medium">{p.lead_count || 0}</TableCell>
                                            <TableCell className="text-center hidden sm:table-cell">{p.fechados || 0}</TableCell>
                                            <TableCell className="text-right hidden md:table-cell font-medium text-emerald-400">
                                                R$ {(p.vendas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {p.id !== user?.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMember(p.id, p.email);
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
