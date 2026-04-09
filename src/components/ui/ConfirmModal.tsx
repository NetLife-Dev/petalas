'use client'

import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
    isOpen: boolean
    title: string
    description: string
    confirmLabel?: string
    onConfirm: () => void
    onCancel: () => void
    isDestructive?: boolean
}

export function ConfirmModal({
    isOpen,
    title,
    description,
    confirmLabel = 'Confirmar',
    onConfirm,
    onCancel,
    isDestructive = true,
}: ConfirmModalProps) {
    if (!isOpen) return null

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-panel max-w-sm animate-scale-in">
                <div className="modal-body text-center flex flex-col items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDestructive ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <AlertTriangle className={`w-6 h-6 ${isDestructive ? 'text-red-500' : 'text-amber-500'}`} />
                    </div>
                    <div>
                        <h3 id="confirm-title" className="text-base font-semibold text-text-primary">{title}</h3>
                        <p className="text-sm text-text-muted mt-1">{description}</p>
                    </div>
                </div>
                <div className="modal-footer justify-center gap-3">
                    <button onClick={onCancel} className="btn-secondary flex-1">
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 font-medium px-5 py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors ${
                            isDestructive
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'btn-primary'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
