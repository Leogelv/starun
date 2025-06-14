const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '192.168.1.241';
const port = 3001;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// SSL certificate options
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '192.168.1.241+3-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '192.168.1.241+3.pem'))
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on https://${hostname}:${port}`);
  });
});