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
        <div className="p-6 lg:p-8">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
                    <p className="text-text-muted text-sm mt-0.5">Gerencie seu perfil e preferências</p>
                </div>

                {/* Tabs */}
                <nav className="flex items-center border-b border-surface-200 gap-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative',
                                    isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </button>
                        )
                    })}
                </nav>

                <div className="animate-fade-in pb-12">
                    {/* ── PERFIL ─────────────────────────────────────────────── */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-5">
                            <div className="card">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="section-title">Informações Pessoais</h3>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            Gerencie como sua identidade aparece no sistema
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-20 h-20 rounded-xl bg-surface-100 flex items-center justify-center text-text-muted text-xl font-semibold overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Avatar" />
                                            ) : (
                                                getInitials(profile.nome)
                                            )}
                                        </div>
                                        <button className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-primary text-white rounded-lg border-2 border-white hover:bg-primary-700 transition-colors">
                                            <Camera className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-sm text-text-muted">
                                        <p className="font-medium text-text-primary">Foto de perfil</p>
                                        <p className="mt-0.5">PNG ou JPG. Máximo 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nome Completo</label>
                                        <input
                                            value={profile.nome}
                                            onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Endereço de E-mail</label>
                                        <input
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-5">
                                    <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>

                            <div className="card">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="section-title">Segurança</h3>
                                        <p className="text-xs text-text-muted mt-0.5">Altere sua senha periodicamente</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">Senha Atual</label>
                                        <input type="password" placeholder="••••••••" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Nova Senha</label>
                                        <input type="password" placeholder="••••••••" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="label">Confirmar Senha</label>
                                        <input type="password" placeholder="••••••••" className="input-field" />
                                    </div>
                                </div>
                                <div className="flex justify-end mt-5">
                                    <button className="btn-secondary">
                                        <Lock className="w-4 h-4" />
                                        Alterar Senha
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PIPELINES ──────────────────────────────────────────── */}
                    {activeTab === 'pipelines' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="section-title">Estágios do Pipeline</h3>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        Configure as etapas do seu funil de vendas
                                    </p>
                                </div>
                                <button onClick={handleAddStage} className="btn-primary">
                                    <Plus className="w-4 h-4" />
                                    Novo Estágio
                                </button>
                            </div>

                            <div className="card p-0 overflow-hidden">
                                {stages.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <Kanban className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
                                        <p className="text-sm text-text-muted">Nenhum estágio configurado</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-surface-100">
                                        {stages.map((stage, index) => (
                                            <div
                                                key={stage.id}
                                                className="flex items-center gap-4 px-5 py-4 group hover:bg-surface-50 transition-colors"
                                            >
                                                <span className="text-xs font-medium text-text-muted w-5 text-center">
                                                    {index + 1}
                                                </span>
                                                <div className="w-2 h-2 rounded-full bg-primary/40 flex-shrink-0" />
                                                <input
                                                    defaultValue={stage.title}
                                                    onBlur={(e) => handleUpdateStage(stage.id, e.target.value)}
                                                    className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted focus:text-primary"
                                                    placeholder="Nome do estágio..."
                                                />
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDeleteStage(stage.id)}
                                                        className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-100 rounded-lg transition-colors cursor-grab">
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
                        <div className="space-y-5 animate-fade-in">
                            <div>
                                <h3 className="section-title">Webhooks N8N</h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    Configure as URLs dos fluxos de automação. O sistema usará sua URL ao invés da padrão.
                                </p>
                            </div>

                            {/* Info banner */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Após salvar, o Pétalas vai chamar <strong>sua URL</strong> nos fluxos configurados.
                                    Use o botão <strong>Testar</strong> para verificar se o endpoint está acessível antes de ativar.
                                </p>
                            </div>

                            {/* Webhook cards */}
                            <div className="space-y-4">
                                {WEBHOOK_PRESETS.map((preset) => {
                                    const wh = webhooks[preset.tipo]
                                    return (
                                        <div key={preset.tipo} className="card space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                                                        <Puzzle className="w-4 h-4 text-text-muted" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-text-primary">
                                                                {preset.label}
                                                            </p>
                                                            {preset.required && (
                                                                <span className="badge badge-primary">Principal</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
                                                            {preset.description}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Toggle ativo */}
                                                <button
                                                    onClick={() => setWebhookField(preset.tipo, { ativo: !wh.ativo })}
                                                    className={cn(
                                                        'w-10 h-5 rounded-full relative flex-shrink-0 transition-colors mt-1',
                                                        wh.ativo ? 'bg-emerald-500' : 'bg-surface-200'
                                                    )}
                                                    title={wh.ativo ? 'Desativar' : 'Ativar'}
                                                >
                                                    <div
                                                        className={cn(
                                                            'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                                                            wh.ativo ? 'right-0.5' : 'left-0.5'
                                                        )}
                                                    />
                                                </button>
                                            </div>

                                            {/* URL input */}
                                            <div>
                                                <label className="label">URL do Webhook</label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
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
                                                            className="input-field pl-9 pr-10 font-mono text-xs"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setWebhookField(preset.tipo, { showUrl: !wh.showUrl })
                                                            }
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                                                        >
                                                            {wh.showUrl ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Test result feedback */}
                                            {wh.testResult !== 'idle' && (
                                                <div
                                                    className={cn(
                                                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                                                        wh.testResult === 'ok'
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-red-50 text-red-700'
                                                    )}
                                                >
                                                    {wh.testResult === 'ok' ? (
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    ) : (
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    )}
                                                    {wh.testResult === 'ok'
                                                        ? 'Webhook acessível e respondendo corretamente.'
                                                        : 'Não foi possível alcançar o endpoint. Verifique a URL e tente novamente.'}
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="flex items-center justify-between pt-1">
                                                <button
                                                    onClick={() => handleDeleteWebhook(preset.tipo)}
                                                    className="text-xs text-text-muted hover:text-red-600 transition-colors flex items-center gap-1.5"
                                                    disabled={!wh.url}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    Remover
                                                </button>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleTestWebhook(preset.tipo)}
                                                        disabled={wh.testing || !wh.url}
                                                        className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40"
                                                    >
                                                        {wh.testing ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Link2 className="w-3.5 h-3.5" />
                                                        )}
                                                        {wh.testing ? 'Testando...' : 'Testar'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleSaveWebhook(preset.tipo)}
                                                        disabled={wh.saving || !wh.url}
                                                        className="btn-primary text-xs px-3 py-1.5 disabled:opacity-40"
                                                    >
                                                        {wh.saving ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            <Save className="w-3.5 h-3.5" />
                                                        )}
                                                        {wh.saving ? 'Salvando...' : 'Salvar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Payload reference */}
                            <div className="card bg-surface-50">
                                <h4 className="section-title mb-3">Referência de Payload</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-medium text-text-secondary mb-1.5">
                                            N8N — Gerador de Vídeo
                                        </p>
                                        <pre className="bg-white border border-surface-200 rounded-lg p-3 text-xs text-text-secondary font-mono overflow-x-auto">{`FormData {
  video_id:          string   // UUID do vídeo no banco
  service_name:      string   // Nome do produto
  service_description: string // Descrição do produto
  image?:            File     // Imagem do produto (se enviada)
}`}</pre>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-text-secondary mb-1.5">
                                            Callback esperado (POST /api/videos/callback)
                                        </p>
                                        <pre className="bg-white border border-surface-200 rounded-lg p-3 text-xs text-text-secondary font-mono overflow-x-auto">{`{
  "video_id": "uuid-do-video",
  "video_url": "https://url-do-video-gerado.mp4"
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
