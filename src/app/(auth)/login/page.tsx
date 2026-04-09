'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { signIn, getSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(1, 'Senha é obrigatória'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true)
        try {
            const result = await signIn('credentials', {
                email: data.email,
                password: data.senha,
                redirect: false,
            })

            if (result?.error) {
                toast.error(
                    result.error === 'Conta inativa'
                        ? 'Sua conta está desativada. Contate o administrador'
                        : 'E-mail ou senha incorretos'
                )
                return
            }

            if (!result?.ok) {
                toast.error('Erro ao fazer login. Tente novamente')
                return
            }

            toast.success('Login realizado com sucesso!')
            const session = await getSession()
            if ((session?.user as any)?.perfil === 'admin') {
                router.push('/admin/dashboard')
            } else {
                router.push('/dashboard')
            }
            router.refresh()
        } catch {
            toast.error('Erro inesperado. Tente novamente')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary">Entrar na conta</h2>
                <p className="text-text-muted text-sm mt-1">
                    Use suas credenciais para acessar o painel.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="label">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            className={cn(
                                'input-field pl-9',
                                errors.email && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="label mb-0">Senha</label>
                        <Link
                            href="/esqueci-senha"
                            className="text-xs text-primary hover:underline font-medium"
                        >
                            Esqueceu a senha?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={cn(
                                'input-field pl-9 pr-10',
                                errors.senha && 'border-red-300 focus:border-red-400 focus:ring-red-100'
                            )}
                            {...register('senha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.senha && (
                        <p className="mt-1 text-xs text-red-500">{errors.senha.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remember"
                        className="w-4 h-4 rounded border-surface-200 text-primary focus:ring-primary/20 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-sm text-text-muted cursor-pointer">
                        Lembrar de mim
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3 justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Autenticando...
                        </>
                    ) : (
                        'Entrar'
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-primary hover:underline font-medium">
                    Criar conta
                </Link>
            </p>
        </div>
    )
}
