import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/providers/SessionProvider'

const cormorant = Cormorant_Garamond({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-display',
    display: 'swap',
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Doce Lilium | Vídeo IA & CRM',
        template: '%s | Doce Lilium',
    },
    description:
        'Doce Lilium: Criação de vídeos UGC por Inteligência Artificial. Potencialize seu conteúdo e pipeline de vendas.',
    keywords: ['SaaS', 'CRM', 'IA', 'Inteligência Artificial', 'Vídeos AI', 'UGC', 'Marketing', 'Moda'],
    robots: 'index, follow',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt-BR" className={`${cormorant.variable} ${dmSans.variable}`}>
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
                                background: '#FFF0F0',
                                color: '#3D1A1A',
                                border: '1px solid #D4A0A0',
                                borderRadius: '16px',
                                fontSize: '14px',
                                boxShadow: '0 8px 32px rgba(176, 80, 112, 0.12)',
                                padding: '12px 16px',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#B05070',
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
