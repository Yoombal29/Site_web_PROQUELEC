#!/usr/bin/env node
/* Exporte les pages restant au format legacy dans tmp/failed pour import manuel */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function generateId() { return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,9)}`; }
function mapTypeToResolvedName(type) {
  if (!type) return 'ContainerBlock';
  const key = String(type).toLowerCase();
  const TYPE_MAP = { 'hero': 'HeroBlock', 'html':'HtmlBlock', 'text':'TextBlock', 'columns':'ColumnsBlock' };
  if (TYPE_MAP[key]) return TYPE_MAP[key];
  const pascal = String(type).replace(/[-_\s]+(.)?/g, (_, c) => (c?c.toUpperCase():''));
  return pascal + 'Block';
}
function walk(block, parentId, result) {
  const id = block.id || generateId();
  const resolvedName = mapTypeToResolvedName(block.type || 'container');
  const childIds = [];
  if (Array.isArray(block.children)) {
    for (const child of block.children) childIds.push(walk(child, id, result));
  }
  result[id] = { type: { resolvedName }, nodes: childIds, props: block.props||block.content||{}, custom:{}, hidden:false, parent: parentId||'ROOT', isCanvas: childIds.length>0, displayName: resolvedName, linkedNodes:{} };
  return id;
}
function convert(blocks, title){ const result={}; const roots=[]; for(const b of blocks){ roots.push(walk(b,null,result)); } result['ROOT']={ type:{resolvedName:'ContainerBlock'}, nodes:roots, props:{padding:0,maxWidth:'100%'}, custom:{}, hidden:false, isCanvas:true, displayName:`Page: ${title||'Page'}`, linkedNodes:{} }; return result; }

async function main(){
  const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:proquelec_secure_db_pass@localhost:5437/proquelec';
  const pool = new Pool({ connectionString: DATABASE_URL });
  const client = await pool.connect();
  try{
    const res = await client.query("SELECT id, slug, title, structure_json FROM public.pages WHERE structure_json IS NOT NULL AND jsonb_typeof(structure_json) = 'array'");
    if(res.rowCount===0){ console.log('No remaining legacy pages'); return; }
    const outDir = path.resolve(process.cwd(),'tmp','failed'); fs.mkdirSync(outDir,{recursive:true});
    for(const row of res.rows){ try{ const blocks = Array.isArray(row.structure_json)?row.structure_json:JSON.parse(row.structure_json); const craft = convert(blocks,row.title||row.slug); const file = path.join(outDir, `${row.slug || row.id}.json`); fs.writeFileSync(file, JSON.stringify(craft,null,2),'utf8'); console.log('Exported', row.slug, '->', file); }catch(e){ console.error('Export failed for', row.slug, e.message||e); } }
  }finally{ client.release(); await pool.end(); }
}
main().catch(e=>{ console.error(e); process.exit(1); });
