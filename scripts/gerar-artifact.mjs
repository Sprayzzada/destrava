// Junta o build (dist/) num único arquivo HTML pronto para publicar como link do Claude.
// O Claude já coloca <!doctype>, <html>, <head> e <body>, então aqui sai só o conteúdo da página.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(raiz, 'dist');
let html = readFileSync(join(dist, 'index.html'), 'utf8');

const scripts = [];
html = html.replace(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/g, (_, arquivo) => {
  const js = readFileSync(join(dist, arquivo), 'utf8').replace(/<\/script/gi, '<\\/script');
  scripts.push(`<script type="module">${js}</script>`);
  return '';
});
html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g, (_, arquivo) => {
  const css = readFileSync(join(dist, arquivo), 'utf8');
  return `<style>${css}</style>`;
});

const pegar = (re) => (html.match(re) ?? []).join('\n');
const titulo = pegar(/<title>[\s\S]*?<\/title>/);
const metaClaude = pegar(/<meta name="claude:[^>]*>/g);
const links = pegar(/<link\s+rel="(?:preconnect|stylesheet)"[^>]*>/g).replace(/\s*\n\s*/g, ' ');
const estilos = pegar(/<style>[\s\S]*?<\/style>/g);

const pagina = [titulo, metaClaude, links, estilos, '<div id="root"></div>', ...scripts].join('\n');
const saida = join(raiz, 'publicar', 'destrava.html');
mkdirSync(dirname(saida), { recursive: true });
writeFileSync(saida, pagina);
console.log(`Gerado ${saida} (${(pagina.length / 1024).toFixed(0)} KB)`);
