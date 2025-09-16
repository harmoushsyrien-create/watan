// Test individual proxy services to see which ones work
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const axios = require('axios');
  const results = [];

  const proxyServices = [
    {
      name: 'AllOrigins',
      url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'ThingProxy',
      url: 'https://thingproxy.freeboard.io/fetch/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
    },
    {
      name: 'CORS Anywhere',
      url: 'https://cors-anywhere.herokuapp.com/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
    },
    {
      name: 'ProxyCORS',
      url: 'https://proxycors.herokuapp.com/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
    },
    {
      name: 'CORS Proxy',
      url: 'https://corsproxy.io/?https://www.mot.gov.ps/mot_Ser/Exam.aspx'
    }
  ];

  console.log('Testing proxy services...');

  for (const proxy of proxyServices) {
    try {
      console.log(`Testing ${proxy.name}...`);
      
      const startTime = Date.now();
      const response = await axios.get(proxy.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)',
          'Accept': 'text/html'
        },
        timeout: 15000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      results.push({
        name: proxy.name,
        status: 'SUCCESS',
        responseTime: responseTime,
        htmlLength: response.data.length,
        hasViewState: response.data.includes('__VIEWSTATE'),
        hasViewStateGenerator: response.data.includes('__VIEWSTATEGENERATOR'),
        hasEventValidation: response.data.includes('__EVENTVALIDATION')
      });
      
      console.log(`${proxy.name}: SUCCESS (${responseTime}ms, ${response.data.length} chars)`);
    } catch (error) {
      results.push({
        name: proxy.name,
        status: 'FAILED',
        error: error.message,
        code: error.code
      });
      
      console.log(`${proxy.name}: FAILED - ${error.message}`);
    }
  }

  // Test direct connection
  try {
    console.log('Testing direct connection...');
    const startTime = Date.now();
    const response = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      timeout: 15000,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    results.push({
      name: 'Direct Connection',
      status: 'SUCCESS',
      responseTime: responseTime,
      htmlLength: response.data.length,
      hasViewState: response.data.includes('__VIEWSTATE'),
      hasViewStateGenerator: response.data.includes('__VIEWSTATEGENERATOR'),
      hasEventValidation: response.data.includes('__EVENTVALIDATION')
    });
    
    console.log(`Direct Connection: SUCCESS (${responseTime}ms, ${response.data.length} chars)`);
  } catch (error) {
    results.push({
      name: 'Direct Connection',
      status: 'FAILED',
      error: error.message,
      code: error.code
    });
    
    console.log(`Direct Connection: FAILED - ${error.message}`);
  }

  const successfulServices = results.filter(r => r.status === 'SUCCESS');
  const failedServices = results.filter(r => r.status === 'FAILED');

  res.status(200).json({
    success: true,
    summary: {
      total: results.length,
      successful: successfulServices.length,
      failed: failedServices.length
    },
    results: results,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
