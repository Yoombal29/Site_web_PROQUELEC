const fs = require('fs');
const path = require('path');

// Liste des pages à convertir en dynamique
const pages = [
  'About.tsx',
  'Activities.tsx',
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

  // Contenu dynamique pour chaque page
  const componentName = pageName.replace('.tsx', '');
  const dynamicContent = `import { DynamicPage } from "./DynamicPage";

const ${componentName} = () => {
  return <DynamicPage />;
};

export default ${componentName};
`;

  try {
    fs.writeFileSync(filePath, dynamicContent, 'utf8');
    console.log('✅ ' + pageName + ' converti en page dynamique');
  } catch (error) {
    console.error('❌ Erreur lors de la conversion de ' + pageName + ':', error);
  }
});

console.log('🎉 Conversion terminée !');