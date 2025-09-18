import { createContext, useContext, useEffect, useState } from 'react';

// Mock auth types for basic functionality
interface User {
  id: string;
  email: string;
  role?: string;
}

interface Session {
  user: User;
  access_token: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, userData: any, redirectUrl?: string) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string, userData: any, customRedirectUrl?: string) => {
    try {
      setLoading(true);
      // Mock signup - in real app this would connect to Supabase
      const mockUser = { id: '1', email, role: userData.role || 'patient' };
      const mockSession = { user: mockUser, access_token: 'mock-token' };
      
      setUser(mockUser);
      setSession(mockSession);
      
      return { data: mockSession, error: null };
    } catch (error) {
      return { data: null, error: error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock signin - in real app this would connect to Supabase
      if (email && password.length >= 6) {
        const mockUser = { id: '1', email, role: 'patient' };
        const mockSession = { user: mockUser, access_token: 'mock-token' };
        
        setUser(mockUser);
        setSession(mockSession);
        
        return { data: mockSession, error: null };
      } else {
        throw new Error('Invalid login credentials');
      }
    } catch (error: any) {
      return { data: null, error: { message: error.message || 'Login failed' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    signUp,
    signIn,
    signOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};