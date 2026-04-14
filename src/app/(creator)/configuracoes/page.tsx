'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Lock,
    Puzzle,
    Save,
    Loader2,
    ShieldCheck,
    Kanban,
    Plus,
    Trash2,
    Settings2,
    Camera,
    Link2,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    AlertCircle,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    getPipelineStages,
    upsertPipelineStage,
    deletePipelineStage,
    getIntegrations,
    saveIntegration,
    deleteIntegration,
} from './actions'

const TABS = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'pipelines', label: 'Pipelines', icon: Kanban },
    { id: 'integracoes', label: 'Integrações', icon: Puzzle },
]

// Webhooks predefinidos do sistema
const WEBHOOK_PRESETS = [
    {
        tipo: 'n8n_video',
        label: 'N8N — Gerador de Vídeo',
        description: 'Webhook chamado ao gerar um novo vídeo. Recebe video_id, nome, descrição e imagem do produto.',
        placeholder: 'https://seu-n8n.com/webhook/gerar-video',
        required: true,
    },
    {
        tipo: 'n8n_cnpj',
        label: 'N8N — Consulta CNPJ',
        description: 'Webhook para enriquecer contatos do CRM com dados de CNPJ automaticamente.',
        placeholder: 'https://seu-n8n.com/webhook/consulta-cnpj',
        required: false,
    },
]

const passwordSchema = z
    .object({
        senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
        novaSenha: z.string().min(8, 'Mínimo 8 caracteres'),
        confirmarSenha: z.string(),
    })
    .refine((d) => d.novaSenha === d.confirmarSenha, {
        message: 'As senhas não coincidem',
        path: ['confirmarSenha'],
    })

type PasswordForm = z.infer<typeof passwordSchema>

// Estado local de uma webhook
interface WebhookState {
    url: string
    ativo: boolean
    saving: boolean
    testing: boolean
    testResult: 'idle' | 'ok' | 'error'
    showUrl: boolean
}

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState('perfil')
    const [profile, setProfile] = useState({
        nome: '',
        email: '',
        avatar_url: null as string | null,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [stages, setStages] = useState<any[]>([])

    // Estado dos webhooks — keyed pelo tipo
    const [webhooks, setWebhooks] = useState<Record<string, WebhookState>>(() =>
        Object.fromEntries(
            WEBHOOK_PRESETS.map((p) => [
                p.tipo,
                { url: '', ativo: false, saving: false, testing: false, testResult: 'idle', showUrl: false },
            ])
        )
    )

    const { register, formState: { errors: passwordErrors } } = useForm<PasswordForm>({
        resolver: zodResolver(passwordSchema),
    })

    useEffect(() => {
        loadAllData()
    }, [])

    async function loadAllData() {
        setIsLoading(true)
        try {
            const [profileRes, stagesData, intData] = await Promise.all([
                fetch('/api/creator/profile'),
                getPipelineStages(),
                getIntegrations(),
            ])

            if (profileRes.ok) {
                const data = await profileRes.json()
                setProfile({
                    nome: data.nome || '',
                    email: data.email || '',
                    avatar_url: data.avatar_url || null,
                })
            }
            setStages(stagesData)

            // Mapear integrações salvas para o estado local
            setWebhooks((prev) => {
                const next = { ...prev }
                for (const int of intData) {
                    if (next[int.tipo]) {
                        next[int.tipo] = {
                            ...next[int.tipo],
                            url: int.token_acesso || '',
                            ativo: int.ativo,
                        }
                    }
                }
                return next
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveProfile = async () => {
        setIsSaving(true)
        const res = await fetch('/api/creator/profile', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: profile.nome, email: profile.email }),
        })
        if (res.ok) toast.success('Perfil atualizado!')
        else toast.error('Erro ao salvar perfil')
        setIsSaving(false)
    }

    const handleAddStage = async () => {
        try {
            await upsertPipelineStage(null, 'Novo Estágio', stages.length)
            const updated = await getPipelineStages()
            setStages(updated)
            toast.success('Estágio adicionado')
        } catch {
            toast.error('Erro ao adicionar estágio')
        }
    }

    const handleUpdateStage = async (id: string, title: string) => {
        try {
            await upsertPipelineStage(id, title, stages.find((s) => s.id === id)?.order || 0)
            toast.success('Estágio salvo')
        } catch {
            toast.error('Erro ao salvar')
        }
    }

    const handleDeleteStage = async (id: string) => {
        try {
            await deletePipelineStage(id)
            setStages(stages.filter((s) => s.id !== id))
            toast.success('Estágio removido')
        } catch {
            toast.error('Erro ao remover')
        }
    }

    // ── Webhook handlers ──────────────────────────────────────────────────────

    const setWebhookField = (tipo: string, patch: Partial<WebhookState>) =>
        setWebhooks((prev) => ({ ...prev, [tipo]: { ...prev[tipo], ...patch } }))

    const handleSaveWebhook = async (tipo: string) => {
        const wh = webhooks[tipo]
        if (!wh.url) return toast.error('Informe a URL do webhook')

        setWebhookField(tipo, { saving: true })
        try {
            await saveIntegration(tipo, wh.url.trim(), wh.ativo)
            toast.success('Webhook salvo!')
            setWebhookField(tipo, { testResult: 'idle' })
        } catch {
            toast.error('Erro ao salvar webhook')
        } finally {
            setWebhookField(tipo, { saving: false })
        }
    }

    const handleTestWebhook = async (tipo: string) => {
        const wh = webhooks[tipo]
        if (!wh.url) return toast.error('Informe a URL antes de testar')

        setWebhookField(tipo, { testing: true, testResult: 'idle' })
        try {
            const res = await fetch(wh.url.trim(), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ test: true, source: 'petalas' }),
                signal: AbortSignal.timeout(8000),
            })
            if (res.ok) {
                setWebhookField(tipo, { testResult: 'ok' })
                toast.success('Webhook respondeu com sucesso!')
            } else {
                setWebhookField(tipo, { testResult: 'error' })
                toast.error(`Webhook retornou ${res.status}`)
            }
        } catch {
            setWebhookField(tipo, { testResult: 'error' })
            toast.error('Webhook não respondeu ou está inacessível')
        } finally {
            setWebhookField(tipo, { testing: false })
        }
    }

    const handleDeleteWebhook = async (tipo: string) => {
        try {
            await deleteIntegration(tipo)
            setWebhookField(tipo, { url: '', ativo: false, testResult: 'idle' })
            toast.success('Webhook removido')
        } catch {
            toast.error('Erro ao remover webhook')
        }
    }

    if (isLoading) {
        return (
            <div className="p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-text-tertiary" />
            </div>
        )
    }

    return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-semibold text-text-primary italic font-display">Configurações</h1>
                    <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                        Ajustes e Automações
                    </p>
                </div>

                {/* Tabs */}
                <nav className="flex items-center border-b border-primary/5 gap-8 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-3 px-2 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap outline-none',
                                    isActive ? 'text-primary' : 'text-text-muted hover:text-primary opacity-60 hover:opacity-100'
                                )}
                            >
                                <Icon className={cn("w-4 h-4 transition-transform", isActive && "scale-110")} />
                                {tab.label}
                                {isActive && (
                                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary rounded-full shadow-glow" />
                                )}
                            </button>
                        )
                    })}
                </nav>

                <div className="animate-fade-in pb-20">
                    {/* ── PERFIL ─────────────────────────────────────────────── */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-8">
                            <div className="surface-card">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-semibold font-display italic text-text-secondary leading-none">Dados Maestro</h3>
                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-muted mt-2">Identidade e Acesso</p>
                                </div>

                                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-10 border-b border-primary/5">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-[32px] bg-bg-subtle flex items-center justify-center text-primary text-2xl font-bold overflow-hidden border-2 border-primary/10 shadow-soft group-hover:border-primary/30 transition-all duration-500 transform group-hover:rotate-3">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                            ) : (
                                                getInitials(profile.nome)
                                            )}
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-2xl border-4 border-white shadow-xl hover:scale-110 transition-transform">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-1">
                                        <p className="text-sm font-bold text-text-primary uppercase tracking-widest">Retrato</p>
                                        <p className="text-xs text-text-muted font-medium italic">Sua imagem será exibida em todas as criações do acervo.</p>
                                        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-widest mt-2">PNG ou JPG · Máximo 2MB</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Nome de Exibição</label>
                                        <input
                                            value={profile.nome}
                                            onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Email Maestro</label>
                                        <input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-10">
                                    <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary px-10 py-4 shadow-glow">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        SALVAR ALTERAÇÕES
                                    </button>
                                </div>
                            </div>

                            <div className="surface-card">
                                <div className="mb-10">
                                    <h3 className="text-2xl font-semibold font-display italic text-text-secondary leading-none">Criptografia</h3>
                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-muted mt-2">Segurança da Conta</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Senha Atual</label>
                                        <input type="password" placeholder="••••••••" className="input-field rounded-full px-6 py-4 bg-bg-subtle/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Nova Senha</label>
                                        <input type="password" placeholder="••••••••" className="input-field rounded-full px-6 py-4 bg-bg-subtle/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Confirmar</label>
                                        <input type="password" placeholder="••••••••" className="input-field rounded-full px-6 py-4 bg-bg-subtle/30" />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button className="btn-secondary px-8">
                                        <Lock className="w-4 h-4 mr-2" />
                                        RENOVAR ACESSO
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PIPELINES ──────────────────────────────────────────── */}
                    {activeTab === 'pipelines' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-4">
                                <div>
                                    <h3 className="text-3xl font-semibold font-display italic text-text-secondary leading-none">Fluxos de Venda</h3>
                                    <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-muted mt-2">Curadoria de Estágios do Pipeline</p>
                                </div>
                                <button onClick={handleAddStage} className="btn-primary px-8">
                                    <Plus className="w-4 h-4 mr-2" />
                                    NOVO ESTÁGIO
                                </button>
                            </div>

                            <div className="surface-card p-0 overflow-hidden">
                                {stages.length === 0 ? (
                                    <div className="py-24 text-center">
                                        <Kanban className="w-12 h-12 text-primary/10 mx-auto mb-4" />
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Nenhum pipeline desenhado</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-primary/5">
                                        {stages.map((stage, index) => (
                                            <div
                                                key={stage.id}
                                                className="flex items-center gap-6 px-8 py-5 group hover:bg-bg-subtle/30 transition-colors"
                                            >
                                                <span className="text-[10px] font-bold text-primary/40 w-6">
                                                    {String(index + 1).padStart(2, '0')}
                                                </span>
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                <input
                                                    defaultValue={stage.title}
                                                    onBlur={(e) => handleUpdateStage(stage.id, e.target.value)}
                                                    className="flex-1 bg-transparent text-sm font-bold uppercase tracking-wider text-text-primary outline-none placeholder:text-text-muted focus:text-primary transition-colors"
                                                    placeholder="Nome do estágio..."
                                                />
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleDeleteStage(stage.id)}
                                                        className="p-2.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2.5 text-text-muted hover:text-primary hover:bg-primary/5 rounded-full transition-colors cursor-grab">
                                                        <Settings2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── INTEGRAÇÕES ────────────────────────────────────────── */}
                    {activeTab === 'integracoes' && (
                        <div className="space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-3xl font-semibold font-display italic text-text-secondary leading-none">APIs</h3>
                                <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-muted mt-2">Conexões de Automação Maestro</p>
                            </div>

                            {/* Info banner */}
                            <div className="flex items-center gap-4 p-5 bg-primary/5 border border-primary/10 rounded-3xl animate-pulse-subtle">
                                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-primary/80 leading-relaxed">
                                    O sistema se integra perfeitamente com fluxos N8N para automação de vídeos e inteligência de dados.
                                </p>
                            </div>

                            {/* Webhook cards */}
                            <div className="grid grid-cols-1 gap-6">
                                {WEBHOOK_PRESETS.map((preset) => {
                                    const wh = webhooks[preset.tipo]
                                    return (
                                        <div key={preset.tipo} className="surface-card relative group">
                                            {/* Header */}
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                                                <div className="flex items-start gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-bg-subtle flex items-center justify-center flex-shrink-0 shadow-soft group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                        <Puzzle className="w-6 h-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-lg font-bold text-text-primary">
                                                                {preset.label}
                                                            </p>
                                                            {preset.required && (
                                                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-widest border border-primary/20">Core</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-muted font-medium italic max-w-lg">
                                                            {preset.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Toggle ativo */}
                                                <button
                                                    onClick={() => setWebhookField(preset.tipo, { ativo: !wh.ativo })}
                                                    className={cn(
                                                        'w-12 h-6 rounded-full relative flex-shrink-0 transition-all duration-300 border-[1.5px]',
                                                        wh.ativo ? 'bg-primary border-primary shadow-glow' : 'bg-white border-primary/20'
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transition-all duration-300',
                                                            wh.ativo ? 'right-1 bg-white scale-110' : 'left-1 bg-primary/20'
                                                        )}
                                                    />
                                                </button>
                                            </div>

                                            {/* URL input */}
                                            <div className="space-y-2 mb-8">
                                                <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Endpoint do Maestro</label>
                                                <div className="relative group/input">
                                                    <Link2 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within/input:text-primary" />
                                                    <input
                                                        type={wh.showUrl ? 'text' : 'password'}
                                                        value={wh.url}
                                                        onChange={(e) =>
                                                            setWebhookField(preset.tipo, {
                                                                url: e.target.value,
                                                                testResult: 'idle',
                                                            })
                                                        }
                                                        placeholder={preset.placeholder}
                                                        className="input-field pl-14 pr-14 py-4 rounded-2xl bg-bg-subtle/30 font-mono text-xs border-primary/5 focus:border-primary/30"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setWebhookField(preset.tipo, { showUrl: !wh.showUrl })
                                                        }
                                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary transition-colors"
                                                    >
                                                        {wh.showUrl ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Test result feedback */}
                                            {wh.testResult !== 'idle' && (
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-widest font-bold mb-8 animate-fade-in',
                                                        wh.testResult === 'ok'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                            : 'bg-red-50 text-red-700 border border-red-100'
                                                    )}
                                                >
                                                    {wh.testResult === 'ok' ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    {wh.testResult === 'ok'
                                                        ? 'Endpoint validado com sucesso'
                                                        : 'Conexão falhou · Verifique a URL'}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center justify-between border-t border-primary/5 pt-8">
                                                <button
                                                    onClick={() => handleDeleteWebhook(preset.tipo)}
                                                    className="text-[10px] uppercase tracking-widest font-bold text-text-muted hover:text-red-500 transition-colors flex items-center gap-2"
                                                    disabled={!wh.url}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    DELETAR CONEXÃO
                                                </button>

                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => handleTestWebhook(preset.tipo)}
                                                        disabled={wh.testing || !wh.url}
                                                        className="btn-secondary px-6"
                                                    >
                                                        {wh.testing ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Link2 className="w-4 h-4 mr-2" />
                                                        )}
                                                        {wh.testing ? 'TESTANDO...' : 'TESTAR'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveWebhook(preset.tipo)}
                                                        disabled={wh.saving || !wh.url}
                                                        className="btn-primary px-10 shadow-glow"
                                                    >
                                                        {wh.saving ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Save className="w-4 h-4 mr-2" />
                                                        )}
                                                        {wh.saving ? 'SALVANDO...' : 'SALVAR'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Payload reference */}
                            <div className="card bg-bg-subtle/50 border-none p-10">
                                <h4 className="text-xl font-semibold font-display italic text-text-secondary mb-6">Especificação</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary italic">Saída Maestro (POST)</p>
                                        <pre className="bg-white border border-primary/10 rounded-3xl p-6 text-[11px] text-text-primary font-mono leading-relaxed shadow-soft overflow-x-auto">{`{
  "service_id":   "uuid-video",
  "project":      "studio-edit",
  "payload": {
     "name":      "str",
     "image":     "blob"
  }
}`}</pre>
                                    </div>
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary italic">Retorno Esperado (JSON)</p>
                                        <pre className="bg-white border border-primary/10 rounded-3xl p-6 text-[11px] text-text-primary font-mono leading-relaxed shadow-soft overflow-x-auto">{`{
  "video_id": "uuid-video",
  "url": "https://cdn. studio.mp4",
  "status": "ready"
}`}</pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
