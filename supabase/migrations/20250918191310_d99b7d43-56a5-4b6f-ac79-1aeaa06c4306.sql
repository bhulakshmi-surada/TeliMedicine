-- Fix RLS policies for feedback table to allow users to insert feedback
DROP POLICY IF EXISTS "Users can create their own feedback" ON feedback;

CREATE POLICY "Users can create their own feedback" 
ON feedback 
FOR INSERT 
WITH CHECK (true);