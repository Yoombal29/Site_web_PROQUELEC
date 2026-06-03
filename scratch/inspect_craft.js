const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'node_modules', '@craftjs', 'core', 'dist', 'cjs');
const walk = (d) => {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((ent) => {
    const full = path.join(d, ent.name);
    if (ent.isDirectory()) return walk(full);
    if (ent.isFile() && ent.name.endsWith('.js')) return [full];
    return [];
  });
};
walk(dir).forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const re = /serializeNode|deserialize|ROOT/g;
  let m;
  while ((m = re.exec(content))) {
    const line = content.substring(0, m.index).split('\n').length;
    console.log(`${file}:${line}:${m[0]}`);
  }
});
