// Test endpoint to simulate Vercel environment and test the fix
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchId } = req.body;

    // Validate search ID
    if (!searchId || !/^\d{7,10}$/.test(searchId)) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهوية يجب أن يكون بين 7 و 10 أرقام'
      });
    }

    console.log(`Testing Vercel simulation with search ID: ${searchId}`);

    // Force Vercel environment variables to simulate production
    const originalVercel = process.env.VERCEL;
    const originalNodeEnv = process.env.NODE_ENV;

    process.env.VERCEL = 'true';
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';

    console.log('Simulating Vercel environment...');

    // Import the actual MOT API handler
    const motHandler = require('./mot-exam-v4').default;

    // Create a mock response object to capture the result
    let capturedResult = null;
    let capturedStatus = null;

    const mockRes = {
      status: (code) => {
        capturedStatus = code;
        return mockRes;
      },
      json: (data) => {
        capturedResult = data;
        return mockRes;
      }
    };

    // Call the actual MOT API with simulated Vercel environment
    await motHandler(req, mockRes);

    // Restore original environment
    process.env.VERCEL = originalVercel;
    process.env.NODE_ENV = originalNodeEnv;

    // Return the test results
    return res.status(200).json({
      success: true,
      testType: 'Vercel Environment Simulation',
      simulatedEnvironment: {
        VERCEL: 'true',
        NODE_ENV: 'production',
        VERCEL_ENV: 'production'
      },
      motApiResult: {
        status: capturedStatus,
        data: capturedResult
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Vercel simulation test error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}