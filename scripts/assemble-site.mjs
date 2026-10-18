import { cp, mkdir, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appNames = ['wordle', 'manga', 'evomon'];
const excluded = new Set(['.git', '.github', 'scripts', '_apps', '_site', ...appNames]);

export async function assembleSite({ root, appsRoot, output }) {
  root = path.resolve(root);
  output = path.resolve(output);
  if (!output.startsWith(root + path.sep) || output === root) throw new Error('Output must be a new directory inside the checkout');
  const sources = [];
  for (const app of appNames) {
    const directory = path.resolve(appsRoot, app, 'site');
    const html = await readFile(path.join(directory, 'index.html'), 'utf8');
    const base = `/${app}/`;
    const assets = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1]).filter((url) => !/^(?:https?:|data:|#)/.test(url));
    if (!assets.some((url) => url.endsWith('.js'))) throw new Error(`${app}: missing JavaScript entry`);
    for (const url of assets) {
      if (!url.startsWith(base)) throw new Error(`${app}: unexpected asset base ${url}`);
      const asset = path.resolve(directory, decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]));
      if (!asset.startsWith(directory + path.sep) || !(await stat(asset)).isFile()) throw new Error(`${app}: missing or invalid asset ${url}`);
    }
    sources.push([app, directory]);
  }
  await mkdir(output);
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    await cp(path.join(root, entry.name), path.join(output, entry.name), { recursive: true });
  }
  for (const [app, directory] of sources) await cp(directory, path.join(output, app), { recursive: true });
  if ((await readFile(path.join(output, 'CNAME'), 'utf8')).trim() !== 'dat.place') throw new Error('Custom domain must remain dat.place');
  console.log('Assembled dat.place homepage and /wordle, /manga, /evomon from their own repositories.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  await assembleSite({ root, appsRoot: path.join(root, '_apps'), output: path.join(root, '_site') });
}

