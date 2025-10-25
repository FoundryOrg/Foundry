"use client"

import { Module } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { PlayCircle, ArrowRight, BookOpen } from "lucide-react"

interface ModuleContentProps {
  module: Module;
  onTakeQuiz: () => void;
}

export function ModuleContent({ module, onTakeQuiz }: ModuleContentProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Module Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {module.isSafetyCheck && (
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded">
              Safety First
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{fontFamily: 'var(--font-instrument-serif)'}}>
          {module.title}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          This module contains {module.subModules.length} lessons covering essential concepts and practical applications.
        </p>
      </div>

      {/* Module Overview */}
      <div className="space-y-8">
        {/* Sub-modules List */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Module Lessons</h2>
          <div className="space-y-4">
            {module.subModules.map((subModule, index) => (
              <div key={subModule.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-sky-600">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900">{subModule.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {subModule.content.text.substring(0, 100)}...
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiz Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Knowledge Check</h2>
            <span className="text-sm text-slate-600">
              {module.quiz.questions.length} questions
            </span>
          </div>
          <p className="text-slate-700 mb-6">
            Test your understanding of all concepts covered in this module&apos;s lessons.
          </p>
          <Button 
            onClick={onTakeQuiz}
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            <PlayCircle className="w-4 h-4" />
            Take Module Quiz
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-slate-200">
          <Button variant="outline" className="flex items-center gap-2">
            ← Previous Module
          </Button>
          <Button className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2">
            Next Module
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
