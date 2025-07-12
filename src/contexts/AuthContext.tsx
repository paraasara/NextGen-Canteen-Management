
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, ProfileData } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextProps {
  authState: AuthState;
  profile: ProfileData | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is admin based on profile role only
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Auth state changed: ${event}`);
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        });
        
        if (!session?.user) {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    if (authState.user?.id) {
      setLoading(true);
      try {
        console.log("Fetching profile for user:", authState.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authState.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        } else {
          console.log("Profile data:", data);
          setProfile(data as ProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    } else {
      setProfile(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.user && !authState.loading) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [authState.user, authState.loading]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Could not log in. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your registration.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not register. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshProfile = async () => {
    console.log("Manually refreshing profile");
    await fetchProfile();
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        profile,
        signIn,
        signUp,
        signOut,
        loading,
        refreshProfile,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
