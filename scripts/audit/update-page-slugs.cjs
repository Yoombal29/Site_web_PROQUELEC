const fs = require('fs');
const path = require('path');

// Mapping des pages vers leur slug
const pageSlugs = {
  'About.tsx': 'about',
  'Activities.tsx': 'activities',
  'Labels.tsx': 'labels',
  'Documents.tsx': 'documents',
  'Events.tsx': 'events',
  'Certifications.tsx': 'certifications',
  'Trainings.tsx': 'trainings',
  'Blog.tsx': 'blog',
  'Contact.tsx': 'contact'
};

Object.entries(pageSlugs).forEach(([pageName, slug]) => {
  const filePath = path.join(__dirname, pageName);
  const componentName = pageName.replace('.tsx', '');

  const dynamicContent = `import DynamicPage from "./DynamicPage";

const ${componentName} = () => {
  return <DynamicPage slug="${slug}" />;
};

export default ${componentName};
`;

  try {
    fs.writeFileSync(filePath, dynamicContent, 'utf8');
    console.log('✅ ' + pageName + ' mis à jour avec slug: ' + slug);
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de ' + pageName + ':', error);
  }
});

console.log('🎉 Mise à jour des slugs terminée !');