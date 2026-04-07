'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getVideos() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: {
            videos: {
                orderBy: { created_at: 'desc' }
            }
        }
    })

    if (!profile) return []

    return profile.videos.map(video => ({
        id: video.id,
        title: video.nome_produto,
        status: video.status,
        date: new Date(video.created_at).toLocaleDateString('pt-BR'),
        thumbnail: video.imagem_produto_url || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop',
        duration: `${Math.floor(video.duracao / 60)}:${(video.duracao % 60).toString().padStart(2, '0')}`
    }))
}

export async function deleteVideo(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    await prisma.video.delete({
        where: { id }
    })
}
