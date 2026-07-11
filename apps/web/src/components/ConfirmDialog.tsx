"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onClose,
  onConfirm,
  isLoading
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-bg-void/80 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-glass-fill-strong backdrop-blur-xl border border-glass-border rounded-2xl p-6 shadow-2xl animate-fade-in-up"
      >
        <h2 className="text-xl font-heading text-text-primary mb-2">{title}</h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {description}
        </p>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={variant === "destructive" ? "destructive" : "default"} 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}
