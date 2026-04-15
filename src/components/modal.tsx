import type { PropsWithChildren } from 'react'
import { createPortal } from 'react-dom'

import { Button } from './primitives'

type ModalProps = PropsWithChildren<{
  open: boolean
  title: string
  description: string
  onClose: () => void
}>

export function Modal({ open, title, description, onClose, children }: ModalProps) {
  if (!open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-8 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </div>
          <Button variant="ghost" className="px-3 py-2" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
