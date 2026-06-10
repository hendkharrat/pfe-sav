'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { logoutUser } from '@/lib/auth';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MobileNavDialog } from './MobileNavDialog';

export function AppHeader() {
  const router = useRouter();
  const { isAuthenticated, displayName, session } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profil');
  };

  return (
    <>
      <header className="border-b border-border bg-card">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Left side: hamburger + compact brand (mobile only) */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Ouvrir la navigation"
            >
              <Menu size={20} />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center shrink-0">
                <span className="text-primary-foreground font-bold text-xs">S</span>
              </div>
              <span className="text-base font-semibold text-foreground">SAV Manager</span>
            </div>
          </div>

          {/* Spacer on desktop (sidebar carries the brand) */}
          <div className="hidden lg:block" />

          {/* Right side: theme toggle + user dropdown */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User size={16} />
                    <span className="hidden sm:inline">{displayName.split(' ')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground">{session?.email}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfile}>
                    <User size={16} className="mr-2" />
                    <span>Mon profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut size={16} className="mr-2" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <MobileNavDialog open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  );
}
