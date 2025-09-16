// Test endpoint to verify MOT API connectivity
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

    console.log('Testing MOT website connectivity...');
    
    // Use custom HTTPS agent to handle SSL certificate issues
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false // Allow self-signed certificates
    });
    
    const testResponse = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
        'Cache-Control': 'no-cache'
      },
      agent: agent,
      timeout: 10000
    });

    if (!testResponse.ok) {
      return res.status(200).json({
        success: false,
        message: `MOT website returned status: ${testResponse.status}`,
        status: testResponse.status,
        statusText: testResponse.statusText
      });
    }

    const html = await testResponse.text();
    
    // Check if we can find the form tokens
    const viewStateMatch = html.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = html.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = html.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    return res.status(200).json({
      success: true,
      message: 'MOT website is accessible',
      status: testResponse.status,
      htmlLength: html.length,
      hasViewState: !!viewStateMatch,
      hasViewStateGenerator: !!viewStateGeneratorMatch,
      hasEventValidation: !!eventValidationMatch,
      tokensFound: !!(viewStateMatch && viewStateGeneratorMatch && eventValidationMatch)
    });

  } catch (error) {
    console.error('MOT Test Error:', error);
    
    return res.status(200).json({
      success: false,
      message: 'Failed to connect to MOT website',
      error: error.message,
      type: error.name
    });
  }
}
