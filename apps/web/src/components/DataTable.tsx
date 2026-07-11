import * as React from "react"
import { AlertCircle, RotateCcw } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

export interface Column<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T) => React.ReactNode
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  isLoading?: boolean
  error?: string | null
  onRetry?: () => void
  emptyMessage?: string
  className?: string
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  isLoading,
  error,
  onRetry,
  emptyMessage = "No data available",
  className
}: DataTableProps<T>) {
  
  if (error) {
    return (
      <div className={cn("p-8 rounded-2xl border border-danger/20 bg-danger/5 flex flex-col items-center justify-center text-center space-y-4", className)}>
        <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-text-primary font-medium">{error}</p>
          <p className="text-sm text-text-secondary mt-1">Failed to load data.</p>
        </div>
        {onRetry && (
          <Button variant="outline" onClick={onRetry} className="border-danger/20 text-danger hover:bg-danger/10 mt-2">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-2xl border border-border bg-bg-surface", className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-text-secondary bg-bg-surface-raised/50 uppercase border-b border-border">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={cn("px-4 py-3 font-medium", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse bg-bg-surface/50">
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4">
                    <div className="h-4 bg-bg-surface-raised rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-text-secondary">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-bg-surface-raised/30 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={cn("px-4 py-3", col.className)}>
                    {col.cell ? col.cell(item) : (col.accessorKey ? String(item[col.accessorKey]) : null)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
