#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const os = require('os');

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

// Kill process on port 3000 if it exists
try {
  if (process.platform === 'darwin' || process.platform === 'linux') {
    execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'ignore' });
  } else if (process.platform === 'win32') {
    execSync('netstat -ano | findstr :3000 | findstr LISTENING | for /f "tokens=5" %a in (\'findstr :3000\') do taskkill /PID %a /F 2>nul || true', { stdio: 'ignore' });
  }
  console.log('✓ Port 3000 cleared');
} catch (e) {
  // Port is already free
}

const localIP = getLocalIP();
console.log(`✓ Using IP address: ${localIP}`);

// Start Next.js with HTTPS
const nextProcess = spawn('npx', ['next', 'dev', '-H', localIP, '--experimental-https', '-p', '3000'], {
  stdio: 'inherit',
  shell: true
});

nextProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

nextProcess.on('exit', (code) => {
  process.exit(code);
});