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
        <div className="p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in h-[calc(100vh-64px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-baseline justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-semibold text-text-primary italic font-display">Pipeline</h1>
                    <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                        Curadoria de Oportunidades
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden xl:flex items-center gap-4 mr-8">
                        <div className="surface-card min-w-[200px]">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Valor do Funil</p>
                            <p className="text-xl font-bold text-primary italic font-display">
                                {totalValue.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                })}
                            </p>
                        </div>
                        <div className="surface-card min-w-[200px]">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">Oportunidades</p>
                            <p className="text-xl font-bold text-text-primary italic font-display">{cards.length} Peças</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsNewColumnModalOpen(true)}
                        className="btn-secondary px-6"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        NOVA COLUNA
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-8 overflow-x-auto pb-8 no-scrollbar outline-none">
                {columns.map((col) => (
                    <div key={col.id} className="flex-shrink-0 w-[320px] flex flex-col group/col surface-card">
                        {/* Column Header */}
                        <div className="mb-6 flex items-center justify-between pb-4 border-b border-surface-100">
                            <div className="flex items-center gap-3">
                                <div className={cn('w-2.5 h-2.5 rounded-full shadow-glow', col.color)} />
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-text-primary">
                                    {col.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-primary/60 italic font-display">
                                    {col.totalValue}
                                </span>
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary/5 text-primary text-[10px] font-bold">
                                    {col.count}
                                </span>
                            </div>
                        </div>

                        {/* Cards Container */}
                        <div className="flex-1 flex flex-col gap-4 min-h-[500px]">
                            <button
                                onClick={() => {
                                    setNewCardData({ ...newCardData, stageId: col.id })
                                    setIsNewCardModalOpen(true)
                                }}
                                className="w-full py-4 border-2 border-dashed border-primary/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:border-primary/30 hover:text-primary hover:bg-white transition-all mb-2"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                NOVO CARD
                            </button>

                            {cards
                                .filter((c) => c.columnId === col.id)
                                .map((card) => {
                                    const pCfg = priorityConfig[card.priority] || priorityConfig.media
                                    return (
                                        <div
                                            key={card.id}
                                            className="bg-white rounded-3xl p-6 shadow-soft border border-primary/5 hover:border-primary/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group/card"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <h3 className="text-sm font-bold text-text-primary leading-snug group-hover/card:text-primary transition-colors">
                                                    {card.title}
                                                </h3>
                                                {card.isNew && (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-widest border border-emerald-100">Novo</span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className={cn('h-[1px] flex-1 opacity-10', pCfg.className.includes('red') ? 'bg-red-500' : 'bg-primary')} />
                                                <span className={cn('text-[9px] font-bold uppercase tracking-widest', pCfg.className.includes('red') ? 'text-red-500' : 'text-primary')}>
                                                    {pCfg.label}
                                                </span>
                                            </div>

                                            <p className="text-lg font-bold text-text-primary italic font-display mb-6">
                                                {card.value}
                                            </p>

                                            <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-bg-subtle border border-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-inner">
                                                        {card.avatar}
                                                    </div>
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">{card.responsible || 'Curadoria'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-text-muted px-2 py-1 rounded-full bg-bg-subtle/50">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.1em]">{card.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                            {col.count === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 opacity-20 group-hover/col:opacity-40 transition-opacity">
                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center mb-4">
                                        <Kanban className="w-6 h-6 text-primary" />
                                    </div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Vazio</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add column button */}
                <div className="flex-shrink-0 w-[320px]">
                    <button
                        onClick={() => setIsNewColumnModalOpen(true)}
                        className="w-full h-full border-2 border-dashed border-primary/10 rounded-[40px] flex flex-col items-center justify-center gap-4 text-primary/40 hover:border-primary/30 hover:text-primary hover:bg-bg-subtle/30 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white border border-primary/10 flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em]">DESENHAR COLUNA</span>
                    </button>
                </div>
            </div>

            {/* Modal — New Card */}
            {isNewCardModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 outline-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setIsNewCardModalOpen(false)} />
                    <div className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-10 lg:p-12">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-3xl font-semibold font-display italic text-text-primary leading-none">Novo Card</h2>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted mt-2">Registrar Oportunidade</p>
                                </div>
                                <button
                                    onClick={() => setIsNewCardModalOpen(false)}
                                    className="p-2.5 text-text-muted hover:text-text-primary border border-primary/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Título</label>
                                    <input
                                        type="text"
                                        className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
                                        placeholder="Nome da oportunidade"
                                        value={newCardData.title}
                                        onChange={(e) =>
                                            setNewCardData({ ...newCardData, title: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Descrição Curatorial</label>
                                    <textarea
                                        className="input-field rounded-[24px] px-6 py-4 bg-bg-subtle/30 h-24 resize-none"
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

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Valor (R$)</label>
                                        <input
                                            type="number"
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
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
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Vencimento</label>
                                        <input
                                            type="date"
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
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

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Prioridade</label>
                                        <select
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30 appearance-none"
                                            value={newCardData.priority}
                                            onChange={(e) =>
                                                setNewCardData({
                                                    ...newCardData,
                                                    priority: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="media">MÉDIA</option>
                                            <option value="alta">ALTA</option>
                                            <option value="baixa">BAIXA</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Coluna Maestro</label>
                                        <select
                                            className="input-field rounded-full px-6 py-4 bg-bg-subtle/30 appearance-none"
                                            value={newCardData.stageId}
                                            onChange={(e) =>
                                                setNewCardData({
                                                    ...newCardData,
                                                    stageId: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Selecione...</option>
                                            {columns.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.title.toUpperCase()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 lg:p-12 bg-bg-subtle/30 flex items-center justify-end gap-4 border-t border-primary/5">
                            <button
                                onClick={() => setIsNewCardModalOpen(false)}
                                className="px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button onClick={handleCreateCard} className="btn-primary px-10 shadow-glow">
                                CRIAR CARD
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal — New Column */}
            {isNewColumnModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 outline-none">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={() => setIsNewColumnModalOpen(false)} />
                    <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden animate-scale-up">
                        <div className="p-10 lg:p-12">
                             <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h2 className="text-2xl font-semibold font-display italic text-text-primary leading-none">Nova Coluna</h2>
                                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted mt-2">Estrutura</p>
                                </div>
                                <button
                                    onClick={() => setIsNewColumnModalOpen(false)}
                                    className="p-2.5 text-text-muted hover:text-text-primary border border-primary/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Nome da Coluna</label>
                                    <input
                                        type="text"
                                        value={newColumnName}
                                        onChange={(e) => setNewColumnName(e.target.value)}
                                        placeholder="Ex: Qualificação"
                                        className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] uppercase font-bold tracking-widest text-text-muted ml-1">Identidade Visual</label>
                                    <div className="flex flex-wrap gap-4 px-2">
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
                                                    'w-8 h-8 rounded-full border-4 transition-all duration-300 shadow-soft',
                                                    color,
                                                    selectedColor === color
                                                        ? 'border-white scale-125 shadow-glow ring-2 ring-primary/20'
                                                        : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-10 lg:p-12 bg-bg-subtle/30 flex items-center justify-end gap-4 border-t border-primary/5">
                            <button onClick={handleCreateColumn} className="btn-primary w-full shadow-glow">
                                CRIAR COLUNA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
