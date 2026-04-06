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
    Search,
    Loader2,
    Link2,
    Zap,
    Share2,
    Target,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

type NotionConnectState = 'disconnected' | 'connecting' | 'connected'

const SAMPLE_IDEAS = [
    'Como o Home Equity pode impulsionar sua reforma residencial',
    'Diferenças financeiras: Imobiliário vs Consórcio',
    '5 motivos para usar crédito com garantia de ativos para crescer',
    'Planejamento Inteligente: Quando é a hora de refinanciar?',
    'Guia Completo: Florescimento do Crédito Imobiliário',
]

export default function AgendaPage() {
    const [notionToken, setNotionToken] = useState('')
    const [connectState, setConnectState] = useState<NotionConnectState>('disconnected')
    const [ideaInput, setIdeaInput] = useState('')
    const [ideas, setIdeas] = useState<string[]>([])
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false)
    const [concorrenteInput, setConcorrenteInput] = useState('')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysisResult, setAnalysisResult] = useState('')
    const [posts] = useState([
        { id: '1', titulo: 'Home Equity — Benefícios para Autônomos', status: 'rascunho', data: '2024-12-10' },
        { id: '2', titulo: 'Financiamento: Suas Dúvidas Respondidas', status: 'em revisão', data: '2024-12-12' },
        { id: '3', titulo: 'Crédito Imobiliário em 2025: O Florescer', status: 'aprovado', data: '2024-12-15' },
        { id: '4', titulo: 'Taxas de Mercado e Impactos no Crescimento', status: 'publicado', data: '2024-12-08' },
    ])

    useEffect(() => {
        async function loadIntegration() {
            try {
                const res = await fetch('/api/creator/integracoes')
                if (!res.ok) return
                const data: Array<{ tipo: string; ativo: boolean }> = await res.json()
                const notion = data.find((i) => i.tipo === 'notion')
                if (notion?.ativo) setConnectState('connected')
            } catch {
                // ignore
            }
        }
        loadIntegration()
    }, [])

    const handleConnectNotion = async () => {
        if (!notionToken.trim()) {
            toast.error('Insira sua chave secreta (bloom secret) do Notion')
            return
        }
        setConnectState('connecting')

        await new Promise((r) => setTimeout(r, 1500))

        const res = await fetch('/api/creator/integracoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: 'notion', token_acesso: notionToken, ativo: true, configuracoes: {} }),
        })

        if (!res.ok) {
            toast.error('Erro ao florescer integração com Notion')
            setConnectState('disconnected')
        } else {
            toast.success('Notion sincronizado com sucesso!')
            setConnectState('connected')
        }
    }

    const handleGenerateIdeas = async () => {
        if (!ideaInput.trim()) {
            toast.error('Descreva o produto para gerar ideias')
            return
        }
        setIsGeneratingIdeas(true)
        await new Promise((r) => setTimeout(r, 2000))
        const customIdeas = SAMPLE_IDEAS.map((idea) =>
            idea.replace('Home Equity', ideaInput.split(' ')[0] || 'Asset')
        )
        setIdeas(customIdeas)
        setIsGeneratingIdeas(false)
    }

    const handleAnalyzeCompetitor = async () => {
        if (!concorrenteInput.trim()) {
            toast.error('Insira o @usuario do perfil para análise')
            return
        }
        setIsAnalyzing(true)
        await new Promise((r) => setTimeout(r, 2500))
        setAnalysisResult(`
**Pulso do Perfil: ${concorrenteInput}**

📊 **Fluxo de Conteúdo**
Conteúdo altamente informativo com linguagem acessível. Foco forte em reels curtos e infográficos.

📅 **Frequência de Postagens**
Média de 5-7 postagens por semana. Pico de visibilidade às terças e quintas-feiras.

🎯 **Distribuição de Ativos**
- 40% Conteúdos Educativos (30-60s)
- 30% Carrosséis baseados em Dados
- 20% Posts Estáticos de Dicas
- 10% Enquetes Interativas

💡 **Oportunidades de Crescimento**
Falta no concorrente: Caminhos de planejamento a longo prazo, vídeos comparativos de recursos e histórias de sucesso de clientes.
    `.trim())
        setIsAnalyzing(false)
    }

    const statusConfig: Record<string, { label: string; icon: typeof Circle; color: string; bg: string }> = {
        'rascunho': { label: 'Semente', icon: Circle, color: 'text-text-muted', bg: 'bg-surface-100' },
        'em revisão': { label: 'Regando', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
        'aprovado': { label: 'Florescer', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        'publicado': { label: 'Colhido', icon: Zap, color: 'text-primary', bg: 'bg-primary/5' },
    }

    if (connectState !== 'connected') {
        return (
            <main className="flex-1 p-8 lg:p-12 bg-surface-50 min-h-screen">
                <div className="max-w-2xl mx-auto space-y-12">
                    <header>
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">Calendário de Conteúdo</h1>
                        <p className="text-text-muted mt-2 font-medium">Sincronize sua estratégia com o ecossistema Notion.</p>
                    </header>

                    <div className="bg-white border border-surface-200 rounded-[40px] p-12 shadow-premium text-center flex flex-col items-center gap-8">
                        <div className="w-24 h-24 rounded-[32px] bg-surface-50 border-2 border-surface-100 flex items-center justify-center">
                            <Calendar className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-text-primary">Conectar Workspace do Notion</h2>
                            <p className="text-text-muted mt-3 font-medium max-w-sm">
                                Integre com o Notion para gerenciar seu hub de conteúdo, aprovações e agendamentos diretamente do seu painel.
                            </p>
                        </div>

                        <div className="w-full max-w-sm space-y-6 text-left">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Notion Bloom Secret</label>
                                <input
                                    type="text"
                                    placeholder="secret_..."
                                    value={notionToken}
                                    onChange={(e) => setNotionToken(e.target.value)}
                                    className="w-full bg-surface-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none transition-all shadow-sm"
                                />
                                <p className="text-[10px] text-text-muted font-bold px-2">
                                    Obtenha a sua em notion.so → Configurações → Integrações
                                </p>
                            </div>
                            <button
                                onClick={handleConnectNotion}
                                disabled={connectState === 'connecting'}
                                className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {connectState === 'connecting' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SINCRONIZANDO O PAINEL...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-5 h-5" />
                                        CONECTAR WORKSPACE
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
        <main className="flex-1 p-8 lg:p-12 bg-surface-50 min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col gap-10">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-text-primary tracking-tight">Calendário Estratégico</h1>
                        <p className="text-text-muted mt-2 font-medium">Hub de conteúdo integrado sincronizado com o Notion.</p>
                    </div>
                    <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 shadow-sm animate-fade-in">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Workspace Sincronizado</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Content Hub */}
                    <div className="bg-white border border-surface-200 rounded-[40px] p-8 shadow-sm group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                <Share2 className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Fluxo do Hub de Conteúdo</h2>
                        </div>

                        <div className="space-y-3">
                            {posts.map((post) => {
                                const config = statusConfig[post.status]
                                const Icon = config.icon
                                return (
                                    <div key={post.id} className="flex items-center gap-4 p-4 rounded-[24px] bg-surface-50/50 hover:bg-white border-2 border-transparent hover:border-surface-100 transition-all cursor-pointer group/item">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white shadow-sm", config.bg, config.color)}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-text-primary font-black truncate">{post.titulo}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{post.data}</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em]",
                                            config.bg, config.color
                                        )}>
                                            {config.label}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Idea Generator */}
                    <div className="bg-white border border-surface-200 rounded-[40px] p-8 shadow-sm group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                <Brain className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Gerador de Ideias (Bloom)</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">Semente ou Tema do Produto</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="Ex: Investimento Imobiliário para Jovens"
                                        value={ideaInput}
                                        onChange={(e) => setIdeaInput(e.target.value)}
                                        className="flex-1 bg-surface-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none transition-all shadow-sm"
                                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                                    />
                                    <button
                                        onClick={handleGenerateIdeas}
                                        disabled={isGeneratingIdeas}
                                        className="bg-primary text-white px-8 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
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
                                <div className="grid grid-cols-1 gap-2 animate-fade-in">
                                    {ideas.map((idea, i) => (
                                        <div key={i} className="flex items-start gap-4 p-5 rounded-[24px] bg-surface-50 hover:bg-primary/5 group/idea transition-all cursor-pointer border-2 border-transparent hover:border-primary/10">
                                            <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center text-xs font-black shadow-sm group-hover/idea:bg-primary group-hover/idea:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-text-primary font-bold leading-relaxed">{idea}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Competitor Analysis */}
                    <div className="bg-white border border-surface-200 rounded-[40px] p-8 shadow-sm group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                <Target className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Análise de Pulso do Ecossistema</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] px-2 italic">@Usuario do Concorrente</label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        placeholder="@digital_bloom ou link..."
                                        value={concorrenteInput}
                                        onChange={(e) => setConcorrenteInput(e.target.value)}
                                        className="flex-1 bg-surface-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-text-primary outline-none transition-all shadow-sm"
                                    />
                                    <button
                                        onClick={handleAnalyzeCompetitor}
                                        disabled={isAnalyzing}
                                        className="bg-text-primary text-white px-8 rounded-2xl shadow-lg hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {analysisResult && (
                                <div className="p-8 rounded-[32px] bg-surface-50 border-2 border-surface-100 text-sm text-text-primary font-medium whitespace-pre-line leading-relaxed italic animate-fade-in">
                                    {analysisResult}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Scheduling */}
                    <div className="bg-white border border-surface-200 rounded-[40px] p-8 shadow-sm group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                <Clock className="w-7 h-7" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary">Agendamento Automático</h2>
                        </div>
                        <p className="text-sm font-medium text-text-muted leading-relaxed px-2">
                            Agende a publicação automática dos seus materiais em seus canais sociais sincronizados.
                        </p>
                        
                        <div className="mt-8 p-10 rounded-[32px] bg-surface-50 border-2 border-surface-100 text-center flex flex-col items-center gap-4 border-dashed">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-text-muted shadow-sm">
                                <Zap className="w-6 h-6 opacity-30" />
                            </div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] max-w-[200px]">
                                Configure seu Ecossistema Social em{' '}
                                <a href="/configuracoes" className="text-primary hover:underline italic">
                                    Identidade → Ecossistema
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
