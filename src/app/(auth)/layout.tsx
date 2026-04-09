import { type ReactNode } from 'react'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen flex bg-white font-outfit">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-[52%] bg-surface-50 border-r border-surface-100 p-12 flex-col justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-bold text-text-primary tracking-tight">Pétalas</span>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary leading-tight">
                            O futuro da criação de conteúdo está florescendo.
                        </h1>
                        <p className="text-text-muted mt-4 text-base leading-relaxed">
                            Automatize a criação de vídeos, gerencie seu CRM e acompanhe seu pipeline — tudo em um só lugar.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            'Geração de vídeos com IA em segundos',
                            'CRM integrado com pipeline de vendas',
                            'Insights estratégicos em tempo real',
                        ].map((item) => (
                            <div key={item} className="flex items-center gap-3">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                <span className="text-sm text-text-secondary">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-text-muted">© 2024 Pétalas AI. Todos os direitos reservados.</p>
            </div>

            {/* Right Panel — Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-sm animate-fade-in">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-text-primary">Pétalas</span>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    )
}
