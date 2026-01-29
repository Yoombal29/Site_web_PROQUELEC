import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { DownloadButtonConfig } from '../components/ConfigurableDownloadButton';

export function useDownloadButtons() {
  const [buttons, setButtons] = useState<DownloadButtonConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger tous les boutons
  const fetchButtons = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('download_buttons')
      .select('*')
      .order('created_at', { ascending: false });
    setLoading(false);
    if (error) setError(error.message);
    else setButtons(data || []);
  };

  // Ajouter ou mettre à jour un bouton
  const upsertButton = async (button: DownloadButtonConfig) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('download_buttons')
      .upsert([button], { onConflict: ['id'] });
    setLoading(false);
    if (error) setError(error.message);
    else await fetchButtons();
  };

  // Supprimer un bouton
  const deleteButton = async (id: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from('download_buttons')
      .delete()
      .eq('id', id);
    setLoading(false);
    if (error) setError(error.message);
    else await fetchButtons();
  };

  useEffect(() => {
    fetchButtons();
  }, []);

  return { buttons, loading, error, fetchButtons, upsertButton, deleteButton };
}
