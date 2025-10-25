"use client"

import { Course } from "@/lib/types"

interface CourseOverviewProps {
  course: Course;
  completedModules: string[];
}

export function CourseOverview({ course, completedModules }: CourseOverviewProps) {
  const totalModules = course.modules.length + 1 // +1 for Final Assessment
  const completedModulesCount = completedModules.length
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Course Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4" style={{fontFamily: 'var(--font-instrument-serif)'}}>
          {course.name}
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Master the fundamentals of woodworking through structured learning modules and hands-on AR-guided projects.
        </p>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Course Progress</h2>
        <div className="mb-4">
          <div className="text-sm text-slate-600 mb-2">Course Progress</div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedModulesCount / totalModules) * 100}%` }}
            />
          </div>
          <div className="text-sm text-slate-500 mt-2">
            {completedModulesCount} of {totalModules} modules completed
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Complete all modules to unlock the final AR-guided assessment
        </p>
      </div>

      {/* Learning Objectives */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Learning Objectives</h2>
        <ul className="space-y-3">
          {course.learningObjectives.map((objective, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-sky-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-semibold text-sky-600">{index + 1}</span>
              </div>
              <span className="text-slate-700 leading-relaxed">{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Course Structure */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Course Structure</h2>
        <div className="space-y-4">
          {course.modules.map((module, index) => (
            <div key={module.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-600">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900">{module.title}</h3>
                <p className="text-sm text-slate-600">
                  {module.isSafetyCheck ? 'Essential safety protocols and procedures' : 'Core concepts and practical applications'}
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  {module.quiz.questions.length} questions
                </span>
              </div>
            </div>
          ))}
          
          {/* Final Assessment */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-purple-600">AR</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900">Final Assessment</h3>
              <p className="text-sm text-slate-600">
                Hands-on project with Meta Ray-Bans AR guidance
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                AR-Guided
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
