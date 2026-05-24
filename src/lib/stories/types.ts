export type Story = {
  id: string;
  author_id: string;
  author_name: string;
  author_avatar_url: string | null;
  title: string;
  body: string;
  slug: string;
  excerpt: string | null;
  voice_note_path: string | null;
  category: string | null;
  status: 'draft' | 'published' | 'pending_review' | 'rejected';
  moderation_reason: string | null;
  moderation_category: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type StoryWithCounts = Story & {
  reaction_count: number;
  comment_count: number;
  share_count: number;
  media: StoryMedia[];
};

export type StoryMedia = {
  id: string;
  story_id: string;
  file_path: string;
  file_type: string;
  display_order: number;
  created_at: string;
};

export type StoryReaction = {
  id: string;
  story_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
};

export type StoryComment = {
  id: string;
  story_id: string;
  user_id: string;
  parent_id: string | null;
  author_name: string;
  author_avatar_url: string | null;
  author_title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export type StoryShare = {
  id: string;
  story_id: string;
  user_id: string | null;
  platform: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  actor_id: string | null;
  actor_name: string | null;
  story_id: string | null;
  target_id: string | null;
  target_type: string | null;
  is_read: boolean;
  created_at: string;
};