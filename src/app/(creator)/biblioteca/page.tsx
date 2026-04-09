'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Video,
    Download,
    Trash2,
    Play,
    X,
    Clock,
    Calendar,
    Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVideos, deleteVideo } from './actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function BibliotecaPage() {
    const [videos, setVideos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedVideo, setSelectedVideo] = useState<any>(null)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = await getVideos()
            setVideos(data)
        } catch {
            toast.error('Erro ao carregar biblioteca')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return
        const id = deleteTarget
        setDeleteTarget(null)
        try {
            await deleteVideo(id)
            toast.success('Vídeo excluído')
            fetchData()
        } catch {
            toast.error('Erro ao excluir vídeo')
        }
    }

    const filteredVideos = videos.filter((v) =>
        v.title.toLowerCase().includes(search.toLowerCase())
    )

    const statusConfig: Record<string, { label: string; dot: string }> = {
        concluido: { label: 'Concluído', dot: 'bg-emerald-500' },
        processando: { label: 'Processando', dot: 'bg-amber-500' },
        erro: { label: 'Erro', dot: 'bg-red-500' },
    }

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="shimmer h-7 w-32 rounded-lg" />
                        <div className="shimmer h-4 w-24 rounded" />
                    </div>
                    <div className="shimmer h-10 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="card p-0 overflow-hidden">
                            <div className="shimmer aspect-video w-full" />
                            <div className="p-4 space-y-2">
                                <div className="shimmer h-4 w-3/4 rounded" />
                                <div className="shimmer h-3 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Biblioteca</h1>
                    <p className="text-text-muted text-sm mt-0.5">{videos.length} {videos.length === 1 ? 'projeto' : 'projetos'}</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                        <input
                            type="text"
                            placeholder="Buscar vídeos..."
                            className="input-field pl-9 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link href="/criar" className="btn-primary whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        Novo Vídeo
                    </Link>
                </div>
            </div>

            {/* Grid */}
            {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-14 h-14 rounded-xl bg-surface-100 flex items-center justify-center mb-4">
                        <Video className="w-7 h-7 text-text-tertiary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                        {search ? 'Nenhum resultado encontrado' : 'Biblioteca vazia'}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">
                        {search ? `Sem resultados para "${search}"` : 'Crie seu primeiro vídeo com IA.'}
                    </p>
                    {!search && (
                        <Link href="/criar" className="btn-primary mt-4">
                            <Plus className="w-4 h-4" />
                            Criar Vídeo
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredVideos.map((video) => {
                        const sCfg = statusConfig[video.status] || {
                            label: video.status,
                            dot: 'bg-surface-300',
                        }
                        return (
                            <div
                                key={video.id}
                                className="bg-surface border border-surface-200 rounded-xl overflow-hidden hover:border-surface-300 hover:shadow-soft transition-all group"
                                style={{ boxShadow: 'var(--shadow-card)' }}
                            >
                                {/* Thumbnail */}
                                <div
                                    className="relative aspect-video bg-surface-100 cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={video.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Video className="w-8 h-8 text-text-tertiary" />
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>

                                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                                        <div className={cn('w-1.5 h-1.5 rounded-full', sCfg.dot)} />
                                        <span className="text-[10px] font-medium text-white">
                                            {sCfg.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-text-primary truncate">
                                                {video.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <div className="flex items-center gap-1 text-text-muted">
                                                    <Calendar className="w-3 h-3" />
                                                    <span className="text-xs">{video.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-text-muted">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-xs">{video.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setDeleteTarget(video.id)}
                                            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                            aria-label="Excluir vídeo"
                                            title="Excluir vídeo"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Preview Modal */}
            {selectedVideo && (
                <div className="modal-overlay" onClick={() => setSelectedVideo(null)}>
                    <div className="modal-panel max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="section-title truncate">{selectedVideo.title}</h3>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg transition-colors"
                                aria-label="Fechar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="aspect-video bg-black relative">
                            {selectedVideo.thumbnail && (
                                <img
                                    src={selectedVideo.thumbnail}
                                    className="w-full h-full object-contain"
                                    alt={selectedVideo.title}
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-12 h-12 text-white opacity-40" />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-primary flex-1 justify-center">
                                <Download className="w-4 h-4" />
                                Download HD
                            </button>
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="btn-secondary flex-1 justify-center"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Excluir vídeo"
                description="Esta ação é irreversível. O vídeo será removido permanentemente."
                confirmLabel="Excluir"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    )
}
