"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLoading } from "@/lib/loading-context"

export default function Navigation() {
  const pathname = usePathname()
  const { isLoading } = useLoading()

  if (isLoading || pathname.startsWith('/course/')) {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <span className="text-5xl font-bold">🏗️</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/browse"
              className={`text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-slate-100 px-2 py-1 rounded-lg ${
                pathname === "/browse"
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browse
            </Link>
            <Link
              href="/"
              className={`text-base font-medium transition-all duration-200 hover:scale-105 hover:bg-slate-100 px-2 py-1 rounded-lg ${
                pathname === "/"
                  ? "text-slate-900"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Builder
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
