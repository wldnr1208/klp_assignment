import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestPosts() {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log('No authenticated user found. Please login first.');
      return;
    }

    console.log('Creating test posts for user:', user.id);

    const testPosts = [
      {
        title: '첫 번째 게시글',
        content: '안녕하세요! 커뮤니티 앱에 오신 것을 환영합니다. 이것은 첫 번째 테스트 게시글입니다.',
        author_id: user.id
      },
      {
        title: '두 번째 게시글',
        content: '이것은 두 번째 테스트 게시글입니다. 게시글 목록이 정상적으로 작동하는지 확인해보세요.',
        author_id: user.id
      },
      {
        title: '세 번째 게시글',
        content: '마지막 테스트 게시글입니다. 댓글과 이미지 기능도 곧 추가될 예정입니다!',
        author_id: user.id
      }
    ];

    for (const post of testPosts) {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
      } else {
        console.log('Created post:', data.title);
      }
    }

    console.log('Test posts created successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestPosts();