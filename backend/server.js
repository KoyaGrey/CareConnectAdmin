/**
 * CareConnect Admin – minimal backend server
 * Run with: npm start (or npm run dev)
 */
const http = require('http');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  if (req.url === '/' || req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      ok: true,
      message: 'CareConnect Admin backend is running',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
  console.log('  GET / or GET /health for status');
});
