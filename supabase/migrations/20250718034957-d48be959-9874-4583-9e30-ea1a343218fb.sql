
-- Update project_invites table to ensure proper functionality
ALTER TABLE public.project_invites 
ADD COLUMN IF NOT EXISTS invite_link TEXT;

-- Create index for better performance on token lookups
CREATE INDEX IF NOT EXISTS idx_project_invites_token ON public.project_invites(token);
CREATE INDEX IF NOT EXISTS idx_project_invites_expires_used ON public.project_invites(expires_at, used_at);

-- Update RLS policies for project invites to allow public access to valid invites
DROP POLICY IF EXISTS "Anyone can view valid invites for joining" ON public.project_invites;

CREATE POLICY "Public can view valid unused invites" 
  ON public.project_invites 
  FOR SELECT 
  USING (expires_at > now() AND used_at IS NULL);

-- Ensure project members can be added properly
ALTER TABLE public.project_members 
ALTER COLUMN user_id DROP DEFAULT;

-- Update checklists table to support goals
ALTER TABLE public.checklists 
ADD CONSTRAINT checklists_parent_type_check 
CHECK (parent_type IN ('task', 'project', 'goal'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_checklists_parent ON public.checklists(parent_id, parent_type);
CREATE INDEX IF NOT EXISTS idx_checklists_position ON public.checklists(parent_id, position);

-- Enable realtime for checklists
ALTER TABLE public.checklists REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklists;
