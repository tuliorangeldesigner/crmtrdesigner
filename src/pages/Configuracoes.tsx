import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Lock, Shield } from 'lucide-react';

export default function Configuracoes() {
    const { user, isAdmin } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);


    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    useEffect(() => {
        if (!user) return;
        setEmail(user.email || '');

        const fetchProfile = async () => {
            const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
            if (data) setFullName(data.full_name || '');
        };
        fetchProfile();
    }, [user]);

    const handleSaveProfile = async () => {
        if (!user) return;
        setSavingProfile(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName.trim() || null })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Perfil atualizado com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar perfil.');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Preencha a nova senha e a confirmação.');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('As senhas não coincidem.');
            return;
        }

        setSavingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;

            toast.success('Senha alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao alterar a senha.');
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
                <p className="text-muted-foreground mt-1">Gerencie seu perfil e segurança.</p>
            </div>

            {/* Perfil */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <div>
                        <CardTitle className="text-base">Perfil</CardTitle>
                        <CardDescription>Informações da sua conta.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={email} disabled className="bg-muted/30 text-muted-foreground" />
                        <p className="text-[10px] text-muted-foreground">O email não pode ser alterado.</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Nome Completo</Label>
                        <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Seu nome completo"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Cargo:</span>
                            <Badge className={isAdmin
                                ? 'bg-secondary/20 text-secondary border-transparent'
                                : 'bg-primary/20 text-primary border-transparent'
                            }>
                                {isAdmin ? 'Administrador' : 'Prospectador'}
                            </Badge>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={savingProfile} size="sm">
                            {savingProfile ? 'Salvando...' : 'Salvar Perfil'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Alterar Senha */}
            <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center gap-2">
                    <Lock className="w-5 h-5 text-yellow-400" />
                    <div>
                        <CardTitle className="text-base">Alterar Senha</CardTitle>
                        <CardDescription>Atualize sua senha de acesso.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repita a nova senha"
                            className="bg-background/50"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleChangePassword} disabled={savingPassword} size="sm" variant="outline">
                            {savingPassword ? 'Alterando...' : 'Alterar Senha'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
