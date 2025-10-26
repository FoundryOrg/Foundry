"use client"

import { useParams } from "next/navigation"
import type { FinalAssessment as FinalAssessmentType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle, ExternalLink, Zap } from "lucide-react"

interface FinalAssessmentProps {
  assessment: FinalAssessmentType;
  onComplete: () => void;
  completedModules?: string[];
}

export function FinalAssessment({ assessment, onComplete, completedModules = [] }: FinalAssessmentProps) {
  const params = useParams()
  const courseId = params.id as string

  const handleBeginAssessment = async () => {
    try {
      
      // Fetch the voice prompt from the API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/course/${courseId}/voice-prompt`)
      const data = await response.json()
      
      if (data.voice_prompt) {
        console.log('Voice prompt:', data.voice_prompt)
        // TRIGGER THE VOICE AGENT HERE THRU THE PROMPT
      }
    } catch (error) {
      console.error('Error fetching voice prompt:', error)
    }

    onComplete()
  }
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Assessment Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded">
            AR Integration
          </span>
          {assessment.metaRayBansIntegration && (
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Meta Ray-Bans
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{fontFamily: 'var(--font-instrument-serif)'}}>
          {assessment.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          {assessment.description}
        </p>
      </div>

      {/* AR Integration Info */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">AR-Guided Learning</h2>
            <p className="text-slate-700 leading-relaxed">
              This assessment uses Meta Ray-Bans to provide real-time guidance and safety monitoring 
              as you complete your woodworking project. The AR system will guide you through each step 
              while ensuring you follow proper safety protocols.
            </p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Assessment Instructions</h2>
        <div className="space-y-4">
          {assessment.arInstructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-semibold text-sky-600">{index + 1}</span>
              </div>
              <span className="text-slate-700 leading-relaxed">{instruction}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Prerequisites</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-slate-700">Complete all 3 course modules</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-slate-700">Pass all module quizzes</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-slate-700">Have Meta Ray-Bans available</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-slate-700">Access to a safe workspace</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button 
          onClick={handleBeginAssessment}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 mx-auto"
        >
          <ExternalLink className="w-5 h-5" />
          Begin AR Assessment
        </Button>
        <p className="text-sm text-slate-500 mt-3">
          Ready to begin your AR-guided project!
        </p>
      </div>
    </div>
  )
}
