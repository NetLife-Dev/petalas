'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Loader2, Lock, Mail, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { cn } from '@/lib/utils'

const cadastroSchema = z
    .object({
        nome: z.string().min(3, 'Mínimo 3 caracteres'),
        email: z.string().email('E-mail inválido'),
        senha: z
            .string()
            .min(8, 'Mínimo 8 caracteres')
            .regex(/[A-Z]/, 'Precisa de ao menos 1 letra maiúscula')
            .regex(/[0-9]/, 'Precisa de ao menos 1 número')
            .regex(/[^A-Za-z0-9]/, 'Precisa de ao menos 1 caractere especial'),
        confirmarSenha: z.string(),
    })
    .refine((d) => d.senha === d.confirmarSenha, {
        message: 'As senhas não coincidem',
        path: ['confirmarSenha'],
    })

type CadastroForm = z.infer<typeof cadastroSchema>

const calculateStrength = (password: string) => {
    let strength = 0
    if (!password) return strength
    if (password.length >= 8) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
}

export default function CadastroPage() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CadastroForm>({ resolver: zodResolver(cadastroSchema) })

    const senhaValue = watch('senha', '')
    const strength = calculateStrength(senhaValue)

    const getStrengthColor = () => {
        if (strength <= 2) return 'bg-red-400'
        if (strength === 3) return 'bg-amber-400'
        return 'bg-emerald-500'
    }

    const getStrengthLabel = () => {
        if (strength === 0) return 'Digite uma senha'
        if (strength <= 2) return 'Senha fraca'
        if (strength === 3) return 'Senha média'
        return 'Senha forte'
    }

    const onSubmit = async (data: CadastroForm) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: data.nome,
                    email: data.email,
                    password: data.senha,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                toast.error(
                    result.error?.includes('Email já cadastrado') || result.error?.includes('already')
                        ? 'Este e-mail já existe. Tente fazer login.'
                        : result.error || 'Erro ao criar conta. Tente novamente.'
                )
                return
            }

            const signInResult = await signIn('credentials', {
                email: data.email,
                password: data.senha,
                redirect: false,
            })

            if (signInResult?.ok) {
                toast.success('Conta criada! Bem-vindo ao Pétalas.')
                router.push('/dashboard')
                router.refresh()
            } else {
                toast.success('Conta criada! Faça login para continuar.')
                router.push('/login')
            }
        } catch {
            toast.error('Erro ao criar conta. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-text-primary">Criar conta</h2>
                <p className="text-text-muted text-sm mt-1">
                    Comece a gerar conteúdo profissional com IA.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="label">Nome completo</label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="João Silva"
                            className={cn(
                                'input-field pl-9',
                                errors.nome && 'border-red-300'
                            )}
                            {...register('nome')}
                        />
                    </div>
                    {errors.nome && (
                        <p className="mt-1 text-xs text-red-500">{errors.nome.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="email"
                            placeholder="joao@empresa.com"
                            className={cn(
                                'input-field pl-9',
                                errors.email && 'border-red-300'
                            )}
                            {...register('email')}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            className={cn(
                                'input-field pl-9 pr-10',
                                errors.senha && 'border-red-300'
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

                    {/* Strength meter */}
                    <div className="mt-2">
                        <div className="flex gap-1 h-1">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={cn(
                                        'flex-1 rounded-full transition-colors duration-300',
                                        strength >= level ? getStrengthColor() : 'bg-surface-200'
                                    )}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-text-muted mt-1">{getStrengthLabel()}</p>
                    </div>

                    {errors.senha && (
                        <p className="mt-1 text-xs text-red-500">{errors.senha.message}</p>
                    )}
                </div>

                <div>
                    <label className="label">Confirmar senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type={showConfirm ? 'text' : 'password'}
                            placeholder="Repita a senha"
                            className={cn(
                                'input-field pl-9 pr-10',
                                errors.confirmarSenha && 'border-red-300'
                            )}
                            {...register('confirmarSenha')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.confirmarSenha && (
                        <p className="mt-1 text-xs text-red-500">{errors.confirmarSenha.message}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary py-3 justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Criando conta...
                        </>
                    ) : (
                        <>
                            Criar Conta
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-text-muted">
                Já tem uma conta?{' '}
                <Link href="/login" className="text-primary hover:underline font-medium">
                    Entrar
                </Link>
            </p>
        </div>
    )
}
