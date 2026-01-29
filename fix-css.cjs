const fs = require('fs');
const path = require('path');

function findAndReplace(dir, pattern, replacement) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findAndReplace(filePath, pattern, replacement);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(pattern)) {
        console.log('Found in:', filePath);
        const newContent = content.replace(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&'), 'g'), replacement);
        fs.writeFileSync(filePath, newContent);
        console.log('Fixed:', filePath);
      }
    }
  });
}

findAndReplace('./src', 'text-proqblue-dark/70', 'text-proqblue-dark opacity-70');
findAndReplace('./src', 'text-proqblue-dark/5', 'text-proqblue-dark opacity-50');
findAndReplace('./src', 'from-proqblue/5', 'from-proqblue opacity-50');
findAndReplace('./src', 'to-proqblue-dark/5', 'to-proqblue-dark opacity-50');