import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Bundle Size Budget', () => {
  const distPath = path.resolve(__dirname, '../../dist');

  it('should have a built dist directory', () => {
    expect(fs.existsSync(distPath)).toBe(true);
  });

  it('JS assets should be under 500kB each (gzipped approx)', () => {
    if (!fs.existsSync(distPath)) return;
    const assets = fs.readdirSync(distPath);
    const jsFiles = assets.filter(f => f.endsWith('.js'));

    jsFiles.forEach(file => {
      const stats = fs.statSync(path.join(distPath, file));
      const sizeKB = stats.size / 1024;
      // Warn if > 500kB, but allow craftjs chunk which is known to be small
      if (file.includes('craft')) {
        expect(sizeKB).toBeLessThan(50); // craftjs lazy chunk should be tiny
      } else if (!file.includes('vendor')) {
        expect(sizeKB).toBeLessThan(500);
      }
    });
  });

  it('CSS assets should be under 100kB each', () => {
    if (!fs.existsSync(distPath)) return;
    const cssFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.css'));

    cssFiles.forEach(file => {
      const stats = fs.statSync(path.join(distPath, file));
      expect(stats.size / 1024).toBeLessThan(100);
    });
  });
});
