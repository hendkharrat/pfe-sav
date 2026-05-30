'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/auth';
import { getNavItems, isNavItemActive, ROLE_LABEL } from './navItems';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  return (
    <aside className="hidden lg:flex w-64 bg-sidebar border-r border-sidebar-border flex-col shrink-0">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span className="text-primary-foreground font-bold text-sm">S</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-sidebar-foreground leading-tight">SAV Manager</p>
          <p className="text-xs text-sidebar-foreground opacity-60">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            return (
              <li key={item.href}>
                <button
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight size={14} className="shrink-0 opacity-70" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer: user info + logout */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <div className="px-3 py-1.5">
          <p className="text-xs font-semibold text-sidebar-foreground truncate">
            {user.prenom} {user.nom}
          </p>
          <p className="text-xs text-sidebar-foreground opacity-60 truncate">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={16} className="shrink-0" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
