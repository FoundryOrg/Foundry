import { Course } from './types';

// Published course data interface
export interface PublishedCourse extends Course {
  publishedAt: string;
  enrolledCount: number;
  rating: number;
  reviewCount: number;
}

// Single mock course - "Woodworking Fundamentals"
export const MOCK_COURSE: Course = {
  id: "mock-course",
  name: "Woodworking Fundamentals",
  learningObjectives: [
    "Master essential woodworking safety protocols",
    "Learn fundamental woodworking techniques and tools",
    "Understand wood selection and preparation methods",
    "Apply skills through hands-on AR-guided project completion"
  ],
  modules: [
    {
      id: "safety-checks",
      title: "Safety Checks",
      isSafetyCheck: true,
      subModules: [
        {
          id: "safety-equipment",
          title: "Safety Equipment",
          content: {
            text: "Learn about essential safety equipment including safety glasses, hearing protection, dust masks, and proper clothing. Understanding when and how to use each piece of equipment is crucial for preventing injuries.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Safety+Equipment"
          }
        },
        {
          id: "workshop-setup",
          title: "Workshop Setup",
          content: {
            text: "Discover how to properly set up your workspace for safety and efficiency. Learn about lighting, ventilation, tool organization, and emergency procedures.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Workshop+Setup"
          }
        },
        {
          id: "emergency-procedures",
          title: "Emergency Procedures",
          content: {
            text: "Master emergency protocols including first aid basics, fire safety, and how to respond to common woodworking accidents. Being prepared can save lives.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Emergency+Procedures"
          }
        }
      ],
      quiz: {
        id: "safety-quiz",
        questions: [
          {
            id: "safety-q1",
            question: "What is the most important safety equipment when using power tools?",
            options: ["Safety glasses", "Hearing protection", "Both safety glasses and hearing protection", "Work gloves"],
            correctAnswer: 2
          },
          {
            id: "safety-q2",
            question: "What should you do before starting any woodworking project?",
            options: ["Check tool condition", "Clear workspace", "Plan your cuts", "All of the above"],
            correctAnswer: 3
          }
        ]
      }
    },
    {
      id: "core-concepts",
      title: "Core Concepts",
      subModules: [
        {
          id: "basic-tools",
          title: "Basic Tools",
          content: {
            text: "Introduction to essential woodworking tools including saws, chisels, planes, and measuring tools. Learn proper handling and maintenance techniques.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/059669/FFFFFF?text=Basic+Tools"
          }
        },
        {
          id: "wood-grain",
          title: "Understanding Wood Grain",
          content: {
            text: "Learn to read wood grain patterns and understand how grain direction affects cutting, joining, and finishing techniques.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/059669/FFFFFF?text=Wood+Grain"
          }
        },
        {
          id: "basic-joinery",
          title: "Basic Joinery",
          content: {
            text: "Master fundamental joinery techniques including butt joints, lap joints, and basic mortise and tenon connections.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/059669/FFFFFF?text=Basic+Joinery"
          }
        }
      ],
      quiz: {
        id: "core-quiz",
        questions: [
          {
            id: "core-q1",
            question: "Which direction should you cut relative to wood grain?",
            options: ["With the grain", "Against the grain", "Perpendicular to grain", "It doesn't matter"],
            correctAnswer: 0
          },
          {
            id: "core-q2",
            question: "What is the strongest type of basic joint?",
            options: ["Butt joint", "Lap joint", "Mortise and tenon", "All are equally strong"],
            correctAnswer: 2
          }
        ]
      }
    },
    {
      id: "project-planning",
      title: "Project Planning",
      subModules: [
        {
          id: "design-principles",
          title: "Design Principles",
          content: {
            text: "Learn fundamental design principles including proportion, balance, and functionality. Understand how to create aesthetically pleasing and practical woodworking projects.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Design+Principles"
          }
        },
        {
          id: "material-selection",
          title: "Material Selection",
          content: {
            text: "Discover how to choose the right wood species for your project, considering factors like strength, appearance, workability, and cost.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Material+Selection"
          }
        },
        {
          id: "project-workflow",
          title: "Project Workflow",
          content: {
            text: "Learn to plan your project workflow from initial design to final finishing. Understand sequencing, time management, and quality control.",
            aiGeneratedImage: "https://via.placeholder.com/400x200/DC2626/FFFFFF?text=Project+Workflow"
          }
        }
      ],
      quiz: {
        id: "planning-quiz",
        questions: [
          {
            id: "planning-q1",
            question: "What is the first step in project planning?",
            options: ["Buy materials", "Create detailed drawings", "Choose tools", "Set timeline"],
            correctAnswer: 1
          },
          {
            id: "planning-q2",
            question: "Which factor is most important when selecting wood?",
            options: ["Color", "Price", "Suitability for project", "Availability"],
            correctAnswer: 2
          }
        ]
      }
    }
  ],
  finalAssessment: {
    title: "AR-Guided Woodworking Project",
    description: "Complete a real woodworking project with Meta Ray-Bans guidance. This hands-on assessment will test your ability to apply all the skills you've learned throughout the course. You'll build a simple but functional project while following AR prompts that guide you through each step safely and effectively.",
    arInstructions: [
      "Put on your Meta Ray-Bans and ensure they're properly calibrated",
      "Follow AR prompts to set up your workshop safely",
      "Build a simple project with real-time guidance and safety checks",
      "Complete the project while maintaining proper safety protocols",
      "Submit photos of your completed work for evaluation"
    ],
    metaRayBansIntegration: true
  },
  createdAt: new Date().toISOString()
};

// Published courses for Browse page
export const PUBLISHED_COURSES: PublishedCourse[] = [
  {
    ...MOCK_COURSE,
    id: "woodworking-fundamentals",
    publishedAt: "2 days ago",
    enrolledCount: 1247,
    rating: 4.8,
    reviewCount: 89
  }
];