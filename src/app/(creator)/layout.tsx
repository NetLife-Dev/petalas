'use client'

import { type ReactNode } from 'react'
import { CreatorSidebar } from '@/components/layout/CreatorSidebar'
import { Bell } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { getInitials, getAvatarColor } from '@/lib/utils'
import { cn } from '@/lib/utils'

export default function CreatorLayout({ children }: { children: ReactNode }) {
    const { data: session } = useSession()
    const user = session?.user as any

    return (
        <div className="flex min-h-screen" style={{ background: 'var(--color-bg-main)' }}>
            <CreatorSidebar />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Top bar — desktop only */}
                <header className="hidden lg:flex items-center justify-end px-12 h-20 bg-transparent sticky top-0 z-30 pointer-events-none">
                    <div className="flex items-center gap-6 pointer-events-auto">
                        <button className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-primary transition-all duration-300 rounded-full hover:bg-white hover:shadow-soft border border-transparent hover:border-primary/5">
                            <Bell className="w-4.5 h-4.5" />
                        </button>

                        <div className="flex items-center gap-4 pl-6 border-l border-primary/10">
                            <div className="text-right hidden xl:block">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-primary leading-none">{user?.name || 'Membro'}</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-primary opacity-60 mt-1">Conectado</p>
                            </div>
                            <div
                                className={cn(
                                    'w-10 h-10 rounded-2xl flex items-center justify-center text-[11px] font-black overflow-hidden bg-white text-primary shadow-soft border border-primary/5 transition-transform hover:scale-110 cursor-pointer'
                                )}
                            >
                                {user?.image ? (
                                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(user?.name || 'U')
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 relative">
                    <div className="pt-20 lg:pt-0">{children}</div>
                </main>
            </div>
        </div>
    )
}
