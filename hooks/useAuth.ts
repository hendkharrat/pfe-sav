'use client';

import { useEffect, useState } from 'react';
import { User, AuthSession, UserRole } from '@/types';
import { getAuthSession, logoutUser } from '@/lib/auth';
import { mockUsers } from '@/data/mock-users';
import { mockClients } from '@/data/mock-clients';

/** Builds a User object from the session for backward-compatible component usage. */
function synthesizeUser(session: AuthSession): User | null {
  if (session.userId) {
    return mockUsers.find((u) => u.id === session.userId) ?? null;
  }
  if (session.clientId) {
    const client = mockClients.find((c) => c.id === session.clientId);
    if (client) {
      const prenom =
        client.typeClient === 'PERSONNE_PHYSIQUE'
          ? (client.prenom ?? session.displayName)
          : (client.societe ?? session.displayName);
      const nom =
        client.typeClient === 'PERSONNE_PHYSIQUE' ? (client.nom ?? '') : '';
      return {
        id: client.id,
        prenom,
        nom,
        email: session.email,
        telephone: session.telephone,
        role: 'client',
        actif: true,
        dateCreation: client.dateCreation,
      };
    }
  }
  return null;
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
