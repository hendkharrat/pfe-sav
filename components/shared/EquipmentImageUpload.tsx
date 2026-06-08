'use client';

import { useRef } from 'react';
import { EquipmentImage } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Star, Trash2, Upload } from 'lucide-react';

interface EquipmentImageUploadProps {
  images: EquipmentImage[];
  onChange: (images: EquipmentImage[]) => void;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Impossible de lire ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function EquipmentImageUpload({ images, onChange }: EquipmentImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const hasMain = images.some((img) => img.isMain);

    const newImages = await Promise.all(
      files.map(async (file, index): Promise<EquipmentImage> => {
        const previewUrl = await readFileAsDataURL(file);
        return {
          id: `img-${Date.now()}-${index}`,
          filename: file.name,
          previewUrl,
          isMain: !hasMain && index === 0,
        };
      })
    );

    onChange([...images, ...newImages]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSetMain = (id: string) => {
    onChange(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  const handleRemove = (id: string) => {
    const filtered = images.filter((img) => img.id !== id);
    if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
      filtered[0] = { ...filtered[0], isMain: true };
    }
    onChange(filtered);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFilesChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        className="gap-2"
      >
        <Upload size={14} />
        Ajouter des images
      </Button>

      {images.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-4 border border-dashed rounded-lg">
          <ImageIcon size={15} />
          <span>Aucune image sélectionnée</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              className={`relative rounded-lg border overflow-hidden group ${
                img.isMain ? 'border-primary ring-1 ring-primary' : 'border-border'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {img.previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.previewUrl}
                  alt={img.filename}
                  className="w-full h-28 object-cover"
                />
              ) : (
                <div className="w-full h-28 bg-muted flex items-center justify-center">
                  <ImageIcon size={32} className="text-muted-foreground" />
                </div>
              )}

              <div className="p-2 space-y-1">
                <p className="text-xs text-muted-foreground truncate" title={img.filename}>
                  {img.filename}
                </p>
                {img.isMain ? (
                  <Badge className="text-[10px] py-0 h-5 gap-1">
                    <Star size={9} />
                    Image principale
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 text-[10px] px-1 w-full justify-start gap-1 text-muted-foreground"
                    onClick={() => handleSetMain(img.id)}
                  >
                    <Star size={9} />
                    Définir principale
                  </Button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(img.id)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer l'image"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
