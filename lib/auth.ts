import { AuthSession, UserRole } from '@/types';

const AUTH_STORAGE_KEY = 'sav_session';
const LEGACY_AUTH_STORAGE_KEY = 'sav-manager-auth';

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
