import { useEffect, useState } from 'react';
import type { DownloadButtonConfig } from '../components/ConfigurableDownloadButton';
import { apiFetch } from '@/lib/api-client';

export function useDownloadButtons() {
  const [buttons, setButtons] = useState<DownloadButtonConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les boutons
  const fetchButtons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<DownloadButtonConfig[]>('/api/download-buttons');
      setButtons(data || []);
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter ou mettre à jour un bouton
  const upsertButton = async (button: DownloadButtonConfig) => {
    setLoading(true);
    setError(null);
    try {
      if (button.id) {
        await apiFetch(`/api/download-buttons/${button.id}`, {
          method: 'PUT',
          body: JSON.stringify(button)
        });
      } else {
        await apiFetch('/api/download-buttons', {
          method: 'POST',
          body: JSON.stringify(button)
        });
      }
      await fetchButtons();
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un bouton
  const deleteButton = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiFetch(`/api/download-buttons/${id}`, {
        method: 'DELETE'
      });
      await fetchButtons();
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchButtons();
  }, []);

  return { buttons, loading, error, fetchButtons, upsertButton, deleteButton };
}