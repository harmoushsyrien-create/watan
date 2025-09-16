// Test endpoint to see what Hide.me proxy returns
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const axios = require('axios');

    console.log('Testing Hide.me proxy response...');

    const targetUrl = 'https://www.mot.gov.ps/mot_Ser/Exam.aspx';

    // Test multiple proxy services to find working ones
    const testMethods = [
      // AllOrigins (usually reliable)
      {
        name: 'AllOrigins Raw',
        method: 'GET',
        url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent(targetUrl)
      },
      {
        name: 'AllOrigins JSON',
        method: 'GET',
        url: 'https://api.allorigins.win/get?url=' + encodeURIComponent(targetUrl),
        isJson: true
      },
      // CORS proxies
      {
        name: 'CORS Anywhere',
        method: 'GET',
        url: 'https://cors-anywhere.herokuapp.com/' + targetUrl
      },
      {
        name: 'CORS.io',
        method: 'GET',
        url: 'https://cors.io/?' + targetUrl
      },
      // ThingProxy
      {
        name: 'ThingProxy',
        method: 'GET',
        url: 'https://thingproxy.freeboard.io/fetch/' + targetUrl
      },
      // Other proxy services
      {
        name: 'ProxyNova',
        method: 'GET',
        url: 'https://www.proxynova.com/proxy-server/?url=' + encodeURIComponent(targetUrl)
      },
      // Hide.me (for comparison - we know this doesn't work)
      {
        name: 'Hide.me Simple URL',
        method: 'GET',
        url: 'https://hide.me/en/proxy?url=' + encodeURIComponent(targetUrl)
      },
      // JSONP proxies
      {
        name: 'CrossOrigin.me',
        method: 'GET',
        url: 'https://crossorigin.me/' + targetUrl
      }
    ];

    const results = [];

    for (const testMethod of testMethods) {
      try {
        console.log(`Testing ${testMethod.name}...`);

        let response;
        if (testMethod.method === 'POST') {
          response = await axios.post(testMethod.url, testMethod.data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Referer': 'https://hide.me/en/proxy'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 400;
            }
          });
        } else {
          response = await axios.get(testMethod.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 400;
            }
          });
        }

        let responseText;

        // Handle different response formats
        if (testMethod.isJson && response.data && response.data.contents) {
          responseText = response.data.contents;
        } else if (typeof response.data === 'string') {
          responseText = response.data;
        } else {
          responseText = JSON.stringify(response.data);
        }

        // Analyze the response
        const analysis = {
          method: testMethod.name,
          status: response.status,
          statusText: response.statusText,
          contentLength: responseText.length,
          contentType: response.headers['content-type'],

          // Check for MOT indicators
          hasViewState: responseText.includes('__VIEWSTATE'),
          hasEventValidation: responseText.includes('__EVENTVALIDATION'),
          hasViewStateGenerator: responseText.includes('__VIEWSTATEGENERATOR'),
          hasTextBox1: responseText.includes('TextBox1'),
          hasBtnSearch: responseText.includes('btnSearch'),
          hasMotTitle: responseText.includes('نتيجة امتحان التؤوريا'),
          hasArabicInput: responseText.includes('أدخل رقم الهوية'),
          hasExamAspx: responseText.includes('Exam.aspx'),
          hasBootstrap: responseText.includes('bootstrap.min.css'),
          hasForm1: responseText.includes('form1'),

          // Check for proxy wrapper indicators
          hasHideMeBranding: responseText.includes('hide.me') || responseText.includes('Hide.me'),
          hasProxyFrame: responseText.includes('iframe') || responseText.includes('frame'),
          hasProxyNavigation: responseText.includes('proxy') && responseText.includes('nav'),

          // Get first 1000 and last 500 characters for inspection
          firstChars: responseText.substring(0, 1000),
          lastChars: responseText.substring(Math.max(0, responseText.length - 500)),

          // Extract title if present
          title: responseText.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || 'No title found'
        };

        results.push(analysis);
        console.log(`${testMethod.name} completed:`, {
          status: analysis.status,
          contentLength: analysis.contentLength,
          hasViewState: analysis.hasViewState,
          hasMotTitle: analysis.hasMotTitle
        });

      } catch (error) {
        console.error(`${testMethod.name} failed:`, error.message);
        results.push({
          method: testMethod.name,
          error: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText
        });
      }
    }

    // Return comprehensive results
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      targetUrl: targetUrl,
      totalMethods: testMethods.length,
      results: results,
      summary: {
        successfulMethods: results.filter(r => !r.error).length,
        failedMethods: results.filter(r => r.error).length,
        methodsWithValidMOTContent: results.filter(r =>
          !r.error && r.hasViewState && r.hasEventValidation && r.hasTextBox1
        ).length
      }
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}