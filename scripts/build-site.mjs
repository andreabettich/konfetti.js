// Copies the freshly built core bundle into site/lib so the site always demos the current code.
// Run `pnpm --filter @konfetti-js/core build` first (or use `pnpm site:build`).
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'packages/core/dist');
const target = join(root, 'site/lib');

const files = ['index.js', 'index.js.map'];

for (const file of files) {
  if (!existsSync(join(dist, file))) {
    console.error(`Missing ${file} in packages/core/dist. Build core first.`);
    process.exit(1);
  }
}

mkdirSync(target, { recursive: true });
for (const file of files) {
  copyFileSync(join(dist, file), join(target, file));
}
console.log(`Copied ${files.length} files to site/lib`);
