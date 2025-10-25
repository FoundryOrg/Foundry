'use client'

import { useState } from "react";

export function ClaudeChat() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
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
        console.log('Store response:', storeData) 
        

      } catch (storeError) {
        console.error('Store error:', storeError)
      }
    } catch (error) {
      console.error('Main error:', error)
      setResponse('Error: ' + error)
    }
    
    
    setLoading(false)
  }

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <input 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What course do you want to build"
          className="px-4 py-2 border rounded-lg"
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'generating...' : 'Send to Claude'}
        </button>
      </form>
      
      {response && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">Claude Response:</h3>
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  )
}
