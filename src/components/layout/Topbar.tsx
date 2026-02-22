import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Rocket } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { navItems } from './Sidebar'

export default function Topbar() {
    const { user, isAdmin, signOut } = useAuth()

    const initials = user?.email
        ? user.email.substring(0, 2).toUpperCase()
        : 'US'

    return (
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
                {/* Mobile menu */}
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
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                        Sair do sistema
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    )
}
