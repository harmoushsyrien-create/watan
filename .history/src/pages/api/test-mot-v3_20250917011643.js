// Test MOT API v3 with a sample search ID
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing MOT API v3...');
    
    // Test with a sample search ID
    const testSearchId = '420698060'; // The ID from the original Postman request
    
    const response = await fetch(`${req.headers.host ? 'https://' + req.headers.host : 'http://localhost:3000'}/api/mot-exam-v3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchId: testSearchId }),
    });

    const result = await response.json();
    
    console.log('MOT API v3 test result:', result);
    
    res.status(200).json({
      success: true,
      message: 'MOT API v3 test completed',
      testResult: result,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MOT API v3 test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
