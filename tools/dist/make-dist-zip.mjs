import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const PLUGIN_SLUG = 's2j-alliance-manager';

const repoRoot = resolve(process.cwd());
const pkgJsonPath = join(repoRoot, 'package.json');
const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
const version = (process.env.DIST_VERSION || pkg.version || '0.0.0').toString();

const distDir = join(repoRoot, 'dist');
if (!existsSync(distDir)) {
  throw new Error('dist/ not found. Run `npm run build:production` first.');
}

const outDir = join(repoRoot, 'release');
const stageRoot = join(repoRoot, '.dist-tmp');
const stagePluginDir = join(stageRoot, PLUGIN_SLUG);
const zipBaseName = `${PLUGIN_SLUG}-${version}`;
const zipPath = join(outDir, `${zipBaseName}.zip`);

const ensureEmptyDir = (dir) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
};

const copyTree = (src, dest) => {
  cpSync(src, dest, { recursive: true });
};

const removeJunkFilesRecursively = (dir) => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      removeJunkFilesRecursively(full);
      continue;
    }
    if (entry.name === '.DS_Store') {
      rmSync(full, { force: true });
    }
  }
};

const pruneUnwantedDistArtifacts = () => {
  // In this repo, block sources can accidentally end up under dist/blocks/**/src/.
  // They are not required at runtime and only bloat the distribution zip.
  const distBlocksDir = join(stagePluginDir, 'dist', 'blocks');
  if (!existsSync(distBlocksDir)) return;
  for (const entry of readdirSync(distBlocksDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const srcDir = join(distBlocksDir, entry.name, 'src');
    if (existsSync(srcDir)) rmSync(srcDir, { recursive: true, force: true });
  }
};

const writeBuildMeta = () => {
  const meta = {
    plugin: PLUGIN_SLUG,
    version,
    builtAt: new Date().toISOString(),
    node: process.version,
  };
  writeFileSync(join(stagePluginDir, 'release-meta.json'), JSON.stringify(meta, null, 2) + '\n', 'utf8');
};

const mustExist = (relPath) => {
  const abs = join(repoRoot, relPath);
  if (!existsSync(abs)) throw new Error(`Missing required file: ${relPath}`);
  return abs;
};

ensureEmptyDir(outDir);
ensureEmptyDir(stagePluginDir);

// Allowlist: ship only what WordPress needs at runtime.
copyTree(mustExist('includes'), join(stagePluginDir, 'includes'));
copyTree(mustExist('languages'), join(stagePluginDir, 'languages'));
copyTree(mustExist('dist'), join(stagePluginDir, 'dist'));

cpSync(mustExist('s2j-alliance-manager.php'), join(stagePluginDir, 's2j-alliance-manager.php'));
cpSync(mustExist('uninstall.php'), join(stagePluginDir, 'uninstall.php'));
cpSync(mustExist('readme.txt'), join(stagePluginDir, 'readme.txt'));
cpSync(mustExist('LICENSE'), join(stagePluginDir, 'LICENSE'));

removeJunkFilesRecursively(stagePluginDir);
pruneUnwantedDistArtifacts();
writeBuildMeta();

// Create zip: `release/<slug>-<version>.zip` containing top-level folder `<slug>/...`
rmSync(zipPath, { force: true });

const zip = spawnSync(
  'zip',
  ['-r', zipPath, basename(stagePluginDir)],
  { cwd: stageRoot, stdio: 'inherit' }
);

if (zip.status !== 0) {
  throw new Error('zip command failed. Ensure `zip` is available in your environment.');
}

const zipStat = statSync(zipPath);
process.stdout.write(`Created: ${zipPath} (${zipStat.size} bytes)\n`);
