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

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, isLoading } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요.';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        '로그인 실패',
        error.message || '로그인 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  const handleSignUpPress = () => {
    router.push('/auth/signup');
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
            <Text style={styles.title}>로그인</Text>
            <Text style={styles.subtitle}>커뮤니티에 오신 것을 환영합니다!</Text>
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
              label="비밀번호"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>계정이 없으신가요? </Text>
              <Button
                title="회원가입"
                onPress={handleSignUpPress}
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
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
});