// Test SSL bypass approach for MOT website
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const axios = require('axios');
  const https = require('https');

  try {
    console.log('Testing SSL bypass approaches...');
    
    // Test 1: Standard SSL bypass
    console.log('Test 1: Standard SSL bypass...');
    try {
      const httpsAgent = new https.Agent({ 
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method'
      });
      
      const response1 = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        httpsAgent,
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      console.log('Standard SSL bypass: SUCCESS');
      console.log('HTML length:', response1.data.length);
      console.log('Has ViewState:', response1.data.includes('__VIEWSTATE'));
    } catch (error1) {
      console.log('Standard SSL bypass: FAILED -', error1.message);
    }

    // Test 2: Alternative SSL settings
    console.log('Test 2: Alternative SSL settings...');
    try {
      const altHttpsAgent = new https.Agent({ 
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_method',
        ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH'
      });
      
      const response2 = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        httpsAgent: altHttpsAgent,
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      console.log('Alternative SSL settings: SUCCESS');
      console.log('HTML length:', response2.data.length);
      console.log('Has ViewState:', response2.data.includes('__VIEWSTATE'));
    } catch (error2) {
      console.log('Alternative SSL settings: FAILED -', error2.message);
    }

    // Test 3: HTTP instead of HTTPS
    console.log('Test 3: HTTP instead of HTTPS...');
    try {
      const response3 = await axios.get('http://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      console.log('HTTP connection: SUCCESS');
      console.log('HTML length:', response3.data.length);
      console.log('Has ViewState:', response3.data.includes('__VIEWSTATE'));
    } catch (error3) {
      console.log('HTTP connection: FAILED -', error3.message);
    }

    res.status(200).json({
      success: true,
      message: 'SSL bypass tests completed - check server logs for results',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SSL bypass test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
