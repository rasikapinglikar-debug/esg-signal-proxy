const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY; // set in Render env vars

// Allow any origin to call this proxy (frontend on GitHub Pages)
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ESG Signal proxy OK', time: new Date().toISOString() });
});

// Main proxy — frontend calls /news?q=...&pageSize=...&from=...
app.get('/news', async (req, res) => {
  if (!NEWS_API_KEY) {
    return res.status(500).json({ error: 'NEWS_API_KEY not configured on server.' });
  }

  const { q, pageSize = '10', from } = req.query;
  if (!q) return res.status(400).json({ error: 'Missing q parameter.' });

  try {
    const params = new URLSearchParams({
      q,
      language:  'en',
      pageSize,
      sortBy:    'publishedAt',
      apiKey:    NEWS_API_KEY,
    });
    if (from) params.append('from', from);

    const upstream = await fetch(`https://newsapi.org/v2/everything?${params}`);
    const data     = await upstream.json();

    if (data.status === 'error') {
      return res.status(400).json({ error: data.message });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`ESG Signal proxy on port ${PORT}`));
