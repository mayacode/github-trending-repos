const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// middleware
app.use(cors());
app.use(express.json());

// serve static files in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
}

// github oauth token exchange endpoint
app.post('/api/github-auth', async (req, res) => {
  const { code, state } = req.body;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  try {
    console.log('Exchanging code for token...');

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
    console.log('Token response:', tokenData);

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

// serve react app in production
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (isProduction) {
    console.log('Production mode: serving built frontend files');
  } else {
    console.log('Development mode: OAuth server only');
  }
});
