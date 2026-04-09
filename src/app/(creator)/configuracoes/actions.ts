'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// ─── Integrations / Webhooks ──────────────────────────────────────────────────

export async function getIntegrations() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: { integracoes: true },
    })

    return profile?.integracoes || []
}

export async function saveIntegration(tipo: string, webhookUrl: string, ativo: boolean) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    const profile = await prisma.profile.findUnique({ where: { email: session.user.email } })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.integracao.upsert({
        where: { user_id_tipo: { user_id: profile.id, tipo } },
        update: { token_acesso: webhookUrl, ativo },
        create: { user_id: profile.id, tipo, token_acesso: webhookUrl, ativo },
    })

    revalidatePath('/configuracoes')
}

export async function deleteIntegration(tipo: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    const profile = await prisma.profile.findUnique({ where: { email: session.user.email } })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.integracao.deleteMany({
        where: { user_id: profile.id, tipo },
    })

    revalidatePath('/configuracoes')
}

export async function getPipelineStages() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: {
            pipeline_stages: {
                orderBy: { order: 'asc' }
            }
        }
    })

    return profile?.pipeline_stages || []
}

export async function upsertPipelineStage(id: string | null, title: string, order: number) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    const profile = await prisma.profile.findUnique({ where: { email: session.user.email } })
    if (!profile) throw new Error('Perfil não encontrado')

    if (id) {
        await prisma.pipelineStage.update({
            where: { id },
            data: { title, order }
        })
    } else {
        await prisma.pipelineStage.create({
            data: {
                title,
                order,
                color: '#E11D48',
                userId: profile.id
            }
        })
    }

    revalidatePath('/configuracoes')
    revalidatePath('/pipeline')
}

export async function deletePipelineStage(id: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    await prisma.pipelineStage.delete({ where: { id } })

    revalidatePath('/configuracoes')
    revalidatePath('/pipeline')
}
