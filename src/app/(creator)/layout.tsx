'use client'

import { type ReactNode } from 'react'
import { CreatorSidebar } from '@/components/layout/CreatorSidebar'
import { Search, Bell } from 'lucide-react'
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
                <header className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-surface-100 sticky top-0 z-30">
                    <div className="flex-1 max-w-sm relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-surface-50 border border-surface-200 text-sm py-2 pl-9 pr-4 rounded-lg outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-150 placeholder-text-tertiary"
                        />
                    </div>

                    <div className="flex items-center gap-3 ml-6">
                        <button className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-100 rounded-lg transition-colors">
                            <Bell className="w-4 h-4" />
                        </button>

                        <div
                            className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden',
                                user?.image ? '' : getAvatarColor(user?.name || 'U')
                            )}
                        >
                            {user?.image ? (
                                <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                getInitials(user?.name || 'U')
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1">
                    <div className="pt-16 lg:pt-0">{children}</div>
                </main>
            </div>
        </div>
    )
}
