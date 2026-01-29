import { createClient } from '@supabase/supabase-js';

// Créer une seule instance du client Supabase
// Récupération des variables d'environnement (Souverain Local ou Cloud)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase configuration missing!");
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
};
