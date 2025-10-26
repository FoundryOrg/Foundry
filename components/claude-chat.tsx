'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLoading } from "@/lib/loading-context"

export function ClaudeChat() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setIsLoading } = useLoading()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    
    setLoading(true)
    setIsLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/claude`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      
      const data = await res.json()
      
      setResponse(data.content)

      try {
        const storeRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/course`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ courseJson: data.content })
        })
        
        const storeData = await storeRes.json()
        console.log('Store response data:', storeData)
        
        // Redirect directly to the course page after successful course creation
        if (storeData.courseId) {
          console.log('Redirecting to course:', storeData.courseId)
          router.push(`/course/${storeData.courseId}`)
        } else {
          console.log('No courseId found, redirecting to browse')
          router.push('/browse')
        }

      } catch (storeError) {
        console.error('Store error:', storeError)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Main error:', error)
      setResponse('Error: ' + error)
      setIsLoading(false)
    }
    
    
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-3 py-2 shadow-sm">
        <Input
          type="text"
          placeholder="What course would you like to make?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
          disabled={loading}
          className="flex-1 bg-transparent text-slate-900 placeholder:text-slate-500 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-1 text-base hover:placeholder:text-slate-600 transition-all duration-300 h-auto border-0"
        />
        <Button
          type="submit"
          disabled={loading}
          className="rounded-full px-3 py-2 bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200 shadow-none"
        >
          →
        </Button>
      </div>
    </form>
  )
}
