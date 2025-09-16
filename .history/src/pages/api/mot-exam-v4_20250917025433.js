// MOT Exam API with robust connection handling for Vercel
// Simple rate limiting store (in production, use Redis or external store)
const rateLimitStore = new Map();

// Rate limiting helper
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  const data = rateLimitStore.get(ip);
  if (now > data.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (data.count >= maxRequests) {
    return false;
  }

  data.count++;
  rateLimitStore.set(ip, data);
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      success: false,
      message: 'تم تجاوز حد الطلبات المسموح. يرجى المحاولة بعد دقيقة.'
    });
  }

  // Detect environment variables at function level for proper scope
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  const isProduction = process.env.NODE_ENV === 'production';

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

    console.log('Environment detection:', {
      isVercel: !!isVercel,
      isProduction,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV
    });

    // Create HTTPS agent that bypasses SSL verification
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      timeout: 20000
    });

    // Alternative HTTPS agent for fallback
    const altHttpsAgent = new https.Agent({
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_method',
      ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH',
      timeout: 20000
    });

    // Vercel-optimized HTTPS agent
    const vercelHttpsAgent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 15000,
      family: 4 // Force IPv4
    });

    // Helper function to validate MOT HTML content
    function isValidMOTContent(html) {
      if (!html || typeof html !== 'string') return false;

      // Check for essential MOT indicators that must be present
      const essentialIndicators = [
        '__VIEWSTATE',
        '__EVENTVALIDATION',
        '__VIEWSTATEGENERATOR',
        'TextBox1',
        'btnSearch'
      ];

      // Check for MOT-specific content indicators
      const contentIndicators = [
        'نتيجة امتحان التؤوريا',
        'أدخل رقم الهوية',
        'Exam.aspx',
        'form1',
        'bootstrap.min.css'
      ];

      // Count essential indicators (all must be present)
      let foundEssential = 0;
      for (const indicator of essentialIndicators) {
        if (html.includes(indicator)) {
          foundEssential++;
        }
      }

      // Count content indicators (at least 2 must be present)
      let foundContent = 0;
      for (const indicator of contentIndicators) {
        if (html.includes(indicator)) {
          foundContent++;
        }
      }

      // Must have all essential indicators and at least 2 content indicators
      const isValid = foundEssential === essentialIndicators.length && foundContent >= 2;

      if (!isValid) {
        console.log('Content validation failed:', {
          foundEssential: foundEssential,
          requiredEssential: essentialIndicators.length,
          foundContent: foundContent,
          requiredContent: 2,
          htmlLength: html.length
        });
      }

      return isValid;
    }

    // Helper function for retry with exponential backoff
    async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          return await fn();
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }

          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // Step 1: Try to fetch initial page with robust fallbacks
    console.log('Fetching fresh form tokens from MOT website...');
    let initialResponse, initialHtml;

    // Choose connection strategy based on environment
    const connectionMethods = [];

    if (isVercel) {
      console.log('Vercel environment detected - using custom Render proxy');
      // Use our own deployed Render proxy first (most reliable)
      connectionMethods.push(
        // Our custom Render proxy (primary)
        {
          name: 'Custom Render Proxy',
          method: 'proxy',
          url: 'https://cors-jquj.onrender.com/proxy/mot_Ser/Exam.aspx'
        },
        // Backup proxy services
        {
          name: 'AllOrigins Proxy',
          method: 'proxy',
          url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
        },
        {
          name: 'ThingProxy',
          method: 'proxy',
          url: 'https://thingproxy.freeboard.io/fetch/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        // Direct connections as last resort
        {
          name: 'HTTP Direct',
          method: 'http',
          url: 'http://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'Vercel HTTPS Basic',
          method: 'vercel-https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        }
      );
    } else {
      console.log('Local/Development environment - using direct connection strategy');
      // On local development, prioritize direct connections
      connectionMethods.push(
        {
          name: 'Direct HTTPS',
          method: 'https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'Alternative HTTPS',
          method: 'alt-https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'HTTP Direct',
          method: 'http',
          url: 'http://www.mot.gov.ps/mot_Ser/Exam.aspx'
        }
      );
    }

    let connectionSuccess = false;
    let lastError = null;

    for (const connection of connectionMethods) {
      try {
        console.log(`Trying ${connection.name}...`);

        let requestConfig = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
            'Cache-Control': 'no-cache'
          },
          timeout: isVercel ? 20000 : 25000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        };

        // Configure agent based on connection method
        switch (connection.method) {
          case 'https':
            requestConfig.httpsAgent = httpsAgent;
            requestConfig.headers['Connection'] = 'keep-alive';
            requestConfig.headers['Upgrade-Insecure-Requests'] = '1';
            break;
          case 'alt-https':
            requestConfig.httpsAgent = altHttpsAgent;
            requestConfig.headers['User-Agent'] = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
            requestConfig.headers['Accept-Encoding'] = 'gzip, deflate';
            break;
          case 'vercel-https':
            requestConfig.httpsAgent = vercelHttpsAgent;
            requestConfig.headers['Connection'] = 'close';
            break;
          case 'proxy':
            // Standard proxy requests
            requestConfig.timeout = 18000;
            break;
          case 'http':
            // HTTP requests don't need HTTPS agents
            break;
        }

        // Make the request (all direct connections now)
        initialResponse = await axios.get(connection.url, requestConfig);
        initialHtml = initialResponse.data;

        if (isValidMOTContent(initialHtml)) {
          console.log(`${connection.name} successful with valid content`);
          connectionSuccess = true;
          break;
        } else {
          console.log(`${connection.name} returned invalid content, trying next method...`);
          lastError = new Error(`Invalid content from ${connection.name}`);
          continue;
        }
      } catch (error) {
        console.error(`${connection.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!connectionSuccess) {
      console.error('All connection methods failed. Last error:', lastError?.message);
      throw new Error(`All connection methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    // Step 2: Extract fresh form tokens using regex
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      console.error('Failed to extract form tokens');
      console.log('HTML length:', initialHtml ? initialHtml.length : 'null');
      console.log('HTML preview (first 1000 chars):', initialHtml ? initialHtml.substring(0, 1000) : 'null');
      console.log('HTML preview (last 500 chars):', initialHtml ? initialHtml.substring(Math.max(0, initialHtml.length - 500)) : 'null');

      // Check what we actually got
      const hasViewState = initialHtml && initialHtml.includes('__VIEWSTATE');
      const hasEventValidation = initialHtml && initialHtml.includes('__EVENTVALIDATION');
      const hasViewStateGenerator = initialHtml && initialHtml.includes('__VIEWSTATEGENERATOR');

      console.log('Token presence check:');
      console.log('- __VIEWSTATE found:', hasViewState);
      console.log('- __EVENTVALIDATION found:', hasEventValidation);
      console.log('- __VIEWSTATEGENERATOR found:', hasViewStateGenerator);

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

    // Step 4: Submit search request with environment-aware strategy
    let searchResponse, resultHtml;

    // Choose search strategy based on environment (use same method that worked for initial fetch)
    const searchMethods = [];

    if (isVercel) {
      console.log('Using custom Render proxy for search');
      searchMethods.push(
        // Our custom Render proxy for search (primary)
        {
          name: 'Custom Render Proxy Search',
          method: 'proxy',
          url: 'https://cors-jquj.onrender.com/proxy/mot_Ser/Exam.aspx'
        },
        // Backup proxy services for search
        {
          name: 'AllOrigins Search',
          method: 'proxy',
          url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
        },
        {
          name: 'ThingProxy Search',
          method: 'proxy',
          url: 'https://thingproxy.freeboard.io/fetch/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        // Direct connections as last resort
        {
          name: 'HTTP Search',
          method: 'http',
          url: 'http://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'Vercel HTTPS Basic Search',
          method: 'vercel-https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        }
      );
    } else {
      searchMethods.push(
        {
          name: 'Direct HTTPS Search',
          method: 'https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'Alternative HTTPS Search',
          method: 'alt-https',
          url: 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
        },
        {
          name: 'HTTP Search',
          method: 'http',
          url: 'http://www.mot.gov.ps/mot_Ser/Exam.aspx'
        }
      );
    }

    let searchSuccess = false;
    let lastSearchError = null;

    for (const searchMethod of searchMethods) {
      try {
        console.log(`Attempting ${searchMethod.name}...`);

        let searchConfig = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
          },
          timeout: isVercel ? 20000 : 25000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        };

        // Configure search request based on method
        switch (searchMethod.method) {
          case 'https':
            searchConfig.httpsAgent = httpsAgent;
            searchConfig.headers['Origin'] = 'https://www.mot.gov.ps';
            searchConfig.headers['Referer'] = 'https://www.mot.gov.ps/mot_Ser/Exam.aspx';
            searchConfig.headers['Connection'] = 'keep-alive';
            break;
          case 'alt-https':
            searchConfig.httpsAgent = altHttpsAgent;
            searchConfig.headers['User-Agent'] = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
            searchConfig.headers['Accept-Language'] = 'en-US,en;q=0.5';
            searchConfig.headers['Accept-Encoding'] = 'gzip, deflate';
            break;
          case 'vercel-https':
            searchConfig.httpsAgent = vercelHttpsAgent;
            searchConfig.headers['Connection'] = 'close';
            searchConfig.headers['Origin'] = 'https://www.mot.gov.ps';
            searchConfig.headers['Referer'] = 'https://www.mot.gov.ps/mot_Ser/Exam.aspx';
            break;
          case 'proxy':
            // Standard proxy requests
            searchConfig.timeout = 18000;
            break;
          case 'http':
            searchConfig.headers['Origin'] = 'http://www.mot.gov.ps';
            searchConfig.headers['Referer'] = 'http://www.mot.gov.ps/mot_Ser/Exam.aspx';
            break;
        }

        // Make search request (all direct connections now)
        searchResponse = await axios.post(searchMethod.url, formData.toString(), searchConfig);
        resultHtml = searchResponse.data;

        console.log(`${searchMethod.name} successful`);
        searchSuccess = true;
        break;
      } catch (error) {
        console.error(`${searchMethod.name} failed:`, error.message);
        lastSearchError = error;
        continue;
      }
    }

    if (!searchSuccess) {
      console.error('All search methods failed. Last error:', lastSearchError?.message);
      throw new Error(`فشل في البحث عن النتيجة: ${lastSearchError?.message || 'جميع طرق الاتصال فشلت'}`);
    }

    // Step 5: Parse results using enhanced parsing
    console.log('Parsing search results...');
    console.log('Result HTML length:', resultHtml.length);
    console.log('Result HTML preview (first 2000 chars):', resultHtml.substring(0, 2000));
    console.log('Result HTML preview (last 1000 chars):', resultHtml.substring(resultHtml.length - 1000));
    
    // Check for the specific table structure we see in the logs
    const examTableMatch = resultHtml.match(/<table[^>]*>(.*?<th><span[^>]*>درجة الرخصة<\/span><\/th>.*?)<\/table>/is);
    console.log('Exam table match:', !!examTableMatch);

    // Try to parse the exam table first (the one we see in the logs)
    if (examTableMatch) {
      console.log('Found exam table, parsing results...');
      const tableContent = examTableMatch[1];
      
      // Extract exam data using the specific structure we see
      const examData = {};
      
      // Extract all possible fields from the HTML
      const allSpanMatches = tableContent.match(/<span[^>]*id="([^"]*)"[^>]*>(.*?)<\/span>/gis);
      console.log('All span elements found:', allSpanMatches ? allSpanMatches.length : 0);
      
      if (allSpanMatches) {
        for (const match of allSpanMatches) {
          const idMatch = match.match(/id="([^"]*)"/);
          const contentMatch = match.match(/>([^<]*)</);
          if (idMatch && contentMatch) {
            const id = idMatch[1];
            const content = contentMatch[1].trim();
            console.log(`Found field: ${id} = ${content}`);
            examData[id] = content;
          }
        }
      }
      
      // Extract specific known fields with fallback
      examData.degree = examData.lblDegree || examData.degree || 'غير محدد';
      examData.maxScore = examData.lblMax || examData.maxScore || 'غير محدد';
      examData.examResult = examData.lblResult_ || examData.examResult || 'غير محدد';
      examData.needTester = examData.lblNeedtester || examData.needTester || 'غير محدد';
      examData.finalResult = examData.lblAllResult || examData.finalResult || 'غير محدد';
      examData.questionsCount = examData.lblQuestions || examData.questionsCount || 'غير محدد';
      
      // Look for date fields specifically
      const dateFields = ['lblDate', 'lblExamDate', 'lblTestDate', 'lblDateOfExam', 'date', 'examDate', 'testDate'];
      for (const field of dateFields) {
        if (examData[field]) {
          examData.examDate = examData[field];
          break;
        }
      }
      
      // If no date found in specific fields, try to extract from any date-like pattern
      if (!examData.examDate) {
        const datePatterns = [
          /<span[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/span>/g, // DD/MM/YYYY format
          /<span[^>]*>(\d{4}\/\d{1,2}\/\d{1,2})<\/span>/g, // YYYY/MM/DD format
          /<span[^>]*>(\d{1,2}-\d{1,2}-\d{4})<\/span>/g,   // DD-MM-YYYY format
          /<td[^>]*>(\d{1,2}\/\d{1,2}\/\d{4})<\/td>/g,     // Date in table cells
        ];
        
        for (const pattern of datePatterns) {
          const matches = tableContent.match(pattern);
          if (matches) {
            for (const match of matches) {
              const dateMatch = match.match(/>([^<]*)</);
              if (dateMatch) {
                const date = dateMatch[1].trim();
                // Check if it looks like a date
                if (/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/.test(date)) {
                  examData.examDate = date;
                  console.log('Found potential exam date:', date);
                  break;
                }
              }
            }
            if (examData.examDate) break;
          }
        }
      }
      
      // Look for name field specifically
      const nameFields = ['lblName', 'lblFullName', 'lblStudentName', 'lblCandidateName', 'name', 'fullName'];
      for (const field of nameFields) {
        if (examData[field]) {
          examData.name = examData[field];
          break;
        }
      }
      
      // If no name found, try to extract from any text that might contain a name
      if (!examData.name) {
        const namePatterns = [
          /<span[^>]*>([أ-ي\s]{10,})<\/span>/g, // Arabic text with 10+ characters
          /<td[^>]*>([أ-ي\s]{10,})<\/td>/g,     // Arabic text in table cells
        ];
        
        for (const pattern of namePatterns) {
          const matches = tableContent.match(pattern);
          if (matches) {
            for (const match of matches) {
              const textMatch = match.match(/>([أ-ي\s]{10,})</);
              if (textMatch) {
                const text = textMatch[1].trim();
                // Check if it looks like a name (contains Arabic letters and spaces)
                if (text.length > 5 && /[أ-ي]/.test(text) && !/[\d]/.test(text)) {
                  examData.name = text;
                  console.log('Found potential name:', text);
                  break;
                }
              }
            }
            if (examData.name) break;
          }
        }
      }
      
      console.log('Extracted exam data:', examData);
      
      // Convert to rows format for compatibility
      const rows = [];
      
      // Add name if found
      if (examData.name) {
        rows.push(['الاسم', examData.name]);
      }
      
      // Add exam date if found
      if (examData.examDate) {
        rows.push(['تاريخ الامتحان', examData.examDate]);
      }
      
      // Add other fields
      rows.push(['درجة الرخصة', examData.degree || 'غير محدد']);
      rows.push(['النتيجة العظمى', examData.maxScore || 'غير محدد']);
      rows.push(['نتيجة الامتحان', examData.examResult || 'غير محدد']);
      rows.push(['بحاجة إلى فاحص؟', examData.needTester || 'غير محدد']);
      rows.push(['النتيجة النهائية', examData.finalResult || 'غير محدد']);
      rows.push(['عدد الأسئلة', examData.questionsCount || 'غير محدد']);
      
      return res.status(200).json({
        success: true,
        found: true,
        data: {
          rows: rows,
          examData: examData
        }
      });
    } else {
      // Fallback to basic table parsing
      console.log('No exam table found, trying basic table parsing...');
      
      const tableMatch = resultHtml.match(/<table[^>]*id="Table1"[^>]*>(.*?)<\/table>/is);
      const tableMatch2 = resultHtml.match(/<table[^>]*class="[^"]*table[^"]*"[^>]*>(.*?)<\/table>/is);
      const tableMatch3 = resultHtml.match(/<table[^>]*>(.*?)<\/table>/is);
      
      console.log('Table1 match:', !!tableMatch);
      console.log('Table class match:', !!tableMatch2);
      console.log('Any table match:', !!tableMatch3);
      
      if (!tableMatch && !tableMatch2 && !tableMatch3) {
        return res.status(200).json({
          success: true,
          found: false,
          message: 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
        });
      }
      
      // Use the first available table
      const selectedTable = tableMatch || tableMatch2 || tableMatch3;
      const tableContent = selectedTable[1];
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
    }

  } catch (error) {
    console.error('MOT API v4 Error:', error);

    // Enhanced error logging for production debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        timeout: error.config.timeout,
        headers: error.config.headers
      } : null,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        dataLength: error.response.data ? error.response.data.length : 0
      } : null,
      request: error.request ? {
        method: error.request.method,
        url: error.request.url,
        timeout: error.request.timeout
      } : null,
      isVercel: !!isVercel,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.',
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          error: error.message,
          isVercel: !!isVercel,
          timestamp: new Date().toISOString()
        }
      })
    });
  }
}