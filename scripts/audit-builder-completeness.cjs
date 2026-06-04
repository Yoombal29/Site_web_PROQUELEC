const fs = require('fs');
const path = require('path');

const root = process.cwd();
const blockFiles = [
  'src/components/blocks/ProquelecBlocks.tsx',
  'src/components/blocks/ProquelecBlocksPlus.tsx',
];
const templatesFile = 'src/components/god-builder/builderTemplates.tsx';

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const blocks = [];

for (const file of blockFiles) {
  const source = read(file);
  const craftRegex = /(\w+Block)\.craft\s*=\s*\{([\s\S]*?)\n\};/g;
  let match;

  while ((match = craftRegex.exec(source))) {
    const [, name, body] = match;
    blocks.push({
      file,
      name,
      hasDisplayName: /displayName\s*:/.test(body),
      hasProps: /props\s*:/.test(body),
      hasSettings: /related\s*:\s*\{\s*settings\s*:/.test(body),
      usesAutoSettings: /related\s*:\s*\{\s*settings\s*:\s*AutoSettingsPanel/.test(body),
    });
  }
}

const templatesSource = read(templatesFile);
const templateLabels = [];
const templateLines = templatesSource.split(/\r?\n/);

for (let index = 0; index < templateLines.length; index += 1) {
  const match = templateLines[index].match(/label:\s*'([^']+)'/);
  if (!match) continue;

  const nearby = templateLines.slice(index, index + 8).join('\n');
  if (/category:\s*'/.test(nearby)) {
    templateLabels.push(match[1]);
  }
}

const report = {
  totalBlocks: blocks.length,
  totalTemplates: templateLabels.length,
  blocksUsingAutoSettings: blocks.filter((block) => block.usesAutoSettings).length,
  missingDisplayName: blocks.filter((block) => !block.hasDisplayName).map((block) => block.name),
  missingProps: blocks.filter((block) => !block.hasProps).map((block) => block.name),
  missingSettings: blocks.filter((block) => !block.hasSettings).map((block) => block.name),
  templates: templateLabels,
};

console.log(JSON.stringify(report, null, 2));

if (
  report.missingDisplayName.length ||
  report.missingProps.length ||
  report.missingSettings.length
) {
  process.exitCode = 1;
}
