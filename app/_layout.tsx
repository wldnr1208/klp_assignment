import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QueryProvider } from '../src/providers/QueryProvider';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/api/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AuthListener() {
  const { setAuth, initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    initialize();

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setAuth(profile, session);
          } else {
            setAuth(null, null);
          }
        } else {
          setAuth(null, null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setAuth, initialize]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthListener />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/login"
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="auth/signup"
            options={{
              headerShown: false,
              presentation: 'modal'
            }}
          />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryProvider>
  );
}
