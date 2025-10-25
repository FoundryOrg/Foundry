-- Seed data for Course Builder
-- This file populates the database with initial data for development/testing

-- Insert sample profiles
INSERT INTO profiles (id, username) VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'admin'),
  ('550e8400-e29b-41d4-a716-446655440001', 'instructor1'),
  ('550e8400-e29b-41d4-a716-446655440002', 'student1')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, owner_id, title, summary, meta) VALUES 
  (
    '650e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'Electrical Safety Fundamentals',
    'A comprehensive course covering electrical safety protocols and procedures',
    '{
      "learningObjectives": [
        "Identify electrical hazards in the workplace",
        "Apply proper safety procedures when working with electricity",
        "Use appropriate personal protective equipment",
        "Respond to electrical emergencies"
      ],
      "finalAssessment": {
        "title": "AR-Guided Electrical Safety Inspection",
        "description": "Use Meta Ray-Bans to perform a comprehensive electrical safety inspection of a simulated work environment",
        "arInstructions": [
          "Scan the work area for electrical hazards",
          "Identify proper PPE requirements",
          "Check electrical equipment for safety compliance",
          "Document findings using AR annotations",
          "Complete safety checklist"
        ],
        "metaRayBansIntegration": true
      }
    }'::jsonb
  ),
  (
    '650e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Construction Site Safety',
    'Essential safety protocols for construction environments',
    '{
      "learningObjectives": [
        "Recognize construction site hazards",
        "Implement fall protection measures",
        "Use construction safety equipment",
        "Follow emergency procedures"
      ],
      "finalAssessment": {
        "title": "AR Construction Safety Walkthrough",
        "description": "Conduct a virtual safety inspection of a construction site using AR technology",
        "arInstructions": [
          "Identify potential fall hazards",
          "Check safety equipment placement",
          "Verify proper signage and barriers",
          "Assess emergency exit routes",
          "Complete safety compliance report"
        ],
        "metaRayBansIntegration": true
      }
    }'::jsonb
  );

-- Insert sample modules for Electrical Safety course
INSERT INTO modules (id, course_id, idx, title, summary) VALUES 
  (
    '750e8400-e29b-41d4-a716-446655440000',
    '650e8400-e29b-41d4-a716-446655440000',
    1,
    'Safety Fundamentals',
    'Introduction to electrical safety principles'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440001',
    '650e8400-e29b-41d4-a716-446655440000',
    2,
    'Hazard Identification',
    'Learning to recognize electrical hazards'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440002',
    '650e8400-e29b-41d4-a716-446655440000',
    3,
    'Safety Procedures',
    'Proper procedures for electrical work'
  );

-- Insert sample modules for Construction Safety course
INSERT INTO modules (id, course_id, idx, title, summary) VALUES 
  (
    '750e8400-e29b-41d4-a716-446655440003',
    '650e8400-e29b-41d4-a716-446655440001',
    1,
    'Site Hazards',
    'Identifying construction site dangers'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440004',
    '650e8400-e29b-41d4-a716-446655440001',
    2,
    'Fall Protection',
    'Preventing falls in construction'
  ),
  (
    '750e8400-e29b-41d4-a716-446655440005',
    '650e8400-e29b-41d4-a716-446655440001',
    3,
    'Emergency Response',
    'Responding to construction emergencies'
  );

-- Insert sample submodules (instruction type)
INSERT INTO submodules (id, module_id, idx, kind, title, body) VALUES 
  -- Electrical Safety Module 1
  (
    '850e8400-e29b-41d4-a716-446655440000',
    '750e8400-e29b-41d4-a716-446655440000',
    1,
    'instruction',
    'Understanding Electrical Hazards',
    'Electrical hazards can cause serious injury or death. Always assume electrical equipment is energized until proven otherwise. Common hazards include exposed wires, damaged insulation, and wet conditions.'
  ),
  (
    '850e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440000',
    2,
    'instruction',
    'Personal Protective Equipment',
    'Proper PPE is essential when working with electricity. This includes insulated gloves, safety glasses, and non-conductive footwear. Always inspect PPE before use and replace damaged equipment immediately.'
  ),
  (
    '850e8400-e29b-41d4-a716-446655440002',
    '750e8400-e29b-41d4-a716-446655440000',
    3,
    'instruction',
    'Lockout/Tagout Procedures',
    'Lockout/Tagout (LOTO) procedures prevent accidental energization of equipment. Always follow the six-step LOTO process: preparation, shutdown, isolation, lockout, stored energy check, and verification.'
  ),
  -- Electrical Safety Module 2
  (
    '850e8400-e29b-41d4-a716-446655440003',
    '750e8400-e29b-41d4-a716-446655440001',
    1,
    'instruction',
    'Visual Inspection Techniques',
    'Regular visual inspections can identify potential electrical hazards before they become dangerous. Look for signs of damage, overheating, or improper installation. Document all findings and report issues immediately.'
  ),
  (
    '850e8400-e29b-41d4-a716-446655440004',
    '750e8400-e29b-41d4-a716-446655440001',
    2,
    'instruction',
    'Testing Equipment Safety',
    'Before using electrical testing equipment, verify it is properly calibrated and rated for the voltage you will be testing. Never use damaged or unrated equipment. Always test on a known live source first.'
  ),
  (
    '850e8400-e29b-41d4-a716-446655440005',
    '750e8400-e29b-41d4-a716-446655440001',
    3,
    'instruction',
    'Environmental Considerations',
    'Environmental conditions significantly affect electrical safety. Avoid working in wet conditions, and ensure proper ventilation when working with electrical equipment. Consider temperature and humidity effects on equipment performance.'
  );

-- Insert sample quiz submodules
INSERT INTO submodules (id, module_id, idx, kind, title, body) VALUES 
  (
    '850e8400-e29b-41d4-a716-446655440006',
    '750e8400-e29b-41d4-a716-446655440000',
    4,
    'quiz',
    'Safety Fundamentals Quiz',
    'Test your understanding of electrical safety fundamentals'
  ),
  (
    '850e8400-e29b-41d4-a716-446655440007',
    '750e8400-e29b-41d4-a716-446655440001',
    4,
    'quiz',
    'Hazard Identification Quiz',
    'Test your ability to identify electrical hazards'
  );

-- Insert sample quiz questions
INSERT INTO quiz_questions (id, submodule_id, idx, type, prompt, options, answer) VALUES 
  -- Safety Fundamentals Quiz
  (
    '950e8400-e29b-41d4-a716-446655440000',
    '850e8400-e29b-41d4-a716-446655440006',
    1,
    'multiple_choice',
    'What is the first step when working with electrical equipment?',
    '["Assume equipment is de-energized", "Assume equipment is energized", "Touch the equipment to test", "Start working immediately"]'::jsonb,
    'Assume equipment is energized'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440006',
    2,
    'multiple_choice',
    'Which PPE is most important when working with electricity?',
    '["Hard hat", "Insulated gloves", "Safety glasses", "Steel-toed boots"]'::jsonb,
    'Insulated gloves'
  ),
  -- Hazard Identification Quiz
  (
    '950e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440007',
    1,
    'multiple_choice',
    'What should you do if you see exposed electrical wires?',
    '["Touch them to test", "Report immediately and stay away", "Cover with tape", "Continue working"]'::jsonb,
    'Report immediately and stay away'
  ),
  (
    '950e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440007',
    2,
    'multiple_choice',
    'What is the minimum safe distance from overhead power lines?',
    '["3 feet", "10 feet", "15 feet", "20 feet"]'::jsonb,
    '10 feet'
  );

-- Insert sample question progress (for testing)
INSERT INTO question_progress (id, user_id, submodule_id, tries, is_completed) VALUES 
  (
    'a50e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440006',
    1,
    false
  ),
  (
    'a50e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440007',
    0,
    false
  );

-- Insert sample question attempts (for testing)
INSERT INTO question_attempts (id, user_id, submodule_id, answer_json, is_correct) VALUES 
  (
    'b50e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440006',
    '{"question_id": "950e8400-e29b-41d4-a716-446655440000", "answer": "Assume equipment is energized"}'::jsonb,
    true
  ),
  (
    'b50e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440006',
    '{"question_id": "950e8400-e29b-41d4-a716-446655440001", "answer": "Insulated gloves"}'::jsonb,
    true
  );