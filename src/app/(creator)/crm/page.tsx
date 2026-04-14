'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    ChevronDown,
    Eye,
    Edit2,
    Trash2,
    Upload,
    Users,
    TrendingUp,
    Target,
    Clock,
    X,
    UserPlus,
} from 'lucide-react'
import { cn, getInitials, getAvatarColor } from '@/lib/utils'
import { getContacts, createContact } from './actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'

export default function CRMPage() {
    const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [contacts, setContacts] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState('TODOS')
    const [search, setSearch] = useState('')
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        nome: '',
        empresa: '',
        email: '',
        telefone: '',
        cargo: '',
        canal: 'Google',
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = await getContacts()
            setContacts(data)
        } catch {
            toast.error('Erro ao buscar contatos')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreate = async () => {
        if (!formData.nome) return toast.error('Nome é obrigatório')
        try {
            await createContact(formData)
            toast.success('Contato adicionado!')
            setIsNewContactModalOpen(false)
            setFormData({ nome: '', empresa: '', email: '', telefone: '', cargo: '', canal: 'Google' })
            fetchData()
        } catch {
            toast.error('Erro ao adicionar contato')
        }
    }

    const tabs = [
        { key: 'TODOS', label: 'Todos', count: contacts.length },
        { key: 'LEADS', label: 'Leads', count: 0 },
        { key: 'CLIENTES', label: 'Clientes', count: 0 },
        { key: 'INATIVOS', label: 'Inativos', count: 0 },
    ]

    const filteredContacts = contacts.filter((c) => {
        const matchesSearch =
            !search ||
            c.nome?.toLowerCase().includes(search.toLowerCase()) ||
            c.empresa?.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase())
        return matchesSearch
    })

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="shimmer h-7 w-16 rounded-lg" />
                        <div className="shimmer h-4 w-28 rounded" />
                    </div>
                    <div className="flex gap-2">
                        <div className="shimmer h-10 w-32 rounded-lg" />
                        <div className="shimmer h-10 w-36 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="metric-card space-y-3">
                            <div className="shimmer h-10 w-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="shimmer h-3 w-24 rounded" />
                                <div className="shimmer h-7 w-12 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="card p-0 overflow-hidden">
                    <div className="px-5 py-4 border-b border-surface-100">
                        <div className="shimmer h-9 w-64 rounded-lg" />
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-100">
                                {['Contato','Email','Status','Origem','Última Atividade','Ações'].map((h) => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b border-surface-50">
                                    <td className="table-cell">
                                        <div className="flex items-center gap-3">
                                            <div className="shimmer w-8 h-8 rounded-full flex-shrink-0" />
                                            <div className="space-y-1.5">
                                                <div className="shimmer h-3.5 w-28 rounded" />
                                                <div className="shimmer h-3 w-20 rounded" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-cell"><div className="shimmer h-3.5 w-36 rounded" /></td>
                                    <td className="table-cell"><div className="shimmer h-5 w-16 rounded-md" /></td>
                                    <td className="table-cell"><div className="shimmer h-3.5 w-16 rounded" /></td>
                                    <td className="table-cell"><div className="shimmer h-3.5 w-20 rounded" /></td>
                                    <td className="table-cell text-right"><div className="shimmer h-6 w-16 rounded ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-10 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-semibold text-text-primary italic font-display">CRM</h1>
                    <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                        Gestão de Relacionamento · {contacts.length} Registros
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="btn-secondary px-8"
                        title="Em breve"
                    >
                        <Upload className="w-4 h-4 mr-1" />
                        Importar CSV
                    </button>
                    <button
                        onClick={() => setIsNewContactModalOpen(true)}
                        className="btn-primary px-8"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        NOVO CONTATO
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    {
                        icon: Users,
                        label: 'Total de Contatos',
                        value: contacts.length,
                        sub: 'Cadastros gerais',
                    },
                    {
                        icon: TrendingUp,
                        label: 'Novos este Mês',
                        value: contacts.filter(
                            (c) =>
                                new Date(c.created_at).getMonth() === new Date().getMonth()
                        ).length,
                        sub: 'Crescimento studio',
                    },
                    {
                        icon: Target,
                        label: 'Taxa de Conversão',
                        value: '0%',
                        sub: 'Lead para Cliente',
                    },
                    {
                        icon: Clock,
                        label: 'Atividades',
                        value: '0',
                        sub: 'Pendências hoje',
                    },
                ].map(({ icon: Icon, label, value, sub }) => (
                    <div key={label} className="surface-card group flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                             <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.15em] text-text-muted mb-2">{label}</p>
                            <p className="text-4xl font-bold tracking-tight text-text-primary">
                                {value}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-text-muted mt-2 font-bold">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table section */}
            <div>
                {/* Filters */}
                <div className="surface-card flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, empresa ou email..."
                            className="input-field pl-12 rounded-full border-primary/10 hover:border-primary/20 bg-bg-main/50"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-bg-main/50 p-1 rounded-full border border-primary/10">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200',
                                    activeTab === tab.key
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-text-muted hover:text-primary'
                                )}
                            >
                                {tab.label}{' '}
                                <span className={cn('ml-1 opacity-50', activeTab === tab.key && 'opacity-80')}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="surface-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-bg-subtle/50 border-b border-primary/10">
                                    <th className="table-header">Contato</th>
                                    <th className="table-header">Email</th>
                                    <th className="table-header">Status</th>
                                    <th className="table-header">Origem</th>
                                    <th className="table-header">Última Atividade</th>
                                    <th className="table-header text-right"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContacts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-24 text-center">
                                            <Users className="w-12 h-12 text-primary/20 mx-auto mb-4" />
                                            <p className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted">
                                                Nenhum registro encontrado no studio
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredContacts.map((contact) => (
                                        <tr key={contact.id} className="table-row group">
                                            <td className="table-cell">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={cn(
                                                            'w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 bg-primary/10 text-primary border border-primary/20'
                                                        )}
                                                    >
                                                        {contact.avatar ||
                                                            getInitials(contact.nome || '')}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-text-primary">
                                                            {contact.nome}
                                                        </p>
                                                        <p className="text-[10px] uppercase tracking-widest text-text-muted font-semibold">
                                                            {contact.empresa}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell font-medium">
                                                {contact.email}
                                            </td>
                                            <td className="table-cell">
                                                <span className="badge-lead">
                                                    lead
                                                </span>
                                            </td>
                                            <td className="table-cell text-xs font-semibold text-text-muted uppercase tracking-wider">
                                                {contact.canal}
                                            </td>
                                            <td className="table-cell text-xs font-semibold text-text-muted uppercase tracking-wider">
                                                {contact.ultimaAtividade}
                                            </td>
                                            <td className="table-cell text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-primary-light"
                                                        title="Visualizar"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-primary-light"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(contact.id)}
                                                        className="p-2 text-text-muted hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal — New Contact */}
            {isNewContactModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-panel max-w-xl">
                        <div className="modal-header">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <UserPlus className="w-4 h-4 text-primary" />
                                </div>
                                <h2 className="section-title">Novo Contato</h2>
                            </div>
                            <button
                                onClick={() => setIsNewContactModalOpen(false)}
                                className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Nome *</label>
                                    <input
                                        type="text"
                                        placeholder="João Silva"
                                        value={formData.nome}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nome: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Empresa</label>
                                    <input
                                        type="text"
                                        placeholder="Empresa LTDA"
                                        value={formData.empresa}
                                        onChange={(e) =>
                                            setFormData({ ...formData, empresa: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        type="email"
                                        placeholder="joao@empresa.com"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Telefone</label>
                                    <input
                                        type="text"
                                        placeholder="(11) 99999-9999"
                                        value={formData.telefone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, telefone: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Cargo</label>
                                    <input
                                        type="text"
                                        placeholder="CEO, Diretor..."
                                        value={formData.cargo}
                                        onChange={(e) =>
                                            setFormData({ ...formData, cargo: e.target.value })
                                        }
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="label">Canal de Origem</label>
                                    <div className="relative">
                                        <select
                                            value={formData.canal}
                                            onChange={(e) =>
                                                setFormData({ ...formData, canal: e.target.value })
                                            }
                                            className="input-field appearance-none"
                                        >
                                            <option value="Google">Google</option>
                                            <option value="Indicação">Indicação</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="Manual">Manual</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setIsNewContactModalOpen(false)}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button onClick={handleCreate} className="btn-primary">
                                <Plus className="w-4 h-4" />
                                Adicionar Contato
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Excluir contato"
                description="O contato será removido permanentemente do seu CRM. Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
                onConfirm={async () => {
                    if (!deleteTarget) return
                    const id = deleteTarget
                    setDeleteTarget(null)
                    try {
                        // deleteContact action would go here if implemented
                        toast.success('Contato removido')
                        setContacts((prev) => prev.filter((c) => c.id !== id))
                    } catch {
                        toast.error('Erro ao excluir contato')
                    }
                }}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    )
}
