import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Rocket, UsersRound, Circle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getNavItems } from './Sidebar'
import { usePresence } from '@/hooks/usePresence'
import { Badge } from '@/components/ui/badge'

export default function Topbar() {
    const { user, isAdmin, signOut } = useAuth()
    const { onlineUsers } = usePresence()
    const navItems = getNavItems(isAdmin)

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'US'

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="w-5 h-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-64 bg-card border-border p-0">
                        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
                            <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-md text-white">
                                <Rocket className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">CRM TR Designer</span>
                        </div>
                        <nav className="p-4 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isActive
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>

                <h2 className="font-bold text-foreground text-sm md:text-base">
                    Painel {isAdmin ? 'Administrativo' : 'do Prospectador'}
                </h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {isAdmin && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2 border-border text-muted-foreground relative">
                                <UsersRound className="w-4 h-4" />
                                <span className="font-medium text-xs">Online</span>
                                <Badge className="ml-1 px-1.5 py-0 min-w-[20px] h-5 justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-transparent">
                                    {onlineUsers.filter(u => !u.isAdmin).length}
                                </Badge>
                                {onlineUsers.filter(u => !u.isAdmin).length > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none text-foreground flex items-center justify-between">
                                        Equipe Online
                                        <span className="text-xs text-muted-foreground font-medium bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{onlineUsers.filter(u => !u.isAdmin).length} ativos</span>
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-60 overflow-y-auto p-1">
                                {onlineUsers.filter(u => !u.isAdmin).length === 0 ? (
                                    <p className="text-xs text-muted-foreground text-center py-4">Nenhum prospectador online no momento.</p>
                                ) : (
                                    onlineUsers.filter(u => !u.isAdmin).map(onlineUser => (
                                        <div key={onlineUser.id} className="flex flex-col px-2 py-1.5 hover:bg-accent rounded-sm">
                                            <div className="flex items-center gap-2">
                                                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 shrink-0" />
                                                <span className="text-sm font-medium truncate flex-1 capitalize">{onlineUser.email.split('@')[0]}</span>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground pl-4 truncate">{onlineUser.email}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-border shrink-0 hover:border-primary/50 transition-colors">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{initials}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-foreground">Sua Conta</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-xs">
                            <span className="flex w-full items-center justify-between">
                                Perfil
                                {isAdmin && <span className="px-1.5 py-0.5 rounded bg-secondary/20 text-secondary ml-2 font-bold tracking-wider text-[10px]">ADMIN</span>}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                            Sair do sistema
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
