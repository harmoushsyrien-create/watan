// Test proxy services for MOT website connectivity
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const axios = require('axios');

  try {
    console.log('Testing proxy services...');
    
    // Test 1: Direct connection
    console.log('Test 1: Direct connection...');
    try {
      const directResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      console.log('Direct connection: SUCCESS');
    } catch (directError) {
      console.log('Direct connection: FAILED -', directError.message);
    }

    // Test 2: AllOrigins proxy
    console.log('Test 2: AllOrigins proxy...');
    try {
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx');
      const proxyResponse = await axios.get(proxyUrl, {
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      console.log('AllOrigins proxy: SUCCESS - HTML length:', proxyResponse.data.length);
    } catch (proxyError) {
      console.log('AllOrigins proxy: FAILED -', proxyError.message);
    }

    // Test 3: CORS Anywhere proxy
    console.log('Test 3: CORS Anywhere proxy...');
    try {
      const corsUrl = 'https://cors-anywhere.herokuapp.com/https://www.mot.gov.ps/mot_Ser/Exam.aspx';
      const corsResponse = await axios.get(corsUrl, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      console.log('CORS Anywhere proxy: SUCCESS - HTML length:', corsResponse.data.length);
    } catch (corsError) {
      console.log('CORS Anywhere proxy: FAILED -', corsError.message);
    }

    // Test 4: Alternative proxy service
    console.log('Test 4: Alternative proxy...');
    try {
      const altProxyUrl = 'https://thingproxy.freeboard.io/fetch/https://www.mot.gov.ps/mot_Ser/Exam.aspx';
      const altResponse = await axios.get(altProxyUrl, {
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      console.log('Alternative proxy: SUCCESS - HTML length:', altResponse.data.length);
    } catch (altError) {
      console.log('Alternative proxy: FAILED -', altError.message);
    }

    res.status(200).json({
      success: true,
      message: 'Proxy tests completed - check server logs for results',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Proxy test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      environment: process.env.NODE_ENV
    });
  }
}
