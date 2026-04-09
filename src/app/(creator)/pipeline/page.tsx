'use client'

import { useState, useEffect } from 'react'
import {
    Plus,
    Search,
    Calendar,
    DollarSign,
    AlertCircle,
    X,
    Kanban,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPipelineData, createColumn, createOpportunity } from './actions'
import toast from 'react-hot-toast'

export default function PipelinePage() {
    const [isNewColumnModalOpen, setIsNewColumnModalOpen] = useState(false)
    const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [columns, setColumns] = useState<any[]>([])
    const [cards, setCards] = useState<any[]>([])
    const [newColumnName, setNewColumnName] = useState('')
    const [selectedColor, setSelectedColor] = useState('bg-blue-500')

    const [newCardData, setNewCardData] = useState({
        title: '',
        description: '',
        value: '',
        date: '',
        priority: 'media',
        stageId: '',
        responsible: '',
    })

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = await getPipelineData()
            setColumns(data.columns)
            setCards(data.cards)
        } catch {
            toast.error('Erro ao carregar pipeline')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCreateColumn = async () => {
        if (!newColumnName) return
        try {
            await createColumn(newColumnName, selectedColor)
            toast.success('Coluna criada!')
            setNewColumnName('')
            setIsNewColumnModalOpen(false)
            fetchData()
        } catch {
            toast.error('Erro ao criar coluna')
        }
    }

    const handleCreateCard = async () => {
        if (!newCardData.title || !newCardData.stageId) {
            toast.error('Título e Coluna são obrigatórios')
            return
        }
        try {
            await createOpportunity(
                newCardData.stageId,
                newCardData.title,
                parseFloat(newCardData.value) || 0,
                newCardData.priority,
                newCardData.description,
                newCardData.responsible,
                newCardData.date
            )
            toast.success('Card criado!')
            setIsNewCardModalOpen(false)
            setNewCardData({
                title: '',
                description: '',
                value: '',
                date: '',
                priority: 'media',
                stageId: '',
                responsible: '',
            })
            fetchData()
        } catch {
            toast.error('Erro ao criar card')
        }
    }

    const priorityConfig: Record<string, { label: string; className: string }> = {
        alta: { label: 'Alta', className: 'badge-red' },
        media: { label: 'Média', className: 'badge-yellow' },
        baixa: { label: 'Baixa', className: 'badge-blue' },
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="shimmer h-7 w-28 rounded-lg" />
                        <div className="shimmer h-4 w-40 rounded" />
                    </div>
                    <div className="shimmer h-10 w-36 rounded-lg" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-72">
                            <div className="card p-0 overflow-hidden">
                                <div className="px-4 py-3 border-b border-surface-100 flex items-center justify-between">
                                    <div className="shimmer h-4 w-24 rounded" />
                                    <div className="shimmer h-5 w-8 rounded-full" />
                                </div>
                                <div className="p-3 space-y-3">
                                    {Array.from({ length: 3 - (i % 2) }).map((_, j) => (
                                        <div key={j} className="card p-4 space-y-2">
                                            <div className="shimmer h-4 w-full rounded" />
                                            <div className="shimmer h-3 w-2/3 rounded" />
                                            <div className="flex gap-2 mt-2">
                                                <div className="shimmer h-5 w-14 rounded-md" />
                                                <div className="shimmer h-5 w-16 rounded-md" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const totalValue = columns.reduce((acc, col) => {
        const val = parseFloat(col.totalValue.replace(/[^\d]/g, '').replace(',', '.')) / 100
        return acc + (isNaN(val) ? 0 : val)
    }, 0)

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Pipeline</h1>
                    <p className="text-text-muted text-sm mt-0.5">Gestão de oportunidades</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsNewColumnModalOpen(true)}
                        className="btn-primary"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Coluna
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="metric-card flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Kanban className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="label mb-0.5">Total de Cards</p>
                        <p className="text-2xl font-bold text-text-primary">{cards.length}</p>
                    </div>
                </div>
                <div className="metric-card flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="label mb-0.5">Valor do Funil</p>
                        <p className="text-2xl font-bold text-text-primary">
                            {totalValue.toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                            })}
                        </p>
                    </div>
                </div>
                <div className="metric-card flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="label mb-0.5">Oportunidades Vencidas</p>
                        <p className="text-2xl font-bold text-text-primary">0</p>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-6">
                {columns.map((col) => (
                    <div key={col.id} className="flex-shrink-0 w-72 flex flex-col gap-3">
                        {/* Column Header */}
                        <div className="bg-white border border-surface-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={cn('w-2 h-2 rounded-full', col.color)} />
                                <span className="text-sm font-semibold text-text-primary">
                                    {col.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-text-muted font-medium">
                                    {col.totalValue}
                                </span>
                                <span className="bg-surface-100 text-text-muted text-xs font-medium px-1.5 py-0.5 rounded-md">
                                    {col.count}
                                </span>
                            </div>
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-2.5 min-h-[400px]">
                            {cards
                                .filter((c) => c.columnId === col.id)
                                .map((card) => {
                                    const pCfg =
                                        priorityConfig[card.priority] || priorityConfig.media
                                    return (
                                        <div
                                            key={card.id}
                                            className="bg-white border border-surface-200 rounded-xl p-4 hover:border-surface-300 hover:shadow-soft transition-all cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <h3 className="text-sm font-semibold text-text-primary leading-snug">
                                                    {card.title}
                                                </h3>
                                                {card.isNew && (
                                                    <span className="badge badge-primary whitespace-nowrap">
                                                        Novo
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 mb-3">
                                                <span className={cn('badge', pCfg.className)}>
                                                    {pCfg.label}
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-text-secondary mb-3">
                                                {card.value}
                                            </p>

                                            <div className="flex items-center justify-between pt-3 border-t border-surface-100">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-medium">
                                                        {card.avatar}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-text-muted">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-xs">{card.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                            <button
                                onClick={() => {
                                    setNewCardData({ ...newCardData, stageId: col.id })
                                    setIsNewCardModalOpen(true)
                                }}
                                className="w-full py-2.5 border border-dashed border-surface-200 rounded-xl flex items-center justify-center gap-1.5 text-text-muted hover:border-primary/30 hover:text-primary transition-colors text-xs font-medium"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Adicionar Card
                            </button>

                            {col.count === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-16">
                                    <Kanban className="w-6 h-6 text-text-muted mb-1" />
                                    <p className="text-xs text-text-muted">Nenhum card</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add column button */}
                <div className="flex-shrink-0 w-72">
                    <button
                        onClick={() => setIsNewColumnModalOpen(true)}
                        className="w-full h-full min-h-[300px] border border-dashed border-surface-200 rounded-xl flex flex-col items-center justify-center gap-3 text-text-muted hover:border-primary/30 hover:text-primary transition-colors group"
                    >
                        <div className="w-8 h-8 rounded-full border border-dashed border-surface-200 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">Nova Coluna</span>
                    </button>
                </div>
            </div>

            {/* Modal — New Card */}
            {isNewCardModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-panel max-w-lg">
                        <div className="modal-header">
                            <h2 className="section-title">Novo Card</h2>
                            <button
                                onClick={() => setIsNewCardModalOpen(false)}
                                className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="label">Título *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Nome da oportunidade"
                                    value={newCardData.title}
                                    onChange={(e) =>
                                        setNewCardData({ ...newCardData, title: e.target.value })
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">Descrição</label>
                                <textarea
                                    className="input-field h-20 resize-none"
                                    placeholder="Detalhes do card..."
                                    value={newCardData.description}
                                    onChange={(e) =>
                                        setNewCardData({
                                            ...newCardData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Valor (R$)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        placeholder="0,00"
                                        value={newCardData.value}
                                        onChange={(e) =>
                                            setNewCardData({
                                                ...newCardData,
                                                value: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="label">Vencimento</label>
                                    <input
                                        type="date"
                                        className="input-field"
                                        value={newCardData.date}
                                        onChange={(e) =>
                                            setNewCardData({
                                                ...newCardData,
                                                date: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Prioridade</label>
                                    <select
                                        className="input-field"
                                        value={newCardData.priority}
                                        onChange={(e) =>
                                            setNewCardData({
                                                ...newCardData,
                                                priority: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="media">Média</option>
                                        <option value="alta">Alta</option>
                                        <option value="baixa">Baixa</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Coluna</label>
                                    <select
                                        className="input-field"
                                        value={newCardData.stageId}
                                        onChange={(e) =>
                                            setNewCardData({
                                                ...newCardData,
                                                stageId: e.target.value,
                                            })
                                        }
                                    >
                                        {columns.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Responsável</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Nome do responsável"
                                    value={newCardData.responsible}
                                    onChange={(e) =>
                                        setNewCardData({
                                            ...newCardData,
                                            responsible: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setIsNewCardModalOpen(false)}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button onClick={handleCreateCard} className="btn-primary">
                                Criar Card
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — New Column */}
            {isNewColumnModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-panel max-w-sm">
                        <div className="modal-header">
                            <h2 className="section-title">Nova Coluna</h2>
                            <button
                                onClick={() => setIsNewColumnModalOpen(false)}
                                className="p-1 text-text-muted hover:text-text-primary rounded transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div>
                                <label className="label">Nome da Coluna</label>
                                <input
                                    type="text"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                    placeholder="Ex: Qualificação"
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="label">Cor</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'bg-blue-500',
                                        'bg-violet-500',
                                        'bg-purple-500',
                                        'bg-orange-500',
                                        'bg-amber-500',
                                        'bg-emerald-500',
                                        'bg-rose-500',
                                    ].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={cn(
                                                'w-7 h-7 rounded-full border-2 transition-all',
                                                color,
                                                selectedColor === color
                                                    ? 'border-text-primary scale-110'
                                                    : 'border-transparent'
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                onClick={() => setIsNewColumnModalOpen(false)}
                                className="btn-secondary"
                            >
                                Cancelar
                            </button>
                            <button onClick={handleCreateColumn} className="btn-primary">
                                Criar Coluna
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
