export interface Video {
  id: string;
  url: string;
  user_id?: string;
  user: {
    name: string;
    avatar: string;
  };
  description: string;
  likes: number;
  comments: number;
  shares: number;
}

export interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string;
  };
}
export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'seen';
  conversationId?: string;
  receiverId?: string;
}

export interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  lastMessage: string;
  unread: boolean;
  timestamp?: number;
}

export interface Profile {
  id?: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  posts: number;
  followers: string;
  following: number;
  storyHighlights: string[];
}

export type AppView = 'home' | 'discover' | 'chat' | 'upload' | 'profile';
