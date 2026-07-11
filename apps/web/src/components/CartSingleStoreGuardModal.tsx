"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export interface CartSingleStoreGuardModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  newStoreName: string
}

export function CartSingleStoreGuardModal({ isOpen, onClose, onConfirm, newStoreName }: CartSingleStoreGuardModalProps) {
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
        className="relative w-full max-w-md bg-glass-fill-strong backdrop-blur-xl border border-glass-border rounded-3xl p-6 shadow-2xl animate-fade-in-up"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-warning/10 text-warning flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div>
            <h2 className="text-xl font-heading text-text-primary">Change Store?</h2>
            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              You are adding a product from <span className="text-text-primary font-medium">{newStoreName}</span>. 
              Because products must be shipped together, your current cart from another store will be <strong className="text-danger font-semibold">cleared</strong> if you proceed.
            </p>
          </div>
          
          <div className="flex gap-3 w-full pt-4">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" className="flex-1" onClick={onConfirm}>
              Clear & Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
