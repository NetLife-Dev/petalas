'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    LayoutDashboard,
    Video,
    Library,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Kanban,
    Sun,
    Moon,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { useTheme } from '@/components/providers/ThemeProvider'
import toast from 'react-hot-toast'

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/pipeline', label: 'Pipeline', icon: Kanban },
    { href: '/crm', label: 'CRM', icon: Users },
    { href: '/criar', label: 'Criar Vídeo', icon: Video },
    { href: '/biblioteca', label: 'Biblioteca', icon: Library },
    { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function CreatorSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const { data: session } = useSession()
    const sessionUser = session?.user as any

    const user = sessionUser
        ? {
              nome: sessionUser.name || 'User',
              email: sessionUser.email || '',
              image: sessionUser.image || null,
              plan: sessionUser.plan || 'Pro Plan',
          }
        : null

    const { theme, toggleTheme } = useTheme()

    const handleLogout = async () => {
        await signOut({ redirect: false })
        toast.success('Sessão encerrada')
        router.push('/login')
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-6 border-b border-surface-200">
                <Link href="/dashboard" className="flex flex-col cursor-pointer hover:opacity-85 transition-opacity">
                    <span
                        className="leading-none"
                        style={{
                            fontFamily: 'var(--font-display), Cormorant Garamond, serif',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            fontSize: '1.55rem',
                            color: 'var(--color-sidebar-logo)',
                            letterSpacing: '0.02em',
                        }}
                    >
                        Doce Lilium
                    </span>
                    <span
                        className="mt-0.5 uppercase tracking-widest text-[10px]"
                        style={{ color: 'var(--color-sidebar-text-muted)', fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                        Studio
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                        pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href))

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                                isActive ? 'sidebar-item-active' : 'sidebar-item'
                            )}
                        >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 py-4">
                {user && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                                getAvatarColor(user.nome)
                            )}
                        >
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.nome}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                getInitials(user.nome)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary truncate leading-tight">
                                {user.nome}
                            </p>
                            <p className="text-xs text-text-muted truncate leading-tight">{user.plan}</p>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleLogout}
                        className="sidebar-item flex-1 text-left"
                    >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span>Sair</span>
                    </button>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-100 transition-colors"
                        title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
                        aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            {/* O <aside> se estica com a página (self-stretch) e carrega o bg/border em toda a altura.
                O div interno fica sticky+h-screen para manter a nav visível durante o scroll. */}
            <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 z-40 self-stretch border-r border-surface-100">
                <div className="sticky top-0 h-screen flex flex-col overflow-y-auto">
                    <SidebarContent />
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="mobile-header lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3">
                <Link href="/dashboard" className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity">
                    <span
                        style={{
                            fontFamily: 'var(--font-display), serif',
                            fontStyle: 'italic',
                            fontWeight: 600,
                            fontSize: '1.2rem',
                            color: 'var(--color-text-main)',
                        }}
                    >
                        Doce Lilium
                    </span>
                </Link>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-100"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/20"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={cn(
                    'lg:hidden fixed top-0 left-0 h-full w-64 border-r border-surface-100 z-50 transition-transform duration-300',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    )
}
