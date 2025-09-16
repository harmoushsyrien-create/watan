// Proxy service to bypass CORS and server blocking issues
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST.'
    });
  }

  const { url, method = 'GET', headers = {}, body } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL is required'
    });
  }

  try {
    const fetchOptions = {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    };

    if (body) {
      fetchOptions.body = body;
    }

    // Add agent for development to handle SSL issues
    if (process.env.NODE_ENV === 'development') {
      const https = require('https');
      const agent = new https.Agent({
        rejectUnauthorized: false
      });
      fetchOptions.agent = agent;
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    return res.status(200).json({
      success: true,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseText
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      success: false,
      message: 'Proxy request failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
