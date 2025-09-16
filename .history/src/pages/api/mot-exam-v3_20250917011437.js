// MOT Exam API with SSL bypass and alternative approaches
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

    console.log(`MOT API v3 called with search ID: ${searchId}`);
    console.log('Environment:', process.env.NODE_ENV);

    const axios = require('axios');
    const https = require('https');

    // Create HTTPS agent that bypasses SSL verification
    const httpsAgent = new https.Agent({ 
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method'
    });

    // Step 1: Try to fetch initial page with SSL bypass
    console.log('Fetching fresh form tokens from MOT website...');
    let initialResponse, initialHtml;
    
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
      
      // Try alternative approaches
      try {
        console.log('Trying alternative SSL approach...');
        
        // Try with different SSL settings
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
        
        // Try HTTP instead of HTTPS
        try {
          console.log('Trying HTTP instead of HTTPS...');
          initialResponse = await axios.get('http://www.mot.gov.ps/mot_Ser/Exam.aspx', {
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
          
          initialHtml = initialResponse.data;
          console.log('HTTP connection successful');
        } catch (httpError) {
          console.error('HTTP connection failed:', httpError.message);
          throw new Error(`لا يمكن الاتصال بموقع وزارة المواصلات: ${httpError.message}`);
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

    // Step 4: Submit search request with SSL bypass
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
      
      // Try alternative search approaches
      try {
        console.log('Trying alternative search approach...');
        
        // Try with different SSL settings
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
        
        // Try HTTP instead of HTTPS for search
        try {
          console.log('Trying HTTP search...');
          searchResponse = await axios.post('http://www.mot.gov.ps/mot_Ser/Exam.aspx', formData.toString(), {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Origin': 'http://www.mot.gov.ps',
              'Referer': 'http://www.mot.gov.ps/mot_Ser/Exam.aspx',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            },
            timeout: 30000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });
          
          resultHtml = searchResponse.data;
          console.log('HTTP search successful');
        } catch (httpSearchError) {
          console.error('HTTP search failed:', httpSearchError.message);
          throw new Error(`فشل في البحث عن النتيجة: ${httpSearchError.message}`);
        }
      }
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
    console.error('MOT API v3 Error:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.'
    });
  }
}
