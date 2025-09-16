// Test MOT API v3 with a sample search ID
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Testing MOT API v3...');
    
    // Test with a sample search ID
    const testSearchId = '420698060'; // The ID from the original Postman request
    
    // Import the handler directly instead of making HTTP request
    const motExamV3Handler = require('./mot-exam-v3').default;
    
    // Create mock request and response objects
    const mockReq = {
      method: 'POST',
      body: { searchId: testSearchId }
    };
    
    const mockRes = {
      status: (code) => ({
        json: (data) => ({ statusCode: code, data })
      }),
      json: (data) => ({ statusCode: 200, data })
    };
    
    const result = await motExamV3Handler(mockReq, mockRes);
    
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
