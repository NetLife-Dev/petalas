'use client'

import { useState, useEffect } from 'react'
import {
    Search,
    Video,
    Download,
    Trash2,
    MoreHorizontal,
    Play,
    X,
    Clock,
    Zap,
    LayoutGrid,
    Calendar,
    ChevronDown,
    Plus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVideos, deleteVideo } from './actions'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function BibliotecaPage() {
    const [videos, setVideos] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedVideo, setSelectedVideo] = useState<any>(null)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const data = await getVideos()
            setVideos(data)
        } catch (error) {
            toast.error('Erro ao carregar biblioteca')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir?')) return
        try {
            await deleteVideo(id)
            toast.success('Vídeo excluído')
            fetchData()
        } catch (error) {
            toast.error('Erro ao excluir vídeo')
        }
    }

    const filteredVideos = videos.filter(v => 
        v.title.toLowerCase().includes(search.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin text-rose-500">
                    <Zap className="w-12 h-12" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-10 max-w-[1400px] mx-auto animate-fade-in bg-transparent min-h-screen text-slate-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Video className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Biblioteca</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Meus Projetos • {videos.length} Arquivos</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none md:w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Buscar vídeos..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-5 text-sm font-bold text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 transition-all font-outfit uppercase tracking-widest text-[10px]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Link href="/criar" className="bg-rose-600 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] shadow-xl shadow-rose-500/20 hover:bg-rose-500 transition-all flex items-center gap-2 uppercase tracking-widest">
                        <Plus className="w-4 h-4" />
                        Novo Vídeo
                    </Link>
                </div>
            </div>

            {/* Grid de Vídeos */}
            {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-40 text-center grayscale opacity-30">
                    <Video className="w-16 h-16 text-slate-400 mb-6" />
                    <h3 className="text-xl font-black uppercase tracking-widest">Nenhum vídeo encontrado</h3>
                    <p className="text-slate-500 font-bold mt-2">Sua biblioteca está pronta para florescer!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="group bg-white rounded-[40px] p-5 shadow-soft border border-slate-100 hover:border-rose-500/30 transition-all relative">
                            {/* Thumbnail Overlay */}
                            <div 
                                className="relative aspect-[9/16] rounded-[32px] overflow-hidden bg-slate-100 mb-6 cursor-pointer group-hover:shadow-2xl transition-all"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={video.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white">
                                        <Play className="w-6 h-6 fill-current" />
                                    </div>
                                </div>
                                <div className="absolute top-4 left-4 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">{video.status}</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black text-slate-900 truncate uppercase mt-1">{video.title}</h4>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{video.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">{video.duration}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(video.id)}
                                    className="p-3 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Preview (Opcional, mas premium) */}
            {selectedVideo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl animate-fade-in">
                    <div className="bg-white border border-slate-200 rounded-[48px] w-full max-w-lg shadow-2xl overflow-hidden relative animate-scale-in">
                        <button 
                            onClick={() => setSelectedVideo(null)}
                            className="absolute top-8 right-8 z-50 p-4 bg-white/10 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        
                        <div className="aspect-[9/16] bg-slate-900 relative">
                            <img src={selectedVideo.thumbnail} className="w-full h-full object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-16 h-16 text-white opacity-40" />
                            </div>
                        </div>
                        
                        <div className="p-10 bg-slate-50 flex gap-4">
                            <button className="flex-1 bg-rose-600 text-white py-4 rounded-3xl font-black shadow-lg shadow-rose-500/20 hover:bg-rose-500 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                <Download className="w-5 h-5" />
                                Download HD
                            </button>
                            <button 
                                onClick={() => setSelectedVideo(null)}
                                className="flex-1 bg-white border border-slate-200 text-slate-400 font-black py-4 rounded-3xl hover:text-slate-900 transition-all uppercase tracking-widest text-xs"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
