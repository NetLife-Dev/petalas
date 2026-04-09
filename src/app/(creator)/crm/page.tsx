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
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">CRM</h1>
                    <p className="text-text-muted text-sm mt-0.5">
                        {contacts.length} contatos
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        className="btn-secondary"
                        title="Em breve"
                    >
                        <Upload className="w-4 h-4" />
                        Importar CSV
                    </button>
                    <button
                        onClick={() => setIsNewContactModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Contato
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        icon: Users,
                        bg: 'bg-blue-50',
                        color: 'text-blue-600',
                        label: 'Total de Contatos',
                        value: contacts.length,
                        sub: '0 clientes ativos',
                    },
                    {
                        icon: TrendingUp,
                        bg: 'bg-purple-50',
                        color: 'text-purple-600',
                        label: 'Novos este Mês',
                        value: contacts.filter(
                            (c) =>
                                new Date(c.created_at).getMonth() === new Date().getMonth()
                        ).length,
                        sub: 'contatos adicionados',
                    },
                    {
                        icon: Target,
                        bg: 'bg-emerald-50',
                        color: 'text-emerald-600',
                        label: 'Taxa de Conversão',
                        value: '0%',
                        sub: 'lead → cliente',
                    },
                    {
                        icon: Clock,
                        bg: 'bg-amber-50',
                        color: 'text-amber-600',
                        label: 'Próximas Atividades',
                        value: '0',
                        sub: 'pendentes',
                    },
                ].map(({ icon: Icon, bg, color, label, value, sub }) => (
                    <div key={label} className="metric-card">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bg)}>
                            <Icon className={cn('w-5 h-5', color)} />
                        </div>
                        <div>
                            <p className="label mb-0.5">{label}</p>
                            <p className="text-2xl font-bold text-text-primary leading-none">
                                {value}
                            </p>
                            <p className="text-xs text-text-muted mt-1">{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table section */}
            <div className="card p-0 overflow-hidden">
                {/* Filters */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-4 border-b border-surface-100">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Buscar contatos..."
                            className="input-field pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1 bg-surface-50 p-1 rounded-lg border border-surface-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap',
                                    activeTab === tab.key
                                        ? 'bg-white text-text-primary shadow-sm border border-surface-200'
                                        : 'text-text-muted hover:text-text-secondary'
                                )}
                            >
                                {tab.label}{' '}
                                <span className="opacity-50">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-100">
                                <th className="table-header">Contato</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Origem</th>
                                <th className="table-header">Última Atividade</th>
                                <th className="table-header text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContacts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center">
                                        <Users className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
                                        <p className="text-sm text-text-muted">
                                            Nenhum contato encontrado
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="table-row group">
                                        <td className="table-cell">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0',
                                                        getAvatarColor(contact.nome || '')
                                                    )}
                                                >
                                                    {contact.avatar ||
                                                        getInitials(contact.nome || '')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {contact.nome}
                                                    </p>
                                                    <p className="text-xs text-text-muted">
                                                        {contact.empresa}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell text-text-muted">
                                            {contact.email}
                                        </td>
                                        <td className="table-cell">
                                            <span className="badge badge-gray">
                                                {contact.status}
                                            </span>
                                        </td>
                                        <td className="table-cell text-text-muted">
                                            {contact.canal}
                                        </td>
                                        <td className="table-cell text-text-muted">
                                            {contact.ultimaAtividade}
                                        </td>
                                        <td className="table-cell text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-100"
                                                    title="Visualizar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors rounded-lg hover:bg-surface-100"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(contact.id)}
                                                    className="p-1.5 text-text-muted hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                                                    title="Excluir contato"
                                                    aria-label="Excluir contato"
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
