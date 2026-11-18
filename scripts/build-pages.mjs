import { cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'public');
const rootFiles = [
  'index.html',
  'translation.js',
  'brand.css',
  'icon.png',
  '01-onboarding-welcome-dark.jpg',
  '02-results-ring-dark.jpg',
  '03-recommendations-dark.jpg',
  'estrutura-da-landing-page-carbonpocket.svg',
  'sitemap.xml',
  'CNAME',
  '_headers',
  '_redirects',
];
const staticDirectories = [
  'carbonpocket-calculator',
  'compensation-service',
  'delete-account',
  'privacy',
  'verify',
];
const allowedExtensions = new Set([
  '.css',
  '.html',
  '.jpg',
  '.jpeg',
  '.js',
  '.png',
  '.svg',
  '.webp',
]);

async function copyStaticDirectory(relativePath) {
  const source = path.join(root, relativePath);
  const destination = path.join(output, relativePath);
  const entries = await readdir(source, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === 'email' || entry.name.startsWith('.')) continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyStaticDirectory(path.join(relativePath, entry.name));
    } else if (entry.isFile() && allowedExtensions.has(path.extname(entry.name).toLowerCase())) {
      await mkdir(destination, { recursive: true });
      await cp(sourcePath, destinationPath);
    }
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const filename of rootFiles) {
  const source = path.join(root, filename);
  if ((await stat(source)).isFile()) {
    await cp(source, path.join(output, filename));
  }
}

for (const directory of staticDirectories) {
  await copyStaticDirectory(directory);
}

const redirectPage = (destination) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="refresh" content="0;url=${destination}">
    <link rel="canonical" href="${destination}">
    <title>Page moved | Carbon Pocket</title>
  </head>
  <body>
    <p>This page has moved to <a href="${destination}">Carbon Pocket</a>.</p>
    <script>window.location.replace(${JSON.stringify(destination)});</script>
  </body>
</html>
`;

const redirects = [
  { path: 'neutralization-service/index.html', destination: '/compensation-service/' },
  { path: 'neutralization-service/neutralization-service.html', destination: '/compensation-service/' },
  { path: 'neutralization-service/neutralization-service/index.html', destination: '/compensation-service/' },
  { path: 'privacy/privacy/index.html', destination: '/privacy/privacy.html' },
  { path: 'delete-account/delete-account/index.html', destination: '/delete-account/delete-account.html' },
];
for (const { path: relativePath, destination } of redirects) {
  const target = path.join(output, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, redirectPage(destination), 'utf8');
}

await writeFile(path.join(output, '.nojekyll'), '', 'utf8');
console.log(`Built Pages-safe static site in ${path.relative(root, output)}.`);
