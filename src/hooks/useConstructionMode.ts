
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from './useSession';
import { startTransition } from 'react';

interface ConstructionModeData {
  is_enabled: boolean;
}

export const useConstructionMode = () => {
  const [isConstructionMode, setIsConstructionMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useSession();

  useEffect(() => {
    fetchConstructionMode();

    let mounted = true;
    let channel: any = null;

    const setupSubscription = async () => {
      // Désactiver en local car le pont API ne supporte pas Realtime
      if (import.meta.env.VITE_SUPABASE_URL?.includes('localhost')) {
        return;
      }
      try {
        // Nettoyer l'ancien channel avant de créer un nouveau
        const existingChannels = supabase.getChannels();
        const existingChannel = existingChannels.find(ch => ch.topic === 'construction-mode-changes');
        if (existingChannel) {
          await existingChannel.unsubscribe();
        }

        // Créer le nouveau channel
        channel = supabase
          .channel('construction-mode-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'construction_mode'
            },
            (payload) => {
              console.log('Changement mode construction:', payload);
              if (mounted && payload.new && typeof (payload.new as ConstructionModeData).is_enabled === 'boolean') {
                startTransition(() => {
                  setIsConstructionMode((payload.new as ConstructionModeData).is_enabled);
                });
              }
            }
          );

        await channel.subscribe();
      } catch (error) {
        console.error('Erreur lors de la configuration de la souscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  const fetchConstructionMode = async () => {
    try {
      // console.log('Récupération de l\'état du mode construction...');
      const { data, error } = await supabase
        .from('construction_mode')
        .select('is_enabled')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du mode construction:', error);
        return;
      }

      // console.log('Mode construction récupéré:', data);
      const isEnabled = (data as ConstructionModeData)?.is_enabled ?? true;
      startTransition(() => {
        setIsConstructionMode(isEnabled);
      });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      startTransition(() => {
        setIsLoading(false);
      });
    }
  };

  const grantAccess = async () => {
    try {
      console.log('Désactivation du mode construction...');
      const { error } = await supabase
        .from('construction_mode')
        .update({
          is_enabled: false,
          updated_by: user?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) {
        console.error('Erreur lors de la désactivation du mode construction:', error);
      } else {
        console.log('Mode construction désactivé avec succès');
        startTransition(() => {
          setIsConstructionMode(false);
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const revokeAccess = async () => {
    if (!user) return;

    try {
      console.log('Activation du mode construction...');
      const { error } = await supabase
        .from('construction_mode')
        .update({
          is_enabled: true,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) {
        console.error('Erreur lors de l\'activation du mode construction:', error);
      } else {
        console.log('Mode construction activé avec succès');
        startTransition(() => {
          setIsConstructionMode(true);
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return {
    isConstructionMode,
    isLoading,
    grantAccess,
    revokeAccess
  };
};
