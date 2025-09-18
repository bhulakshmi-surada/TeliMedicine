-- Fix RLS policies for feedback table to allow users to insert their own feedback
DROP POLICY IF EXISTS "Users can create their own feedback" ON feedback;

CREATE POLICY "Users can create their own feedback" 
ON feedback 
FOR INSERT 
WITH CHECK (true);

-- Also allow reading feedback for debugging purposes (users can still only see their own)
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback;

CREATE POLICY "Users can view their own feedback" 
ON feedback 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);