import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'

const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Leads = lazy(() => import('@/pages/Leads'))
const Kanban = lazy(() => import('@/pages/Kanban'))
const Comissoes = lazy(() => import('@/pages/Comissoes'))
const Manual = lazy(() => import('@/pages/Manual'))
const Configuracoes = lazy(() => import('@/pages/Configuracoes'))
const Equipe = lazy(() => import('@/pages/Equipe'))
const Gamificacao = lazy(() => import('@/pages/Gamificacao'))
const CaptacaoOSM = lazy(() => import('@/pages/CaptacaoOSM'))
const ProfissionaisOps = lazy(() => import('@/pages/ProfissionaisOps'))
const FilaOperacional = lazy(() => import('@/pages/FilaOperacional'))
const PoliticasInternas = lazy(() => import('@/pages/PoliticasInternas'))
const OrganizacaoProspeccao = lazy(() => import('@/pages/OrganizacaoProspeccao'))

function PageLoader() {
  return <div className="flex justify-center items-center py-20">Carregando pagina...</div>
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{node}</Suspense>
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center py-20">Carregando CRM...</div>
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center items-center py-20">Carregando CRM...</div>
  }

  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />
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
                {withSuspense(<Login />)}
              </PublicRoute>
            } />

            <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
              <Route path="/dashboard" element={withSuspense(<Dashboard />)} />
              <Route path="/leads" element={withSuspense(<Leads />)} />
              <Route path="/organizacao-prospeccao" element={withSuspense(<OrganizacaoProspeccao />)} />
              <Route path="/kanban" element={withSuspense(<Kanban />)} />
              <Route path="/comissoes" element={withSuspense(<Comissoes />)} />
              <Route path="/gamificacao" element={withSuspense(<Gamificacao />)} />
              <Route path="/equipe" element={withSuspense(<Equipe />)} />
              <Route path="/manual" element={withSuspense(<Manual />)} />
              <Route path="/configuracoes" element={withSuspense(<Configuracoes />)} />
              <Route
                path="/captacao-osm"
                element={
                  <AdminRoute>
                    {withSuspense(<CaptacaoOSM />)}
                  </AdminRoute>
                }
              />
              <Route
                path="/captacao-ia"
                element={
                  <AdminRoute>
                    {withSuspense(<CaptacaoOSM />)}
                  </AdminRoute>
                }
              />
              <Route
                path="/profissionais"
                element={
                  <AdminRoute>
                    {withSuspense(<ProfissionaisOps />)}
                  </AdminRoute>
                }
              />
              <Route
                path="/fila-operacional"
                element={
                  <AdminRoute>
                    {withSuspense(<FilaOperacional />)}
                  </AdminRoute>
                }
              />
              <Route
                path="/politicas-internas"
                element={
                  <AdminRoute>
                    {withSuspense(<PoliticasInternas />)}
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
      <Toaster />
    </AuthProvider>
  )
}

export default App
