import {createReadStream, existsSync} from 'node:fs';
import {stat} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, 'frontend', 'dist');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 4173);

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
]);

if (!existsSync(distDir)) {
  console.error('Build output not found. Run "npm run build" before starting the server.');
  process.exit(1);
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const requestedPath = decodeURIComponent(requestUrl.pathname);
    const safeRelativePath = requestedPath.replace(/^\/+/, '');
    const candidatePath = path.resolve(distDir, safeRelativePath);
    const isInsideDist = candidatePath === distDir || candidatePath.startsWith(`${distDir}${path.sep}`);

    if (!isInsideDist) {
      response.writeHead(403, {'Content-Type': 'text/plain; charset=utf-8'});
      response.end('Forbidden');
      return;
    }

    const filePath = await resolveFilePath(candidatePath, requestedPath);
    const fileStat = await stat(filePath);

    response.writeHead(200, {
      'Content-Length': fileStat.size,
      'Content-Type': contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream',
    });

    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, {'Content-Type': 'text/plain; charset=utf-8'});
    response.end('Internal Server Error');
    console.error(error);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Set another port with PORT=<port> npm start.`);
    process.exit(1);
  }

  console.error(`Unable to start IFM Workspace on http://${host}:${port}`);
  console.error(error);
  process.exit(1);
});

server.listen(port, host, () => {
  console.log(`IFM Workspace is ready at http://${host}:${port}`);
});

async function resolveFilePath(candidatePath, requestedPath) {
  if (requestedPath === '/' || requestedPath === '') {
    return path.join(distDir, 'index.html');
  }

  try {
    const fileStat = await stat(candidatePath);
    if (fileStat.isFile()) {
      return candidatePath;
    }
  } catch {
    // Fall back to index.html below for SPA routes.
  }

  return path.join(distDir, 'index.html');
}
