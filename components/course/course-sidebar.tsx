"use client"

import { Course } from "@/lib/types"
import { CheckCircle, Circle, PlayCircle, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

interface CourseSidebarProps {
  course: Course;
  activeModule: string;
  activeSubModule?: string;
  onModuleSelect: (moduleId: string) => void;
  onSubModuleSelect: (moduleId: string, subModuleId: string) => void;
  completedModules: string[];
  completedSubModules: string[];
}

export function CourseSidebar({ 
  course, 
  activeModule, 
  activeSubModule,
  onModuleSelect, 
  onSubModuleSelect,
  completedModules, 
  completedSubModules 
}: CourseSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  
  const isCompleted = (moduleId: string) => completedModules.includes(moduleId)
  const isSubModuleCompleted = (subModuleId: string) => completedSubModules.includes(subModuleId)
  const isActive = (moduleId: string) => activeModule === moduleId
  const isSubModuleActive = (moduleId: string, subModuleId: string) => 
    activeModule === moduleId && activeSubModule === subModuleId
  
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const totalModules = course.modules.length + 1 // +1 for Final Assessment
  const completedModulesCount = completedModules.length

  return (
    <div className="w-full h-full bg-white/80 backdrop-blur-sm border-r border-slate-200 flex flex-col">
      {/* Course Title */}
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900" style={{fontFamily: 'var(--font-instrument-serif)'}}>
          {course.name}
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          {totalModules} modules • {completedModulesCount} completed
        </p>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {/* Course Overview */}
          <button
            onClick={() => onModuleSelect('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              isActive('overview')
                ? 'bg-sky-100 text-sky-900 border border-sky-200'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex-shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Course Overview</span>
          </button>

          {/* Modules with Sub-modules */}
          {course.modules.map((module, index) => {
            const isExpanded = expandedModules.includes(module.id)
            const moduleCompleted = isCompleted(module.id)
            
            return (
              <div key={module.id} className="space-y-1">
                {/* Module Header */}
                <button
                  onClick={() => {
                    toggleModule(module.id)
                    onModuleSelect(module.id)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                    isActive(module.id) && !activeSubModule
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {moduleCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      Module {index + 1}: {module.title}
                    </div>
                    {module.isSafetyCheck && (
                      <div className="text-xs text-amber-600 font-medium">
                        Safety First
                      </div>
                    )}
                  </div>
                </button>

                {/* Sub-modules */}
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {module.subModules.map((subModule, subIndex) => (
                      <button
                        key={subModule.id}
                        onClick={() => onSubModuleSelect(module.id, subModule.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                          isSubModuleActive(module.id, subModule.id)
                            ? 'bg-sky-100 text-sky-900 border border-sky-200'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {isSubModuleCompleted(subModule.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate">
                            {subIndex + 1}. {subModule.title}
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    {/* Quiz Button */}
                    <button
                      onClick={() => onModuleSelect(`${module.id}-quiz`)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                        isActive(`${module.id}-quiz`)
                          ? 'bg-purple-100 text-purple-900 border border-purple-200'
                          : 'text-purple-600 hover:bg-purple-50 hover:text-purple-900'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <PlayCircle className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          Quiz ({module.quiz.questions.length} questions)
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Final Assessment */}
          <button
            onClick={() => onModuleSelect('assessment')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
              isActive('assessment')
                ? 'bg-sky-100 text-sky-900 border border-sky-200'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex-shrink-0">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                Final Assessment
              </div>
              <div className="text-xs text-purple-600 font-medium">
                AR-Guided Project
              </div>
            </div>
          </button>
        </nav>
      </div>

      {/* Progress Summary */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <div className="text-xs text-slate-600 mb-2">Course Progress</div>
        <div className="w-full bg-slate-200 rounded-full h-1.5">
          <div 
            className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
            style={{ width: `${(completedModulesCount / totalModules) * 100}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {completedModulesCount} of {totalModules} modules completed
        </div>
      </div>
    </div>
  )
}
