'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
    Upload,
    X,
    Sparkles,
    ArrowRight,
    Play,
    CheckCircle2,
    Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const steps = [
    { num: '01', label: 'Nome e Identidade' },
    { num: '02', label: 'Foto do Produto' },
    { num: '03', label: 'Duração' },
]

export default function CriarPage() {
    const router = useRouter()

    const [productName, setProductName] = useState('')
    const [duration, setDuration] = useState('15s')
    const [productPhoto, setProductPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [isGenerating, setIsGenerating] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProductPhoto(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleGenerate = async () => {
        if (!productName) {
            toast.error('Por favor, informe o nome do produto')
            return
        }
        if (!productPhoto) {
            toast.error('Por favor, adicione uma foto do produto')
            return
        }
        setIsGenerating(true)

        try {
            // 1. Cria registro no banco com status "processando"
            const res = await fetch('/api/creator/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome_produto: productName,
                    descricao_produto: 'Gerado via IA',
                    formato: 'instagram',
                    linha_editorial: 'Geral',
                    duracao: parseInt(duration),
                    tom: 'Vibrante',
                }),
            })

            if (!res.ok) throw new Error('Erro ao criar registro do vídeo')
            const { id: videoId } = await res.json()

            // 2. Dispara o webhook do n8n com a imagem como binário (multipart/form-data)
            const webhookData = new FormData()
            webhookData.append('nomeProduto', productName)
            webhookData.append('videoId', videoId)
            webhookData.append('image', productPhoto)

            fetch('https://auto.devnetlife.com/webhook/docelilium', {
                method: 'POST',
                body: webhookData,
            }).catch(err => console.error('n8n webhook error:', err))

            toast.success('Vídeo enviado para geração! Acompanhe na Biblioteca.')
            router.push('/biblioteca')
        } catch {
            toast.error('Ocorreu um erro ao iniciar a geração')
            setIsGenerating(false)
        }
    }

    const activeStep = !productName ? 0 : !productPhoto ? 1 : 2

    return (
        <div className="p-8 lg:p-12 max-w-[1400px] mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-semibold text-text-primary italic font-display">Criar Novo Vídeo</h1>
                <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-2">
                    Geração de Conteúdo Inteligente · Studio Doce Lilium
                </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-12">
                {/* Left — Form */}
                <div className="flex-1 space-y-12">
                    {/* Progress steps */}
                    <div className="flex items-center">
                        {steps.map((step, i) => (
                            <div key={step.num} className="flex items-center">
                                <div className="flex flex-col items-center gap-2 group">
                                    <div
                                        className={cn(
                                            'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2',
                                            i < activeStep
                                                ? 'bg-primary border-primary text-white scale-90 opacity-50'
                                                : i === activeStep
                                                ? 'bg-primary border-primary text-white shadow-glow translate-y-[-2px]'
                                                : 'bg-white border-primary/20 text-text-muted'
                                        )}
                                    >
                                        {i < activeStep ? (
                                            <CheckCircle2 className="w-5 h-5" />
                                        ) : (
                                            step.num
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            'text-[10px] uppercase tracking-widest font-bold whitespace-nowrap',
                                            i === activeStep
                                                ? 'text-primary'
                                                : 'text-text-muted'
                                        )}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            'h-[2px] w-12 sm:w-20 mx-4 transition-colors mb-6',
                                            i < activeStep ? 'bg-primary' : 'bg-primary/10'
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-8">
                            {/* Step 01 */}
                            <section className="card p-8 border-primary/10 hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-2xl font-semibold font-display italic text-text-secondary">Nome do Projeto</h3>
                                </div>
                                <div>
                                    <label className="label">Título da Peça</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Coleção Outono 2024"
                                        className="input-field rounded-full px-6 py-4 bg-bg-subtle/30"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                    />
                                </div>
                            </section>

                            {/* Step 03 */}
                            <section className="card p-8 border-primary/10 hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-2xl font-semibold font-display italic text-text-secondary">Duração</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { val: '15s', label: 'Curto', desc: 'Stories' },
                                        { val: '20s', label: 'Padrão', desc: 'Feed/Reels' },
                                    ].map((d) => (
                                        <button
                                            key={d.val}
                                            onClick={() => setDuration(d.val)}
                                            className={cn(
                                                'p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all group',
                                                duration === d.val
                                                    ? 'border-primary bg-primary/5 scale-[1.02]'
                                                    : 'border-primary/10 bg-white hover:border-primary/30'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'text-xl font-bold tracking-tight',
                                                    duration === d.val
                                                        ? 'text-primary'
                                                        : 'text-text-primary'
                                                )}
                                            >
                                                {d.val}
                                            </span>
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">{d.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Step 02 */}
                        <section className="card p-8 border-primary/10 hover:border-primary/20 transition-all flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <h3 className="text-2xl font-semibold font-display italic text-text-secondary">Referência Visual</h3>
                            </div>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 w-full rounded-2xl border-2 border-dashed border-primary/20 bg-bg-subtle/30 hover:border-primary/40 hover:bg-white transition-all flex flex-col items-center justify-center gap-4 cursor-pointer p-8 relative overflow-hidden group"
                            >
                                {photoPreview ? (
                                    <div className="absolute inset-0">
                                        <img
                                            src={photoPreview}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            alt="Preview"
                                        />
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPhotoPreview(null)
                                                    setProductPhoto(null)
                                                }}
                                                className="p-3 bg-white rounded-full text-red-500 shadow-xl"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-soft border border-primary/5">
                                            <Upload className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-primary">
                                                ADICIONAR PEÇA
                                            </p>
                                            <p className="text-[10px] text-text-muted mt-2 font-semibold">
                                                PNG, JPG OU WEBP ATÉ 10MB
                                            </p>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </section>
                    </div>
                </div>

                {/* Right — Preview & Action */}
                <div className="w-full xl:w-[480px] space-y-6">
                    <div className="card p-8 border-primary/10 bg-white relative overflow-hidden">
                        {isGenerating && (
                            <div className="absolute inset-0 bg-white/95 z-40 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm animate-fade-in">
                                <div className="w-16 h-16 rounded-full border-[3px] border-primary/10 border-t-primary animate-spin mb-8" />
                                <h2 className="text-2xl font-semibold text-text-primary italic font-display mb-2">
                                    Tecendo seu vídeo...
                                </h2>
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">
                                    Finalizando a curadoria da IA
                                </p>
                            </div>
                        ) || (
                           <>
                             <div className="mb-8 flex items-baseline justify-between border-b border-primary/5 pb-4">
                                <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted italic">Preview do Studio</p>
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                             </div>

                             <div className="aspect-[9/16] bg-bg-subtle rounded-3xl relative overflow-hidden shadow-2xl group border border-primary/5 mb-10 mx-auto max-w-[300px]">
                                {photoPreview ? (
                                    <>
                                        <img
                                            src={photoPreview}
                                            className="w-full h-full object-cover transition-all duration-700"
                                            alt="Preview"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-6 left-6 right-6 text-white">
                                            <p className="text-lg font-bold font-display italic leading-tight mb-1 truncate">
                                                {productName || 'Nome do Produto'}
                                            </p>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">{duration} studio edit</span>
                                                <div className="h-1 w-12 bg-white/30 rounded-full" />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 text-text-muted opacity-30">
                                        <div className="w-20 h-28 border-2 border-dashed border-primary/40 rounded-2xl flex items-center justify-center">
                                            <Video className="w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] uppercase tracking-widest font-bold">Aguardando curadoria</p>
                                    </div>
                                )}
                             </div>

                             <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !productName}
                                className="w-full btn-primary py-5 justify-center tracking-[0.3em] shadow-glow"
                             >
                                <Sparkles className="w-4 h-4 mr-2" />
                                GERAR VÍDEO
                             </button>
                           </>
                        )}
                    </div>

                    <div className="card bg-bg-subtle/50 p-6 border-none">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3 italic">Dica do Studio</p>
                        <p className="text-xs text-text-secondary leading-relaxed font-medium italic">
                            "Imagens com fundos neutros e iluminação suave resultam em criações com estética superior para marcas de luxo."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
