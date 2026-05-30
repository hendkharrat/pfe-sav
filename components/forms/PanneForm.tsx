'use client';

import { useState } from 'react';
import { Equipment, InterventionPriorite } from '@/types';
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
import { INTERVENTION_PRIORITY_LABELS, EQUIPMENT_TYPE_LABELS } from '@/lib/constants';
import { AlertCircle, Paperclip, Send, X } from 'lucide-react';

interface PanneFormProps {
  clientId: string;
  equipments: Equipment[];
  onSubmit: (data: {
    equipementId: string;
    description: string;
    priorite: InterventionPriorite;
    pieceJointeNom?: string;
  }) => void;
  isLoading?: boolean;
}

export function PanneForm({ clientId, equipments, onSubmit, isLoading = false }: PanneFormProps) {
  const [formData, setFormData] = useState({
    equipementId: '',
    description: '',
    priorite: 'MOYENNE' as InterventionPriorite,
    pieceJointeNom: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.equipementId) {
      newErrors.equipementId = 'Veuillez sélectionner un équipement';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description de la panne est obligatoire';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'La description doit faire au moins 20 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, pieceJointeNom: file.name }));
    }
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, pieceJointeNom: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      equipementId: formData.equipementId,
      description: formData.description.trim(),
      priorite: formData.priorite,
      pieceJointeNom: formData.pieceJointeNom || undefined,
    });

    // Reset Form
    setFormData({
      equipementId: '',
      description: '',
      priorite: 'MOYENNE',
      pieceJointeNom: '',
    });
    setErrors({});
  };

  return (
    <Card className="shadow-lg border-border hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold text-foreground">Déclarer une panne</CardTitle>
        <CardDescription>
          Signalez un dysfonctionnement sur l&apos;un de vos équipements sous contrat. Un administrateur prendra en charge votre demande rapidement.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Equipment Selector */}
          <div className="space-y-2">
            <Label htmlFor="equipement" className="text-sm font-semibold">
              Mon équipement *
            </Label>
            <Select
              value={formData.equipementId}
              onValueChange={(value) => setFormData({ ...formData, equipementId: value })}
              disabled={isLoading}
            >
              <SelectTrigger id="equipement" className="h-10">
                <SelectValue placeholder="Sélectionner l'équipement en panne" />
              </SelectTrigger>
              <SelectContent>
                {equipments.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Aucun équipement disponible
                  </SelectItem>
                ) : (
                  equipments.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.reference} - {eq.marque} {eq.modele} ({EQUIPMENT_TYPE_LABELS[eq.type]} - {eq.localisation})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.equipementId && (
              <p className="text-xs text-red-500 flex items-center gap-1.5 mt-1 font-medium">
                <AlertCircle size={14} />
                {errors.equipementId}
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
              placeholder="Décrivez précisément le problème rencontré (ex: fuite d'eau constante, sifflement suspect, arrêt automatique de la climatisation...)"
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

          {/* Attachment */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold block">Pièce jointe (facultatif)</Label>
            {!formData.pieceJointeNom ? (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9 text-muted-foreground hover:text-foreground cursor-pointer relative"
                  asChild
                >
                  <label htmlFor="file-upload">
                    <Paperclip size={16} />
                    Ajouter un fichier (photo, audio...)
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={isLoading}
                    />
                  </label>
                </Button>
                <span className="text-xs text-muted-foreground">Formats acceptés : JPG, PNG, PDF (max 5Mo)</span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/40 border border-border text-sm font-medium animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Paperclip size={16} className="text-primary" />
                  <span className="text-foreground truncate max-w-[200px] sm:max-w-md">
                    {formData.pieceJointeNom}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  disabled={isLoading}
                >
                  <X size={16} />
                </Button>
              </div>
            )}
          </div>

          {/* Submit button */}
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
      </CardContent>
    </Card>
  );
}
