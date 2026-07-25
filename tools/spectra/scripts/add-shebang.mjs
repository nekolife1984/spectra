import { readFile, writeFile, chmod } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = fileURLToPath(new URL('.', import.meta.url));
const cliPath = path.resolve(here, '..', 'dist', 'cli.js');

const shebang = '#!/usr/bin/env node\n';

try {
  let content = await readFile(cliPath, 'utf8');
  if (!content.startsWith('#!')) {
    content = shebang + content;
    await writeFile(cliPath, content, 'utf8');
  }
  await chmod(cliPath, 0o755);
  console.log(`Ensured shebang and exec bit on ${cliPath}`);
} catch (e) {
  console.error(`Failed to add shebang: ${e?.message || e}`);
  // Fail the build if shebang cannot be written. Publishing a CLI without
  // `#!/usr/bin/env node` makes the package unrunnable via `npx` / direct
  // invocation; it is cheaper to surface this at install time than to ship
  // a broken binary.
  process.exitCode = 1;
}
