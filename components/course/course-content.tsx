"use client"

import { Course, Module, SubModule, ActiveView } from "@/lib/types"
import { CourseOverview } from "./course-overview"
import { ModuleContent } from "./module-content"
import { SubModuleContent } from "./sub-module-content"
import { FinalAssessment } from "./final-assessment"

interface CourseContentProps {
  activeView: ActiveView;
  course: Course;
  activeModule?: Module;
  activeSubModule?: SubModule;
  onTakeQuiz: (moduleId: string) => void;
  onFinalAssessmentComplete: () => void;
  completedModules: string[];
}

export function CourseContent({ activeView, course, activeModule, activeSubModule, onTakeQuiz, onFinalAssessmentComplete, completedModules }: CourseContentProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeView === 'overview' && (
        <CourseOverview course={course} completedModules={completedModules} />
      )}
      {activeView === 'module' && activeModule && (
        <ModuleContent 
          module={activeModule} 
          onTakeQuiz={() => onTakeQuiz(activeModule.id)}
        />
      )}
      {activeView === 'submodule' && activeSubModule && (
        <SubModuleContent subModule={activeSubModule} />
      )}
      {activeView === 'quiz' && activeModule && (
        <ModuleContent 
          module={activeModule} 
          onTakeQuiz={() => onTakeQuiz(activeModule.id)}
        />
      )}
      {activeView === 'assessment' && (
        <FinalAssessment 
          assessment={course.finalAssessment} 
          onComplete={onFinalAssessmentComplete}
          completedModules={completedModules}
        />
      )}
    </div>
  )
}
