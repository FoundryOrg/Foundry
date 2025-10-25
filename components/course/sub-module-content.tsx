"use client"

import { SubModule } from "@/lib/types"
import Image from "next/image"

interface SubModuleContentProps {
  subModule: SubModule;
}

export function SubModuleContent({ subModule }: SubModuleContentProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* SubModule Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{fontFamily: 'var(--font-instrument-serif)'}}>
          {subModule.title}
        </h1>
      </div>

      {/* SubModule Content */}
      <div className="space-y-8">
        {/* Text Content */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Learning Content</h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
              {subModule.content.text}
            </p>
          </div>
        </div>

        {/* AI Generated Image */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Visual Learning</h2>
          <div className="relative">
            <Image 
              src={subModule.content.aiGeneratedImage} 
              alt={`${subModule.title} illustration`}
              width={500}
              height={192}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-slate-600">
              AI Generated
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
