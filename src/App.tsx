import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Leads from '@/pages/Leads'
import Kanban from '@/pages/Kanban'
import Comissoes from '@/pages/Comissoes'
import Manual from '@/pages/Manual'
import Configuracoes from '@/pages/Configuracoes'
import Equipe from '@/pages/Equipe'
import Gamificacao from '@/pages/Gamificacao'
import DashboardLayout from '@/components/layout/DashboardLayout'
import type { ReactNode } from 'react'

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center py-20">Carregando CRM...</div>
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center py-20">Carregando CRM...</div>
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen font-sans bg-background text-foreground selection:bg-primary/30">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />

            {/* Rotas Protegidas englobadas no Layout Base */}
            <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/comissoes" element={<Comissoes />} />
              <Route path="/gamificacao" element={<Gamificacao />} />
              <Route path="/equipe" element={<Equipe />} />
              <Route path="/manual" element={<Manual />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App
