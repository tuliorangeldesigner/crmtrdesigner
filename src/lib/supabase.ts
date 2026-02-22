import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Variáveis de ambiente do Supabase não encontradas!")
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    auth: {
        storageKey: 'crm-antigravity-auth',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // Desabilita o Navigator LockManager que trava com múltiplas abas
        lock: ((_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
            return fn()
        }) as any,
    }
})
