'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Monitor,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/usuarios', label: 'Usuários', icon: Users },
    { href: '/admin/cotas', label: 'Cotas', icon: BarChart3 },
    { href: '/admin/monitoramento', label: 'Monitoramento', icon: Monitor },
    { href: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const { data: session } = useSession()

    const admin = session?.user
        ? {
              nome: session.user.name || '',
              email: session.user.email || '',
              avatar_url: session.user.image || null,
          }
        : null

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Logout realizado')
        router.push('/login')
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-surface-200">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <span className="text-text-primary font-black text-xl tracking-tighter block leading-none">
                            Pétalas
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-primary font-black uppercase tracking-widest">Admin Panel</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(isActive ? 'sidebar-item-active' : 'sidebar-item')}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Admin Footer */}
            {admin && (
                <div className="p-4 border-t border-surface-200">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                            {admin.avatar_url ? (
                                <img
                                    src={admin.avatar_url}
                                    alt={admin.nome}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-primary text-xs font-bold">
                                    {getInitials(admin.nome)}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate">{admin.nome}</p>
                            <p className="text-xs text-text-muted truncate">Administrador</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-text-muted hover:text-red-500 transition-colors p-1"
                            title="Sair"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-surface-50 border-r border-surface-200 h-screen sticky top-0 flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-surface-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-text-primary font-black text-lg">
                        Pétalas
                    </span>
                    <span className="text-[10px] text-primary font-black uppercase tracking-widest ml-2">Admin</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-text-muted hover:text-primary"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-text-primary/20 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-surface-200 z-50 transition-transform duration-300',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
