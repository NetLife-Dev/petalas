import React from 'react'

export function Logo({ className }: { className?: string }) {
    return (
        <div className={className + " flex flex-col items-center justify-center"}>
            <svg 
                viewBox="0 0 100 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-auto max-h-32"
            >
                {/* Stylized Lily petals */}
                <path 
                    d="M50 90C70 90 90 60 90 40C90 20 75 10 50 10C25 10 10 20 10 40C10 60 30 90 50 90Z" 
                    fill="#B05070" 
                    fillOpacity="0.1" 
                />
                <path 
                    d="M50 85C65 85 80 60 80 45C80 30 70 20 50 20C30 20 20 30 20 45C20 60 35 85 50 85Z" 
                    fill="#B05070" 
                    fillOpacity="0.3" 
                />
                <path 
                    d="M50 80C60 80 70 60 70 50C70 40 60 35 50 35C40 35 30 40 30 50C30 60 40 80 50 80Z" 
                    fill="#B05070" 
                />
                
                {/* Stem */}
                <path d="M50 80V110" stroke="#7A8B63" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50 95C55 95 65 90 65 85" stroke="#7A8B63" strokeWidth="2" strokeLinecap="round"/>
                <path d="M50 100C45 100 35 95 35 90" stroke="#7A8B63" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="mt-4 flex flex-col items-center">
                <span className="text-xl italic font-display font-semibold text-primary leading-none">Doce Lilium</span>
                <span className="text-[8px] uppercase tracking-[0.4em] font-bold text-text-muted mt-1 opacity-60">Closet</span>
            </div>
        </div>
    )
}
