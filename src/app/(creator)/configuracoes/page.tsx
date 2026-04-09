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
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getPipelineStages, upsertPipelineStage, deletePipelineStage } from './actions'

const TABS = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'pipelines', label: 'Pipelines', icon: Kanban },
    { id: 'integracoes', label: 'Integrações', icon: Puzzle },
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
    const [integrations] = useState([
        { id: 'n8n_video', nome: 'N8N — Gerador de Vídeo', ativo: true, tipo: 'video_gen' },
        { id: 'n8n_cnpj', nome: 'N8N — Consulta CNPJ', ativo: true, tipo: 'cnpj_lookup' },
    ])

    const {
        register,
        handleSubmit,
        formState: { errors: passwordErrors },
    } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

    useEffect(() => {
        loadAllData()
    }, [])

    async function loadAllData() {
        setIsLoading(true)
        try {
            const [profileRes, stagesData] = await Promise.all([
                fetch('/api/creator/profile'),
                getPipelineStages(),
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
                    <p className="text-text-muted text-sm mt-0.5">
                        Gerencie seu perfil e preferências
                    </p>
                </div>

                {/* Tab Navigation */}
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
                                    isActive
                                        ? 'text-primary'
                                        : 'text-text-muted hover:text-text-secondary'
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
                    {/* PERFIL */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-5">
                            {/* Personal info */}
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
                                                <img
                                                    src={profile.avatar_url}
                                                    className="w-full h-full object-cover"
                                                    alt="Avatar"
                                                />
                                            ) : (
                                                getInitials(profile.nome)
                                            )}
                                        </div>
                                        <button className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-primary text-white rounded-lg border-2 border-white hover:bg-primary-700 transition-colors">
                                            <Camera className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="flex-1 text-sm text-text-muted">
                                        <p className="font-medium text-text-primary">
                                            Foto de perfil
                                        </p>
                                        <p className="mt-0.5">
                                            PNG ou JPG. Máximo 2MB.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Nome Completo</label>
                                        <input
                                            value={profile.nome}
                                            onChange={(e) =>
                                                setProfile({ ...profile, nome: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Endereço de E-mail</label>
                                        <input
                                            value={profile.email}
                                            onChange={(e) =>
                                                setProfile({ ...profile, email: e.target.value })
                                            }
                                            className="input-field"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end mt-5">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="btn-primary"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Salvar Alterações
                                    </button>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="card">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="section-title">Segurança</h3>
                                        <p className="text-xs text-text-muted mt-0.5">
                                            Altere sua senha periodicamente
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="label">Senha Atual</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Nova Senha</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Confirmar Senha</label>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            className="input-field"
                                        />
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

                    {/* PIPELINES */}
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
                                        <p className="text-sm text-text-muted">
                                            Nenhum estágio configurado
                                        </p>
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
                                                    onBlur={(e) =>
                                                        handleUpdateStage(
                                                            stage.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className="flex-1 bg-transparent text-sm font-medium text-text-primary outline-none placeholder:text-text-muted focus:text-primary"
                                                    placeholder="Nome do estágio..."
                                                />
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteStage(stage.id)
                                                        }
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

                    {/* INTEGRAÇÕES */}
                    {activeTab === 'integracoes' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="section-title">Integrações Ativas</h3>
                                    <p className="text-xs text-text-muted mt-0.5">
                                        Conecte serviços externos ao Pétalas
                                    </p>
                                </div>
                                <button className="btn-primary">
                                    <Plus className="w-4 h-4" />
                                    Nova Integração
                                </button>
                            </div>

                            <div className="space-y-3">
                                {integrations.map((int) => (
                                    <div
                                        key={int.id}
                                        className="card flex items-center justify-between py-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-surface-100 flex items-center justify-center">
                                                <Puzzle className="w-5 h-5 text-text-muted" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-text-primary">
                                                    {int.nome}
                                                </p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    Conexão via N8N Automations
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    'w-10 h-5 rounded-full relative cursor-pointer transition-colors',
                                                    int.ativo ? 'bg-emerald-500' : 'bg-surface-200'
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all',
                                                        int.ativo ? 'right-0.5' : 'left-0.5'
                                                    )}
                                                />
                                            </div>
                                            <button className="btn-secondary text-xs px-3 py-1.5">
                                                Configurar URL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* New connection form */}
                            <div className="card">
                                <h4 className="section-title mb-4">Criar Nova Conexão</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Identificador</label>
                                        <input
                                            placeholder="Ex: Webhook de Leads Ads"
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">URL do Endpoint</label>
                                        <input
                                            placeholder="https://seu-n8n.com/webhook/..."
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <button className="btn-secondary">Cancelar</button>
                                    <button className="btn-primary">Salvar Integração</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
