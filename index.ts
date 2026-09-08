export interface Profile {
  id: string;
  king_id: number;
  email: string;
  account_type: 'client' | 'designer';
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string;
  country: string | null;
  age: number | null;
  is_admin: boolean;
  is_verified: boolean;
  vip_level: number;
  is_pro: boolean;
  pro_color: string;
  vip_colors: string[];
  designer_rank: number;
  ban_type: 'permanent' | 'temporary' | 'photo' | null;
  ban_until: string | null;
  is_banned: boolean;
  photo_banned: boolean;
  cv_summary: string;
  cv_experience: string;
  cv_education: string;
  cv_skills: string;
  cv_phone: string;
  cv_location: string;
  whatsapp_number: string | null;
  social_links: Record<string, string> | null;
  last_seen: string | null;
  avatar_frame_url: string | null;
  avatar_gif_url: string | null;
  name_gradient: string | null;
  created_at: string;
  updated_at: string;
}

export interface SplashScreen {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  display_order: number;
  enabled: boolean;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface MessageRequest {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media: MediaItem[];
  voice_url: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  media: MediaItem[];
  audience: 'public' | 'friends' | 'private';
  created_at: string;
  updated_at: string;
  user?: Profile;
  likes?: { user_id: string }[];
  comments?: Comment[];
  view_count?: number;
}

export interface Story {
  id: string;
  user_id: string;
  content: string;
  media: MediaItem[];
  audience: 'public' | 'friends' | 'private';
  background: string | null;
  font_family: string | null;
  text_color: string | null;
  created_at: string;
  expires_at: string;
  user?: Profile;
  views?: { user_id: string; reaction: string | null }[];
}

export interface Comment {
  id: string;
  post_id: string | null;
  story_id: string | null;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  user?: Profile;
  replies?: Comment[];
}

export interface MediaItem {
  type: 'image' | 'video' | 'audio' | 'pdf' | 'gif' | 'svga' | 'file';
  url: string;
  name?: string;
  size?: number;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  other_user?: Profile;
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  media: MediaItem[];
  voice_url: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  status: 'sent' | 'delivered' | 'seen';
  reply_to_id: string | null;
  voice_heard: boolean;
  created_at: string;
  updated_at: string;
  reply_to?: Message | null;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  entity_type: string | null;
  entity_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
  actor?: Profile;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  entity_type: 'post' | 'story' | 'comment' | 'user';
  entity_id: string | null;
  reason: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  admin_reply: string | null;
  replied_at: string | null;
  video_url: string | null;
  created_at: string;
  reporter?: Profile;
  reported_user?: Profile;
}

export interface AvatarFrame {
  id: string;
  name: string;
  frame_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string;
  user_id: string;
  id_card_front_url: string;
  id_card_back_url: string;
  cv_url: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ServiceRequest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  media: MediaItem[];
  cover_url: string | null;
  price: number;
  currency: string;
  status: 'open' | 'closed' | 'taken';
  designer_id: string | null;
  reject_reason: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  created_at: string;
  user?: Profile;
  designer?: Profile;
}

export interface DesignerService {
  id: string;
  user_id: string;
  service_name: string;
  description: string;
  price: number;
  currency: string;
  cover_url: string | null;
  created_at: string;
}

export interface PortfolioSection {
  id: string;
  user_id: string;
  title: string;
  description: string;
  post_ids: string[];
  created_at: string;
}

export interface PortfolioFolder {
  id: string;
  user_id: string;
  name: string;
  description: string;
  cover_url: string | null;
  media: MediaItem[];
  created_at: string;
}

export interface Friendship {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  requester?: Profile;
  receiver?: Profile;
}

export interface Rating {
  id: string;
  rater_id: string;
  rated_user_id: string | null;
  post_id: string | null;
  score: number;
  comment: string;
  created_at: string;
  rater?: Profile;
}

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
  blocked?: Profile;
}
