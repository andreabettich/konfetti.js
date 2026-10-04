// Checks what consumers will actually install, for every package in packages/:
// publint (package.json correctness), attw (types in every module resolution mode),
// and a real require() / import() of the built files in Node.
// Run after `pnpm build`.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');
let failed = false;

function run(label, command, args, cwd) {
  try {
    execFileSync(command, args, { cwd, stdio: 'pipe', encoding: 'utf8' });
    console.log(`  ok    ${label}`);
  } catch (error) {
    failed = true;
    console.log(`  FAIL  ${label}`);
    console.log(String(error.stdout ?? '') + String(error.stderr ?? ''));
  }
}

for (const dir of readdirSync(packagesDir)) {
  const cwd = join(packagesDir, dir);
  const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
  const esmOnly = !JSON.stringify(pkg.exports).includes('"require"');
  console.log(pkg.name);

  run('publint', 'pnpm', ['exec', 'publint', '--strict'], cwd);
  run(
    'attw',
    'pnpm',
    [
      'exec',
      'attw',
      '--pack',
      '.',
      '--format',
      'ascii',
      ...(esmOnly ? ['--profile', 'esm-only'] : []),
    ],
    cwd
  );

  // Self-reference by package name, so Node resolves through the exports map
  const assertExports = `if (Object.keys(m).length === 0) { console.error('no exports'); process.exit(1); }`;
  run(
    'import()',
    'node',
    ['--input-type=module', '-e', `const m = await import('${pkg.name}'); ${assertExports}`],
    cwd
  );
  if (!esmOnly) {
    run('require()', 'node', ['-e', `const m = require('${pkg.name}'); ${assertExports}`], cwd);
  }
}

if (failed) {
  console.error('\nPackage checks failed.');
  process.exit(1);
}
console.log('\nAll package checks passed.');
