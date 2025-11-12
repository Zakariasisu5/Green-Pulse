-- Create profiles table with user preferences
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goals TEXT[] DEFAULT '{}',
  spiritual_mode BOOLEAN DEFAULT false,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create eco_actions table for tracking green habits
CREATE TABLE public.eco_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  note TEXT,
  emoji_rating TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  impact_score INTEGER DEFAULT 0
);

-- Create journal_entries table for daily reflections
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  tags TEXT[] DEFAULT '{}',
  emoji_reaction TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create greenpoints table for rewards
CREATE TABLE public.greenpoints (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create marketplace_items table
CREATE TABLE public.marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL,
  brand_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_challenges junction table
CREATE TABLE public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  completed BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, challenge_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eco_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for eco_actions
CREATE POLICY "Users can view their own eco actions"
  ON public.eco_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own eco actions"
  ON public.eco_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own eco actions"
  ON public.eco_actions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own eco actions"
  ON public.eco_actions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for journal_entries
CREATE POLICY "Users can view their own journal entries"
  ON public.journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
  ON public.journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON public.journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON public.journal_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for greenpoints
CREATE POLICY "Users can view their own greenpoints"
  ON public.greenpoints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own greenpoints"
  ON public.greenpoints FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own greenpoints"
  ON public.greenpoints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for marketplace_items (public read)
CREATE POLICY "Anyone can view marketplace items"
  ON public.marketplace_items FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for challenges (public read)
CREATE POLICY "Anyone can view challenges"
  ON public.challenges FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_challenges
CREATE POLICY "Users can view their own challenge progress"
  ON public.user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join challenges"
  ON public.user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their challenge progress"
  ON public.user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'name', 'Green Friend'));
  
  INSERT INTO public.greenpoints (user_id, total)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_greenpoints_updated_at
  BEFORE UPDATE ON public.greenpoints
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert some sample marketplace items
INSERT INTO public.marketplace_items (name, cost, category, brand_url, description) VALUES
  ('Eco-Friendly Water Bottle', 50, 'lifestyle', 'https://example.com', 'Reusable stainless steel bottle'),
  ('Bamboo Toothbrush Set', 30, 'personal-care', 'https://example.com', 'Pack of 4 sustainable toothbrushes'),
  ('Solar Phone Charger', 100, 'tech', 'https://example.com', 'Portable solar-powered charger'),
  ('Plant a Tree Donation', 25, 'donation', 'https://example.com', 'Plant one tree in your name'),
  ('Organic Cotton Tote', 40, 'fashion', 'https://example.com', 'Fair trade cotton shopping bag');

-- Insert sample challenges
INSERT INTO public.challenges (title, description, duration, is_active) VALUES
  ('No Plastic Bottles', 'Avoid single-use plastic bottles for 3 days', 3, true),
  ('Meatless Monday', 'Try plant-based meals every Monday this month', 30, true),
  ('Walk to Work Week', 'Walk or bike instead of driving for 7 days', 7, true),
  ('Zero Waste Weekend', 'Produce no waste for an entire weekend', 2, true);