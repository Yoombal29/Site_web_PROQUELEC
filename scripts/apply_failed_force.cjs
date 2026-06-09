#!/usr/bin/env node
/*
 * Tentative d'écriture forcée des pages exportées dans tmp/failed.
 * Attention: met session_replication_role = replica pour désactiver triggers.
 * Nécessite des privilèges suffisants (superuser) sur la base.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec';
const pool = new Pool({ connectionString: DATABASE_URL });

async function main(){
  const dir = path.resolve(process.cwd(),'tmp','failed');
  if(!fs.existsSync(dir)) { console.error('No tmp/failed directory found'); process.exit(1); }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  if(files.length===0){ console.log('No files to apply'); return; }

  const client = await pool.connect();
  try{
    for(const file of files){
      const slug = path.basename(file, '.json');
      const data = JSON.parse(fs.readFileSync(path.join(dir,file),'utf8'));
      const json = JSON.stringify(data);
      try{
        await client.query('BEGIN');
        await client.query("SET LOCAL session_replication_role = 'replica'");
        const res = await client.query('UPDATE public.pages SET structure_json = $1::jsonb, draft_json = $1::jsonb, updated_at = NOW() WHERE slug = $2 RETURNING id, slug', [json, slug]);
        await client.query('RESET session_replication_role');
        await client.query('COMMIT');
        if(res.rowCount>0) console.log('Forced update applied for', slug);
        else console.warn('No row updated for', slug);
      }catch(e){
        await client.query('ROLLBACK');
        console.error('Force update failed for', slug, e.message || e);
      }
    }
  }finally{ client.release(); await pool.end(); }
}

main().catch(e=>{ console.error(e); process.exit(1); });
