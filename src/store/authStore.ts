import { create } from 'zustand';
import { AuthState, User } from '../types';
import { supabase } from '../api/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  setAuth: (user: User | null, session: Session | null) => void;
  initialize: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,

  setAuth: (user: User | null, session: Session | null) => {
    set({ user, session, isLoading: false });
  },

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          get().setAuth(profile, session);
        } else {
          get().setAuth(null, null);
        }
      } else {
        get().setAuth(null, null);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      get().setAuth(null, null);
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          get().setAuth(profile, data.session);
        }
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // 트리거가 프로필을 생성할 시간을 조금 기다림
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 프로필이 생성되었는지 확인 (최대 5번 시도)
        let profile = null;
        let attempts = 0;
        const maxAttempts = 5;

        while (!profile && attempts < maxAttempts) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profileData) {
            profile = profileData;
          } else {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (profile) {
          get().setAuth(profile, data.session);
        } else {
          // 트리거가 실패한 경우 수동으로 프로필 생성 시도
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                username,
              });

            if (!profileError) {
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              if (newProfile) {
                get().setAuth(newProfile, data.session);
              }
            }
          } catch (insertError) {
            // 프로필 생성 실패해도 사용자는 생성되었으므로 성공으로 처리
            console.warn('Profile creation failed, but user was created:', insertError);
            set({ isLoading: false });
          }
        }
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    get().setAuth(null, null);
  },
}));