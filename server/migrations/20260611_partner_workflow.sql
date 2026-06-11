-- Notifications table (in-app notification system)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link TEXT,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Event comments (admin ↔ partner dialog)
CREATE TABLE IF NOT EXISTS public.event_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON public.event_comments(event_id);

-- Event tags
CREATE TABLE IF NOT EXISTS public.event_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#2563eb'
);

-- Event-tag junction
CREATE TABLE IF NOT EXISTS public.event_event_tags (
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.event_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, tag_id)
);

-- Event images
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS review_comment TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;
