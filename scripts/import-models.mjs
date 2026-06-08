import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MODELS_DIR = path.resolve(__dirname, '../model-page');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

try {
  const files = fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith('.html'));
  console.log(files.length + ' modeles...');

  let ok = 0,
    up = 0;
  for (const file of files) {
    const html = fs.readFileSync(path.join(MODELS_DIR, file), 'utf-8');
    const name = file.replace('.html', '');
    const displayName = name
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const structure = JSON.stringify({ type: 'html', content: html, css: 'tailwind' });

    const exist = await pool.query('SELECT id FROM public.page_templates WHERE name = $1', [
      displayName,
    ]);
    if (exist.rows.length === 0) {
      await pool.query(
        'INSERT INTO public.page_templates (name, description, structure, category) VALUES ($1, $2, $3, $4)',
        [displayName, 'Modele de page: ' + displayName, structure, 'page_model'],
      );
      ok++;
    } else {
      await pool.query(
        'UPDATE public.page_templates SET structure = $1, updated_at = NOW() WHERE name = $2',
        [structure, displayName],
      );
      up++;
    }
  }

  console.log(ok + ' nouveaux, ' + up + ' mis a jour');
  await pool.end();
} catch (err) {
  console.error('Erreur:', err.message);
  await pool.end();
}
