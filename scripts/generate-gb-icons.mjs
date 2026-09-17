import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const assets = new URL('../public/assets/gb-icons/', import.meta.url);
const paths = {};
for (const file of readdirSync(assets).filter(name => name.endsWith('.svg')).sort()) {
  const source = readFileSync(new URL(file, assets), 'utf8');
  if (/<script|\bon\w+=|<image|<foreignObject/i.test(source)) throw new Error(`Unsupported SVG: ${file}`);
  paths[file.slice(0, -4)] = source.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1]
    .replace(/fill="(?:black|#000000|#000)"/g, 'fill="currentColor"');
}
writeFileSync(new URL('../src/components/gbIconPaths.json', import.meta.url), JSON.stringify(paths, null, 2) + '\n');
