const { Pool } = require('pg');
const crypto = require('crypto');
const pool = new Pool({ connectionString: 'postgresql://postgres:proquelec_secure_db_pass@localhost:5432/proquelec' });
function id(){return 'h'+Date.now()+'_'+crypto.randomBytes(4).toString('hex');}

const HTML = `<section class="relative bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] text-white py-20 px-4">
  <div class="max-w-6xl mx-auto text-center">
    <span class="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/20">CONTACT</span>
    <h1 class="text-4xl md:text-5xl font-black mb-4">Contactez-nous</h1>
    <p class="text-xl text-white/80 max-w-3xl mx-auto">Une question, un besoin de controle ou de formation ? Notre equipe est a votre ecoute.</p>
  </div>
</section>
<section class="py-16 px-4 bg-gray-50">
  <div class="max-w-6xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div id="successMessage" style="display:none;text-align:center;padding:40px 20px">
            <div style="font-size:60px;margin-bottom:20px">&#10004;</div>
            <h2 style="font-size:28px;font-weight:bold;color:#166534;margin-bottom:8px">Message envoye</h2>
            <p style="font-size:16px;color:#6b7280">Merci de votre message. Notre equipe vous repondra dans les plus brefs delais.</p>
          </div>
          <div id="formContainer">
            <h2 style="font-size:24px;font-weight:bold;color:#111827;margin-bottom:24px">Envoyez-nous un message</h2>
            <div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
                <div><label style="display:block;font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Nom complet</label><input id="fnom" type="text" placeholder="Votre nom" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;outline:none"></div>
                <div><label style="display:block;font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Email</label><input id="femail" type="email" placeholder="votre@email.com" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;outline:none"></div>
              </div>
              <div style="margin-bottom:16px"><label style="display:block;font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Telephone</label><input id="ftel" type="tel" placeholder="+221 33 000 00 00" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;outline:none"></div>
              <div style="margin-bottom:16px"><label style="display:block;font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Sujet</label><select id="fsujet" style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;outline:none;background:white">
                <option value="">Selectionnez un sujet</option>
                <option value="Controle de conformite">Controle de conformite</option>
                <option value="Formation">Formation / Certification</option>
                <option value="Partenariat">Partenariat</option>
                <option value="Information">Demande information</option>
                <option value="Autre">Autre</option>
              </select></div>
              <div style="margin-bottom:16px"><label style="display:block;font-size:14px;font-weight:600;color:#374151;margin-bottom:6px">Message</label><textarea id="fmsg" rows="5" placeholder="Decrivez votre demande..." style="width:100%;padding:12px 16px;border:1px solid #e5e7eb;border-radius:12px;outline:none"></textarea></div>
              <button id="sendBtn" type="button" onclick="var b=this,n=document.getElementById('fnom').value,e=document.getElementById('femail').value,t=document.getElementById('ftel').value,s=document.getElementById('fsujet').value,m=document.getElementById('fmsg').value;if(!n||!e||!m){alert('Remplissez les champs obligatoires');return;}b.disabled=true;b.textContent='Envoi...';var x=new XMLHttpRequest();x.open('POST','/api/contact-requests',true);x.setRequestHeader('Content-Type','application/json');x.onload=function(){if(x.status>=200&&x.status<300){document.getElementById('formContainer').style.display='none';document.getElementById('successMessage').style.display='block';}else{alert('Erreur');b.disabled=false;b.textContent='Envoyer';}};x.onerror=function(){alert('Erreur reseau');b.disabled=false;b.textContent='Envoyer';};x.send(JSON.stringify({nom:n,email:e,telephone:t,sujet:s,message:m}));" style="width:100%;padding:16px 32px;background:linear-gradient(to right,#2563eb,#1d4ed8);color:white;border:none;border-radius:12px;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 4px 14px rgba(37,99,235,0.3)">Envoyer le message</button>
            </div>
          </div>
        </div>
      </div>
      <div class="space-y-4">
        <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0"><span class="text-xl text-white">&#x1f4cd;</span></div><div><h3 class="font-semibold text-gray-900">Adresse</h3><p class="text-sm text-gray-500 mt-0.5">Route Aeroport, Mermoz<br/>BP 1234 Dakar</p></div></div></div>
        <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shrink-0"><span class="text-xl text-white">&#x1f4de;</span></div><div><h3 class="font-semibold text-gray-900">Telephone</h3><p class="text-sm text-gray-500 mt-0.5">+221 33 000 00 00</p></div></div></div>
        <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0"><span class="text-xl text-white">&#x2709;</span></div><div><h3 class="font-semibold text-gray-900">Email</h3><p class="text-sm text-gray-500 mt-0.5">contact@proquelec.sn</p></div></div></div>
        <div class="bg-white rounded-2xl p-6 shadow-md border border-gray-100"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0"><span class="text-xl text-white">&#x1f552;</span></div><div><h3 class="font-semibold text-gray-900">Horaires</h3><p class="text-sm text-gray-500 mt-0.5">Lun-Jeu: 8h-17h<br/>Ven: 8h-13h</p></div></div></div>
      </div>
    </div>
  </div>
</section>`;

async function run() {
  const hid = id();
  const struct = {
    ROOT: { type: { resolvedName: 'ContainerBlock' }, nodes: [hid], props: { padding: 0, maxWidth: '100%', backgroundColor: '#ffffff' }, custom: {}, hidden: false, isCanvas: true, displayName: 'Page: Contact', linkedNodes: {} },
    [hid]: { type: { resolvedName: 'HtmlBlock' }, nodes: [], props: { html: HTML, padding: 0 }, custom: {}, hidden: false, parent: 'ROOT', isCanvas: false, displayName: 'Formulaire', linkedNodes: {} }
  };
  await pool.query("UPDATE pages SET structure_json=$1::jsonb WHERE slug='contact'", [JSON.stringify(struct)]);
  await pool.query("UPDATE pages SET structure_json=$1::jsonb WHERE slug='contact-form'", [JSON.stringify(struct)]);
  console.log('OK');
  await pool.end();
}

run().catch(e => { console.error(e); process.exit(1); });
