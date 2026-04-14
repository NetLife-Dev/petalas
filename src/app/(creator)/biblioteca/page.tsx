'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Video, Download, Trash2, Play, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVideos, deleteVideo } from './actions'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import Link from 'next/link'

// ─── VideoFrameThumb ───────────────────────────────────────────
// Seeks to frame 0.5s to show a real thumbnail without canvas/CORS issues.
function VideoFrameThumb({ src }: { src: string }) {
    const ref = useRef<HTMLVideoElement>(null)
    const [ready, setReady] = useState(false)

    return (
        <div className="absolute inset-0 bg-[#2c1a1a]">
            <video
                ref={ref}
                src={src}
                preload="metadata"
                muted
                playsInline
                onLoadedMetadata={() => {
                    if (ref.current) ref.current.currentTime = 0.5
                }}
                onSeeked={() => setReady(true)}
                className="w-full h-full object-cover transition-opacity duration-500"
                style={{ display: 'block', opacity: ready ? 1 : 0 }}
            />
            {/* Placeholder visible while seeking */}
            {!ready && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/40 animate-spin"
                    />
                </div>
            )}
        </div>
    )
}

// ─── Filter tags ───────────────────────────────────────────────
const FILTERS = [
    { id: 'todos',       label: 'TODOS' },
    { id: 'concluido',   label: 'FINALIZADO' },
    { id: 'processando', label: 'PROCESSANDO' },
    { id: '15',          label: '15S' },
    { id: '20',          label: '20S' },
]

// ─── Helpers ───────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    concluido:   { label: 'FINALIZADO',   color: '#fff',    bg: '#B05070' },
    processando: { label: 'PROCESSANDO',  color: '#8C5C5C', bg: '#F5D5D5' },
    erro:        { label: 'ERRO',         color: '#fff',    bg: '#EF4444' },
}

const FORMAT_LABEL: Record<string, string> = {
    instagram: 'REELS',
    tiktok:    'TIKTOK',
    stories:   'STORIES',
    reels:     'REELS',
}

// ─── Phone Mockup (CSS-only, no external image) ───────────────
function PhoneMockup({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                position: 'relative',
                width: '220px',
                aspectRatio: '9/19',
                background: '#111',
                borderRadius: '36px',
                border: '3px solid #333',
                boxShadow: '0 0 0 6px #1a1a1a, 0 24px 64px rgba(0,0,0,0.6)',
                overflow: 'hidden',
                flexShrink: 0,
            }}
        >
            {/* Notch */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '72px',
                    height: '20px',
                    background: '#111',
                    borderRadius: '0 0 14px 14px',
                    zIndex: 10,
                }}
            />
            {/* Side button accents */}
            <div style={{ position: 'absolute', right: '-5px', top: '80px', width: '4px', height: '40px', background: '#2a2a2a', borderRadius: '0 2px 2px 0' }} />
            <div style={{ position: 'absolute', left: '-5px', top: '70px', width: '4px', height: '28px', background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
            <div style={{ position: 'absolute', left: '-5px', top: '106px', width: '4px', height: '28px', background: '#2a2a2a', borderRadius: '2px 0 0 2px' }} />
            {/* Screen content */}
            <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    )
}

// ─── Loading skeleton ──────────────────────────────────────────
function LoadingSkeleton() {
    return (
        <div className="min-h-screen p-6 lg:p-8 space-y-8" style={{ background: 'var(--color-bg-main)' }}>
            <div className="space-y-3">
                <div className="shimmer h-10 w-56 rounded-xl" />
                <div className="shimmer h-4 w-28 rounded" />
            </div>
            <div className="shimmer h-12 w-full max-w-lg rounded-full mx-auto" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div
                        key={i}
                        className="shimmer rounded-2xl"
                        style={{ aspectRatio: '9/16' }}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── Main Page ─────────────────────────────────────────────────
export default function BibliotecaPage() {
    const [videos, setVideos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [activeFilter, setActiveFilter] = useState('todos')
    const [selectedVideo, setSelectedVideo] = useState<any>(null)
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)

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

    useEffect(() => { fetchData() }, [])

    // Autoplay when modal opens
    useEffect(() => {
        if (selectedVideo && videoRef.current) {
            videoRef.current.play().catch(() => {})
        }
    }, [selectedVideo])

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

    const filteredVideos = videos.filter((v) => {
        const matchSearch = v.title.toLowerCase().includes(search.toLowerCase())
        if (!matchSearch) return false
        if (activeFilter === 'todos') return true
        if (activeFilter === '15') return v.duracao_s === 15
        if (activeFilter === '20') return v.duracao_s === 20
        return v.status === activeFilter
    })

    if (isLoading) return <LoadingSkeleton />

    return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto animate-fade-in">
            {/* ── Header ── */}
            <div className="space-y-10 mb-12">
                {/* Title row */}
                <div className="flex flex-col md:flex-row items-baseline justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-semibold text-text-primary italic font-display">Acervo</h1>
                        <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                           Galeria de Criações · {videos.length} Peças Digitais
                        </p>
                    </div>

                    <Link href="/criar" className="btn-primary px-8">
                        <Plus className="w-4 h-4 mr-1" />
                        NOVO VÍDEO
                    </Link>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted transition-colors group-focus-within:text-primary" />
                        <input
                            type="text"
                            placeholder="PESQUISAR NO STUDIO..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field pl-12 rounded-full border-primary/10 hover:border-primary/20 bg-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f.id)}
                                className={cn(
                                    'px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-200 border',
                                    activeFilter === f.id
                                        ? 'bg-primary text-white border-primary shadow-md'
                                        : 'bg-white text-text-muted border-primary/10 hover:border-primary/30 hover:text-primary'
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div>
                {filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center card bg-bg-subtle/50 border-none">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-soft">
                            <Video className="w-8 h-8 text-primary/30" />
                        </div>
                        <h3 className="text-xl font-semibold font-display italic text-text-primary mb-2">
                            {search ? 'Nenhuma peça encontrada' : 'O studio está pronto'}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.2em] font-bold text-text-muted">
                           Comece a tecer sua primeira criação
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {filteredVideos.map((video, idx) => {
                            const st = STATUS_MAP[video.status] ?? {
                                label: video.status?.toUpperCase() ?? '—',
                                color: '#fff',
                                bg: '#888',
                            }
                            return (
                                <div
                                    key={video.id}
                                    className="relative rounded-3xl overflow-hidden group cursor-pointer shadow-soft hover:shadow-2xl transition-all duration-500 border border-primary/5 bg-white"
                                    style={{
                                        aspectRatio: '9/16',
                                        animation: `slideUp 0.6s ease-out ${idx * 0.05}s both`,
                                    }}
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    {/* Thumbnail */}
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : video.video_url ? (
                                        <VideoFrameThumb src={video.video_url} />
                                    ) : (
                                        <div className="absolute inset-0 bg-bg-subtle flex items-center justify-center">
                                            <div className="w-16 h-24 border-2 border-dashed border-primary/10 rounded-2xl flex items-center justify-center">
                                                <Video className="w-6 h-6 text-primary/20" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-4 left-4 flex items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            video.status === 'concluido' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                                        )} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">
                                            {st.label}
                                        </span>
                                    </div>

                                    {/* Play icon */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                                            <Play className="w-6 h-6 text-white fill-white ml-1" />
                                        </div>
                                    </div>

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteTarget(video.id)
                                        }}
                                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 backdrop-blur-md text-white/60 hover:text-red-400 hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    {/* Bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[9px] font-bold text-white/60 tracking-widest uppercase">{video.duration || '15s'} edit</span>
                                            <div className="h-[1px] flex-1 bg-white/20" />
                                        </div>
                                        <h3 className="text-white font-semibold font-display italic text-lg leading-tight truncate">
                                            {video.title}
                                        </h3>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ── Modal ── */}
            {selectedVideo && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                    onClick={() => setSelectedVideo(null)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl animate-fade-in" />

                    <div
                        className="relative flex flex-col lg:flex-row w-full max-w-5xl rounded-[40px] overflow-hidden bg-white shadow-2xl animate-scale-up"
                        style={{ maxHeight: '90vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ── Left: Video Player ── */}
                        <div className="flex-1 bg-black flex items-center justify-center p-8 lg:p-12 relative group/video">
                             <div className="absolute top-8 left-8 z-10">
                                <span className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 backdrop-blur-md",
                                    selectedVideo.status === 'concluido' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                                )}>
                                    {selectedVideo.status === 'concluido' ? 'Pronto para Exportar' : 'Processando Studio'}
                                </span>
                             </div>

                             <div className="h-full aspect-[9/16] bg-zinc-900 rounded-[30px] shadow-2xl overflow-hidden border border-white/5 relative">
                                {selectedVideo.video_url ? (
                                    <video
                                        ref={videoRef}
                                        src={selectedVideo.video_url}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        playsInline
                                        muted
                                        loop
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/20">
                                        <Video className="w-12 h-12" />
                                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">O vídeo está sendo tecido...</p>
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* ── Right: Details ── */}
                        <div className="w-full lg:w-[400px] bg-white flex flex-col p-10 lg:p-12">
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="self-end p-2 text-text-muted hover:text-text-primary transition-colors border border-primary/10 rounded-full mb-4"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-10">
                                <h2 className="text-3xl font-semibold font-display italic text-text-primary mb-3">
                                    {selectedVideo.title}
                                </h2>
                                <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary">
                                    Curadoria Digital Doce Lilium
                                </p>
                            </div>

                            <div className="flex-1 space-y-6">
                                {[
                                    { label: 'Duração', value: selectedVideo.duracao_s ? `${selectedVideo.duracao_s}s Studio Edit` : '—' },
                                    { label: 'Formato',  value: FORMAT_LABEL[selectedVideo.formato] ?? 'Reels / TikTok' },
                                    { label: 'Status',   value: STATUS_MAP[selectedVideo.status]?.label ?? 'Processando' },
                                    { label: 'Studio Data', value: selectedVideo.date || 'Hoje' },
                                ].map((row) => (
                                    <div key={row.label}>
                                        <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted mb-1">{row.label}</p>
                                        <p className="text-sm font-semibold text-text-primary">{row.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 space-y-4">
                                {selectedVideo.video_url ? (
                                    <a
                                        href={selectedVideo.video_url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full btn-primary py-4 justify-center shadow-glow"
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        EXPORTAR HD
                                    </a>
                                ) : (
                                    <div className="w-full text-center py-4 rounded-full text-[10px] font-bold uppercase tracking-widest text-text-muted bg-bg-subtle border border-primary/10">
                                        AGUARDANDO FINALIZAÇÃO
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="w-full py-4 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                                >
                                    VOLTAR PARA ACERVO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteTarget}
                title="Excluir criação"
                description="Esta peça será removida permanentemente do studio. Esta ação não pode ser desfeita."
                confirmLabel="Excluir"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>

            {/* ── Confirm Delete ── */}
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
