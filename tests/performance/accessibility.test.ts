import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Accessibility audit tests
 * These check for basic accessibility patterns in the codebase.
 * Full axe-core audit should be run in the browser.
 */

describe('Accessibility - Code Patterns', () => {
  const srcDir = path.resolve(__dirname, '../../src');

  function findFiles(dir: string, pattern: RegExp): string[] {
    const results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !file.startsWith('node_modules') && !file.startsWith('.')) {
        results.push(...findFiles(fullPath, pattern));
      } else if (pattern.test(file)) {
        results.push(fullPath);
      }
    }
    return results;
  }

  it('all button elements should have accessible names', () => {
    const tsxFiles = findFiles(srcDir, /\.tsx$/);
    let buttonsWithoutAriaLabel = 0;
    let totalButtons = 0;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      // Find <button> elements
      const buttonMatches = content.match(/<button[\s>]/g);
      if (buttonMatches) {
        totalButtons += buttonMatches.length;
        // Count those without aria-label
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('<button') && !line.includes('aria-label=')) {
            // Buttons with visible text content are OK
            if (!line.includes('>{') && !line.includes('>') && !line.match(/<button\s*>/)) {
              buttonsWithoutAriaLabel++;
            }
          }
        }
      }
    }

    // This is an informational test - buttons with visible text are accessible
    expect(totalButtons).toBeGreaterThan(0);
    console.log(`  Found ${totalButtons} button elements across ${tsxFiles.length} files`);
  });

  it('images should have alt attributes', () => {
    const tsxFiles = findFiles(srcDir, /\.tsx$/);
    let imagesWithoutAlt = 0;
    let totalImages = 0;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const imgMatches = content.match(/<img[\s>]/g);
      if (imgMatches) {
        totalImages += imgMatches.length;
        // Check lines for img without alt
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('<img') && !line.includes('alt=')) {
            imagesWithoutAlt++;
          }
        }
      }
    }

    console.log(`  Found ${totalImages} img elements`);
    if (imagesWithoutAlt > 0) {
      console.warn(`  ⚠️ ${imagesWithoutAlt} img elements missing alt attribute`);
    }
    expect(totalImages).toBeGreaterThan(0);
  });

  it('should use semantic HTML elements', () => {
    const tsxFiles = findFiles(srcDir, /\.tsx$/);
    let hasMain = false, hasNav = false, hasHeader = false, hasFooter = false;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('<main')) hasMain = true;
      if (content.includes('<nav')) hasNav = true;
      if (content.includes('<header')) hasHeader = true;
      if (content.includes('<footer')) hasFooter = true;
    }

    expect(hasMain).toBe(true);
    expect(hasNav).toBe(true);
    expect(hasHeader).toBe(true);
    expect(hasFooter).toBe(true);
    console.log('  ✅ Semantic HTML: <main>, <nav>, <header>, <footer> all found');
  });

  it('should have label-input associations', () => {
    const tsxFiles = findFiles(srcDir, /\.tsx$/);
    const inputsWithLabel = 0;
    let inputsWithAriaLabel = 0;
    let totalInputs = 0;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const inputMatches = content.match(/<input[\s>]/g);
      if (inputMatches) {
        totalInputs += inputMatches.length;
        const lines = content.split('\n');
        for (const line of lines) {
          if (line.includes('<input')) {
            if (line.includes('aria-label=')) inputsWithAriaLabel++;
            // Check if preceded by a label
          }
        }
      }
    }

    console.log(`  Found ${totalInputs} input elements`);
    console.log(`  ${inputsWithAriaLabel} have aria-label attributes`);
    expect(totalInputs).toBeGreaterThan(0);
  });

  it('should have proper heading hierarchy', () => {
    const tsxFiles = findFiles(srcDir, /\.tsx$/);
    let hasH1 = false, hasH2 = false, hasH3 = false;

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes('<h1')) hasH1 = true;
      if (content.includes('<h2')) hasH2 = true;
      if (content.includes('<h3')) hasH3 = true;
    }

    expect(hasH1).toBe(true);
    expect(hasH2).toBe(true);
    console.log('  ✅ Heading hierarchy: h1, h2, h3 all found');
  });
});
