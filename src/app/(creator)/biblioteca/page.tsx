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
        <div
            className="min-h-screen animate-fade-bloom"
            style={{ background: 'var(--color-bg-main)' }}
        >
            {/* ── Header ── */}
            <div className="px-6 lg:px-10 pt-8 pb-6 space-y-6">
                {/* Title row */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1
                            className="text-4xl font-bold uppercase tracking-wider leading-none"
                            style={{
                                fontFamily: 'var(--font-display), serif',
                                fontStyle: 'italic',
                                color: 'var(--color-text-main)',
                            }}
                        >
                            Acervo
                        </h1>
                        <p
                            className="mt-1.5 text-xs uppercase tracking-widest"
                            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
                        >
                            {videos.length} {videos.length === 1 ? 'criação' : 'criações'}
                        </p>
                    </div>

                    <Link href="/criar" className="btn-primary whitespace-nowrap flex-shrink-0">
                        <Plus className="w-4 h-4" />
                        Novo Vídeo
                    </Link>
                </div>

                {/* Search */}
                <div className="relative max-w-lg">
                    <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'var(--color-text-tertiary)' }}
                    />
                    <input
                        type="text"
                        placeholder="BUSCAR NO ACERVO..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-5 py-3 rounded-full text-xs font-semibold uppercase tracking-widest focus:outline-none transition-all"
                        style={{
                            background: 'rgba(255,255,255,0.7)',
                            border: '1px solid var(--color-border-solid)',
                            color: 'var(--color-text-main)',
                            fontFamily: 'var(--font-sans)',
                        }}
                    />
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className="px-4 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-widest transition-all duration-150"
                            style={
                                activeFilter === f.id
                                    ? {
                                          background: 'var(--color-primary)',
                                          color: '#fff',
                                          border: '1px solid var(--color-primary)',
                                      }
                                    : {
                                          background: 'rgba(255,255,255,0.6)',
                                          color: 'var(--color-text-secondary)',
                                          border: '1px solid var(--color-border-solid)',
                                      }
                            }
                        >
                            #{f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="px-6 lg:px-10 pb-10">
                {filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(176,80,112,0.10)' }}
                        >
                            <Video className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <h3
                            className="text-lg font-bold uppercase tracking-wide"
                            style={{ color: 'var(--color-text-main)' }}
                        >
                            {search ? 'Sem resultados' : 'Acervo vazio'}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {search
                                ? `Nenhum vídeo encontrado para "${search}"`
                                : 'Crie seu primeiro vídeo UGC com IA.'}
                        </p>
                        {!search && (
                            <Link href="/criar" className="btn-primary mt-5">
                                <Plus className="w-4 h-4" />
                                Criar Vídeo
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredVideos.map((video, idx) => {
                            const st = STATUS_MAP[video.status] ?? {
                                label: video.status?.toUpperCase() ?? '—',
                                color: '#fff',
                                bg: '#888',
                            }
                            return (
                                <div
                                    key={video.id}
                                    className="relative rounded-2xl overflow-hidden group cursor-pointer"
                                    style={{
                                        aspectRatio: '9/16',
                                        background: '#1a0a0f',
                                        animation: `slideUp 0.4s ease-out ${idx * 0.04}s both`,
                                    }}
                                    onClick={() => setSelectedVideo(video)}
                                >
                                    {/* Thumbnail — product image > video frame > placeholder */}
                                    {video.thumbnail ? (
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                                        />
                                    ) : video.video_url ? (
                                        <VideoFrameThumb src={video.video_url} />
                                    ) : (
                                        <div className="absolute inset-0 bg-[#2c1a1a] flex items-center justify-center">
                                            <Video className="w-10 h-10 opacity-20 text-white" />
                                        </div>
                                    )}

                                    {/* Bottom gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                                    {/* Hover brighten overlay */}
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/8 transition-colors duration-300" />

                                    {/* Play icon on hover */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{
                                                background: 'rgba(255,255,255,0.18)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1.5px solid rgba(255,255,255,0.35)',
                                            }}
                                        >
                                            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                        </div>
                                    </div>

                                    {/* Delete button — top right, hover only */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setDeleteTarget(video.id)
                                        }}
                                        className="absolute top-2.5 right-2.5 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        style={{
                                            background: 'rgba(0,0,0,0.45)',
                                            backdropFilter: 'blur(4px)',
                                        }}
                                        aria-label="Excluir"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 text-white/80" />
                                    </button>

                                    {/* Bottom info */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            {/* Status badge */}
                                            <span
                                                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                style={{ background: st.bg, color: st.color }}
                                            >
                                                {st.label}
                                            </span>
                                            {/* Duration badge */}
                                            {video.duration && video.duration !== '—' && (
                                                <span
                                                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.15)',
                                                        color: '#fff',
                                                        backdropFilter: 'blur(4px)',
                                                    }}
                                                >
                                                    {video.duration}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-white font-bold uppercase text-[11px] tracking-wide leading-snug line-clamp-2">
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
                    className="fixed inset-0 z-50 flex animate-fade-bloom"
                    style={{ background: 'rgba(20, 8, 14, 0.92)', backdropFilter: 'blur(12px)' }}
                    onClick={() => setSelectedVideo(null)}
                >
                    <div
                        className="relative flex flex-col md:flex-row w-full max-w-4xl m-auto rounded-3xl overflow-hidden"
                        style={{ maxHeight: '92vh' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* ── Left: Phone mockup + player ── */}
                        <div
                            className="flex-1 flex flex-col items-center justify-center gap-6 p-8 md:p-10"
                            style={{ background: '#0f0608' }}
                        >
                            {/* Video label */}
                            <div className="flex items-center gap-2 self-start">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ background: selectedVideo.status === 'concluido' ? '#B05070' : '#F5D5D5' }}
                                />
                                <span
                                    className="text-xs uppercase tracking-widest font-semibold"
                                    style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-sans)' }}
                                >
                                    {selectedVideo.title}
                                </span>
                            </div>

                            {/* Phone frame */}
                            <PhoneMockup>
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
                                        style={{ display: 'block' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <Video className="w-8 h-8 text-white/20" />
                                    </div>
                                )}
                            </PhoneMockup>
                        </div>

                        {/* ── Right: Details panel ── */}
                        <div
                            className="w-full md:w-80 flex flex-col p-8 md:p-10 relative"
                            style={{ background: '#1a0a0f' }}
                        >
                            {/* Close */}
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-5 right-5 p-1.5 rounded-full transition-colors"
                                style={{
                                    background: 'rgba(255,255,255,0.08)',
                                    color: 'rgba(255,255,255,0.6)',
                                }}
                                aria-label="Fechar"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Title */}
                            <div className="mt-2 mb-5">
                                <h2
                                    className="text-2xl font-bold uppercase leading-tight mb-3"
                                    style={{
                                        fontFamily: 'var(--font-display), serif',
                                        fontStyle: 'italic',
                                        color: '#fff',
                                        letterSpacing: '0.03em',
                                    }}
                                >
                                    {selectedVideo.title}
                                </h2>

                                {/* Category badge */}
                                <span
                                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                    style={{ background: 'rgba(176,80,112,0.25)', color: '#D490A8' }}
                                >
                                    #{FORMAT_LABEL[selectedVideo.formato] ?? 'UGC'}
                                </span>
                            </div>

                            {/* Metadata list */}
                            <div
                                className="flex-1 space-y-0"
                                style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
                            >
                                {[
                                    {
                                        label: 'DURAÇÃO',
                                        value: selectedVideo.duracao_s
                                            ? `${selectedVideo.duracao_s} SEGUNDOS`
                                            : '—',
                                    },
                                    {
                                        label: 'FORMATO',
                                        value: FORMAT_LABEL[selectedVideo.formato] ?? selectedVideo.formato?.toUpperCase() ?? '—',
                                    },
                                    { label: 'STATUS',  value: STATUS_MAP[selectedVideo.status]?.label ?? selectedVideo.status },
                                    { label: 'DATA',    value: selectedVideo.date },
                                ].map((row) => (
                                    <div
                                        key={row.label}
                                        className="flex items-center justify-between py-3.5"
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                                    >
                                        <span
                                            className="text-[10px] uppercase tracking-widest font-semibold"
                                            style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-sans)' }}
                                        >
                                            {row.label}
                                        </span>
                                        <span
                                            className="text-xs font-bold uppercase tracking-wide"
                                            style={{ color: 'rgba(255,255,255,0.80)' }}
                                        >
                                            {row.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-6 space-y-3">
                                {selectedVideo.video_url ? (
                                    <a
                                        href={selectedVideo.video_url}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full font-bold uppercase text-sm tracking-widest transition-all duration-200 hover:scale-[1.02]"
                                        style={{
                                            background: 'var(--color-primary)',
                                            color: '#fff',
                                            fontFamily: 'var(--font-sans)',
                                        }}
                                    >
                                        <Download className="w-4 h-4" />
                                        Exportar HD
                                    </a>
                                ) : (
                                    <div
                                        className="w-full text-center py-3 rounded-full text-sm uppercase tracking-widest font-bold opacity-40"
                                        style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
                                    >
                                        Aguardando geração
                                    </div>
                                )}

                                <button
                                    onClick={() => setSelectedVideo(null)}
                                    className="w-full text-center text-xs uppercase tracking-widest font-semibold py-2 transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.30)', fontFamily: 'var(--font-sans)' }}
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
