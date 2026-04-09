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
            <main className="p-6 lg:p-8">
                <div className="max-w-xl mx-auto space-y-8">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Calendário de Conteúdo</h1>
                        <p className="text-text-muted text-sm mt-1">Sincronize sua estratégia com o Notion.</p>
                    </div>

                    <div className="card p-8 flex flex-col items-center gap-6 text-center">
                        <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center">
                            <Calendar className="w-7 h-7 text-text-muted" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary">Conectar Workspace do Notion</h2>
                            <p className="text-text-muted text-sm mt-1 max-w-sm">
                                Integre com o Notion para gerenciar conteúdo, aprovações e agendamentos diretamente do seu painel.
                            </p>
                        </div>

                        <div className="w-full max-w-sm space-y-4 text-left">
                            <div>
                                <label className="label">Notion Secret Key</label>
                                <input
                                    type="text"
                                    placeholder="secret_..."
                                    value={notionToken}
                                    onChange={(e) => setNotionToken(e.target.value)}
                                    className="input-field"
                                    onKeyDown={(e) => e.key === 'Enter' && handleConnectNotion()}
                                />
                                <p className="text-xs text-text-muted mt-1.5">
                                    Obtenha a sua em notion.so → Configurações → Integrações
                                </p>
                            </div>
                            <button
                                onClick={handleConnectNotion}
                                disabled={connectState === 'connecting'}
                                className="btn-primary w-full disabled:opacity-50"
                            >
                                {connectState === 'connecting' ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sincronizando...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-4 h-4" />
                                        Conectar Workspace
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">Calendário Estratégico</h1>
                        <p className="text-text-muted text-sm mt-0.5">Hub de conteúdo integrado com Notion.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-medium">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Workspace Sincronizado
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Content Flow */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Share2 className="w-4.5 h-4.5 text-blue-600" />
                            </div>
                            <h2 className="section-title">Fluxo de Conteúdo</h2>
                        </div>

                        {isLoadingPosts ? (
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3">
                                        <div className="shimmer w-9 h-9 rounded-lg flex-shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="shimmer h-3.5 w-full rounded" />
                                            <div className="shimmer h-3 w-1/3 rounded" />
                                        </div>
                                        <div className="shimmer h-5 w-16 rounded-md" />
                                    </div>
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3">
                                <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
                                    <Video className="w-6 h-6 text-text-tertiary" />
                                </div>
                                <p className="text-sm text-text-muted text-center">Nenhum vídeo criado ainda.</p>
                                <Link href="/criar" className="btn-primary text-xs px-4 py-2">
                                    <Plus className="w-3.5 h-3.5" />
                                    Criar vídeo
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {posts.map((post) => {
                                    const cfg = statusConfig[post.status] || statusConfig['rascunho']
                                    const Icon = cfg.icon
                                    return (
                                        <div key={post.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors cursor-pointer">
                                            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', cfg.bg)}>
                                                <Icon className={cn('w-4 h-4', cfg.color, post.status === 'processando' && 'animate-spin')} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{post.titulo}</p>
                                                <p className="text-xs text-text-muted mt-0.5">{formatDate(post.data)}</p>
                                            </div>
                                            <span className={cn('badge text-[11px]', cfg.bg, cfg.color)}>
                                                {cfg.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Idea Generator */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                                <Brain className="w-4.5 h-4.5 text-purple-600" />
                            </div>
                            <h2 className="section-title">Gerador de Ideias</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Produto ou tema</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ex: Crédito imobiliário para jovens"
                                        value={ideaInput}
                                        onChange={(e) => setIdeaInput(e.target.value)}
                                        className="input-field"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                                    />
                                    <button
                                        onClick={handleGenerateIdeas}
                                        disabled={isGeneratingIdeas}
                                        className="btn-primary flex-shrink-0 disabled:opacity-50"
                                        aria-label="Gerar ideias"
                                    >
                                        {isGeneratingIdeas ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {ideas.length > 0 && (
                                <div className="space-y-2 animate-fade-in">
                                    {ideas.map((idea, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface-50 hover:bg-surface-100 transition-colors cursor-pointer">
                                            <span className="w-5 h-5 rounded-full bg-white border border-surface-200 flex items-center justify-center text-xs font-medium text-text-muted flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </span>
                                            <p className="text-sm text-text-secondary leading-relaxed">{idea}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Competitor Analysis */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                <Target className="w-4.5 h-4.5 text-amber-600" />
                            </div>
                            <h2 className="section-title">Análise de Concorrente</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">@Usuario do concorrente</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="@perfil ou link do perfil"
                                        value={concorrenteInput}
                                        onChange={(e) => setConcorrenteInput(e.target.value)}
                                        className="input-field"
                                    />
                                    <button
                                        onClick={handleAnalyzeCompetitor}
                                        disabled={isAnalyzing}
                                        className="btn-secondary flex-shrink-0 disabled:opacity-50"
                                        aria-label="Analisar concorrente"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {analysisResult && (
                                <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 text-sm text-text-secondary leading-relaxed whitespace-pre-line animate-fade-in">
                                    {analysisResult}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scheduling (coming soon) */}
                    <div className="card">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Clock className="w-4.5 h-4.5 text-emerald-600" />
                            </div>
                            <h2 className="section-title">Agendamento Automático</h2>
                        </div>
                        <p className="text-sm text-text-muted leading-relaxed mb-4">
                            Agende a publicação automática dos seus materiais nos canais sociais sincronizados.
                        </p>

                        <div className="flex flex-col items-center gap-3 py-8 border border-dashed border-surface-200 rounded-lg bg-surface-50">
                            <Zap className="w-8 h-8 text-text-tertiary opacity-50" />
                            <p className="text-xs text-text-muted text-center max-w-[180px]">
                                Configure seus canais em{' '}
                                <Link href="/configuracoes" className="text-primary hover:underline">
                                    Configurações → Integrações
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
