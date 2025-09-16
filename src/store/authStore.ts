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
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            username,
          });

        if (profileError) throw profileError;

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

  signOut: async () => {
    await supabase.auth.signOut();
    get().setAuth(null, null);
  },
}));