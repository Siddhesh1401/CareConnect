import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8081;

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Handle favicon request
  if (req.url === '/favicon.ico') {
    res.writeHead(204); // No content
    res.end();
    return;
  }
  
  // Serve the HTML file
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'index.html');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error loading government portal');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log('🏛️  Government Portal Server Started!');
  console.log(`📊 Portal URL: http://localhost:${PORT}`);
  console.log(`🔗 CareConnect API: http://localhost:5000`);
  console.log('🚀 Ready for government API testing!');
  console.log('');
  console.log('Instructions:');
  console.log(`1. Open http://localhost:${PORT} in your browser`);
  console.log('2. Use your government API key from the admin dashboard');
  console.log('3. Test the CareConnect API endpoints');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use. Try stopping other servers or use a different port.`);
  } else {
    console.error('❌ Server error:', err);
  }
});