import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/providers/SessionProvider'

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Pétalas | Vídeo IA & CRM',
        template: '%s | Pétalas',
    },
    description:
        'Pétalas: A próxima geração de CRM com criação de vídeos por Inteligência Artificial. Potencialize seu pipeline de vendas e conteúdo.',
    keywords: [
        'SaaS',
        'CRM',
        'IA',
        'Inteligência Artificial',
        'Vídeos AI',
        'Marketing',
        'Vendas',
    ],
    robots: 'index, follow',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR" className={outfit.variable}>
            <head>
                {/* Apply theme before first paint to avoid FOUC */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');} }catch(e){}})();`,
                    }}
                />
            </head>
            <body className="font-sans antialiased selection:bg-primary/20 selection:text-primary">
                <Providers>
                    {children}
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: '#ffffff',
                                color: '#111827',
                                border: '1px solid #e5e7eb',
                                borderRadius: '16px',
                                fontSize: '14px',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                padding: '12px 16px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#E11D48',
                                    secondary: '#ffffff',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#ffffff',
                                },
                            },
                        }}
                    />
                </Providers>
            </body>
        </html>
    )
}
