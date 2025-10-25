-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  meta JSONB, -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL, -- Order within course
  title TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Submodules table (child of module, exactly one of two kinds)
CREATE TABLE submodules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL, -- Order within module
  kind TEXT NOT NULL CHECK (kind IN ('instruction', 'quiz')),
  title TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions table (only for submodules.kind='quiz')
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submodule_id UUID REFERENCES submodules(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL, -- Order within submodule
  type TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB, -- Array of answer options
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Question attempts table
CREATE TABLE question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submodule_id UUID REFERENCES submodules(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answer_json JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL
);

-- Question progress table
CREATE TABLE question_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submodule_id UUID REFERENCES submodules(id) ON DELETE CASCADE,
  tries INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_courses_owner_id ON courses(owner_id);
CREATE INDEX idx_modules_course_id ON modules(course_id);
CREATE INDEX idx_submodules_module_id ON submodules(module_id);
CREATE INDEX idx_quiz_questions_submodule_id ON quiz_questions(submodule_id);
CREATE INDEX idx_question_attempts_user_id ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_submodule_id ON question_attempts(submodule_id);
CREATE INDEX idx_question_progress_user_id ON question_progress(user_id);
CREATE INDEX idx_question_progress_submodule_id ON question_progress(submodule_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE submodules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_progress ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust as needed)
CREATE POLICY "Allow all operations on profiles" ON profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow all operations on modules" ON modules FOR ALL USING (true);
CREATE POLICY "Allow all operations on submodules" ON submodules FOR ALL USING (true);
CREATE POLICY "Allow all operations on quiz_questions" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_attempts" ON question_attempts FOR ALL USING (true);
CREATE POLICY "Allow all operations on question_progress" ON question_progress FOR ALL USING (true);
