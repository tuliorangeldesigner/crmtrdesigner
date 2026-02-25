import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { clearLeadsCache } from '@/hooks/useLeadsCache'
import { toast } from 'sonner'
import { useWebPush } from '@/hooks/useWebPush'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    isAdmin: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAdmin, setIsAdmin] = useState(false)

    useWebPush(user?.id)

    useEffect(() => {
        // Fallback de segurança fortíssimo: Se o Supabase travar por cache bugado do navegador do usuário,
        // força a liberação da tela de loading para ele não ficar preso!
        const safetyTimeout = setTimeout(() => {
            setLoading(false);
        }, 2000);

        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error) console.error("Erro ao obter a sessão: ", error)
                setSession(session)
                setUser(session?.user ?? null)
                await checkIfAdmin(session?.user?.id)
            } catch (err) {
                console.error("Erro inesperado na sessão: ", err)
            } finally {
                setLoading(false)
            }
        }

        initSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            await checkIfAdmin(session?.user?.id)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe();
            clearTimeout(safetyTimeout);
        }
    }, [])

    const checkIfAdmin = async (userId: string | undefined) => {
        if (!userId) {
            setIsAdmin(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single()

            if (error) {
                console.error("Erro ao checar admin role:", error)
                setIsAdmin(false)
            } else {
                setIsAdmin(data?.role === 'admin')
            }
        } catch (error) {
            console.error("Erro inesperado ao checar admin:", error)
            setIsAdmin(false)
        }
    }

    const signOut = async () => {
        try {
            console.log('[Auth] Iniciando logout...');
            setLoading(true);
            clearLeadsCache();
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            console.log('[Auth] Logout realizado com sucesso.');
            toast.success('Você saiu do sistema.');
        } catch (error: any) {
            console.error('[Auth] Erro ao sair:', error);
            toast.error('Erro ao sair do sistema. Tente fechar a aba.');
        } finally {
            setLoading(false);
        }
    }

    const value = useMemo(() => ({
        user,
        session,
        loading,
        isAdmin,
        signOut
    }), [user, session, loading, isAdmin]);

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        <p className="text-muted-foreground font-medium animate-pulse">Conectando ao banco de dados...</p>
                    </div>
                </div>
            ) : children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext)
}

