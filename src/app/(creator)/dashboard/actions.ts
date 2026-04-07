'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getDashboardStats() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: {
            videos: true,
            contacts: true,
            opportunities: true,
            integracoes: true
        }
    })

    if (!profile) return null

    const totalDeals = profile.opportunities.reduce((acc: number, op: any) => acc + op.value, 0)
    
    return {
        metrics: [
            { label: 'Vídeos Gerados', value: profile.videos.length.toString(), change: '+0%', status: 'up' },
            { label: 'Leads Ativos', value: profile.contacts.length.toString(), change: '+0%', status: 'up' },
            { label: 'Valor do Funil', value: totalDeals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), change: '+0%', status: 'up' },
            { label: 'Integrações', value: profile.integracoes.length.toString(), change: 'Ativas', status: 'neutral' }
        ],
        recentActivity: (profile as any).videos.slice(0, 5).map((video: any) => ({
            id: video.id,
            user: profile.nome,
            action: 'gerou o vídeo',
            target: video.nome_produto,
            time: 'Recente',
            avatar: profile.nome.charAt(0)
        }))
    }
}
