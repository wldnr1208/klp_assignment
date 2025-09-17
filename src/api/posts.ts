import { supabase } from './supabase';
import { Post, PostFormData } from '../types';

export const postsApi = {
  // 게시글 목록 조회
  getPosts: async (page = 0, limit = 10) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          username,
          avatar_url
        ),
        comments_count:comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;

    // 데이터 변환
    return data?.map(post => ({
      ...post,
      author_username: post.profiles?.username,
      author_avatar_url: post.profiles?.avatar_url,
      comments_count: post.comments_count?.[0]?.count || 0,
    }));
  },

  // 게시글 상세 조회
  getPost: async (id: string) => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles:author_id (
          username,
          avatar_url
        ),
        comments_count:comments (count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // 데이터 변환
    return {
      ...data,
      author_username: data.profiles?.username,
      author_avatar_url: data.profiles?.avatar_url,
      comments_count: data.comments_count?.[0]?.count || 0,
    };
  },

  // 게시글 작성
  createPost: async (postData: PostFormData, authorId: string) => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        image_url: postData.image,
        author_id: authorId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 게시글 수정
  updatePost: async (id: string, postData: Partial<PostFormData>) => {
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: postData.title,
        content: postData.content,
        image_url: postData.image,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // 게시글 삭제
  deletePost: async (id: string) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};