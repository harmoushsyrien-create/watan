// Test endpoint to check Vercel environment and basic connectivity
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use GET.'
      });
    }

    console.log('Testing Vercel environment...');
    
    // Test basic fetch to a reliable endpoint
    const testResponse = await fetch('https://httpbin.org/get', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    if (!testResponse.ok) {
      return res.status(200).json({
        success: false,
        message: `Basic fetch failed: ${testResponse.status}`,
        environment: process.env.NODE_ENV,
        vercel: process.env.VERCEL ? 'Yes' : 'No'
      });
    }

    const testData = await testResponse.json();

    return res.status(200).json({
      success: true,
      message: 'Vercel environment test successful',
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'Yes' : 'No',
      region: process.env.VERCEL_REGION || 'Unknown',
      basicFetch: 'Working',
      testData: testData.origin
    });

  } catch (error) {
    console.error('Vercel Test Error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'Vercel environment test failed',
      error: error.message,
      environment: process.env.NODE_ENV,
      vercel: process.env.VERCEL ? 'Yes' : 'No',
      region: process.env.VERCEL_REGION || 'Unknown'
    });
  }
}
