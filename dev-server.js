import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { createServer } from 'net';
import fs from 'fs';
import path from 'path';

// load environment variables from .env.local
dotenv.config({ path: '.env.local' });

console.log('Starting development server...');
console.log('Environment variables loaded:', {
  VITE_GITHUB_CLIENT_ID: process.env.VITE_GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
  VITE_GITHUB_CLIENT_SECRET: process.env.VITE_GITHUB_CLIENT_SECRET
    ? 'SET'
    : 'NOT SET',
});

const app = express();
const DEFAULT_PORT = process.env.PORT || 3001;

// fnction to find an available port
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 10; port++) {
    try {
      await new Promise((resolve, reject) => {
        const server = createServer();
        server.listen(port, () => {
          server.close();
          resolve(port);
        });
        server.on('error', () => {
          reject();
        });
      });
      return port;
    } catch (error) {
      console.log(`Port ${port} is in use, trying another one...`);
    }
  }
  throw new Error(
    `No available ports found between ${startPort} and ${startPort + 10}`
  );
}

// middleware
app.use(cors());
app.use(express.json());

// github oauth token exchange endpoint (mimics vercel serverless function)
app.post('/api/github-auth', async (req, res) => {
  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  try {
    // exchange authorization code for access token
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.VITE_GITHUB_CLIENT_ID,
          client_secret: process.env.VITE_GITHUB_CLIENT_SECRET,
          code,
          state,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res
        .status(400)
        .json({ error: tokenData.error_description || tokenData.error });
    }

    if (!tokenData.access_token) {
      return res.status(400).json({ error: 'No access token received' });
    }

    // return the access token to the frontend
    res.json({ access_token: tokenData.access_token });
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.status(500).json({ error: 'Failed to exchange code for token' });
  }
});

// start server with automatic port finding
async function startServer() {
  try {
    const PORT = await findAvailablePort(DEFAULT_PORT);

    app
      .listen(PORT, () => {
        console.log(`Development server running on http://localhost:${PORT}`);
        console.log(
          'This mimics Vercel serverless functions for local development'
        );

        // write port to file for vite to read
        const portFile = path.join(process.cwd(), '.dev-server-port');
        fs.writeFileSync(portFile, PORT.toString());
      })
      .on('error', error => {
        console.error('Server error:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();

// handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down development server...');
  process.exit(0);
});
