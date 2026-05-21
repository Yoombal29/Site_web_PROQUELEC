-- Academy Module Schema migration

-- Courses table
CREATE TABLE IF NOT EXISTS public.academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_name TEXT,
    duration_hours INTEGER,
    level TEXT, -- Débutant, Intermédiaire, Expert
    difficulty TEXT, -- Facile, Moyen, Difficile
    status TEXT DEFAULT 'draft', -- draft, published, archived
    content JSONB, -- Stores the rich content (sections, introduction, conclusion, resources)
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules associated with courses
CREATE TABLE IF NOT EXISTS public.academy_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    prerequisites JSONB DEFAULT '[]',
    knowledge JSONB DEFAULT '[]',
    skills JSONB DEFAULT '[]',
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QCM (Quizzes) associated with courses or modules
CREATE TABLE IF NOT EXISTS public.academy_qcm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.academy_modules(id) ON DELETE SET NULL,
    title TEXT,
    questions JSONB NOT NULL, -- Array of {id, question, options, correctAnswer, explanation}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents/Resources associated with courses or modules
CREATE TABLE IF NOT EXISTS public.academy_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.academy_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.academy_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT, -- pdf, docx, pptx, etc
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_academy_modules_course_id ON public.academy_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_qcm_course_id ON public.academy_qcm(course_id);
CREATE INDEX IF NOT EXISTS idx_academy_documents_course_id ON public.academy_documents(course_id);
