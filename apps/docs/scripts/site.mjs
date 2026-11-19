// What a static host needs beside the prerendered pages of a production build, written into the build output:
//
// - `sitemap.xml` with every prerendered page, so it never lists a page that is gone or misses a new one;
// - `404.html`, the application without prerendered content, which the host serves for an address that is no page;
// - a redirect page for every address of `redirects.mjs`.
//
// `docs:site` runs it after `docs:build`.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REDIRECTS } from './redirects.mjs';

/** Where the site is published; `pageAddress()` of the application builds the same addresses. */
const SITE = 'https://www.ngx-vflow.org';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const output = join(workspaceRoot, 'dist/apps/docs');
const browser = join(output, 'browser');
const report = join(output, 'prerendered-routes.json');

function fail(message) {
  console.error(`docs:site: ${message}`);
  process.exit(1);
}

if (!existsSync(report)) {
  fail(`${report} is missing: the pages are prerendered by the production build, "nx build docs".`);
}

/** The routes of the build: a page, or a route of the application that redirects to one. */
const routes = JSON.parse(readFileSync(report, 'utf8')).routes;
const pages = new Set(routes.filter((route) => !route.redirectTo).map((route) => route.path));
const known = new Set(routes.map((route) => route.path));

/** A page is the `index.html` of its folder, which the host serves at the address with a slash at the end. */
const path = (route) => (route === '/' ? '/' : `${route}/`);

// A page has no date here: the site is rebuilt every day, so the date of the build would say nothing of the page.
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...[...pages].sort().map((page) => `  <url><loc>${SITE}${path(page)}</loc></url>`),
  '</urlset>',
  '',
].join('\n');

writeFileSync(join(browser, 'sitemap.xml'), sitemap);
copyFileSync(join(browser, 'index.csr.html'), join(browser, '404.html'));

/**
 * A page that sends its reader on at once. A static host has no redirects of its own; a search engine reads an
 * immediate refresh as a permanent redirect, and the canonical link names the page that took the place.
 */
const redirectPage = (to) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page has moved</title>
    <link rel="canonical" href="${SITE}${to}" />
    <meta name="robots" content="noindex" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <script>
      location.replace(${JSON.stringify(to)} + location.search + location.hash);
    </script>
  </head>
  <body>
    <a href="${to}">This page has moved</a>
  </body>
</html>
`;

const pagesInLowerCase = new Set([...known].map((route) => route.toLowerCase()));
const mistakes = [];
let written = 0;

for (const [from, to] of Object.entries(REDIRECTS)) {
  if (known.has(from)) mistakes.push(`${from} is a page of the site again: remove its redirect.`);
  else if (!pages.has(to)) mistakes.push(`${from} leads to ${to}, which is no page of the site.`);
  else {
    const file = join(browser, from, 'index.html');

    // The old address can be the address of a page in other letter case. Where the file system ignores case, as
    // on macOS, the two are one file, and the page stays; a host that minds the case gets the redirect.
    if (pagesInLowerCase.has(from.toLowerCase()) && existsSync(file)) continue;

    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, redirectPage(path(to)));
    written++;
  }
}

if (mistakes.length) fail(`redirects.mjs:\n  ${mistakes.join('\n  ')}`);

console.log(`docs:site: ${pages.size} pages in sitemap.xml, ${written} redirects, 404.html`);
