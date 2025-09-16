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

    // Alternative HTTPS agent for fallback
    const altHttpsAgent = new https.Agent({
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_method',
      ciphers: 'ALL:!ADH:!LOW:!EXP:!MD5:@STRENGTH'
    });

    // Helper function to validate MOT HTML content
    function isValidMOTContent(html) {
      if (!html || typeof html !== 'string') return false;

      // Check for MOT-specific indicators
      const motIndicators = [
        'وزارة المواصلات',
        '__VIEWSTATE',
        '__EVENTVALIDATION',
        'Exam.aspx',
        'btnSearch',
        'TextBox1'
      ];

      let foundIndicators = 0;
      for (const indicator of motIndicators) {
        if (html.includes(indicator)) {
          foundIndicators++;
        }
      }

      // At least 3 indicators should be present for valid content
      return foundIndicators >= 3;
    }

    // Step 1: Try to fetch initial page with robust fallbacks
    console.log('Fetching fresh form tokens from MOT website...');
    let initialResponse, initialHtml;

    // Try direct connection with SSL bypass first (most reliable)
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
        timeout: 25000,
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      });

      initialHtml = initialResponse.data;

      if (isValidMOTContent(initialHtml)) {
        console.log('Direct connection with SSL bypass successful');
      } else {
        throw new Error('Invalid content received from direct connection');
      }
    } catch (fetchError) {
      console.error('Direct connection failed:', fetchError.message);

      // Try alternative SSL approach
      try {
        console.log('Trying alternative SSL approach...');
        initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
          },
          httpsAgent: altHttpsAgent,
          timeout: 25000,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          }
        });

        initialHtml = initialResponse.data;

        if (isValidMOTContent(initialHtml)) {
          console.log('Alternative SSL approach successful');
        } else {
          throw new Error('Invalid content received from alternative SSL');
        }
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
            timeout: 25000,
            validateStatus: function (status) {
              return status >= 200 && status < 300;
            }
          });

          initialHtml = initialResponse.data;

          if (isValidMOTContent(initialHtml)) {
            console.log('HTTP connection successful');
          } else {
            throw new Error('Invalid content received from HTTP connection');
          }
        } catch (httpError) {
          console.error('HTTP connection failed:', httpError.message);

          // Last resort: try selected reliable proxy services
          console.log('Trying reliable proxy services as last resort...');
          const reliableProxies = [
            {
              name: 'AllOrigins',
              url: 'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://www.mot.gov.ps/mot_Ser/Exam.aspx')
            },
            {
              name: 'ThingProxy',
              url: 'https://thingproxy.freeboard.io/fetch/https://www.mot.gov.ps/mot_Ser/Exam.aspx'
            }
          ];

          let proxySuccess = false;
          for (const proxy of reliableProxies) {
            try {
              console.log(`Trying ${proxy.name}...`);
              initialResponse = await axios.get(proxy.url, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                  'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3'
                },
                timeout: 20000,
                validateStatus: function (status) {
                  return status >= 200 && status < 300;
                }
              });

              initialHtml = initialResponse.data;

              if (isValidMOTContent(initialHtml)) {
                console.log(`${proxy.name} successful with valid content`);
                proxySuccess = true;
                break;
              } else {
                console.log(`${proxy.name} returned invalid content`);
                continue;
              }
            } catch (proxyError) {
              console.error(`${proxy.name} failed:`, proxyError.message);
              continue;
            }
          }

          if (!proxySuccess) {
            throw new Error('All connection methods failed');
          }
        }
      }
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

    // Step 4: Submit search request with robust fallbacks
    let searchResponse, resultHtml;

    // Try direct connection with SSL bypass first (most reliable)
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
        timeout: 25000,
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
          timeout: 25000,
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
            timeout: 25000,
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
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.'
    });
  }
}