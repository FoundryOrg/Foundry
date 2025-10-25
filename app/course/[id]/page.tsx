"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CourseSidebar } from "@/components/course/course-sidebar"
import { CourseContent } from "@/components/course/course-content"
import { QuizModal } from "@/components/ui/quiz-modal"
import { MOCK_COURSE } from "@/lib/mock-data"
import { ActiveView, Module, SubModule } from "@/lib/types"

export default function CoursePage() {
  const router = useRouter()
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [activeModule, setActiveModule] = useState<Module | undefined>(undefined)
  const [activeSubModule, setActiveSubModule] = useState<SubModule | undefined>(undefined)
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [completedSubModules, setCompletedSubModules] = useState<string[]>([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Module | undefined>(undefined)

  const handleModuleSelect = (moduleId: string) => {
    if (moduleId === 'overview') {
      setActiveView('overview')
      setActiveModule(undefined)
      setActiveSubModule(undefined)
    } else if (moduleId === 'assessment') {
      setActiveView('assessment')
      setActiveModule(undefined)
      setActiveSubModule(undefined)
    } else if (moduleId.endsWith('-quiz')) {
      const actualModuleId = moduleId.replace('-quiz', '')
      const selectedModule = MOCK_COURSE.modules.find(m => m.id === actualModuleId)
      if (selectedModule) {
        setActiveView('quiz')
        setActiveModule(selectedModule)
        setActiveSubModule(undefined)
      }
    } else {
      const selectedModule = MOCK_COURSE.modules.find(m => m.id === moduleId)
      if (selectedModule) {
        setActiveView('module')
        setActiveModule(selectedModule)
        setActiveSubModule(undefined)
      }
    }
  }

  const handleSubModuleSelect = (moduleId: string, subModuleId: string) => {
    const selectedModule = MOCK_COURSE.modules.find(m => m.id === moduleId)
    const selectedSubModule = selectedModule?.subModules.find(sm => sm.id === subModuleId)
    
    if (selectedModule && selectedSubModule) {
      setActiveView('submodule')
      setActiveModule(selectedModule)
      setActiveSubModule(selectedSubModule)
      
      // Mark sub-module as completed when viewed (for demo purposes)
      if (!completedSubModules.includes(subModuleId)) {
        setCompletedSubModules(prev => [...prev, subModuleId])
      }
    }
  }

  const handleTakeQuiz = (moduleId: string) => {
    const quizModule = MOCK_COURSE.modules.find(m => m.id === moduleId)
    if (quizModule) {
      setCurrentQuiz(quizModule)
      setIsQuizOpen(true)
    }
  }

  const handleQuizSubmit = (answers: string[]) => {
    if (currentQuiz) {
      // Simple scoring logic
      let correctAnswers = 0
      currentQuiz.quiz.questions.forEach((question, index) => {
        if (parseInt(answers[index]) === question.correctAnswer) {
          correctAnswers++
        }
      })
      
      // If they got at least 70% correct, check if all sub-modules are completed
      if (correctAnswers / currentQuiz.quiz.questions.length >= 0.7) {
        // Check if all sub-modules for this module are completed
        const allSubModulesCompleted = currentQuiz.subModules.every(subModule => 
          completedSubModules.includes(subModule.id)
        )
        
        // Only mark module as completed if all sub-modules are done AND quiz is passed
        if (allSubModulesCompleted) {
          setCompletedModules(prev => [...prev, currentQuiz.id])
        }
      }
    }
    setIsQuizOpen(false)
    setCurrentQuiz(undefined)
  }

  const handlePrevious = () => {
    if (activeView === 'overview') {
      // Do nothing - already at the beginning
      return
    }
    
    if (activeView === 'submodule' && activeModule && activeSubModule) {
      // Find current sub-module index
      const currentSubModuleIndex = activeModule.subModules.findIndex(sm => sm.id === activeSubModule.id)
      
      if (currentSubModuleIndex > 0) {
        // Go to previous sub-module in same module
        const previousSubModule = activeModule.subModules[currentSubModuleIndex - 1]
        handleSubModuleSelect(activeModule.id, previousSubModule.id)
      } else {
        // Go to module overview
        handleModuleSelect(activeModule.id)
      }
    } else if (activeView === 'module' && activeModule) {
      // Go to course overview
      handleModuleSelect('overview')
    } else if (activeView === 'quiz' && activeModule) {
      // Go back to module overview
      handleModuleSelect(activeModule.id)
    } else if (activeView === 'assessment') {
      // Go to last module
      const lastModule = MOCK_COURSE.modules[MOCK_COURSE.modules.length - 1]
      handleModuleSelect(lastModule.id)
    }
  }

  const handleNext = () => {
    if (activeView === 'overview') {
      // Go to first module
      const firstModule = MOCK_COURSE.modules[0]
      handleModuleSelect(firstModule.id)
    } else if (activeView === 'module' && activeModule) {
      // Go to first sub-module of current module
      const firstSubModule = activeModule.subModules[0]
      handleSubModuleSelect(activeModule.id, firstSubModule.id)
    } else if (activeView === 'submodule' && activeModule && activeSubModule) {
      // Find current sub-module index
      const currentSubModuleIndex = activeModule.subModules.findIndex(sm => sm.id === activeSubModule.id)
      
      if (currentSubModuleIndex < activeModule.subModules.length - 1) {
        // Go to next sub-module in same module
        const nextSubModule = activeModule.subModules[currentSubModuleIndex + 1]
        handleSubModuleSelect(activeModule.id, nextSubModule.id)
      } else {
        // Go to module quiz
        handleModuleSelect(`${activeModule.id}-quiz`)
      }
    } else if (activeView === 'quiz' && activeModule) {
      // Find current module index
      const currentModuleIndex = MOCK_COURSE.modules.findIndex(m => m.id === activeModule.id)
      
      if (currentModuleIndex < MOCK_COURSE.modules.length - 1) {
        // Go to next module
        const nextModule = MOCK_COURSE.modules[currentModuleIndex + 1]
        handleModuleSelect(nextModule.id)
      } else {
        // Go to final assessment
        handleModuleSelect('assessment')
      }
    } else if (activeView === 'assessment') {
      // Do nothing - already at the end
      return
    }
  }

  const handleFinalAssessmentComplete = () => {
    // Mark final assessment as completed
    if (!completedModules.includes('assessment')) {
      setCompletedModules(prev => [...prev, 'assessment'])
      alert('Congratulations! You have completed the AR-Guided Project!')
    }
  }

  const handleBreadcrumbClick = (breadcrumb: string) => {
    if (breadcrumb === 'Home') {
      router.push('/')
    } else if (breadcrumb === MOCK_COURSE.name) {
      handleModuleSelect('overview')
    } else if (activeModule && breadcrumb === activeModule.title) {
      handleModuleSelect(activeModule.id)
    } else if (activeSubModule && breadcrumb === activeSubModule.title) {
      // Already on this sub-module, do nothing
      return
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      <div className="flex h-screen">
        {/* Left Sidebar - 25% width */}
        <div className="w-1/4 min-w-[300px]">
          <CourseSidebar
            course={MOCK_COURSE}
            activeModule={activeModule?.id || activeView}
            activeSubModule={activeSubModule?.id}
            onModuleSelect={handleModuleSelect}
            onSubModuleSelect={handleSubModuleSelect}
            completedModules={completedModules}
            completedSubModules={completedSubModules}
          />
        </div>

        {/* Right Content Area - 75% width */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrevious}
                  disabled={activeView === 'overview'}
                  className={`transition-colors ${
                    activeView === 'overview' 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ← Prev
                </button>
                <div className="text-sm text-slate-600 flex items-center gap-1">
                  <button 
                    onClick={() => handleBreadcrumbClick('Home')}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Home
                  </button>
                  <span>&gt;</span>
                  <button 
                    onClick={() => handleBreadcrumbClick(MOCK_COURSE.name)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {MOCK_COURSE.name}
                  </button>
                  <span>&gt;</span>
                  <span className="text-slate-900">
                    {activeSubModule?.title || activeModule?.title || 'Overview'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    // TODO: Implement publish functionality
                    alert('Course published! It will now appear in the Browse section.')
                  }}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Publish Course
                </button>
                <button 
                  onClick={handleNext}
                  disabled={activeView === 'assessment'}
                  className={`transition-colors ${
                    activeView === 'assessment' 
                      ? 'text-slate-400 cursor-not-allowed' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <CourseContent
            activeView={activeView}
            course={MOCK_COURSE}
            activeModule={activeModule}
            activeSubModule={activeSubModule}
            onTakeQuiz={handleTakeQuiz}
            onFinalAssessmentComplete={handleFinalAssessmentComplete}
            completedModules={completedModules}
          />
        </div>
      </div>

      {/* Quiz Modal */}
      {currentQuiz && (
        <QuizModal
          isOpen={isQuizOpen}
          onClose={() => setIsQuizOpen(false)}
          questions={currentQuiz.quiz.questions}
          onSubmit={handleQuizSubmit}
        />
      )}
    </main>
  )
}
