'use client';

import { useState } from 'react';
import { ClientEquipement, PieceJointe, InterventionPriorite } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { INTERVENTION_PRIORITY_LABELS } from '@/lib/constants';
import { AlertCircle, File, ImageIcon, Paperclip, Send, X } from 'lucide-react';
import { mockEquipments } from '@/data/mock-equipments';

const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5 MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function readFileAsDataURL(file: File): Promise<string | undefined> {
  if (!file.type.startsWith('image/')) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string | undefined);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
}

interface PanneFormProps {
  clientId: string;
  clientEquipements: ClientEquipement[];
  onSubmit: (data: {
    clientEquipementId: string;
    equipementId: string;
    description: string;
    priorite: InterventionPriorite;
    piecesJointes: PieceJointe[];
  }) => void;
  isLoading?: boolean;
  noCard?: boolean;
}

export function PanneForm({
  clientEquipements,
  onSubmit,
  isLoading = false,
  noCard = false,
}: PanneFormProps) {
  const [formData, setFormData] = useState({
    clientEquipementId: '',
    description: '',
    priorite: 'MOYENNE' as InterventionPriorite,
  });

  const [files, setFiles] = useState<PieceJointe[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.clientEquipementId) {
      newErrors.clientEquipementId = 'Veuillez sélectionner un équipement';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description de la panne est obligatoire';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit faire au moins 20 caractères';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const fileArray = Array.from(fileList);
    const previews = await Promise.all(fileArray.map(readFileAsDataURL));
    const newPJs: PieceJointe[] = fileArray.map((file, idx) => ({
      id: `pj-${Date.now()}-${idx}`,
      filename: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      previewUrl: previews[idx],
    }));
    setFiles((prev) => [...prev, ...newPJs]);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    const ce = clientEquipements.find((c) => c.id === formData.clientEquipementId);
    if (!ce) return;
    onSubmit({
      clientEquipementId: formData.clientEquipementId,
      equipementId: ce.equipementId,
      description: formData.description.trim(),
      priorite: formData.priorite,
      piecesJointes: files,
    });
    setFormData({ clientEquipementId: '', description: '', priorite: 'MOYENNE' });
    setFiles([]);
    setErrors({});
  };

  const largeFiles = files.filter((f) => f.size > LARGE_FILE_THRESHOLD);

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Equipment Selector */}
      <div className="space-y-2">
        <Label htmlFor="equipement" className="text-sm font-semibold">
          Mon équipement *
        </Label>
        <Select
          value={formData.clientEquipementId}
          onValueChange={(value) => setFormData({ ...formData, clientEquipementId: value })}
          disabled={isLoading}
        >
          <SelectTrigger id="equipement" className="h-10">
            <SelectValue placeholder="Sélectionner l'équipement en panne" />
          </SelectTrigger>
          <SelectContent>
            {clientEquipements.length === 0 ? (
              <SelectItem value="__none__" disabled>
                Aucun équipement disponible
              </SelectItem>
            ) : (
              clientEquipements.map((ce) => {
                const eq = mockEquipments.find((e) => e.id === ce.equipementId);
                const label = eq
                  ? `${eq.reference} — ${eq.marque} ${eq.modele} (${ce.localisation})`
                  : ce.equipementId;
                return (
                  <SelectItem key={ce.id} value={ce.id}>
                    {label}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
        {errors.clientEquipementId && (
          <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-medium">
            <AlertCircle size={14} />
            {errors.clientEquipementId}
          </p>
        )}
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <Label htmlFor="priorite" className="text-sm font-semibold">
          Priorité *
        </Label>
        <Select
          value={formData.priorite}
          onValueChange={(value) =>
            setFormData({ ...formData, priorite: value as InterventionPriorite })
          }
          disabled={isLoading}
        >
          <SelectTrigger id="priorite" className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FAIBLE">{INTERVENTION_PRIORITY_LABELS['FAIBLE']}</SelectItem>
            <SelectItem value="MOYENNE">{INTERVENTION_PRIORITY_LABELS['MOYENNE']}</SelectItem>
            <SelectItem value="ELEVEE">{INTERVENTION_PRIORITY_LABELS['ELEVEE']}</SelectItem>
            <SelectItem value="URGENTE">{INTERVENTION_PRIORITY_LABELS['URGENTE']}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="description" className="text-sm font-semibold">
            Description de la panne *
          </Label>
          <span className="text-xs text-muted-foreground font-medium">
            {formData.description.trim().length} / 20 caractères min
          </span>
        </div>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Décrivez précisément le problème rencontré (ex: fuite d'eau, sifflement, arrêt automatique...)"
          className="min-h-[120px] resize-y"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-medium">
            <AlertCircle size={14} />
            {errors.description}
          </p>
        )}
      </div>

      {/* Attachments — multiple files */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Pièces jointes (facultatif)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer relative"
            asChild
          >
            <label htmlFor="file-upload">
              <Paperclip size={14} />
              Ajouter des fichiers
              <input
                id="file-upload"
                type="file"
                multiple
                className="sr-only"
                onChange={handleFilesChange}
                disabled={isLoading}
              />
            </label>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Formats acceptés : images (JPG, PNG…), PDF, audio — max 5 Mo recommandé par fichier
        </p>

        {largeFiles.length > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5">
            <AlertCircle size={12} />
            {largeFiles.length === 1
              ? '1 fichier dépasse 5 Mo — la transmission peut être lente.'
              : `${largeFiles.length} fichiers dépassent 5 Mo — la transmission peut être lente.`}
          </p>
        )}

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((pj) => (
              <div
                key={pj.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-accent/40 border border-border animate-in fade-in duration-150"
              >
                {pj.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pj.previewUrl}
                    alt={pj.filename}
                    className="w-10 h-10 rounded object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted border border-border flex items-center justify-center shrink-0">
                    {pj.type.startsWith('image/') ? (
                      <ImageIcon size={16} className="text-muted-foreground" />
                    ) : (
                      <File size={16} className="text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{pj.filename}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatFileSize(pj.size)}
                    {pj.size > LARGE_FILE_THRESHOLD && (
                      <span className="text-amber-600 ml-1">({">"} 5 Mo)</span>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveFile(pj.id)}
                  disabled={isLoading}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 shadow-md transition-all duration-200"
          disabled={isLoading}
        >
          <Send size={16} />
          Envoyer la déclaration
        </Button>
      </div>
    </form>
  );

  if (noCard) return formBody;

  return (
    <Card className="shadow-lg border-border hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold text-foreground">Déclarer une panne</CardTitle>
        <CardDescription>
          Signalez un dysfonctionnement sur l&apos;un de vos équipements sous contrat. Un
          administrateur prendra en charge votre demande rapidement.
        </CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
