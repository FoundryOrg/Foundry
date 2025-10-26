"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { CourseSidebar } from "@/components/course/course-sidebar"
import { CourseContent } from "@/components/course/course-content"
import { QuizModal } from "@/components/ui/quiz-modal"
import { Button } from "@/components/ui/button"
import { ActiveView, Module, SubModule } from "@/lib/types"
import { supabase } from "@/utils/supabase"
import { getUserId } from "@/lib/user-id"

export default function CoursePage() {
  const router = useRouter()
  const params = useParams()
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [activeModule, setActiveModule] = useState<Module | undefined>(undefined)
  const [activeSubModule, setActiveSubModule] = useState<SubModule | undefined>(undefined)
  const [completedModules, setCompletedModules] = useState<string[]>([])
  const [completedSubModules, setCompletedSubModules] = useState<string[]>([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [currentQuiz, setCurrentQuiz] = useState<Module | undefined>(undefined)
  const [isPublished, setIsPublished] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [course, setCourse] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch course data and check publication status
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!params.id) return

      try {
        // Fetch course basic info
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .eq('id', params.id)
          .single()

        if (courseError) {
          console.error('Error fetching course:', courseError)
          return
        }

        setIsPublished(courseData.is_published)

        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', params.id)
          .order('idx')

        if (modulesError) {
          console.error('Error fetching modules:', modulesError)
          return
        }

        // Fetch submodules and quiz questions for each module
        const modulesWithContent = await Promise.all(
          modulesData.map(async (module) => {
            // Fetch submodules
            const { data: submodulesData, error: submodulesError } = await supabase
              .from('submodules')
              .select('*')
              .eq('module_id', module.id)
              .order('idx')

            if (submodulesError) {
              console.error('Error fetching submodules:', submodulesError)
              return { ...module, subModules: [], quiz: null }
            }

            // Separate instruction submodules from quiz submodules
            const instructionSubmodules = submodulesData.filter(sm => sm.kind === 'instruction')
            const quizSubmodules = submodulesData.filter(sm => sm.kind === 'quiz')

            // Fetch quiz questions for quiz submodules
            let quizData = null
            if (quizSubmodules.length > 0) {
              const { data: questionsData, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*') 
                .eq('submodule_id', quizSubmodules[0].id)
                .order('idx')

              if (!questionsError && questionsData && questionsData.length > 0) {
                quizData = {
                  id: quizSubmodules[0].id,
                  questions: questionsData.map(q => ({
                    id: q.id,
                    question: q.prompt,
                    options: q.options,
                    correctAnswer: parseInt(q.answer)
                  }))
                }
              }
            }

            return {
              id: module.id,
              title: module.title,
              isSafetyCheck: false, // We can add this field later if needed
              subModules: instructionSubmodules.map(sm => ({
                id: sm.id,
                title: sm.title,
                content: {
                  text: sm.body,
                  aiGeneratedImage: sm.image_url || "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=" + encodeURIComponent(sm.title)
                }
              })),
              quiz: quizData
            }
          })
        )

        // Create course object in the expected format
        const courseObject = {
          id: courseData.id,
          name: courseData.title,
          learningObjectives: courseData.meta?.learningObjectives || [],
          modules: modulesWithContent,
          finalAssessment: courseData.meta?.finalAssessment || {
            title: "Final Assessment",
            description: "Complete the final assessment to finish this course.",
            arInstructions: [],
            metaRayBansIntegration: false
          },
          createdAt: courseData.created_at
        }

        setCourse(courseObject)
        
        // Load user progress
        const userId = getUserId()
        if (userId) {
          const { data: progressData } = await supabase
            .from('question_progress')
            .select('submodule_id, is_completed')
            .eq('user_id', userId)
          
          if (progressData) {
            const completedIds = progressData
              .filter(p => p.is_completed)
              .map(p => p.submodule_id)
            setCompletedSubModules(completedIds)
            
            // Check which modules should be marked complete based on progress
            const completedModuleIds: string[] = []
            modulesWithContent.forEach((module: any) => {
              // Check if all instruction submodules are complete
              const allSubModulesComplete = module.subModules.every((sm: any) => 
                completedIds.includes(sm.id)
              )
              
              // Check if quiz is complete (if module has a quiz)
              const quizComplete = module.quiz ? completedIds.includes(module.quiz.id) : true
              
              // If both conditions met, module is complete
              if (allSubModulesComplete && quizComplete) {
                completedModuleIds.push(module.id)
              }
            })
            
            setCompletedModules(completedModuleIds)
          }
        }
      } catch (error) {
        console.error('Error fetching course data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [params.id])

  const handlePublish = async () => {
    setPublishing(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/course/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id })
      })

      if (response.ok) {
        setIsPublished(true)
        alert('Course published successfully!')
      } else {
        alert('Failed to publish course')
      }
    } catch (error) {
      console.error('Error publishing course:', error)
      alert('Failed to publish course')
    } finally {
      setPublishing(false)
    }
  }

  const handleModuleSelect = (moduleId: string) => {
    if (!course) return

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
      const selectedModule = course.modules.find((m: any) => m.id === actualModuleId)
      if (selectedModule) {
        setActiveView('quiz')
        setActiveModule(selectedModule)
        setActiveSubModule(undefined)
      }
    } else {
      const selectedModule = course.modules.find((m: any) => m.id === moduleId)
      if (selectedModule) {
        setActiveView('module')
        setActiveModule(selectedModule)
        setActiveSubModule(undefined)
      }
    }
  }

  const handleSubModuleSelect = async (moduleId: string, subModuleId: string) => {
    if (!course) return
    
    const selectedModule = course.modules.find((m: any) => m.id === moduleId)
    const selectedSubModule = selectedModule?.subModules.find((sm: any) => sm.id === subModuleId)
    
    if (selectedModule && selectedSubModule) {
      setActiveView('submodule')
      setActiveModule(selectedModule)
      setActiveSubModule(selectedSubModule)
      
      // Mark sub-module as completed when viewed
      if (!completedSubModules.includes(subModuleId)) {
        setCompletedSubModules(prev => [...prev, subModuleId])
        
        // Save progress to database
        const userId = getUserId()
        if (userId) {
          await supabase.from('question_progress').upsert({
            user_id: userId,
            submodule_id: subModuleId,
            is_completed: true,
            tries: 0
          }, {
            onConflict: 'user_id,submodule_id'
          })
        }
      }
    }
  }

  const handleTakeQuiz = (moduleId: string) => {
    if (!course) return
    
    const quizModule = course.modules.find((m: any) => m.id === moduleId)
    
    if (quizModule && quizModule.quiz && quizModule.quiz.questions && quizModule.quiz.questions.length > 0) {
      setCurrentQuiz(quizModule)
      setIsQuizOpen(true)
    } else {
      alert('No quiz questions available for this module.')
    }
  }

  const handleQuizSubmit = async (answers: string[]) => {
    if (currentQuiz) {
      // Simple scoring logic
      let correctAnswers = 0
      currentQuiz.quiz.questions.forEach((question, index) => {
        if (parseInt(answers[index]) === question.correctAnswer) {
          correctAnswers++
        }
      })
      
      const passed = correctAnswers / currentQuiz.quiz.questions.length >= 0.7
      
      // Save quiz completion to database
      const userId = getUserId()
      if (userId && currentQuiz.quiz) {
        await supabase.from('question_progress').upsert({
          user_id: userId,
          submodule_id: currentQuiz.quiz.id,
          is_completed: passed,
          tries: 1
        })
        
        // If quiz passed, mark it as completed submodule
        if (passed && !completedSubModules.includes(currentQuiz.quiz.id)) {
          setCompletedSubModules(prev => [...prev, currentQuiz.quiz.id])
        }
      }
      
      // If they passed the quiz
      if (passed) {

        const allSubModulesCompleted = currentQuiz.subModules.every(subModule => 
          completedSubModules.includes(subModule.id)
        )
        
        // Quiz is now completed, so check if module should be complete
        if (allSubModulesCompleted && currentQuiz.quiz) {
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
      if (course && course.modules.length > 0) {
        const lastModule = course.modules[course.modules.length - 1]
        handleModuleSelect(lastModule.id)
      }
    }
  }

  const handleNext = () => {
    if (!course) return

    if (activeView === 'overview') {
      // Go to first module
      const firstModule = course.modules[0]
      if (firstModule) {
        handleModuleSelect(firstModule.id)
      }
    } else if (activeView === 'module' && activeModule) {
      // Go to first sub-module of current module
      const firstSubModule = activeModule.subModules[0]
      if (firstSubModule) {
        handleSubModuleSelect(activeModule.id, firstSubModule.id)
      }
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
      const currentModuleIndex = course.modules.findIndex((m: any) => m.id === activeModule.id)
      
      if (currentModuleIndex < course.modules.length - 1) {
        // Go to next module
        const nextModule = course.modules[currentModuleIndex + 1]
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
    } else if (course && breadcrumb === course.name) {
      handleModuleSelect('overview')
    } else if (activeModule && breadcrumb === activeModule.title) {
      handleModuleSelect(activeModule.id)
    } else if (activeSubModule && breadcrumb === activeSubModule.title) {
      // Already on this sub-module, do nothing
      return
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading course...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!course) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Course not found</p>
            <button 
              onClick={() => router.push('/')}
              className="mt-4 text-sky-600 hover:text-sky-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 via-sky-50 to-white">
      <div className="flex h-screen">
        {/* Left Sidebar - 25% width */}
        <div className="w-1/4 min-w-[300px]">
          <CourseSidebar
            course={course}
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
                    onClick={() => handleBreadcrumbClick(course.name)}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {course.name}
                  </button>
                  <span>&gt;</span>
                  <span className="text-slate-900">
                    {activeSubModule?.title || activeModule?.title || 'Overview'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!isPublished ? (
                  <Button 
                    onClick={handlePublish}
                    disabled={publishing}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {publishing ? 'Publishing...' : 'Publish Course'}
                  </Button>
                ) : (
                  <span className="text-green-600 text-sm font-medium">
                    ✓ Published
                  </span>
                )}
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
            course={course}
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
