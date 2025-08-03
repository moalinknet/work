import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './supabase/info';

// Supabase 클라이언트 생성
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
}

class AuthService {
  // 로그인
  async signIn(email: string, password: string): Promise<AuthSession> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw new Error(error.message);
      }

      if (!data.session || !data.user) {
        throw new Error('로그인에 실패했습니다.');
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name,
      };

      return {
        user,
        accessToken: data.session.access_token,
      };
    } catch (error: any) {
      console.error('Error during sign in:', error);
      throw new Error(error.message || '로그인 중 오류가 발생했습니다.');
    }
  }

  // 회원가입
  async signUp(email: string, password: string, name: string): Promise<AuthSession> {
    try {
      // 서버의 회원가입 엔드포인트 사용
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-73d292b7/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '회원가입에 실패했습니다.');
      }

      const { user: userData } = await response.json();

      // 회원가입 후 자동 로그인
      return this.signIn(email, password);
    } catch (error: any) {
      console.error('Error during sign up:', error);
      throw new Error(error.message || '회원가입 중 오류가 발생했습니다.');
    }
  }

  // 로그아웃
  async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw new Error(error.message);
      }
    } catch (error: any) {
      console.error('Error during sign out:', error);
      throw new Error(error.message || '로그아웃 중 오류가 발생했습니다.');
    }
  }

  // 현재 세션 가져오기
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        return null;
      }

      if (!data.session || !data.session.user) {
        return null;
      }

      const user: User = {
        id: data.session.user.id,
        email: data.session.user.email || '',
        name: data.session.user.user_metadata?.name,
      };

      return {
        user,
        accessToken: data.session.access_token,
      };
    } catch (error: any) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // 인증 상태 변경 리스너
  onAuthStateChange(callback: (authState: AuthState) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (session && session.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name,
        };

        callback({
          user,
          accessToken: session.access_token,
          isLoading: false,
        });
      } else {
        callback({
          user: null,
          accessToken: null,
          isLoading: false,
        });
      }
    });
  }

  // 소셜 로그인 (Google)
  async signInWithGoogle(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Google sign in error:', error);
        throw new Error(error.message);
      }

      // OAuth는 리다이렉트를 통해 처리되므로 여기서는 리턴하지 않음
    } catch (error: any) {
      console.error('Error during Google sign in:', error);
      throw new Error(error.message || 'Google 로그인 중 오류가 발생했습니다.');
    }
  }
}

export const authService = new AuthService();