import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Columns3, Rocket, DollarSign, BookOpen, Settings, UsersRound, Trophy, MapPinned, BriefcaseBusiness, ListChecks, FileText, ClipboardList, Bot } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const baseNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Leads', icon: Users, path: '/leads' },
    { name: 'Organização Prospecção', icon: ClipboardList, path: '/organizacao-prospeccao' },
    { name: 'Kanban', icon: Columns3, path: '/kanban' },
    { name: 'Comissões', icon: DollarSign, path: '/comissoes' },
    { name: 'Gamificação', icon: Trophy, path: '/gamificacao' },
    { name: 'Equipe', icon: UsersRound, path: '/equipe' },
    { name: 'Manual', icon: BookOpen, path: '/manual' },
    { name: 'IAs Auxiliadoras', icon: Bot, path: '/ias-auxiliadoras' },
]
const configNavItem = { name: 'Configurações', icon: Settings, path: '/configuracoes' }

const adminNavItems = [
    { name: 'Captação de Leads IA', icon: MapPinned, path: '/captacao-ia' },
    { name: 'Profissionais', icon: BriefcaseBusiness, path: '/profissionais' },
    { name: 'Fila Operacional', icon: ListChecks, path: '/fila-operacional' },
    { name: 'Políticas Internas', icon: FileText, path: '/politicas-internas' },
]

export function getNavItems(isAdmin: boolean) {
    if (isAdmin) {
        return [...baseNavItems, ...adminNavItems, configNavItem]
    }
    return [...baseNavItems, configNavItem]
}

export default function Sidebar() {
    const { isAdmin } = useAuth()
    const navItems = getNavItems(isAdmin)

    return (
        <aside className="w-64 flex flex-col border-r border-border bg-card hidden md:flex min-h-screen">
            <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
                <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-md text-white shadow-md shadow-primary/20">
                    <Rocket className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CRM TR Designer</span>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                ? 'bg-primary/10 text-primary shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`
                        }
                    >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4 border-t border-border text-[10px] text-muted-foreground text-center flex flex-col gap-0.5">
                <span>Versao 1.0.0</span>
                <span>Powered by <a href="https://trdesigner.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors font-semibold">TR Designer</a></span>
            </div>
        </aside>
    )
}
