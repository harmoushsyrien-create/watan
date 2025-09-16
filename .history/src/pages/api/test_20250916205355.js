// Test API endpoint to verify Vercel deployment
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    return res.status(200).json({
      success: true,
      message: 'API is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      method: req.method
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message
    });
  }
}
