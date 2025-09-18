import { supabase } from './supabase';
import { Comment, CommentFormData } from '../types';

export const commentsApi = {
  // 댓글 목록 조회
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles:author_id (
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // 데이터 변환
    return data?.map(comment => ({
      ...comment,
      author_username: comment.profiles?.username,
      author_avatar_url: comment.profiles?.avatar_url,
    }));
  },

  // 댓글 작성
  createComment: async (commentData: CommentFormData, authorId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        content: commentData.content,
        post_id: commentData.post_id,
        author_id: authorId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 댓글 삭제
  deleteComment: async (id: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};