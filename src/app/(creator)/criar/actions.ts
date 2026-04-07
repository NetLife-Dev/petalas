'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function saveGeneratedVideo(data: {
    titulo: string,
    thumbnail?: string,
    status: 'processando' | 'concluido' | 'erro'
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    const profile = await prisma.profile.findUnique({ where: { email: session.user.email } })
    if (!profile) throw new Error('Perfil não encontrado')

    // Matching schema.prisma Video model
    const video = await prisma.video.create({
        data: {
            nome_produto: data.titulo,
            descricao_produto: 'Gerado via IA',
            formato: 'instagram',
            duracao: 30,
            linha_editorial: 'Geral',
            tom: 'Vibrante',
            imagem_produto_url: data.thumbnail || 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop',
            status: data.status,
            user_id: profile.id
        }
    })

    revalidatePath('/biblioteca')
    return video
}
