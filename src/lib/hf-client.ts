/* Helper minimal pour appeler l'API Inference de Hugging Face
   Usage:
     import { hfGenerate } from '@/lib/hf-client';
     const out = await hfGenerate('bigcode/starcoder', 'Comment écrire une fonction X ?', { max_new_tokens: 256 });

   Configurez la variable d'environnement VITE_HF_TOKEN dans votre `.env` ou secrets.
*/

export async function hfGenerate(
  model: string,
  inputs: string,
  options?: Record<string, unknown>
) {
  const token = (import.meta.env as any).VITE_HF_TOKEN as string | undefined;

  if (!token) {
    throw new Error('VITE_HF_TOKEN non configuré. Créez un token Hugging Face et ajoutez-le à .env');
  }

  const url = `https://api-inference.huggingface.co/models/${model}`;

  const body: any = { inputs };
  if (options) body.parameters = options;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Hugging Face API error: ${res.status} ${txt}`);
  }

  const data = await res.json();

  // La réponse peut être une chaîne JSON ou un tableau selon le modèle
  return data;
}
