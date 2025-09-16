import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/ui/Button';

export default function HomeScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch {
              Alert.alert('오류', '로그아웃 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>환영합니다!</Text>
          <Text style={styles.subtitle}>커뮤니티 앱에 오신 것을 환영합니다</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.userInfoTitle}>사용자 정보</Text>
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoText}>
              <Text style={styles.userInfoLabel}>사용자명: </Text>
              {user?.username}
            </Text>
            <Text style={styles.userInfoText}>
              <Text style={styles.userInfoLabel}>이메일: </Text>
              {user?.email}
            </Text>
            <Text style={styles.userInfoText}>
              <Text style={styles.userInfoLabel}>가입일: </Text>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>개발 예정 기능</Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>📝 게시글 작성 및 관리</Text>
            <Text style={styles.featureItem}>🖼️ 이미지 업로드</Text>
            <Text style={styles.featureItem}>💬 댓글 시스템</Text>
            <Text style={styles.featureItem}>🔍 게시글 검색</Text>
          </View>
        </View>

        <Button
          title="로그아웃"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userInfo: {
    marginBottom: 32,
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  userInfoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  userInfoLabel: {
    fontWeight: '600',
    color: '#007AFF',
  },
  actions: {
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  signOutButton: {
    marginTop: 'auto',
  },
});
