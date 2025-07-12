
import { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export interface ProfileData {
  id: string;
  username: string;
  role: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}
