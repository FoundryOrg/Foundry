"use client"

export function Loading() {
  return (
    <div className="max-w-sm mx-auto">
      {/* Loading Animation */}
      <div className="flex justify-center mb-6">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-sky-500 rounded-full animate-spin"></div>
      </div>

      {/* Loading Text */}
      <div className="text-center">
        <p className="text-slate-700 leading-relaxed">
          Building your course...
        </p>
      </div>
    </div>
  )
}
