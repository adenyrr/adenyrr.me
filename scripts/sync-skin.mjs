import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const packageName = '@adenyrr/astro-ui';
const repository = 'https://github.com/adenyrr/astro-sovereign-tty.git';
const branch = 'refs/heads/main';

const remoteLine = execFileSync('git', ['ls-remote', repository, branch], {
  encoding: 'utf8',
}).trim();
const remoteCommit = remoteLine.split(/\s+/u)[0];

if (!/^[0-9a-f]{40}$/u.test(remoteCommit)) {
  throw new Error(`Impossible de résoudre ${repository}#main.`);
}

execFileSync('npm', ['update', packageName, '--legacy-peer-deps'], {
  stdio: 'inherit',
});

const lockfile = JSON.parse(readFileSync(new URL('../package-lock.json', import.meta.url), 'utf8'));
const resolved = lockfile.packages?.[`node_modules/${packageName}`]?.resolved ?? '';

if (!resolved.endsWith(`#${remoteCommit}`)) {
  throw new Error(
    `Le skin installé (${resolved || 'inconnu'}) ne correspond pas à GitHub main (${remoteCommit}).`,
  );
}

console.log(`[skin] GitHub main synchronisé : ${remoteCommit.slice(0, 12)}`);
