// Server-side API route for MOT exam results
// This bypasses CORS by running on the server

// Handle SSL certificate issues for development
if (process.env.NODE_ENV === 'development') {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
}

export default async function handler(req, res) {
  // Set CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Set timeout for Vercel (max 10 seconds)
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        message: 'انتهت مهلة الطلب. يرجى المحاولة لاحقاً.'
      });
    }
  }, 10000);

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed. Use POST.'
      });
    }

    const { searchId } = req.body;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهوية مطلوب'
      });
    }
    // Step 1: Try to fetch the initial page from MOT website
    console.log('Attempting to fetch initial page from MOT website...');

    let initialResponse;
    let motUrl = 'https://www.mot.gov.ps/mot_Ser/Exam.aspx';
    
    // Try multiple approaches to access the MOT website
    const approaches = [
      // Direct approach
      {
        url: motUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none'
        }
      },
      // CORS proxy approach
      {
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(motUrl)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      },
      // Alternative CORS proxy
      {
        url: `https://cors-anywhere.herokuapp.com/${motUrl}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'X-Requested-With': 'XMLHttpRequest'
        }
      },
      // Custom proxy approach
      {
        url: '/api/proxy',
        headers: {
          'Content-Type': 'application/json'
        },
        useProxy: true,
        proxyData: {
          url: motUrl,
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
          }
        }
      }
    ];

    let lastError;
    for (const approach of approaches) {
      try {
        console.log(`Trying approach: ${approach.url.substring(0, 50)}...`);
        
        let fetchOptions;
        
        if (approach.useProxy) {
          // Use custom proxy
          fetchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(approach.proxyData),
            signal: AbortSignal.timeout(8000) // 8 second timeout
          };
        } else {
          // Direct fetch
          fetchOptions = {
            method: 'GET',
            headers: approach.headers,
            signal: AbortSignal.timeout(8000) // 8 second timeout
          };

          // Add agent for development to handle SSL issues
          if (process.env.NODE_ENV === 'development') {
            const https = require('https');
            const agent = new https.Agent({
              rejectUnauthorized: false
            });
            fetchOptions.agent = agent;
          }
        }

        initialResponse = await fetch(approach.url, fetchOptions);
        
        if (approach.useProxy && initialResponse.ok) {
          // Handle proxy response
          const proxyResult = await initialResponse.json();
          if (proxyResult.success) {
            // Create a mock response object
            initialResponse = {
              ok: true,
              status: proxyResult.status,
              text: () => Promise.resolve(proxyResult.data)
            };
            console.log(`Success with custom proxy approach`);
            break;
          } else {
            console.log(`Proxy failed: ${proxyResult.message}`);
            continue;
          }
        } else if (initialResponse.ok) {
          console.log(`Success with approach: ${approach.url.substring(0, 50)}...`);
          break;
        } else {
          console.log(`Failed with status ${initialResponse.status} for approach: ${approach.url.substring(0, 50)}...`);
        }
      } catch (fetchError) {
        console.log(`Error with approach: ${approach.url.substring(0, 50)}... - ${fetchError.message}`);
        lastError = fetchError;
        continue;
      }
    }

    if (!initialResponse || !initialResponse.ok) {
      console.error('All approaches failed to fetch MOT website:', lastError);
      // Return a helpful response instead of throwing an error
      return res.status(503).json({
        success: false,
        message: 'لا يمكن الوصول لموقع وزارة المواصلات حالياً من الخوادم. يرجى زيارة الموقع مباشرة للبحث عن النتيجة.',
        fallback: {
          directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة وإدخال رقم الهوية للبحث عن النتيجة',
          alternative: 'أو يمكنك المحاولة مرة أخرى لاحقاً'
        },
        error: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
      });
    }

    const initialHtml = await initialResponse.text();
    console.log('Initial page fetched successfully');

    // Step 2: Extract form tokens using regex (more reliable than DOM parsing on server)
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      throw new Error('فشل في استخراج بيانات النموذج من الصفحة');
    }

    const viewState = viewStateMatch[1];
    const viewStateGenerator = viewStateGeneratorMatch[1];
    const eventValidation = eventValidationMatch[1];

    console.log('Form tokens extracted successfully');

    // Step 3: Prepare form data for search
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('TextBox1', searchId);
    formData.append('btnSearch', 'بحث');

    // Step 4: Submit search request using the same approach that worked
    console.log(`Searching for ID: ${searchId}`);

    const searchApproaches = [
      // Direct approach
      {
        url: motUrl,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
          'Accept-Encoding': 'gzip, deflate, br',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://www.mot.gov.ps',
          'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'no-cache'
        }
      },
      // CORS proxy approach
      {
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(motUrl)}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      // Alternative CORS proxy
      {
        url: `https://cors-anywhere.herokuapp.com/${motUrl}`,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest'
        }
      },
      // Custom proxy approach
      {
        url: '/api/proxy',
        headers: {
          'Content-Type': 'application/json'
        },
        useProxy: true,
        proxyData: {
          url: motUrl,
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://www.mot.gov.ps',
            'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
          },
          body: formData.toString()
        }
      }
    ];

    let searchResponse;
    let searchLastError;
    
    for (const approach of searchApproaches) {
      try {
        console.log(`Trying search approach: ${approach.url.substring(0, 50)}...`);
        
        let searchOptions;
        
        if (approach.useProxy) {
          // Use custom proxy
          searchOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(approach.proxyData),
            signal: AbortSignal.timeout(8000) // 8 second timeout
          };
        } else {
          // Direct fetch
          searchOptions = {
            method: 'POST',
            headers: approach.headers,
            body: formData,
            signal: AbortSignal.timeout(8000) // 8 second timeout
          };

          // Add agent for development to handle SSL issues
          if (process.env.NODE_ENV === 'development') {
            const https = require('https');
            const agent = new https.Agent({
              rejectUnauthorized: false
            });
            searchOptions.agent = agent;
          }
        }

        searchResponse = await fetch(approach.url, searchOptions);
        
        if (approach.useProxy && searchResponse.ok) {
          // Handle proxy response
          const proxyResult = await searchResponse.json();
          if (proxyResult.success) {
            // Create a mock response object
            searchResponse = {
              ok: true,
              status: proxyResult.status,
              text: () => Promise.resolve(proxyResult.data)
            };
            console.log(`Search success with custom proxy approach`);
            break;
          } else {
            console.log(`Search proxy failed: ${proxyResult.message}`);
            continue;
          }
        } else if (searchResponse.ok) {
          console.log(`Search success with approach: ${approach.url.substring(0, 50)}...`);
          break;
        } else {
          console.log(`Search failed with status ${searchResponse.status} for approach: ${approach.url.substring(0, 50)}...`);
        }
      } catch (fetchError) {
        console.log(`Search error with approach: ${approach.url.substring(0, 50)}... - ${fetchError.message}`);
        searchLastError = fetchError;
        continue;
      }
    }

    if (!searchResponse || !searchResponse.ok) {
      console.error('All search approaches failed:', searchLastError);
      throw new Error(`فشل في البحث في قاعدة بيانات وزارة المواصلات. رمز الخطأ: ${searchResponse?.status || 'UNKNOWN'}`);
    }

    const resultHtml = await searchResponse.text();
    console.log('Search response received');

    // Step 5: Parse results using regex
    const tableMatch = resultHtml.match(/<table[^>]*id="Table1"[^>]*>(.*?)<\/table>/is);

    if (!tableMatch) {
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
      return res.status(200).json({
        success: true,
        found: false,
        message: 'لم يتم العثور على بيانات صالحة في الجدول'
      });
    }

    console.log(`Successfully parsed ${rows.length} data rows`);

    // Return successful result
    return res.status(200).json({
      success: true,
      found: true,
      data: {
        rows: rows
      }
    });

  } catch (error) {
    console.error('MOT API Error:', error);

    if (!res.headersSent) {
      // Check if it's a timeout error
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return res.status(408).json({
          success: false,
          message: 'انتهت مهلة الطلب. يرجى المحاولة لاحقاً أو زيارة موقع وزارة المواصلات مباشرة.',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // Check if it's a network error
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('503')) {
        return res.status(503).json({
          success: false,
          message: 'لا يمكن الوصول لموقع وزارة المواصلات حالياً من الخوادم. يرجى زيارة الموقع مباشرة للبحث عن النتيجة.',
          fallback: {
            directLink: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
            instructions: 'يمكنك زيارة موقع وزارة المواصلات مباشرة وإدخال رقم الهوية للبحث عن النتيجة',
            alternative: 'أو يمكنك المحاولة مرة أخرى لاحقاً'
          },
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      return res.status(500).json({
        success: false,
        message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } finally {
    clearTimeout(timeoutId);
  }
}