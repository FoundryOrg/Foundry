"use client"

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressIndicator({ current, total, label }: ProgressIndicatorProps) {
  const progress = (current / total) * 100

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-sm text-slate-600">{current}/{total}</span>
        </div>
      )}
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
