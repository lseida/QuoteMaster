import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '../utility/supabaseClient';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      checkAdminStatus(session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error al verificar el estado de administrador:', error);
      setIsAdmin(false);
    } else {
      setIsAdmin(data?.is_admin ?? false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};