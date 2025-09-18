import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../../api/posts';
import { useAuthStore } from '../../store/authStore';

export function CreatePostScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: (postData: { title: string; content: string; image?: string }) =>
      postsApi.createPost(postData, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      Alert.alert(
        '게시글 작성 완료',
        '게시글이 성공적으로 작성되었습니다.',
        [
          {
            text: '확인',
            onPress: () => router.back(),
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        '작성 실패',
        error.message || '게시글 작성 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }

    if (title.length > 200) {
      Alert.alert('알림', '제목은 200자 이하로 입력해주세요.');
      return;
    }

    if (content.length > 5000) {
      Alert.alert('알림', '내용은 5000자 이하로 입력해주세요.');
      return;
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
      image: selectedImage || undefined,
    });
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '이미지를 선택하려면 갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleCancel = () => {
    if (title.trim() || content.trim() || selectedImage) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const isSubmitDisabled = !title.trim() || !content.trim() || createPostMutation.isPending;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>제목을 입력하세요</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
          >
            <Text style={[styles.submitButtonText, isSubmitDisabled && styles.submitButtonTextDisabled]}>
              {createPostMutation.isPending ? '게시 중...' : '게시'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력하세요"
            placeholderTextColor="#999999"
            maxLength={200}
            multiline
            autoFocus
          />

          {/* Content Input */}
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="내용을 입력하세요..."
            placeholderTextColor="#999999"
            maxLength={5000}
            multiline
            textAlignVertical="top"
          />

          {/* Image Picker */}
          <View style={styles.imageSection}>
            {selectedImage ? (
              <View style={styles.selectedImageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <Text style={styles.removeImageText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handleImagePicker}
              >
                <Text style={styles.imagePickerText}>+</Text>
                <Text style={styles.imagePickerLabel}>이미지 추가</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Character Count */}
          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              제목: {title.length}/200 | 내용: {content.length}/5000
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
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
  cancelButton: {
    fontSize: 20,
    color: '#666666',
    width: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#999999',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingVertical: 20,
    paddingHorizontal: 0,
    minHeight: 60,
    maxHeight: 120,
  },
  contentInput: {
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 0,
    minHeight: 300,
    lineHeight: 24,
  },
  characterCount: {
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  characterCountText: {
    fontSize: 12,
    color: '#999999',
  },
  imageSection: {
    paddingVertical: 16,
  },
  imagePickerButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  imagePickerText: {
    fontSize: 32,
    color: '#cccccc',
    fontWeight: '300',
  },
  imagePickerLabel: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  selectedImageContainer: {
    position: 'relative',
    width: 200,
    height: 150,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});