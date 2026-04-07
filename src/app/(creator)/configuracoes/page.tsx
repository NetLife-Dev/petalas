'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Lock,
    Puzzle,
    Save,
    Eye,
    EyeOff,
    Loader2,
    CheckCircle,
    XCircle,
    ShieldCheck,
    Zap,
    Kanban,
    Plus,
    Trash2,
    Check,
    X,
    Settings2,
    ChevronRight,
    Camera
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { getPipelineStages, upsertPipelineStage, deletePipelineStage } from './actions'

const TABS = [
    { id: 'perfil', label: 'PERFIL', icon: User },
    { id: 'pipelines', label: 'PIPELINES', icon: Kanban },
    { id: 'integracoes', label: 'INTEGRAÇÕES', icon: Puzzle },
]

const passwordSchema = z.object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmarSenha: z.string(),
}).refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarSenha'],
})

type PasswordForm = z.infer<typeof passwordSchema>

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState('perfil')
    const [profile, setProfile] = useState({ nome: '', email: '', avatar_url: null as string | null })
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [stages, setStages] = useState<any[]>([])
    const [integrations, setIntegrations] = useState<any[]>([
        { id: 'n8n_video', nome: 'N8N - Gerador de vídeo', ativo: true, tipo: 'video_gen' },
        { id: 'n8n_cnpj', nome: 'N8N - Consulta CNPJ', ativo: true, tipo: 'cnpj_lookup' }
    ])

    const {
        register,
        handleSubmit,
        reset: resetPasswordForm,
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
                getPipelineStages()
            ])

            if (profileRes.ok) {
                const data = await profileRes.json()
                setProfile({ 
                    nome: data.nome || '', 
                    email: data.email || '', 
                    avatar_url: data.avatar_url || null 
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
        } catch (error) {
            toast.error('Erro ao adicionar estágio')
        }
    }

    const handleUpdateStage = async (id: string, title: string) => {
        try {
            await upsertPipelineStage(id, title, stages.find(s => s.id === id)?.order || 0)
            toast.success('Estágio salvo')
        } catch (error) {
            toast.error('Erro ao salvar')
        }
    }

    const handleDeleteStage = async (id: string) => {
        try {
            await deletePipelineStage(id)
            setStages(stages.filter(s => s.id !== id))
            toast.success('Estágio removido')
        } catch (error) {
            toast.error('Erro ao remover')
        }
    }

    if (isLoading) {
        return (
            <div className="p-12 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
            </div>
        )
    }

    return (
        <main className="flex-1 p-8 lg:p-12 bg-slate-50/30 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight italic">CONFIGURAÇÕES</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Painel de Personalização • Ecossistema Pétalas</p>
                </header>

                {/* Tab Navigation */}
                <nav className="flex items-center gap-12 border-b border-slate-100 pb-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 pb-4 text-[11px] font-black tracking-[0.2em] transition-all relative",
                                    isActive ? "text-rose-500" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-rose-500 rounded-full" />}
                            </button>
                        )
                    })}
                </nav>

                <div className="animate-fade-in pb-20">
                    {/* PERFIL TAB */}
                    {activeTab === 'perfil' && (
                        <div className="space-y-10">
                            <section className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-soft">
                                <div className="space-y-10">
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-3xl bg-rose-50 border-2 border-rose-100 flex items-center justify-center text-rose-500 text-2xl font-black shadow-inner overflow-hidden">
                                                {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : getInitials(profile.nome)}
                                            </div>
                                            <button className="absolute -bottom-2 -right-2 p-2 bg-rose-600 text-white rounded-xl shadow-lg hover:bg-rose-500 transition-all border-4 border-white">
                                                <Camera className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1 text-center md:text-left">
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Informações Pessoais</h3>
                                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Gerencie como sua identidade aparece no sistema.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Nome Completo</label>
                                            <input 
                                                value={profile.nome}
                                                onChange={(e) => setProfile({...profile, nome: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-rose-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Endereço de E-mail</label>
                                            <input 
                                                value={profile.email}
                                                onChange={(e) => setProfile({...profile, email: e.target.value})}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-900 focus:border-rose-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button 
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-xl shadow-rose-500/20 uppercase tracking-widest"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Salvar Alterações
                                        </button>
                                    </div>
                                </div>
                            </section>

                            <section className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-soft">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                                            <ShieldCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-slate-900 tracking-tight italic">Segurança do Acesso</h3>
                                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Altere sua senha periodicamente.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                                        <div className="space-y-2">
                                            <input placeholder="Senha Atual" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <input placeholder="Nova Senha" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <input placeholder="Confirmar Senha" type="password" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button className="bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-xs transition-all flex items-center gap-3 uppercase tracking-widest">
                                            <Lock className="w-4 h-4" /> Alterar Senha
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* PIPELINES TAB */}
                    {activeTab === 'pipelines' && (
                        <div className="space-y-10 animate-fade-in">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="px-5 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-200 shadow-sm">Funil Padrão</span>
                                </div>
                                <button 
                                    onClick={handleAddStage}
                                    className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-rose-500/20 uppercase tracking-widest"
                                >
                                    <Plus className="w-5 h-5 text-white" /> Novo Estágio
                                </button>
                            </div>

                            <section className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-soft space-y-10">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Configuração de Estágios</h3>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Defina as etapas do seu pipeline de vendas.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {stages.map((stage) => (
                                        <div key={stage.id} className="group flex items-center gap-6 bg-slate-50/50 border border-slate-100 p-6 rounded-3xl hover:border-rose-500/30 transition-all">
                                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-lg shadow-rose-500/30" />
                                            <input 
                                                defaultValue={stage.title}
                                                onBlur={(e) => handleUpdateStage(stage.id, e.target.value)}
                                                className="flex-1 bg-transparent border-none text-sm font-black text-slate-800 outline-none placeholder:text-slate-300 italic"
                                                placeholder="Defina o nome da etapa..."
                                            />
                                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleDeleteStage(stage.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="w-px h-6 bg-slate-200" />
                                                <button className="p-2.5 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                                                    <Settings2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {stages.length === 0 && (
                                        <div className="py-24 text-center border-4 border-dashed border-slate-50 rounded-[40px] bg-slate-50/30">
                                            <Kanban className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest">Nenhum estágio configurado no momento</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* INTEGRAÇÕES TAB */}
                    {activeTab === 'integracoes' && (
                        <div className="space-y-10 animate-fade-in">
                            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Fluxos de Automação</h3>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Explore os superpoderes do ecossistema Pétalas.</p>
                                </div>
                                <button className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 transition-all shadow-xl shadow-rose-500/20 uppercase tracking-widest">
                                    <Plus className="w-5 h-5 text-white" /> Nova Integração
                                </button>
                            </header>

                            <div className="grid grid-cols-1 gap-4">
                                {integrations.map((int) => (
                                    <div key={int.id} className="bg-white border border-slate-100 rounded-[32px] p-8 flex items-center justify-between group hover:border-rose-500/20 shadow-soft transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner">
                                                <Puzzle className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-900">{int.nome}</p>
                                                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-1">Conexão via N8N Automations</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div 
                                                className={cn(
                                                    "w-14 h-7 rounded-full relative transition-all cursor-pointer shadow-inner",
                                                    int.ativo ? "bg-emerald-500" : "bg-slate-200"
                                                )}
                                            >
                                                <div className={cn(
                                                    "absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all",
                                                    int.ativo ? "right-1" : "left-1"
                                                )} />
                                            </div>
                                            <button className="bg-slate-50 text-slate-400 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100 italic">
                                                configurar URL
                                            </button>
                                            <button className="p-2.5 text-slate-200 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Form Preview */}
                            <section className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-12 shadow-soft relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] -mr-16 -mt-16" />
                                <div className="relative z-10 space-y-10">
                                    <h4 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">Criar Nova Conexão</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Identificador do Fluxo</label>
                                            <input placeholder="Ex: Webhook de Leads Ads" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2 italic">Endpoint de Destino (URL)</label>
                                            <input placeholder="https://seu-servidor-n8n.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-bold text-slate-900 outline-none focus:border-rose-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-6 pt-6">
                                        <button className="px-8 py-4 rounded-xl font-black text-[10px] text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all">Cancelar</button>
                                        <button className="bg-rose-600 hover:bg-rose-500 text-white px-10 py-4 rounded-2xl font-black text-xs transition-all shadow-xl shadow-rose-500/20 uppercase tracking-[0.2em]">Salvar Integração</button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
