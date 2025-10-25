"use client"

import { useState } from "react"
import { Question } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  onSubmit: (answers: string[]) => void;
}

export function QuizModal({ isOpen, onClose, questions, onSubmit }: QuizModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>(new Array(questions.length).fill(''))
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  if (!isOpen) return null

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex.toString()
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate score
      let correctAnswers = 0
      questions.forEach((question, index) => {
        if (parseInt(answers[index]) === question.correctAnswer) {
          correctAnswers++
        }
      })
      setScore(correctAnswers)
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(answers)
    onClose()
  }

  const handleRetake = () => {
    setCurrentQuestion(0)
    setAnswers(new Array(questions.length).fill(''))
    setShowResults(false)
    setScore(0)
  }

  const currentQ = questions[currentQuestion]
  const isAnswered = answers[currentQuestion] !== ''
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Knowledge Check</h2>
            <p className="text-sm text-slate-600">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-slate-50">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="h-full bg-sky-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-6">
          {!showResults ? (
            <>
              {/* Question */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  {currentQ.question}
                </h3>
                
                {/* Answer Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                        answers[currentQuestion] === index.toString()
                          ? 'border-sky-500 bg-sky-50 text-sky-900'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          answers[currentQuestion] === index.toString()
                            ? 'border-sky-500 bg-sky-500'
                            : 'border-slate-300'
                        }`}>
                          {answers[currentQuestion] === index.toString() && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="text-slate-700">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="bg-sky-600 hover:bg-sky-700 text-white"
                >
                  {currentQuestion === questions.length - 1 ? 'Submit Quiz' : 'Next'}
                </Button>
              </div>
            </>
          ) : (
            /* Results */
            <div className="text-center">
              <div className="mb-6">
                {score === questions.length ? (
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h3 className="text-2xl font-semibold text-slate-900 mb-2">
                  {score === questions.length ? 'Perfect Score!' : 'Quiz Complete'}
                </h3>
                <p className="text-lg text-slate-600 mb-4">
                  You scored {score} out of {questions.length} questions correctly
                </p>
                <div className="text-3xl font-bold text-sky-600 mb-6">
                  {Math.round((score / questions.length) * 100)}%
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={handleRetake}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Continue Learning
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
