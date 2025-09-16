// MOT Exam API with comprehensive proxy fallbacks
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

    console.log(`MOT API v4 called with search ID: ${searchId}`);
    console.log('Environment:', process.env.NODE_ENV);

    const axios = require('axios');
    const https = require('https');

    // Create HTTPS agent that bypasses SSL verification
    const httpsAgent = new https.Agent({ 
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method'
    });

    // Step 1: Try to fetch initial page with comprehensive fallbacks
    console.log('Fetching fresh form tokens from MOT website...');
    let initialResponse, initialHtml;
    
    // First try direct connection with SSL bypass (this is working locally)
    try {
      console.log('Attempting direct connection with SSL bypass...');
      initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        httpsAgent,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      initialHtml = initialResponse.data;
      console.log('Direct connection with SSL bypass successful');
    } catch (fetchError) {
      console.error('Direct connection failed:', fetchError.message);
      
      // Try working proxy services first (based on test results)
      console.log('Trying working proxy services...');
      
      const proxyServices = [
        {
          name: 'Hide.me Free Web Proxy',
          url: 'https://hide.me/en/proxy?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
        },
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

      let proxySuccess = false;
      
      for (const proxy of proxyServices) {
        try {
          console.log(`Trying ${proxy.name} proxy...`);
          
          const proxyResponse = await axios.get(proxy.url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; VercelBot/1.0)',
              'Accept': 'text/html'
            },
            timeout: 20000,
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
        // Last resort: try alternative SSL approaches
        try {
          console.log('Trying alternative SSL approach...');
          
          const altHttpsAgent = new https.Agent({ 
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_method',
            ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH'
          });
          
          initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive'
            },
            httpsAgent: altHttpsAgent,
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          initialHtml = initialResponse.data;
          console.log('Alternative SSL approach successful');
        } catch (altError) {
          console.error('Alternative SSL approach failed:', altError.message);
          throw new Error(`لا يمكن الاتصال بموقع وزارة المواصلات: ${altError.message}`);
        }
      }
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

    // Step 4: Submit search request with comprehensive fallbacks
    let searchResponse, resultHtml;
    
    try {
      console.log('Attempting search with SSL bypass...');
      searchResponse = await axios.post('https://www.mot.gov.ps/mot_Ser/Exam.aspx', formData.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Origin': 'https://www.mot.gov.ps',
          'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Connection': 'keep-alive'
        },
        httpsAgent,
        timeout: 30000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });
      
      resultHtml = searchResponse.data;
      console.log('Search with SSL bypass successful');
    } catch (searchError) {
      console.error('Search with SSL bypass failed:', searchError.message);
      
      // Try proxy services for search
      console.log('Trying proxy services for search...');
      
      const searchProxyServices = [
        {
          name: 'Hide.me Free Web Proxy',
          url: 'https://hide.me/en/proxy?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
        },
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
            timeout: 20000,
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
        // Last resort: try alternative search approaches
        try {
          console.log('Trying alternative search approach...');
          
          const altHttpsAgent = new https.Agent({ 
            rejectUnauthorized: false,
            secureProtocol: 'TLSv1_method',
            ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH'
          });
          
          searchResponse = await axios.post('https://www.mot.gov.ps/mot_Ser/Exam.aspx', formData.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive'
            },
            httpsAgent: altHttpsAgent,
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          resultHtml = searchResponse.data;
          console.log('Alternative search approach successful');
        } catch (altSearchError) {
          console.error('Alternative search approach failed:', altSearchError.message);
          throw new Error(`فشل في البحث عن النتيجة: ${altSearchError.message}`);
        }
      }
    }

    // Step 5: Parse results using regex
    console.log('Parsing search results...');
    console.log('Result HTML length:', resultHtml.length);
    console.log('Result HTML preview (first 2000 chars):', resultHtml.substring(0, 2000));
    console.log('Result HTML preview (last 1000 chars):', resultHtml.substring(resultHtml.length - 1000));
    
    // Check for various table patterns
    const tableMatch = resultHtml.match(/<table[^>]*id="Table1"[^>]*>(.*?)<\/table>/is);
    const tableMatch2 = resultHtml.match(/<table[^>]*class="[^"]*table[^"]*"[^>]*>(.*?)<\/table>/is);
    const tableMatch3 = resultHtml.match(/<table[^>]*>(.*?)<\/table>/is);
    
    console.log('Table1 match:', !!tableMatch);
    console.log('Table class match:', !!tableMatch2);
    console.log('Any table match:', !!tableMatch3);

    if (!tableMatch) {
      console.log('No Table1 found in results');
      
      // Check for various error message patterns
      const errorPatterns = [
        /<span[^>]*class="danger"[^>]*>(.*?)<\/span>/is,
        /<div[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/div>/is,
        /<p[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/p>/is,
        /<span[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/span>/is,
        /<div[^>]*class="[^"]*alert[^"]*"[^>]*>(.*?)<\/div>/is,
        /<span[^>]*class="[^"]*alert[^"]*"[^>]*>(.*?)<\/span>/is
      ];
      
      let errorMessage = null;
      for (const pattern of errorPatterns) {
        const match = resultHtml.match(pattern);
        if (match) {
          errorMessage = match[1].trim();
          console.log('Error message found:', errorMessage);
          break;
        }
      }
      
      // Check if there are any tables at all
      if (tableMatch3) {
        console.log('Found other tables, checking content...');
        const tableContent = tableMatch3[1];
        console.log('Table content preview:', tableContent.substring(0, 500));
        
        // Try to extract data from any table
        const rowMatches = tableContent.match(/<tr[^>]*>(.*?)<\/tr>/gis);
        if (rowMatches && rowMatches.length > 0) {
          console.log('Found rows in alternative table:', rowMatches.length);
          
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
          
          if (rows.length > 0) {
            console.log('Successfully extracted data from alternative table:', rows.length, 'rows');
            return res.status(200).json({
              success: true,
              found: true,
              data: {
                rows: rows
              }
            });
          }
        }
      }
      
      return res.status(200).json({
        success: true,
        found: false,
        message: errorMessage || 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
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
    console.error('MOT API v4 Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.'
    });
  }
}
