'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function getDashboardStats() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return null

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: {
            videos: { orderBy: { created_at: 'desc' } },
            contacts: true,
            opportunities: true,
            integracoes: true
        }
    })

    if (!profile) return null

    const totalDeals = profile.opportunities.reduce((acc: number, op: any) => acc + op.value, 0)

    // Build last-8-months chart data
    const now = new Date()
    const chartData = Array.from({ length: 8 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 7 + i, 1)
        const year = d.getFullYear()
        const month = d.getMonth()
        const count = profile.videos.filter((v: any) => {
            const vd = new Date(v.created_at)
            return vd.getFullYear() === year && vd.getMonth() === month
        }).length
        return { month: MONTHS_PT[month], count }
    })

    const maxCount = Math.max(...chartData.map((d) => d.count), 1)
    const chartDataNormalized = chartData.map((d) => ({
        month: d.month,
        val: Math.round((d.count / maxCount) * 100),
        count: d.count,
    }))

    return {
        metrics: [
            { label: 'Vídeos Gerados', value: profile.videos.length.toString(), change: '+0%', status: 'up' },
            { label: 'Leads Ativos', value: profile.contacts.length.toString(), change: '+0%', status: 'up' },
            { label: 'Valor do Funil', value: totalDeals.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), change: '+0%', status: 'up' },
            { label: 'Integrações', value: profile.integracoes.length.toString(), change: 'Ativas', status: 'neutral' }
        ],
        chartData: chartDataNormalized,
        recentActivity: profile.videos.slice(0, 5).map((video: any) => ({
            id: video.id,
            user: profile.nome,
            action: 'gerou o vídeo',
            target: video.nome_produto,
            time: 'Recente',
            avatar: profile.nome.charAt(0)
        }))
    }
}
