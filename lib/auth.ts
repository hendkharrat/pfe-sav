import { AuthSession, UserRole } from '@/types';
import { mockUsers } from '@/data/mock-users';
import { mockClients } from '@/data/mock-clients';

const AUTH_STORAGE_KEY = 'sav_session';
const LEGACY_AUTH_STORAGE_KEY = 'sav-manager-auth';

/** Normalize phone for comparison: strip all whitespace. */
function normalizePhone(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}

/** Returns true if the login identifier matches the user's email or phone. */
function matchesIdentifier(identifier: string, email: string, telephone?: string): boolean {
  const norm = identifier.trim().toLowerCase();
  if (email.toLowerCase() === norm) return true;
  if (telephone) {
    const normId = normalizePhone(norm);
    const normStored = normalizePhone(telephone);
    if (normStored.toLowerCase() === normId) return true;
  }
  return false;
}

function isValidSession(raw: unknown): raw is AuthSession {
  if (!raw || typeof raw !== 'object') return false;
  const data = raw as Record<string, unknown>;
  const validRoles: UserRole[] = ['admin', 'technician', 'client'];
  return (
    typeof data.isAuthenticated === 'boolean' &&
    typeof data.loginTime === 'string' &&
    typeof data.role === 'string' &&
    validRoles.includes(data.role as UserRole) &&
    typeof data.displayName === 'string' &&
    typeof data.email === 'string'
  );
}

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;

  const stored =
    localStorage.getItem(AUTH_STORAGE_KEY) ?? localStorage.getItem(LEGACY_AUTH_STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!isValidSession(parsed)) {
      clearAuthSession();
      return null;
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
    localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
    return parsed;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function getAuthSession(): AuthSession | null {
  return readStoredSession();
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
}

export function authenticate(identifier: string, password: string): AuthSession | null {
  // 1. Try internal users (admin / technician)
  const user = mockUsers.find((u) => matchesIdentifier(identifier, u.email, u.telephone));
  if (user) {
    if (!user.password || user.password !== password) return null;
    const session: AuthSession = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      role: user.role,
      displayName: `${user.prenom} ${user.nom}`,
      email: user.email,
      telephone: user.telephone,
      userId: user.id,
    };
    setAuthSession(session);
    return session;
  }

  // 2. Try business clients
  const client = mockClients.find((c) => matchesIdentifier(identifier, c.email, c.telephone));
  if (client) {
    if (!client.password || client.password !== password) return null;
    const displayName =
      client.typeClient === 'PERSONNE_PHYSIQUE'
        ? `${client.prenom ?? ''} ${client.nom ?? ''}`.trim()
        : (client.societe ?? client.contact ?? client.email);
    const session: AuthSession = {
      isAuthenticated: true,
      loginTime: new Date().toISOString(),
      role: 'client',
      displayName,
      email: client.email,
      telephone: client.telephone,
      clientId: client.id,
    };
    setAuthSession(session);
    return session;
  }

  return null;
}

export function logoutUser(): void {
  clearAuthSession();
}

export function isAuthenticated(): boolean {
  const session = getAuthSession();
  return session?.isAuthenticated ?? false;
}

export function getCurrentUserRole(): UserRole | null {
  return getAuthSession()?.role ?? null;
}
