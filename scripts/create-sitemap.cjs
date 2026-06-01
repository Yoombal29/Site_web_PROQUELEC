const { Pool } = require('pg');
const pool = new Pool({host:'127.0.0.1',port:5437,database:'proquelec',user:'postgres',password:'proquelec_secure_db_pass',ssl:false});

(async()=>{
  // Récupérer toutes les pages pour le plan du site
  const {rows} = await pool.query('select slug,title from pages where is_published=true order by slug');
  let items = '';
  for(const r of rows){
    items += '<a href="/'+r.slug+'" class="block p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"><span class="font-semibold text-gray-900">'+r.title+'</span><br><span class="text-xs text-gray-400">/'+r.slug+'</span></a>';
  }

  const html = `<section class="py-20 px-4 bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto">
    <div class="text-center mb-12">
      <span class="inline-block px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold mb-4">NAVIGATION</span>
      <h1 class="text-4xl font-black text-gray-900 mb-4">Plan du site</h1>
      <p class="text-lg text-gray-600">Retrouvez toutes les pages du site PROQUELEC.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${items}
    </div>
  </div>
</section>`;

  const exists = await pool.query('select id from pages where slug=$1', ['plan-du-site']);
  if(exists.rows.length > 0){
    await pool.query("update pages set content=$1, structure_json=null, updated_at=now() where slug=$2", [html, 'plan-du-site']);
    console.log('Page plan-du-site mise à jour');
  } else {
    await pool.query("insert into pages(slug,title,content,is_published,status,created_at,updated_at) values($1,$2,$3,true,'published',now(),now())", ['plan-du-site', 'Plan du site', html]);
    console.log('Page plan-du-site créée');
  }

  await pool.end();
})();
