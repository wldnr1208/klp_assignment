import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';

export function ProfileScreen() {
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
          <Text style={styles.title}>프로필</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>

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
            <Text style={styles.featureItem}>👤 프로필 편집</Text>
            <Text style={styles.featureItem}>🔔 알림 설정</Text>
            <Text style={styles.featureItem}>🔒 개인정보 설정</Text>
            <Text style={styles.featureItem}>📱 앱 설정</Text>
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
    backgroundColor: '#ffffff',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userInfoCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  userInfoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  userInfoLabel: {
    fontWeight: '600',
    color: '#666666',
  },
  actions: {
    marginBottom: 32,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
  },
  featureItem: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666666',
  },
  signOutButton: {
    marginTop: 'auto',
  },
});