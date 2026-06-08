'use client';

import { Equipment } from '@/types';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentThumbnailProps {
  equipment?: Equipment;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<EquipmentThumbnailProps['size']>, string> = {
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const ICON_SIZES: Record<NonNullable<EquipmentThumbnailProps['size']>, number> = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function EquipmentThumbnail({ equipment, size = 'sm', className }: EquipmentThumbnailProps) {
  const sizeClass = SIZE_CLASSES[size];
  const iconSize = ICON_SIZES[size];

  const mainImage =
    equipment?.images?.find((img) => img.isMain) ?? equipment?.images?.[0];

  if (mainImage?.previewUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mainImage.previewUrl}
        alt={`Photo de ${equipment!.reference}`}
        className={cn(sizeClass, 'rounded object-cover border border-border flex-shrink-0', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClass,
        'rounded bg-muted border border-border flex items-center justify-center flex-shrink-0',
        className
      )}
    >
      <ImageIcon size={iconSize} className="text-muted-foreground" />
    </div>
  );
}
