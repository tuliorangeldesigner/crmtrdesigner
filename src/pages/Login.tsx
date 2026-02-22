import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Rocket, Eye, EyeOff } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password })

            if (error) {
                toast.error('Erro ao fazer login. Verifique suas credenciais.')
                console.error(error)
            } else {
                toast.success('Login realizado com sucesso!')
                navigate('/dashboard')
            }
        } catch (error) {
            toast.error('Ocorreu um erro inesperado.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!email || !password) {
            toast.error('Preencha email e senha.')
            return
        }
        setLoading(true)
        try {
            const { error: signUpError, data } = await supabase.auth.signUp({ email, password })

            if (signUpError) {
                toast.error('Erro ao criar conta: ' + signUpError.message)
                return
            }

            if (data?.user?.id) {
                // Tentar forçar o update para admin (se a tabela permitir anon / insert)
                await supabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id)
            }

            toast.success('Conta criada! Você será redirecionado em instantes.')

            // Aguarda 1 segundo para garantir que a trigger no supabase termine
            setTimeout(() => {
                navigate('/dashboard')
            }, 1000)

        } catch {
            toast.error('Ocorreu um problema.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
            {/* Efeitos de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-3xl" />
            </div>

            <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-border shadow-2xl shadow-primary/5 relative z-10">
                <CardHeader className="space-y-1 text-center pb-8">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
                            <Rocket className="w-7 h-7" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        CRM TR Designer
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Acesse sua conta para continuar
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-foreground">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-background/50 border-border focus:border-primary h-11"
                                autoComplete="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-foreground">Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/50 border-border focus:border-primary h-11 pr-10"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-3 pt-2">
                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all duration-200"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Entrando...
                                </div>
                            ) : 'Entrar'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                            onClick={handleRegister}
                            disabled={loading}
                        >
                            Criar Conta de Teste
                        </Button>
                        <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
                            Powered by <span className="text-secondary font-medium">TR Designer</span>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
