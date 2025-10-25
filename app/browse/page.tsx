"use client"

import { CourseCard } from "@/components/ui/course-card"
import { PUBLISHED_COURSES } from "@/lib/mock-data"

export default function BrowsePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-50 to-white" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-slate-900 mb-6" style={{fontFamily: 'var(--font-instrument-serif)'}}>
              Course Library
            </h1>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Browse our collection of published courses and educational content. Learn from expert instructors and master new skills.
            </p>
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {PUBLISHED_COURSES.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>

          {/* Empty State (if no courses) */}
          {PUBLISHED_COURSES.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No courses available</h3>
              <p className="text-slate-600">Check back later for new course releases.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
