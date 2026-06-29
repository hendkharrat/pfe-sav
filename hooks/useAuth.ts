'use client';

import { useEffect, useState } from 'react';
import { User, AuthSession, UserRole } from '@/types';
import { getAuthSession, logoutUser } from '@/lib/auth';

/** Builds a minimal User object from session data — no mock lookups required. */
function synthesizeUser(session: AuthSession): User {
  const name = session.displayName?.trim() || session.email;
  const [prenomRaw, ...rest] = name.split(/\s+/);
  const prenom = prenomRaw || name;
  const nom = rest.join(' ');

  return {
    id: session.userId ?? session.clientId ?? 0,
    prenom,
    nom,
    email: session.email,
    telephone: session.telephone,
    role: session.role,
    actif: true,
    dateCreation: session.loginTime,
  };
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentSession = getAuthSession();
    setSession(currentSession);
    setUser(currentSession ? synthesizeUser(currentSession) : null);
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
    role: (session?.role ?? null) as UserRole | null,
    userId: session?.userId ?? null,
    clientId: session?.clientId ?? null,
    displayName: session?.displayName ?? '',
    logout,
  };
}
