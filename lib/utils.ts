import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Client, ClientType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getClientDisplayName(client: Client): string {
  if (client.typeClient === 'PERSONNE_PHYSIQUE') {
    const fullName = `${client.prenom ?? ''} ${client.nom ?? ''}`.trim();
    return fullName || client.email || 'Client sans nom';
  }
  return client.societe || client.contact || client.email || 'Client sans nom';
}

export function getClientTypeLabel(typeClient: ClientType): string {
  return typeClient === 'PERSONNE_PHYSIQUE' ? 'Personne physique' : 'Société';
}

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
