import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { assembleSite } from './assemble-site.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'dat-place-assembly-'));
  await writeFile(path.join(root, 'index.html'), 'Original homepage');
  await writeFile(path.join(root, 'CNAME'), 'dat.place\n');
  await mkdir(path.join(root, 'wordle'));
  await writeFile(path.join(root, 'wordle', 'old.txt'), 'Old copied app must not be published');
  for (const app of ['wordle', 'manga', 'evomon', 'roblox']) {
    const dir = path.join(root, '_apps', app, 'site');
    await mkdir(path.join(dir, 'assets'), { recursive: true });
    await writeFile(path.join(dir, 'index.html'), `<script type="module" src="/${app}/assets/app.js"></script>`);
    await writeFile(path.join(dir, 'assets', 'app.js'), `console.log('${app}');`);
    await writeFile(path.join(root, '_apps', app, 'private-source.txt'), 'Private source must not be published');
  }
  return { root, appsRoot: path.join(root, '_apps'), output: path.join(root, '_site') };
}

test('preserves homepage and URLs while publishing only each repository site directory', async () => {
  const options = await fixture();
  await assembleSite(options);
  assert.equal(await readFile(path.join(options.output, 'index.html'), 'utf8'), 'Original homepage');
  assert.equal((await readFile(path.join(options.output, 'CNAME'), 'utf8')).trim(), 'dat.place');
  await assert.rejects(stat(path.join(options.output, '_apps')));
  await assert.rejects(stat(path.join(options.output, 'wordle', 'old.txt')));
  for (const app of ['wordle', 'manga', 'evomon', 'roblox']) {
    assert.equal(await readFile(path.join(options.output, app, 'assets', 'app.js'), 'utf8'), `console.log('${app}');`);
    await assert.rejects(stat(path.join(options.output, app, 'private-source.txt')));
  }
});

test('rejects broken asset paths before assembling a release', async () => {
  const options = await fixture();
  await writeFile(path.join(options.appsRoot, 'wordle', 'site', 'index.html'), '<script src="/wrong/app.js"></script>');
  await assert.rejects(assembleSite(options), /unexpected asset base/);
  await assert.rejects(stat(options.output));
});
