'use client'

import { useState, useEffect } from 'react'
import {
    Users,
    Video,
    TrendingUp,
    Activity,
    ArrowUpRight,
    Clock,
    LayoutGrid,
    Target,
} from 'lucide-react'
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { formatDateTime, getStatusColor, getStatusLabel, cn } from '@/lib/utils'

interface Stats {
    totalUsers: number
    videosThisMonth: number
    videosToday: number
    totalQuotaConsumed: number
}

interface VideoActivity {
    id: string
    nome_produto: string
    status: string
    created_at: string
    user_nome: string | null
}

// Generate last 30 days data
function generateChartData() {
    const data = []
    for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        data.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            videos: Math.floor(Math.random() * 15) + 1,
        })
    }
    return data
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-surface-200 rounded-[20px] px-6 py-4 shadow-xl animate-fade-in">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
                <p className="text-xl font-semibold text-primary mt-1">
                    {payload[0].value} <span className="text-sm">Vídeos</span>
                </p>
            </div>
        )
    }
    return null
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        videosThisMonth: 0,
        videosToday: 0,
        totalQuotaConsumed: 0,
    })
    const [recentVideos, setRecentVideos] = useState<VideoActivity[]>([])
    const [topUsers, setTopUsers] = useState<Array<{ nome: string; total: number }>>([])
    const [chartData] = useState(generateChartData())
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            setIsLoading(true)
            try {
                const response = await fetch('/api/admin/dashboard-stats')
                if (response.ok) {
                    const data = await response.json()
                    setStats(data.stats)
                    setRecentVideos(data.recentVideos)
                    setTopUsers(data.topUsers)
                }
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const metricCards = [
        {
            label: 'Criadores Ativos',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
            change: '+12%',
        },
        {
            label: 'Criações/Mês',
            value: stats.videosThisMonth,
            icon: Video,
            color: 'text-primary',
            bg: 'bg-primary/5',
            change: '+8%',
        },
        {
            label: 'Vídeos Hoje',
            value: stats.videosToday,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50',
            change: '+3%',
        },
        {
            label: 'Consumo Total',
            value: stats.totalQuotaConsumed,
            icon: Activity,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
            change: '+5%',
        },
    ]

    return (
        <main className="flex-1 p-6 lg:p-8 min-h-screen animate-fade-in">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                <header>
                    <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                    <p className="text-text-muted text-sm mt-0.5">Visão em tempo real do sistema Pétalas.</p>
                </header>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {metricCards.map((card) => {
                        const Icon = card.icon
                        return (
                            <div key={card.label} className="metric-card">
                                <div className="flex items-center justify-between">
                                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', card.bg)}>
                                        <Icon className={cn('w-5 h-5', card.color)} />
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        <ArrowUpRight className="w-3 h-3" />
                                        <span className="text-xs font-medium">{card.change}</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="label mb-0.5">{card.label}</p>
                                    <p className="text-2xl font-bold text-text-primary">
                                        {isLoading ? (
                                            <span className="w-12 h-6 bg-surface-100 rounded animate-pulse inline-block" />
                                        ) : (
                                            card.value.toLocaleString()
                                        )}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className="card xl:col-span-2">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="section-title">Velocidade de Criação</h2>
                                <p className="text-xs text-text-muted mt-0.5">Últimos 30 dias</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-text-muted">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">30 dias</span>
                            </div>
                        </div>
                        <div className="h-[260px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#9CA3AF"
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={4}
                                    />
                                    <YAxis
                                        stroke="#9CA3AF"
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }} />
                                    <Line
                                        type="monotone"
                                        dataKey="videos"
                                        stroke="#E11D48"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, fill: '#E11D48', strokeWidth: 2, stroke: '#fff' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar chart - Top users */}
                    <div className="card">
                        <h2 className="section-title mb-5">Principais Criadores</h2>
                        {topUsers.length > 0 ? (
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topUsers} layout="vertical" margin={{ left: 0, right: 16 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            type="category"
                                            dataKey="nome"
                                            stroke="#9CA3AF"
                                            tick={{ fill: '#374151', fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            width={90}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F9FAFB' }} />
                                        <Bar dataKey="total" fill="#E11D48" radius={[0, 6, 6, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3 py-16">
                                <Target className="w-8 h-8 opacity-20" />
                                <p className="text-sm">Sem dados ainda</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="card p-0 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                        <h2 className="section-title">Atividade Recente</h2>
                        <div className="flex items-center gap-1.5 text-text-muted">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Tempo real</span>
                        </div>
                    </div>

                    {recentVideos.length === 0 && !isLoading ? (
                        <div className="text-center py-16 flex flex-col items-center gap-3">
                            <Video className="w-8 h-8 text-text-tertiary" />
                            <p className="text-sm text-text-muted">Sem criações ainda.</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="bg-surface-50 border-b border-surface-100">
                                    <th className="table-header">Produto</th>
                                    <th className="table-header">Criador</th>
                                    <th className="table-header">Data/Hora</th>
                                    <th className="table-header text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentVideos.map((video) => (
                                    <tr key={video.id} className="table-row">
                                        <td className="table-cell font-medium text-text-primary">
                                            {video.nome_produto}
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-xs font-medium text-text-muted">
                                                    {video.user_nome ? video.user_nome.charAt(0) : '?'}
                                                </div>
                                                <span>{video.user_nome || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td className="table-cell text-text-muted">
                                            {formatDateTime(video.created_at)}
                                        </td>
                                        <td className="table-cell text-right">
                                            <span
                                                className={cn(
                                                    'badge',
                                                    video.status === 'concluido'
                                                        ? 'badge-green'
                                                        : video.status === 'processando'
                                                        ? 'badge-yellow'
                                                        : 'badge-red'
                                                )}
                                            >
                                                {getStatusLabel(video.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    )
}

function ShieldCheck({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

