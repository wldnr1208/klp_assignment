export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  author_id: string;
  author?: User;
  created_at: string;
  updated_at: string;
  comments_count: number;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  author?: User;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  image?: string;
}

export interface CommentFormData {
  content: string;
  post_id: string;
}