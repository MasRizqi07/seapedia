"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface VoucherInputFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  onApply: (code: string) => Promise<boolean>
  onRemove: () => void
}

type VoucherState = "idle" | "applying" | "applied" | "invalid"

export function VoucherInputField({ onApply, onRemove, className, ...props }: VoucherInputFieldProps) {
  const [code, setCode] = React.useState("")
  const [state, setState] = React.useState<VoucherState>("idle")
  const [errorMsg, setErrorMsg] = React.useState("")

  const handleApply = async () => {
    if (!code) return
    setState("applying")
    setErrorMsg("")
    try {
      const isValid = await onApply(code)
      if (isValid) {
        setState("applied")
      } else {
        setState("invalid")
        setErrorMsg("Voucher code is invalid or expired.")
      }
    } catch {
      setState("invalid")
      setErrorMsg("Failed to apply voucher.")
    }
  }

  const handleRemove = () => {
    setCode("")
    setState("idle")
    setErrorMsg("")
    onRemove()
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              if (state === "invalid") setState("idle")
            }}
            placeholder="Enter voucher code"
            disabled={state === "applied" || state === "applying"}
            className={cn(
              "uppercase transition-colors",
              state === "applied" && "border-success bg-success/5 text-success",
              state === "invalid" && "border-danger focus-visible:ring-danger"
            )}
          />
          {state === "applied" && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-success" />
          )}
        </div>
        
        {state === "applied" ? (
          <Button variant="outline" onClick={handleRemove} className="text-danger hover:text-danger hover:bg-danger/10 border-danger/20">
            Remove
          </Button>
        ) : (
          <Button 
            onClick={handleApply} 
            disabled={!code || state === "applying"}
            className="w-24"
          >
            {state === "applying" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </Button>
        )}
      </div>
      
      {state === "invalid" && (
        <div className="flex items-center gap-1.5 text-danger text-sm animate-fade-in">
          <XCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
