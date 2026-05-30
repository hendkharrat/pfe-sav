'use client';

import { useEffect, useState } from 'react';
import { User, AuthSession } from '@/types';
import { getAuthSession, getCurrentUser, logoutUser } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getAuthSession();
    const currentUser = getCurrentUser();
    setSession(currentSession);
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    isLoading,
    isAuthenticated: session?.isAuthenticated ?? false,
    logout,
  };
}
