import {
  LayoutDashboard,
  Users,
  Building2,
  Wrench,
  FileText,
  ClipboardList,
  Calendar,
  AlertTriangle,
  Receipt,
  History,
  User,
} from 'lucide-react';
import { UserRole } from '@/types';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export function getNavItems(role: UserRole): NavItem[] {
  if (role === 'admin') {
    return [
      { label: 'Tableau de bord', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Utilisateurs', href: '/utilisateurs', icon: <Users size={20} /> },
      { label: 'Équipements', href: '/equipements', icon: <Wrench size={20} /> },
      { label: 'Clients', href: '/clients', icon: <Building2 size={20} /> },
      { label: 'Contrats', href: '/contrats', icon: <FileText size={20} /> },
      { label: 'Interventions', href: '/interventions', icon: <ClipboardList size={20} /> },
      { label: 'Planning', href: '/interventions/planning', icon: <Calendar size={20} /> },
      { label: 'Pannes', href: '/pannes', icon: <AlertTriangle size={20} /> },
      { label: 'Factures', href: '/factures', icon: <Receipt size={20} /> },
      { label: 'Historique', href: '/historique', icon: <History size={20} /> },
      { label: 'Mon profil', href: '/profil', icon: <User size={20} /> },
    ];
  }

  if (role === 'technician') {
    return [
      { label: 'Tableau de bord', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
      { label: 'Mes interventions', href: '/interventions', icon: <ClipboardList size={20} /> },
      { label: 'Mon planning', href: '/interventions/planning', icon: <Calendar size={20} /> },
      { label: 'Historique', href: '/historique', icon: <History size={20} /> },
      { label: 'Mon profil', href: '/profil', icon: <User size={20} /> },
    ];
  }

  return [
    { label: 'Mon espace', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { label: 'Déclarer une panne', href: '/pannes', icon: <AlertTriangle size={20} /> },
    { label: 'Mes interventions', href: '/interventions', icon: <ClipboardList size={20} /> },
    { label: 'Mes factures', href: '/factures', icon: <Receipt size={20} /> },
    { label: 'Historique', href: '/historique', icon: <History size={20} /> },
    { label: 'Mon profil', href: '/profil', icon: <User size={20} /> },
  ];
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === '/interventions') {
    return (
      pathname.startsWith('/interventions/') &&
      !pathname.startsWith('/interventions/planning')
    );
  }
  return pathname.startsWith(href + '/');
}

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrateur',
  technician: 'Technicien',
  client: 'Client',
};
