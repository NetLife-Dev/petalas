'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Video, 
    FileText, 
    UserPlus, 
    DollarSign, 
    ArrowUpRight, 
    Plus, 
    ArrowRight, 
    CheckCircle2,
    Sparkles,
    Search,
    ChevronDown,
    MoreHorizontal,
    Zap
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
            } catch (error) {
                toast.error('Erro ao carregar dados do painel')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    const chartData = [
        { month: 'JAN', val: 30 },
        { month: 'FEV', val: 60 },
        { month: 'MAR', val: 85 },
        { month: 'ABR', val: 40 },
        { month: 'MAI', val: 75 },
        { month: 'JUN', val: 95 },
        { month: 'JUL', val: 55 },
        { month: 'AGO', val: 70 },
    ]

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin text-rose-500">
                    <Zap className="w-12 h-12" />
                </div>
            </div>
        )
    }

    const metrics = data?.metrics || [
        { label: 'Vídeos Gerados', value: '0', change: '0%', status: 'neutral' },
        { label: 'Leads Ativos', value: '0', change: '0%', status: 'neutral' },
        { label: 'Valor do Funil', value: 'R$ 0,00', change: '0%', status: 'neutral' },
        { label: 'Integrações', value: '0', change: 'Ativas', status: 'neutral' }
    ]

    const icons = [Video, UserPlus, DollarSign, Zap]

    return (
        <div className="p-8 space-y-10 max-w-[1400px] mx-auto animate-fade-in">
            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-extrabold text-text-primary tracking-tight">
                        Olá, Criador
                    </h1>
                    <p className="text-text-muted mt-2 text-lg">
                        Bem-vindo ao seu painel <span className="text-primary font-bold">Pétalas</span>. Seu conteúdo está em plena floração.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded-full flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-primary text-[10px] font-black uppercase tracking-widest">Status da IA: Perfeito</span>
                    </div>
                </div>
            </div>

            {/* Linha de Métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric: any, i: number) => {
                    const Icon = icons[i] || Video
                    return (
                        <div key={metric.label} className="bg-white p-6 rounded-3xl border border-surface-200 shadow-sm hover:shadow-md transition-all duration-300 group">
                            <div className="flex items-center justify-between mb-8">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                                    i % 2 === 0 ? "bg-primary/10 text-primary" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-2">{metric.label}</p>
                            <h3 className="text-4xl font-extrabold text-text-primary tracking-tighter mb-2">{metric.value}</h3>
                            <div className="flex items-center gap-1.5">
                                {metric.status === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                                <span className={cn(
                                    "text-sm font-bold",
                                    metric.status === 'up' ? "text-emerald-500" : "text-text-muted"
                                )}>
                                    {metric.change}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Seção Central */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna Esquerda: Gráfico */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-sm relative overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-2xl font-extrabold text-text-primary tracking-tight">Geração de Conteúdo</h2>
                                <p className="text-text-muted text-sm mt-1 font-medium">Distribuição de vídeos gerados por mês</p>
                            </div>
                            <div className="flex bg-surface-100 p-1 rounded-xl gap-1">
                                <button className="px-5 py-1.5 rounded-lg text-xs font-bold bg-primary text-white shadow-md">Total</button>
                            </div>
                        </div>

                        {/* Área do Gráfico */}
                        <div className="flex-1 flex items-end justify-between gap-2 px-2 pb-6 min-h-[300px]">
                            {chartData.map((d) => (
                                <div key={d.month} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="w-full relative h-64 bg-surface-50 rounded-2xl overflow-hidden cursor-pointer hover:bg-surface-100/80 transition-colors">
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-primary/70 rounded-t-xl group-hover:bg-primary transition-all duration-700 ease-out"
                                            style={{ height: `${d.val}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-text-muted tracking-widest">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link href="/criar" className="block p-4 bg-primary/10 border border-primary/20 rounded-2xl group hover:bg-primary/15 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-primary">Criar Novo Vídeo</span>
                        </div>
                    </Link>
                </div>

                {/* Coluna Direita: IA & Atividade */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Painel da IA */}
                    <div className="bg-primary p-8 rounded-3xl text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8 opacity-80">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Sugestão da IA</span>
                            </div>
                            <h3 className="text-3xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                                {data?.metrics[1].value === '0' 
                                    ? "Adicione seus primeiros contatos no CRM para que eu possa analisá-los." 
                                    : `Você possui ${data?.metrics[1].value} leads com alta probabilidade de conversão hoje.`}
                            </h3>
                            <Link href="/crm" className="block w-full bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-2xl py-3 text-sm font-bold text-center hover:bg-white hover:text-primary transition-all active:scale-95">
                                Ver CRM
                            </Link>
                        </div>
                    </div>

                    {/* Atividade Recente */}
                    <div className="bg-white p-8 rounded-3xl border border-surface-200 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-extrabold text-text-primary tracking-tight">Atividade Recente</h2>
                            <MoreHorizontal className="w-5 h-5 text-text-muted cursor-pointer" />
                        </div>
                        <div className="space-y-6">
                            {(data?.recentActivity || []).length === 0 ? (
                                <p className="text-xs text-text-muted font-bold uppercase tracking-widest text-center py-10 opacity-50">Nenhuma atividade recente</p>
                            ) : (
                                data?.recentActivity.map((act: any) => (
                                    <div key={act.id} className="flex gap-4 group">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">{act.avatar}</div>
                                            <div className="w-[1px] flex-1 bg-surface-200 my-1 group-last:hidden" />
                                        </div>
                                        <div className="flex-1 pb-4 border-b border-surface-50 group-last:border-0">
                                            <p className="text-sm font-bold text-text-primary">
                                                <span className="text-primary">{act.user}</span> {act.action}
                                            </p>
                                            <p className="text-xs text-text-muted mt-0.5">{act.target}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 border-2 border-surface-100 rounded-2xl text-xs font-bold text-text-muted hover:bg-surface-50 hover:text-text-primary transition-all">
                            VER TODA ATIVIDADE
                        </button>
                    </div>

                    {/* Card de Destaque */}
                    <div className="relative rounded-3xl overflow-hidden h-64 group cursor-pointer">
                        <img 
                            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop" 
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                            alt="Featured" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Tutorial Pétalas</p>
                            <h4 className="text-xl font-extrabold tracking-tight leading-tight">Como aumentar o LTV do seu negócio usando vídeos</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
