# HTTPS Setup for Telegram Mini App Development

This guide explains how to set up HTTPS with mkcert for testing your Telegram Mini App locally.

## Prerequisites

- mkcert installed (you already have v1.4.4)
- Node.js and npm installed

## Certificate Setup

The certificates have been generated and are valid for:
- 192.168.1.241
- localhost
- 127.0.0.1
- ::1

Certificate files:
- Certificate: `192.168.1.241+3.pem`
- Private Key: `192.168.1.241+3-key.pem`

## Running the App with HTTPS

### Option 1: Custom HTTPS Server (Recommended)

Run the custom HTTPS server that uses the mkcert certificates:

```bash
npm run dev:custom-https
```

This will start the server at `https://192.168.1.241:3001`

### Option 2: Next.js Experimental HTTPS

Run with Next.js built-in HTTPS support:

```bash
npm run dev:https
```

Note: This uses Next.js's experimental HTTPS feature and may not work with custom IP addresses.

## Troubleshooting

### Certificate Not Trusted

If you see certificate warnings:

1. Ensure mkcert CA is installed:
   ```bash
   npm run cert:install
   ```

2. Regenerate certificates if needed:
   ```bash
   npm run cert:generate
   ```

3. On macOS, you may need to manually trust the certificate:
   - Open Keychain Access
   - Find the mkcert certificate
   - Double-click and set to "Always Trust"

### Port Already in Use

If port 3001 is already in use, modify the port in `server.js`:

```javascript
const port = 3002; // or any available port
```

### Telegram Mini App Not Loading

Ensure your Telegram bot is configured to use the correct URL:
- Use `https://192.168.1.241:3001` as your Web App URL
- Make sure your device is on the same network as your development machine

## Environment Variables

Update `.env` if needed:

```env
NEXT_PUBLIC_API_URL=https://192.168.1.241:3001
```

## Testing

1. Access your app directly: https://192.168.1.241:3001
2. Test in Telegram by opening your Mini App
3. Check browser console for any SSL/certificate errors