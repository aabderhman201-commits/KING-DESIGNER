import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const EXPECTED_TABLES = [
  'profiles', 'posts', 'comments', 'likes', 'stories', 'friendships',
  'conversations', 'messages', 'notifications', 'service_requests',
  'portfolio_folders', 'portfolio_items', 'verifications', 'reports',
  'splash_screens', 'avatar_frames',
] as const;
