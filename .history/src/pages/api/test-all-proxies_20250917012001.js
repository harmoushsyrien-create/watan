// Test all proxy services for MOT website connectivity
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
    },
    {
      name: 'Webshare Free Proxy',
      url: 'https://api.webshare.io/proxy?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'Hide.me Free Web Proxy',
      url: 'https://hide.me/en/proxy?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'ProxySite.com',
      url: 'https://www.proxysite.com/process.php?d=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'CroxyProxy',
      url: 'https://www.croxyproxy.com/_p/process.php?d=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'GratisProxy',
      url: 'https://proxygratis.id/proxy.php?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    },
    {
      name: 'CoProxy',
      url: 'https://coproxy.com/proxy.php?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
    }
  ];

  console.log('Testing all proxy services...');

  for (const proxy of proxyServices) {
    try {
      console.log(`Testing ${proxy.name}...`);
      
      const startTime = Date.now();
      const response = await axios.get(proxy.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)',
          'Accept': 'text/html'
        },
        timeout: 10000,
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

  // Test direct connection with SSL bypass
  try {
    console.log('Testing direct connection with SSL bypass...');
    const https = require('https');
    const httpsAgent = new https.Agent({ 
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method'
    });
    
    const startTime = Date.now();
    const response = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
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
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    results.push({
      name: 'Direct Connection (SSL Bypass)',
      status: 'SUCCESS',
      responseTime: responseTime,
      htmlLength: response.data.length,
      hasViewState: response.data.includes('__VIEWSTATE'),
      hasViewStateGenerator: response.data.includes('__VIEWSTATEGENERATOR'),
      hasEventValidation: response.data.includes('__EVENTVALIDATION')
    });
    
    console.log(`Direct Connection (SSL Bypass): SUCCESS (${responseTime}ms, ${response.data.length} chars)`);
  } catch (error) {
    results.push({
      name: 'Direct Connection (SSL Bypass)',
      status: 'FAILED',
      error: error.message,
      code: error.code
    });
    
    console.log(`Direct Connection (SSL Bypass): FAILED - ${error.message}`);
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
