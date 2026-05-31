import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MediaLibrary, MediaFile } from '@/components/MediaLibrary';
import { normalizeUploadUrl } from '@/lib/normalizeUploadUrl';

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

export function MediaPickerDialog({ open, onOpenChange, onSelect }: MediaPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Médiathèque</DialogTitle>
        </DialogHeader>
        <MediaLibrary onSelect={(file: MediaFile) => { onSelect(normalizeUploadUrl(file.file_path)); onOpenChange(false); }} />
      </DialogContent>
    </Dialog>
  );
}

export function MediaPickerButton({ onSelect, label = 'Choisir une image' }: { onSelect: (url: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2 w-full">
        <ImageIcon size={14} /> {label}
      </Button>
      <MediaPickerDialog open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  );
}
