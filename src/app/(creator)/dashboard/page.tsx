'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    Video,
    UserPlus,
    DollarSign,
    ArrowUpRight,
    Plus,
    Zap,
    MoreHorizontal,
    Sparkles,
    ArrowRight,
    FileVideo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDashboardStats } from './actions'
import toast from 'react-hot-toast'

export default function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stats = await getDashboardStats()
                setData(stats)
            } catch {
                toast.error('Erro ao carregar dados do painel')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
                {/* Header skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="shimmer h-7 w-40 rounded-lg" />
                        <div className="shimmer h-4 w-56 rounded" />
                    </div>
                    <div className="shimmer h-10 w-32 rounded-lg" />
                </div>
                {/* Metric cards skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="metric-card space-y-3">
                            <div className="shimmer h-10 w-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="shimmer h-3 w-24 rounded" />
                                <div className="shimmer h-7 w-16 rounded" />
                            </div>
                            <div className="shimmer h-3 w-12 rounded" />
                        </div>
                    ))}
                </div>
                {/* Chart skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 card">
                        <div className="shimmer h-5 w-48 rounded mb-6" />
                        <div className="flex items-end gap-2 h-48">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="shimmer w-full rounded-t-md" style={{ height: `${30 + Math.random() * 60}%` }} />
                                    <div className="shimmer h-2.5 w-6 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-4">
                        <div className="card shimmer h-32" />
                        <div className="card">
                            <div className="shimmer h-5 w-36 rounded mb-4" />
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex gap-3 mb-4">
                                    <div className="shimmer w-7 h-7 rounded-full flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="shimmer h-3.5 w-full rounded" />
                                        <div className="shimmer h-3 w-2/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const metrics = data?.metrics || [
        { label: 'Vídeos Gerados', value: '0', change: '0%', status: 'neutral' },
        { label: 'Leads Ativos', value: '0', change: '0%', status: 'neutral' },
        { label: 'Valor do Funil', value: 'R$ 0,00', change: '0%', status: 'neutral' },
        { label: 'Integrações', value: '0', change: 'Ativas', status: 'neutral' },
    ]

    const chartData = data?.chartData || []

    const iconConfigs = [
        { icon: Video, bg: 'bg-blue-50', color: 'text-blue-600' },
        { icon: UserPlus, bg: 'bg-purple-50', color: 'text-purple-600' },
        { icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
        { icon: Zap, bg: 'bg-amber-50', color: 'text-amber-600' },
    ]

    return (
        <div className="p-6 space-y-6 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-text-muted text-sm mt-0.5">
                        Bem-vindo ao seu painel Pétalas.
                    </p>
                </div>
                <Link
                    href="/criar"
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" />
                    Criar Vídeo
                </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric: any, i: number) => {
                    const cfg = iconConfigs[i] || iconConfigs[0]
                    const Icon = cfg.icon
                    return (
                        <div key={metric.label} className="metric-card">
                            <div className="flex items-center justify-between">
                                <div
                                    className={cn(
                                        'w-10 h-10 rounded-lg flex items-center justify-center',
                                        cfg.bg
                                    )}
                                >
                                    <Icon className={cn('w-5 h-5', cfg.color)} />
                                </div>
                            </div>
                            <div>
                                <p className="label mb-1">{metric.label}</p>
                                <p className="text-2xl font-bold text-text-primary leading-none">
                                    {metric.value}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                {metric.status === 'up' && (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                )}
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        metric.status === 'up'
                                            ? 'text-emerald-600'
                                            : 'text-text-muted'
                                    )}
                                >
                                    {metric.change}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Main section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Chart */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="card h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="section-title">Geração de Conteúdo</h2>
                                <p className="text-text-muted text-xs mt-0.5">
                                    Vídeos gerados por mês
                                </p>
                            </div>
                        </div>

                        {chartData.length === 0 || chartData.every((d: any) => d.count === 0) ? (
                            <div className="flex-1 flex flex-col items-center justify-center min-h-[220px] gap-3">
                                <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
                                    <FileVideo className="w-6 h-6 text-text-tertiary" />
                                </div>
                                <p className="text-sm text-text-muted text-center">Nenhum vídeo gerado ainda.</p>
                                <Link href="/criar" className="btn-primary text-xs px-4 py-2">
                                    <Plus className="w-3.5 h-3.5" />
                                    Criar primeiro vídeo
                                </Link>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-end gap-2 pb-4 min-h-[220px]">
                                {chartData.map((d: any) => (
                                    <div
                                        key={d.month}
                                        className="flex-1 flex flex-col items-center gap-2 group"
                                        title={`${d.count} vídeo${d.count !== 1 ? 's' : ''}`}
                                    >
                                        <div className="w-full relative h-48">
                                            <div
                                                className="absolute bottom-0 left-0 right-0 bg-primary/20 rounded-t-md group-hover:bg-primary/40 transition-colors duration-200"
                                                style={{ height: `${Math.max(d.val, d.count > 0 ? 4 : 0)}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-medium text-text-tertiary">
                                            {d.month}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="lg:col-span-4 space-y-4">
                    {/* AI insight — neutral card with left accent */}
                    <div className="card border-l-4 border-l-primary">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="label mb-0">Sugestão da IA</span>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            {data?.metrics?.[1]?.value === '0'
                                ? 'Adicione seus primeiros contatos no CRM para análise.'
                                : `Você possui ${data?.metrics?.[1]?.value} leads com alta probabilidade de conversão.`}
                        </p>
                        <Link
                            href="/crm"
                            className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3 hover:underline"
                        >
                            Ver CRM
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Recent activity */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="section-title">Atividade Recente</h2>
                            <button className="p-1 text-text-muted hover:text-text-primary rounded transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            {(data?.recentActivity || []).length === 0 ? (
                                <p className="text-sm text-text-muted text-center py-8">
                                    Nenhuma atividade recente
                                </p>
                            ) : (
                                data?.recentActivity.map((act: any) => (
                                    <div key={act.id} className="flex gap-3">
                                        <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-xs font-medium text-text-muted flex-shrink-0">
                                            {act.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-secondary">
                                                <span className="font-medium text-text-primary">
                                                    {act.user}
                                                </span>{' '}
                                                {act.action}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5 truncate">
                                                {act.target}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
