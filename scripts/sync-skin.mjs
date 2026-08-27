import { readFileSync } from 'node:fs';

const packageName = '@adenyrr/astro-sovereign-tty';
const expectedVersion = '2.1.2';

const lockfile = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const installed = lockfile.packages?.[`node_modules/${packageName}`];

if (installed?.version !== expectedVersion || !installed.resolved?.startsWith('https://registry.npmjs.org/')) {
  throw new Error(
    `Le skin verrouillé doit être ${packageName}@${expectedVersion} depuis npm.`,
  );
}

console.log(`[skin] npm synchronisé : ${packageName}@${expectedVersion}`);
