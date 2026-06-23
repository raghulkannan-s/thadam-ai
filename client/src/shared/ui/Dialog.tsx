import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Dialog({ open, onOpenChange, children }: { open: boolean, onOpenChange: (open: boolean) => void, children: React.ReactNode }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => onOpenChange(false)}
          />
          <div className="relative z-50 w-full flex justify-center pointer-events-none">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                // Pass onClose to DialogContent so it can use the X button
                return React.cloneElement(child as React.ReactElement<any>, { onClose: () => onOpenChange(false) });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function DialogContent({ children, className, onClose }: { children: React.ReactNode, className?: string, onClose?: () => void }) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      className={`pointer-events-auto w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] p-6 shadow-2xl border border-[var(--border-subtle)] relative overflow-hidden ${className || ''}`}
    >
      <button 
        onClick={onClose} 
        className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors z-10"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
      {children}
    </motion.div>
  );
}

export function DialogHeader({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col space-y-2 text-center sm:text-left mb-6 pr-6 ${className || ''}`}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={`text-xl font-bold tracking-tight text-[var(--text-primary)] ${className || ''}`}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode, className?: string }) {
  return <p className={`text-sm text-[var(--text-secondary)] leading-relaxed ${className || ''}`}>{children}</p>;
}

export function DialogFooter({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-8 pt-4 border-t border-[var(--border-subtle)] ${className || ''}`}>{children}</div>;
}
