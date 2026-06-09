const fs = require('fs');
const path = require('path');

// Liste des pages à corriger
const pages = [
  'Labels.tsx',
  'Documents.tsx',
  'Events.tsx',
  'Certifications.tsx',
  'Trainings.tsx',
  'Blog.tsx',
  'Contact.tsx'
];

pages.forEach(pageName => {
  const filePath = path.join(__dirname, pageName);
  const componentName = pageName.replace('.tsx', '');
  const slug = componentName.toLowerCase();

  const correctedContent = `import DynamicPage from "./DynamicPage";

const ${componentName} = () => {
  return <DynamicPage slug="${slug}" />;
};

export default ${componentName};
`;

  try {
    fs.writeFileSync(filePath, correctedContent, 'utf8');
    console.log('✅ ' + pageName + ' corrigé');
  } catch (error) {
    console.error('❌ Erreur lors de la correction de ' + pageName + ':', error);
  }
});

console.log('🎉 Correction terminée !');