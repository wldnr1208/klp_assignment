import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    username?: string;
  }>({});

  const { signUp, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      username?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!username.trim()) {
      newErrors.username = '사용자명을 입력해주세요.';
    } else if (username.length < 3) {
      newErrors.username = '사용자명은 3자 이상이어야 합니다.';
    } else if (username.length > 20) {
      newErrors.username = '사용자명은 20자 이하여야 합니다.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username = '사용자명은 영문자, 숫자, 언더스코어만 사용 가능합니다.';
    }

    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await signUp(email.trim(), password, username.trim());
      Alert.alert(
        '회원가입 성공',
        '회원가입이 완료되었습니다!',
        [
          {
            text: '확인',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        '회원가입 실패',
        error.message || '회원가입 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  const handleLoginPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>새로운 계정을 만들어보세요!</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="이메일"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="이메일을 입력하세요"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="사용자명"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              placeholder="사용자명을 입력하세요 (3-20자)"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="비밀번호를 입력하세요 (6자 이상)"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="비밀번호 확인"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              placeholder="비밀번호를 다시 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="회원가입"
              onPress={handleSignup}
              loading={isLoading}
              style={styles.signupButton}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
              <Button
                title="로그인"
                onPress={handleLoginPress}
                variant="outline"
                size="small"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#666',
  },
});