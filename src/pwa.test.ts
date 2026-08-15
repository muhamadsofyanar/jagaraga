import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('ships a same-origin-only offline service worker', () => {
  const worker = readFileSync('public/sw.js', 'utf8');
  expect(worker).toContain("request.url.startsWith(self.location.origin)");
  expect(worker).not.toMatch(/youtube|googleapis|googletagmanager/i);
  const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  expect(manifest.name).toBe('JagaRaga');
  expect(manifest.display).toBe('standalone');
});
