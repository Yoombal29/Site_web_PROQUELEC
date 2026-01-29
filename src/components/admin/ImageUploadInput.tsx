
import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useUploadFile } from '@/hooks/useUploadFile';
import { toast } from 'sonner';

interface ImageUploadInputProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  bucketName: string;
}

export default function ImageUploadInput({ value, onChange, bucketName }: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadFile(bucketName);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Fichier sélectionné:', file.name, file.type, file.size);
      
      try {
        const publicUrl = await uploadMutation.mutateAsync(file);
        console.log('URL reçue:', publicUrl);
        onChange(publicUrl);
        toast.success("Image téléversée avec succès !");
      } catch (error: any) {
        console.error('Erreur de téléversement détaillée:', error);
        toast.error(`Erreur de téléversement: ${error.message}`);
      } finally {
        // Réinitialiser l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const isUploading = uploadMutation.isPending;

  return (
    <div>
      <div className="flex items-center gap-4">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-grow"
          placeholder="Coller une URL ou téléverser un fichier"
          type="url"
          disabled={isUploading}
        />
        <Button type="button" variant="outline" onClick={handleButtonClick} disabled={isUploading}>
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {isUploading ? 'Téléversement...' : 'Téléverser'}
        </Button>
      </div>
      {value && (
        <div className="mt-4">
          <span className="block text-sm font-medium text-gray-700 mb-2">Aperçu:</span>
          <img src={value} alt="Aperçu" className="h-24 w-auto object-contain rounded border p-2 bg-gray-50" />
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/svg+xml, image/webp, image/gif"
        disabled={isUploading}
      />
    </div>
  );
}
