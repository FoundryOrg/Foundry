"use client"

import { Course } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors overflow-hidden group">
      {/* Course Image */}
      <div className="aspect-video bg-gradient-to-br from-sky-100 to-sky-200 flex items-center justify-center">
        <BookOpen className="w-12 h-12 text-sky-400" />
      </div>

      {/* Course Content */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
          {course.name}
        </h3>
        
        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
          Master the fundamentals through structured learning modules and hands-on AR-guided projects.
        </p>

        <div className="text-xs text-slate-500 mb-3">
          {course.modules.length} modules
        </div>

        <Link href={`/course/${course.id}`}>
          <Button size="sm" className="w-full bg-sky-600 hover:bg-sky-700 text-white">
            View Course
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
