const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const port = Number(process.env.PORT || 5173);
const distDir = path.join(__dirname, 'dist');
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function sendFile(res, filePath) {
  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentTypes[path.extname(filePath)] || 'application/octet-stream',
      'Cache-Control': filePath.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const requestedPath = path.resolve(distDir, `.${pathname}`);
  const isAsset = requestedPath.startsWith(`${distDir}${path.sep}`) && path.extname(requestedPath);

  sendFile(res, isAsset ? requestedPath : path.join(distDir, 'index.html'));
}).listen(port, '0.0.0.0', () => {
  console.log(`CloudVault web server listening on port ${port}`);
});
