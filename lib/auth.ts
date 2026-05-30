import { User, AuthSession, UserRole } from '@/types';
import { mockUsers } from '@/data/mock-users';

const AUTH_STORAGE_KEY = 'sav_session';
const LEGACY_AUTH_STORAGE_KEY = 'sav-manager-auth';

const LOGIN_CREDENTIALS: Record<string, string> = {
  'admin@sav.com': 'admin123',
  'tech@sav.com': 'tech123',
  'client@sav.com': 'client123',
};

function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;

  if (typeof data.id !== 'string' || typeof data.email !== 'string') return null;

  const role = data.role as UserRole;
  if (!['admin', 'technician', 'client'].includes(role)) return null;

  if (typeof data.prenom === 'string' && typeof data.nom === 'string') {
    return {
      id: data.id,
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      role,
      actif: typeof data.actif === 'boolean' ? data.actif : true,
      dateCreation:
        typeof data.dateCreation === 'string'
          ? data.dateCreation
          : new Date().toISOString().split('T')[0],
    };
  }

  // Migration depuis l'ancien schéma (firstName, lastName, createdAt)
  if (typeof data.firstName === 'string' && typeof data.lastName === 'string') {
    return {
      id: data.id,
      prenom: data.firstName,
      nom: data.lastName,
      email: data.email,
      role,
      actif: typeof data.actif === 'boolean' ? data.actif : true,
      dateCreation:
        typeof data.createdAt === 'string'
          ? data.createdAt
          : new Date().toISOString().split('T')[0],
    };
  }

  return null;
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const stored =
    localStorage.getItem(AUTH_STORAGE_KEY) ?? localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as AuthSession;
    const user = normalizeUser(parsed.user);
    if (!user) {
      clearAuthSession();
      return null;
    }

    const session: AuthSession = {
      user,
      isAuthenticated: parsed.isAuthenticated ?? true,
      loginTime: parsed.loginTime ?? new Date().toISOString(),
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);

    return session;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  return readStoredSession();
}

export function setAuthSession(user: User): void {
  if (typeof window === 'undefined') return;
  const session: AuthSession = {
    user,
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function authenticate(email: string, password: string): AuthSession | null {
  const normalizedEmail = email.trim().toLowerCase();
  const expectedPassword = LOGIN_CREDENTIALS[normalizedEmail];

  if (!expectedPassword || expectedPassword !== password) {
    return null;
  }

  const user = mockUsers.find((u) => u.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return null;
  }

  setAuthSession(user);
  return getAuthSession();
}

export function logoutUser(): void {
  clearAuthSession();
}

export function isAuthenticated(): boolean {
  const session = getAuthSession();
  return session?.isAuthenticated ?? false;
}

export function getCurrentUser(): User | null {
  const session = getAuthSession();
  return session?.user ?? null;
}

export function getCurrentUserRole(): UserRole | null {
  return getCurrentUser()?.role ?? null;
}
