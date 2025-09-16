// MOT Exam API with proxy-first approach for Vercel compatibility
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

    console.log(`MOT API called with search ID: ${searchId}`);
    console.log('Environment:', process.env.NODE_ENV);

    const axios = require('axios');

    // Step 1: Fetch initial page with proxy-first approach for production
    console.log('Fetching fresh form tokens from MOT website...');
    let initialResponse, initialHtml;
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment - using proxy-first approach...');
      
      // Try multiple proxy services in sequence
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

      let proxySuccess = false;
      
      for (const proxy of proxyServices) {
        try {
          console.log(`Trying ${proxy.name} proxy...`);
          
          const proxyResponse = await axios.get(proxy.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)',
              'Accept': 'text/html'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          initialResponse = proxyResponse;
          initialHtml = proxyResponse.data;
          console.log(`${proxy.name} proxy successful`);
          proxySuccess = true;
          break;
        } catch (proxyError) {
          console.error(`${proxy.name} proxy failed:`, proxyError.message);
          continue;
        }
      }
      
      if (!proxySuccess) {
        console.log('All proxy services failed, trying alternative approach...');
        
        // Try using a different approach - simulate browser request
        try {
          console.log('Trying browser simulation approach...');
          
          // Use a more sophisticated proxy service
          const browserProxyUrl = 'https://api.scraperapi.com/free?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx');
          
          const browserResponse = await axios.get(browserProxyUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
              'Cache-Control': 'no-cache'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          initialResponse = browserResponse;
          initialHtml = browserResponse.data;
          console.log('Browser simulation approach successful');
        } catch (browserError) {
          console.error('Browser simulation failed:', browserError.message);
          
          // Last resort: try direct connection with different headers
          try {
            console.log('Trying direct connection with different headers...');
            initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
              },
              timeout: 30000,
              validateStatus: function (status) {
                return status >= 200 && status < 300;
              }
            });
            
            initialHtml = initialResponse.data;
            console.log('Direct connection with different headers successful');
          } catch (directError) {
            console.error('All connection attempts failed');
            throw new Error(`لا يمكن الاتصال بموقع وزارة المواصلات: ${directError.message}`);
          }
        }
      }
    } else {
      // Development: try direct connection
      console.log('Development environment - trying direct connection...');
      const https = require('https');
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      
      initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
          'Cache-Control': 'no-cache'
        },
        httpsAgent,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      initialHtml = initialResponse.data;
      console.log('Direct connection successful');
    }

    // Step 2: Extract fresh form tokens using regex
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      console.error('Failed to extract form tokens');
      console.log('HTML preview:', initialHtml.substring(0, 1000));
      throw new Error('فشل في استخراج بيانات النموذج من موقع وزارة المواصلات');
    }

    const viewState = viewStateMatch[1];
    const viewStateGenerator = viewStateGeneratorMatch[1];
    const eventValidation = eventValidationMatch[1];

    console.log('Fresh form tokens extracted successfully');

    // Step 3: Prepare form data for search with fresh tokens
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('TextBox1', searchId);
    formData.append('btnSearch', 'بحث');

    console.log(`Searching for ID: ${searchId}`);

    // Step 4: Submit search request with proxy fallback
    let searchResponse, resultHtml;
    
    if (process.env.NODE_ENV === 'production') {
      console.log('Production environment - using proxy for search request...');
      
      // Try proxy services for POST request
      const searchProxyServices = [
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
        }
      ];

      let searchSuccess = false;
      
      for (const proxy of searchProxyServices) {
        try {
          console.log(`Trying ${proxy.name} proxy for search...`);
          
          const proxySearchResponse = await axios.post(proxy.url, formData.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)',
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          searchResponse = proxySearchResponse;
          resultHtml = proxySearchResponse.data;
          console.log(`${proxy.name} search proxy successful`);
          searchSuccess = true;
          break;
        } catch (proxyError) {
          console.error(`${proxy.name} search proxy failed:`, proxyError.message);
          continue;
        }
      }
      
      if (!searchSuccess) {
        throw new Error('All search proxy services failed');
      }
    } else {
      // Development: try direct connection
      console.log('Development environment - trying direct search...');
      const https = require('https');
      const httpsAgent = new https.Agent({ rejectUnauthorized: false });
      
      searchResponse = await axios.post('https://www.mot.gov.ps/mot_Ser/Exam.aspx', formData.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://www.mot.gov.ps',
          'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        httpsAgent,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      resultHtml = searchResponse.data;
      console.log('Direct search successful');
    }

    // Step 5: Parse results using regex
    console.log('Parsing search results...');
    console.log('Result HTML length:', resultHtml.length);
    
    const tableMatch = resultHtml.match(/<table[^>]*id="Table1"[^>]*>(.*?)<\/table>/is);

    if (!tableMatch) {
      console.log('No table found in results');
      // Check if there's an error message in the response
      const errorMatch = resultHtml.match(/<span[^>]*class="danger"[^>]*>(.*?)<\/span>/is);
      if (errorMatch) {
        console.log('Error message found:', errorMatch[1]);
        return res.status(200).json({
          success: true,
          found: false,
          message: errorMatch[1].trim() || 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
        });
      }
      
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
        message: 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
      });
    }

    // Parse table data
    const rows = [];
    for (const rowMatch of rowMatches) {
      const cellMatches = rowMatch.match(/<td[^>]*>(.*?)<\/td>/gis);
      if (cellMatches && cellMatches.length >= 2) {
        const row = cellMatches.map(cell => {
          return cell.replace(/<[^>]*>/g, '').trim();
        });
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      return res.status(200).json({
        success: true,
        found: false,
        message: 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
      });
    }

    console.log('Results parsed successfully:', rows.length, 'rows found');

    // Return successful response
    return res.status(200).json({
      success: true,
      found: true,
      data: {
        rows: rows
      }
    });

  } catch (error) {
    console.error('MOT API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.'
    });
  }
}
