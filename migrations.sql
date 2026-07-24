-- 1. Create Saves Table
CREATE TABLE IF NOT EXISTS public.saves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, video_id)
);

-- Enable Row Level Security (RLS) on Saves
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for Saves
CREATE POLICY "Allow users to view their own saves" 
    ON public.saves FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own saves" 
    ON public.saves FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own saves" 
    ON public.saves FOR DELETE 
    USING (auth.uid() = user_id);


-- 2. Create Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- can be null if guest
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies for Reports
CREATE POLICY "Allow users to submit reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (true); -- Public or authenticated users can report

CREATE POLICY "Allow admin / own user to view reports" 
    ON public.reports FOR SELECT 
    USING (auth.uid() = user_id);
