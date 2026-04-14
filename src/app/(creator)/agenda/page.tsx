'use client'

import { useState, useEffect } from 'react'
import {
    Calendar,
    Brain,
    BarChart2,
    Clock,
    CheckCircle,
    Circle,
    AlertCircle,
    Send,
    Loader2,
    Link2,
    Zap,
    Share2,
    Target,
    Video,
    Plus,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

const IDEAS_TEMPLATES = [
    'Como {produto} pode transformar sua estratégia de vendas',
    '5 razões para investir em {produto} agora',
    'O guia definitivo sobre {produto}: tudo que você precisa saber',
    '{produto}: mitos e verdades que ninguém te conta',
    'Como seus concorrentes usam {produto} para crescer',
]

type Post = {
    id: string
    titulo: string
    status: string
    data: string
}

const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
    processando: { label: 'Processando', icon: Loader2, color: 'text-amber-600', bg: 'bg-amber-50' },
    concluido: { label: 'Concluído', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    erro: { label: 'Erro', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    rascunho: { label: 'Rascunho', icon: Circle, color: 'text-text-muted', bg: 'bg-surface-100' },
    'em revisão': { label: 'Em revisão', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    aprovado: { label: 'Aprovado', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    publicado: { label: 'Publicado', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch {
        return dateStr
    }
}

export default function AgendaPage() {
    const [notionToken, setNotionToken] = useState('')
    const [connectState, setConnectState] = useState<NotionConnectState>('disconnected')
    const [ideaInput, setIdeaInput] = useState('')
    const [ideas, setIdeas] = useState<string[]>([])
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
    const [concorrenteInput, setConcorrenteInput] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState('')
    const [posts, setPosts] = useState<Post[]>([])
    const [isLoadingPosts, setIsLoadingPosts] = useState(true)

    useEffect(() => {
        async function init() {
            // Check Notion integration
            try {
                const res = await fetch('/api/creator/integracoes')
                if (res.ok) {
                    const data: Array<{ tipo: string; ativo: boolean }> = await res.json()
                    const notion = data.find((i) => i.tipo === 'notion')
                    if (notion?.ativo) setConnectState('connected')
                }
            } catch {
                // ignore
            }

            // Load real videos as content posts
            try {
                const res = await fetch('/api/creator/videos')
                if (res.ok) {
                    const data = await res.json()
                    const videos = (data.videos || data || []).slice(0, 10).map((v: any) => ({
                        id: v.id,
                        titulo: v.nome_produto || 'Vídeo sem título',
                        status: v.status || 'rascunho',
                        data: v.created_at || v.data || new Date().toISOString(),
                    }))
                    setPosts(videos)
                }
            } catch {
                // ignore
            } finally {
                setIsLoadingPosts(false)
            }
        }
        init()
    }, [])

    const handleConnectNotion = async () => {
        if (!notionToken.trim()) {
            toast.error('Insira sua chave secreta do Notion')
            return
        }
        setConnectState('connecting')

        const res = await fetch('/api/creator/integracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'notion', token_acesso: notionToken, ativo: true, configuracoes: {} }),
        })

        if (!res.ok) {
            toast.error('Erro ao conectar com Notion')
            setConnectState('disconnected')
        } else {
            toast.success('Notion conectado com sucesso!')
            setConnectState('connected')
        }
    }

    const handleGenerateIdeas = async () => {
        if (!ideaInput.trim()) {
            toast.error('Descreva o produto para gerar ideias')
            return
        }
        setIsGeneratingIdeas(true)
        await new Promise((r) => setTimeout(r, 1200))
        const term = ideaInput.trim()
        const generated = IDEAS_TEMPLATES.map((t) => t.replace('{produto}', term))
        setIdeas(generated)
        setIsGeneratingIdeas(false)
    }

    const handleAnalyzeCompetitor = async () => {
        if (!concorrenteInput.trim()) {
            toast.error('Insira o @usuario do perfil para análise')
            return
        }
        setIsAnalyzing(true)
        await new Promise((r) => setTimeout(r, 2000))
        setAnalysisResult(
            `Análise de ${concorrenteInput}\n\nDistribuição de conteúdo estimada:\n• 40% Conteúdo Educativo (30–60s)\n• 30% Carrosséis baseados em dados\n• 20% Posts estáticos\n• 10% Interativos\n\nOportunidades identificadas: vídeos comparativos, histórias de sucesso e planejamentos de longo prazo estão ausentes no perfil analisado.`
        )
        setIsAnalyzing(false)
    }

    if (connectState !== 'connected') {
        return (
            <main className="p-8 lg:p-12 max-w-4xl mx-auto space-y-12 animate-fade-in">
                <div className="text-center">
                    <h1 className="text-4xl font-semibold text-text-primary italic font-display">Calendário de Conteúdo</h1>
                    <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-4">
                        Studio Pétalas · Sincronização Estratégica
                    </p>
                </div>

                <div className="bg-white rounded-[48px] p-12 lg:p-16 shadow-soft border border-primary/5 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-bg-subtle flex items-center justify-center mb-8 shadow-inner border border-primary/5">
                        <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold text-text-primary font-display italic">Conectar Workspace</h2>
                        <p className="text-text-muted text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                            Integre com o Notion para gerenciar conteúdo, aprovações e agendamentos diretamente do seu estúdio.
                        </p>
                    </div>

                    <div className="w-full max-w-md space-y-6 text-left">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-4">Notion Secret Key</label>
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="secret_..."
                                    value={notionToken}
                                    onChange={(e) => setNotionToken(e.target.value)}
                                    className="input-field rounded-full px-8 py-5 bg-bg-subtle/30 group-focus-within:bg-white transition-all border-transparent focus:border-primary/20"
                                    onKeyDown={(e) => e.key === 'Enter' && handleConnectNotion()}
                                />
                                <div className="absolute inset-0 rounded-full border border-primary/5 pointer-events-none group-focus-within:border-primary/20" />
                            </div>
                            <p className="text-[9px] uppercase tracking-widest text-text-muted mt-3 text-center">
                                Obtenha em notion.so → Configurações → Integrações
                            </p>
                        </div>
                        <button
                            onClick={handleConnectNotion}
                            disabled={connectState === 'connecting'}
                            className="btn-primary w-full py-5 rounded-full shadow-glow disabled:opacity-50"
                        >
                            {connectState === 'connecting' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    SINCRONIZANDO...
                                </>
                            ) : (
                                <>
                                    <Link2 className="w-5 h-5 mr-2" />
                                    CONECTAR WORKSPACE
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in">
            <div className="space-y-12">
                <div className="flex flex-col sm:flex-row items-baseline justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-text-primary italic font-display">Calendário Estratégico</h1>
                        <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                            Studio Pétalas · Hub Integrado
                        </p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50/50 border border-emerald-100/50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow" />
                        Workspace Ativo
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                    {/* Content Flow */}
                    <div className="bg-white rounded-[40px] p-10 shadow-soft border border-primary/5 flex flex-col">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center border border-primary/5">
                                <Share2 className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold font-display italic text-text-primary">Fluxo de Conteúdo</h2>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Cronograma Studio</p>
                            </div>
                        </div>

                        {isLoadingPosts ? (
                            <div className="space-y-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-3xl border border-primary/5">
                                        <div className="shimmer w-12 h-12 rounded-2xl flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="shimmer h-4 w-full rounded-full" />
                                            <div className="shimmer h-3 w-1/3 rounded-full" />
                                        </div>
                                        <div className="shimmer h-6 w-20 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-6 opacity-40">
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
                                    <Video className="w-10 h-10 text-primary" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-text-primary italic font-display">Vazio Artístico</p>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mt-1">Crie sua primeira peça</p>
                                </div>
                                <Link href="/criar" className="btn-primary text-[10px] px-8 py-3 rounded-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    CRIAR VÍDEO
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map((post) => {
                                    const cfg = statusConfig[post.status] || statusConfig['rascunho']
                                    const Icon = cfg.icon
                                    return (
                                        <div key={post.id} className="group flex items-center gap-4 p-4 rounded-3xl border border-transparent hover:border-primary/10 hover:bg-bg-subtle/20 transition-all duration-300 cursor-pointer">
                                            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-soft', cfg.bg)}>
                                                <Icon className={cn('w-5 h-5', cfg.color, post.status === 'processando' && 'animate-spin')} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">{post.titulo}</p>
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mt-1">{formatDate(post.data)}</p>
                                            </div>
                                            <span className={cn('px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-primary/5', cfg.bg, cfg.color)}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Idea Generator */}
                    <div className="bg-white rounded-[40px] p-10 shadow-soft border border-primary/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center border border-primary/5">
                                <Brain className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold font-display italic text-text-primary">Gerador de Ideias</h2>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Brainstorm IA</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-4">Produto ou Coleção</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="Ex: Peças em seda para o verão"
                                        value={ideaInput}
                                        onChange={(e) => setIdeaInput(e.target.value)}
                                        className="input-field rounded-full px-8 py-5 bg-bg-subtle/30 group-focus-within:bg-white transition-all pr-20"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                                    />
                                    <button
                                        onClick={handleGenerateIdeas}
                                        disabled={isGeneratingIdeas}
                                        className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50"
                                    >
                                        {isGeneratingIdeas ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Send className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {ideas.length > 0 && (
                                <div className="space-y-4 animate-fade-in">
                                    {ideas.map((idea, i) => (
                                        <div key={i} className="flex items-start gap-5 p-5 rounded-3xl bg-bg-subtle/30 hover:bg-white hover:shadow-soft border border-transparent hover:border-primary/10 transition-all duration-300 cursor-pointer group">
                                            <span className="w-6 h-6 rounded-full bg-white border border-primary/10 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5 shadow-soft group-hover:bg-primary group-hover:text-white transition-colors">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm font-medium text-text-primary leading-relaxed">{idea}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Competitor Analysis */}
                    <div className="bg-white rounded-[40px] p-10 shadow-soft border border-primary/5">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center border border-primary/5">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold font-display italic text-text-primary">Análise Curatorial</h2>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Benchmark Studio</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-4">@Perfil do Referência</label>
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="@perfil ou link"
                                        value={concorrenteInput}
                                        onChange={(e) => setConcorrenteInput(e.target.value)}
                                        className="input-field rounded-full px-8 py-5 bg-bg-subtle/30 group-focus-within:bg-white transition-all pr-20"
                                    />
                                    <button
                                        onClick={handleAnalyzeCompetitor}
                                        disabled={isAnalyzing}
                                        className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {analysisResult && (
                                <div className="p-8 rounded-[32px] bg-bg-subtle/30 border border-primary/5 text-sm font-medium text-text-primary leading-relaxed whitespace-pre-line animate-fade-in relative overflow-hidden">
                                     <div className="absolute top-0 right-0 p-4 opacity-10">
                                         <Zap className="w-12 h-12 text-primary" />
                                     </div>
                                    {analysisResult}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="bg-white rounded-[40px] p-10 shadow-soft border border-primary/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center border border-primary/5">
                                <Clock className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold font-display italic text-text-primary">Maestro de Agenda</h2>
                                <p className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Automação v1.0</p>
                            </div>
                        </div>
                        <p className="text-sm font-medium text-text-muted leading-relaxed mb-10 ml-1">
                            Agende a publicação automática dos seus materiais nos canais sociais sincronizados.
                        </p>

                        <div className="flex flex-col items-center gap-6 py-12 border-2 border-dashed border-primary/10 rounded-[40px] bg-bg-subtle/10">
                            <div className="w-16 h-16 rounded-full bg-white border border-primary/5 flex items-center justify-center shadow-soft">
                                <Zap className="w-8 h-8 text-primary shadow-glow" />
                            </div>
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-text-muted text-center max-w-[240px]">
                                Configure seus canais maestros em{' '}
                                <Link href="/configuracoes" className="text-primary hover:underline italic font-display lowercase tracking-normal text-sm ml-1">
                                    Studio → Integrações
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
    )
}
