// Advanced MOT Proxy with multiple fallback strategies
// Optimized for Vercel deployment with reliable CORS handling

// Handle SSL certificate issues for development
if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  const { searchId } = req.body;

  if (!searchId) {
    return res.status(400).json({
      success: false,
      error: 'رقم الهوية مطلوب'
    });
  }

  // Set timeout to avoid Vercel limits
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'timeout',
        message: 'انتهت مهلة الطلب',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة'
        }
      });
    }
  }, 9000);

  try {
    const motUrl = 'https://www.mot.gov.ps/mot_Ser/Exam.aspx';

    // Multiple proxy strategies (in order of reliability)
    const proxyStrategies = [
      // Strategy 1: Direct (works best on server-side, fails in browser due to CORS)
      {
        name: 'Direct',
        getUrl: (url) => url,
        processResponse: async (response) => {
          return await response.text();
        }
      },
      // Strategy 2: AllOrigins (most reliable proxy)
      {
        name: 'AllOrigins',
        getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
        processResponse: async (response) => {
          const data = await response.json();
          return data.contents;
        }
      },
      // Strategy 3: CORS Proxy IO
      {
        name: 'CorsProxy',
        getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        processResponse: async (response) => {
          return await response.text();
        }
      },
      // Strategy 4: ThingProxy
      {
        name: 'ThingProxy',
        getUrl: (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
        processResponse: async (response) => {
          return await response.text();
        }
      }
    ];

    let initialHtml = null;
    let lastError = null;

    // Step 1: Get initial page with form tokens
    console.log('Fetching initial MOT page...');

    for (const strategy of proxyStrategies) {
      try {
        console.log(`Trying ${strategy.name}...`);

        const fetchOptions = {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: AbortSignal.timeout(4000)
        };

        // Add agent for development to handle SSL issues
        if (strategy.name === 'Direct' && process.env.NODE_ENV === 'development') {
          const https = require('https');
          const agent = new https.Agent({
            rejectUnauthorized: false
          });
          fetchOptions.agent = agent;
        }

        const response = await fetch(strategy.getUrl(motUrl), fetchOptions);

        if (response.ok) {
          initialHtml = await strategy.processResponse(response);
          console.log(`Success with ${strategy.name}`);
          break;
        }
      } catch (error) {
        console.log(`${strategy.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!initialHtml) {
      clearTimeout(timeoutId);
      return res.status(503).json({
        success: false,
        error: 'proxy_failed',
        message: 'لا يمكن الوصول لموقع وزارة المواصلات حالياً',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة'
        },
        debug: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
      });
    }

    // Step 2: Extract form tokens
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      clearTimeout(timeoutId);
      return res.status(422).json({
        success: false,
        error: 'form_parse_failed',
        message: 'فشل في استخراج بيانات النموذج',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة'
        }
      });
    }

    const viewState = viewStateMatch[1];
    const viewStateGenerator = viewStateGeneratorMatch[1];
    const eventValidation = eventValidationMatch[1];

    console.log('Form tokens extracted successfully');

    // Step 3: Prepare search form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('TextBox1', searchId);
    formData.append('btnSearch', 'بحث');

    // Step 4: Submit search request
    console.log(`Searching for ID: ${searchId}`);

    let resultHtml = null;

    for (const strategy of proxyStrategies) {
      try {
        console.log(`Submitting search with ${strategy.name}...`);

        let searchUrl;
        let searchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          body: formData,
          signal: AbortSignal.timeout(4000)
        };

        if (strategy.name === 'Direct') {
          // Direct approach with proper headers and SSL handling for development
          searchUrl = motUrl;
          searchOptions.headers = {
            ...searchOptions.headers,
            'Origin': 'https://www.mot.gov.ps',
            'Referer': motUrl,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
          };

          // Add agent for development to handle SSL issues
          if (process.env.NODE_ENV === 'development') {
            const https = require('https');
            const agent = new https.Agent({
              rejectUnauthorized: false
            });
            searchOptions.agent = agent;
          }
        } else if (strategy.name === 'AllOrigins') {
          // AllOrigins requires special handling for POST requests
          searchUrl = 'https://api.allorigins.win/get';
          searchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              url: motUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://www.mot.gov.ps',
                'Referer': motUrl
              },
              body: formData.toString()
            }),
            signal: AbortSignal.timeout(4000)
          };
        } else {
          searchUrl = strategy.getUrl(motUrl);
        }

        const response = await fetch(searchUrl, searchOptions);

        if (response.ok) {
          resultHtml = await strategy.processResponse(response);
          console.log(`Search success with ${strategy.name}`);
          break;
        }
      } catch (error) {
        console.log(`Search failed with ${strategy.name}:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!resultHtml) {
      clearTimeout(timeoutId);
      return res.status(503).json({
        success: false,
        error: 'search_failed',
        message: 'فشل في البحث في قاعدة بيانات وزارة المواصلات',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة'
        },
        debug: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
      });
    }

    // Step 5: Parse results
    const tableMatch = resultHtml.match(/<table[^>]*id="Table1"[^>]*>(.*?)<\/table>/is);

    if (!tableMatch) {
      clearTimeout(timeoutId);
      return res.status(200).json({
        success: true,
        found: false,
        message: 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
      });
    }

    // Extract table rows
    const tableContent = tableMatch[1];
    const rowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gis);

    if (!rowMatches || rowMatches.length === 0) {
      clearTimeout(timeoutId);
      return res.status(200).json({
        success: true,
        found: false,
        message: 'لم يتم العثور على بيانات في الجدول'
      });
    }

    // Parse each row
    const rows = [];
    for (const rowHtml of rowMatches) {
      const cellMatches = rowHtml.match(/<t[hd][^>]*>(.*?)<\/t[hd]>/gis);
      if (cellMatches && cellMatches.length >= 2) {
        const key = cellMatches[0].replace(/<[^>]*>/g, '').trim();
        const value = cellMatches[1].replace(/<[^>]*>/g, '').trim();
        if (key && value) {
          rows.push([key, value]);
        }
      }
    }

    if (rows.length === 0) {
      clearTimeout(timeoutId);
      return res.status(200).json({
        success: true,
        found: false,
        message: 'لم يتم العثور على بيانات صالحة في الجدول'
      });
    }

    console.log(`Successfully parsed ${rows.length} data rows`);

    // Return successful result
    clearTimeout(timeoutId);
    return res.status(200).json({
      success: true,
      found: true,
      data: {
        rows: rows
      }
    });

  } catch (error) {
    console.error('MOT Proxy Error:', error);
    clearTimeout(timeoutId);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: 'internal_error',
        message: 'حدث خطأ أثناء جلب البيانات',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة'
        },
        debug: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}