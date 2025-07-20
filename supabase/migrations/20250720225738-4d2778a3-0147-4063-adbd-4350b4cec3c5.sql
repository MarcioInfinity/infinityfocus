-- Add completed_goals table to track goal completion history
CREATE TABLE IF NOT EXISTS public.completed_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on completed_goals
ALTER TABLE public.completed_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for completed_goals
CREATE POLICY "Users can view their own completed goals" 
  ON public.completed_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completed goals" 
  ON public.completed_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completed goals" 
  ON public.completed_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_completed_goals_user_id ON public.completed_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_goals_completed_at ON public.completed_goals(completed_at);

-- Enable realtime for completed_goals
ALTER TABLE public.completed_goals REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.completed_goals;