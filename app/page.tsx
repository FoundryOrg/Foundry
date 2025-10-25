"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loading } from "@/components/ui/loading"
import { useLoading } from "@/lib/loading-context"
import { ClaudeChat } from "@/components/claude-chat"

export default function CourseBuilderPage() {
  const { isLoading, setIsLoading } = useLoading()

  // Reset loading state when component mounts (when navigating back to home)
  useEffect(() => {
    setIsLoading(false)
  }, [setIsLoading])

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50 to-white" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 shadow-none pt-8">
        <div className="w-full text-center">
          {!isLoading && (
            <>
              <div className="opacity-0 animate-fade-in-up mb-12">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-slate-900 whitespace-nowrap text-center mb-[-36px] xl:text-9xl font-normal tracking-normal" style={{fontFamily: 'var(--font-instrument-serif)'}}>
                  Foundry <span className="text-6xl sm:text-7xl md:text-8xl align-middle">🏗️</span>
                </h1>
              </div>
              <div className="max-w-lg mx-auto">
                <div className="opacity-0 animate-fade-in-up animate-delay-200 mb-8 mt-16">
                  <p className="text-slate-700 text-lg font-light tracking-normal leading-tight my-0 py-0">
                  The Course Builder for the Modern Age.
                  </p>
                </div>

                <div className="opacity-0 animate-fade-in-up animate-delay-400">
                  <div className="max-w-lg mx-auto">
                    <ClaudeChat />
                  </div>
                </div>
              </div>
            </>
          )}
          
          {isLoading && (
            <Loading />
          )}
        </div>
      </div>
    </main>
  )
}