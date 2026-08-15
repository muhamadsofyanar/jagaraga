import { existsSync, readFileSync } from 'node:fs';

const indexSource = readFileSync('src/catalog/index.ts', 'utf8');
const groupFiles = [...indexSource.matchAll(/from '\.\/groups\/(.+)'/g)].map((match) => `src/catalog/groups/${match[1]}.ts`);
const ids = groupFiles.flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/id: '([a-z0-9-]+)'/g)].map((match) => match[1]));

if (ids.length !== 60 || new Set(ids).size !== 60) throw new Error(`Expected 60 unique catalog IDs, got ${ids.length}`);
for (const id of ids) {
  if (!existsSync(`public/movement/${id}.png`)) throw new Error(`Missing public/movement/${id}.png`);
}

console.log('Verified 60 movement illustrations');
