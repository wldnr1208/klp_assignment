import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { postsApi } from '../../api/posts';
import { Post } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface PostItemProps {
  post: Post;
}

function PostItem({ post }: PostItemProps) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`;
    return postDate.toLocaleDateString();
  };

  const handlePress = () => {
    router.push(`/posts/${post.id}`);
  };

  return (
    <TouchableOpacity style={styles.postItem} onPress={handlePress}>
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {post.author_username?.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.username}>{post.author_username}</Text>
          <Text style={styles.timeAgo}>{timeAgo(post.created_at)}</Text>
        </View>
      </View>

      <View style={styles.postContent}>
        <Text style={styles.postTitle}>{post.title}</Text>
        {post.content && (
          <Text style={styles.postPreview} numberOfLines={3}>
            {post.content}
          </Text>
        )}
        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.postImage} />
        )}
      </View>

      <View style={styles.postFooter}>
        <View style={styles.commentCount}>
          <Text style={styles.commentText}>💬 {post.comments_count || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function PostListScreen() {
  const { user } = useAuthStore();

  const {
    data: posts,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: () => postsApi.getPosts(),
    enabled: !!user,
  });

  const handleCreatePost = () => {
    router.push('/posts/create');
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostItem post={item} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>아직 게시글이 없습니다</Text>
      <Text style={styles.emptySubtext}>첫 번째 게시글을 작성해보세요!</Text>
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>게시글을 불러오는데 실패했습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>피드</Text>
        <TouchableOpacity style={styles.createButton} onPress={handleCreatePost}>
          <Text style={styles.createButtonText}>+ 글쓰기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts || []}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListEmptyComponent={!isLoading ? renderEmpty : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  createButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    flexGrow: 1,
  },
  postItem: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postMeta: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timeAgo: {
    fontSize: 13,
    color: '#666666',
  },
  postContent: {
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 22,
  },
  postPreview: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentText: {
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 12,
    resizeMode: 'cover',
  },
});