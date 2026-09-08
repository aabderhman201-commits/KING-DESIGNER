/*
# Add story update policy and story_views select for viewer list

1. Policy Changes
- Add UPDATE policy on stories so owners can edit their own stories (for the 10-minute edit window).
- Add UPDATE policy on story_views so viewers can update their reaction.
- story_views SELECT already allows all authenticated users to see views (needed for viewer list).
2. Notes
- No new tables or columns.
- stories DELETE policy already exists for owners.
- These policies are safe to re-run (DROP IF EXISTS before CREATE).
*/

DROP POLICY IF EXISTS "stories_update_own" ON stories;
CREATE POLICY "stories_update_own" ON stories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "story_views_update_own" ON story_views;
CREATE POLICY "story_views_update_own" ON story_views FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
