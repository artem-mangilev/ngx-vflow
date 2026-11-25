// Serves the built site the way GitHub Pages does, to look at a production build before it is deployed: a page is the
// `index.html` of its folder, the address of a folder without the slash redirects to the one with it, and an address
// that is no file gets `404.html` with the status 404. A server that answers every address with `index.html` would
// hide a page the build did not prerender.
//
// `docs:preview` runs it after `docs:site`.
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../dist/apps/docs/browser');
const port = Number(process.env.PORT ?? 4300);

const types = {
  '.css': 'text/css',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
};

const stat = (path) => statSync(path, { throwIfNoEntry: false });

createServer((request, response) => {
  const { pathname, search } = new URL(request.url, 'http://localhost');
  // The URL parser has resolved every `..`, so the path stays inside the root.
  const path = join(root, decodeURIComponent(pathname));

  if (!pathname.endsWith('/') && stat(path)?.isDirectory()) {
    response.writeHead(301, { location: `${pathname}/${search}` }).end();
    return;
  }

  const file = [path, join(path, 'index.html')].find((candidate) => stat(candidate)?.isFile());
  const served = file ?? join(root, '404.html');
  response.writeHead(file ? 200 : 404, { 'content-type': types[extname(served)] ?? 'application/octet-stream' });
  createReadStream(served).pipe(response);
}).listen(port, 'localhost', () => console.log(`The production build of the docs: http://localhost:${port}/`));
