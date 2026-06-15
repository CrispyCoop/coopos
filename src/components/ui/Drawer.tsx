import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, width = 'md', children }: DrawerProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          'relative ml-auto bg-white h-full shadow-2xl overflow-y-auto flex flex-col',
          width === 'sm' && 'w-80',
          width === 'md' && 'w-[480px]',
          width === 'lg' && 'w-[640px]'
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
          {title && <h2 className="font-display text-xl text-dark">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto text-muted hover:text-mid transition-colors p-1"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
