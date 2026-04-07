'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function getContacts() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return []

    const profile = await prisma.profile.findUnique({
        where: { email: session.user.email },
        include: {
            contacts: {
                orderBy: { createdAt: 'desc' }
            }
        }
    })

    if (!profile) return []

    return profile.contacts.map(contact => ({
        id: contact.id,
        nome: contact.nome,
        empresa: contact.empresa || 'N/A',
        email: contact.email || contact.telefone || 'N/A',
        status: contact.status,
        canal: contact.canal || 'Geral',
        ultimaAtividade: new Date(contact.ultimaAtividade).toLocaleDateString('pt-BR'),
        avatar: contact.nome.substring(0, 2).toUpperCase()
    }))
}

export async function createContact(data: {
    nome: string,
    empresa: string,
    email: string,
    telefone: string,
    cargo: string,
    canal: string
}) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) throw new Error('Não autorizado')

    const profile = await prisma.profile.findUnique({ where: { email: session.user.email } })
    if (!profile) throw new Error('Perfil não encontrado')

    await prisma.contact.create({
        data: {
            ...data,
            userId: profile.id
        }
    })

    revalidatePath('/crm')
}
