import { Stack } from 'expo-router';
import { PostDetailScreen } from '../../src/screens/posts/PostDetailScreen';

export default function PostDetail() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PostDetailScreen />
    </>
  );
}