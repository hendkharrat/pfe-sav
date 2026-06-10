'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/auth';
import { getNavItems, isNavItemActive, ROLE_LABEL } from './navItems';

interface MobileNavDialogProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNavDialog({ open, onClose }: MobileNavDialogProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated || !role) return null;

  const navItems = getNavItems(role);

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href);
  };

  const handleLogout = () => {
    onClose();
    logoutUser();
    router.push('/login');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Navigation</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-2 mb-1">{ROLE_LABEL[role]}</p>
        <nav>
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigate(item.href)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t pt-3 mt-1">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
