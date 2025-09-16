// Server-side API route for MOT exam results
// This bypasses CORS by running on the server

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    // Validate searchId format (should be numeric and reasonable length)
    if (!/^\d{7,10}$/.test(searchId)) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهوية يجب أن يكون رقم صحيح بين 7-10 أرقام'
      });
    }

    // Step 1: Fetch the initial page to get fresh form tokens
    console.log('Fetching fresh form tokens from MOT website...');
    
    const initialResponse = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!initialResponse.ok) {
      throw new Error(`Failed to fetch MOT website: ${initialResponse.status}`);
    }

    const initialHtml = await initialResponse.text();
    console.log('Initial page fetched successfully');

    // Step 2: Extract fresh form tokens using regex
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      throw new Error('فشل في استخراج بيانات النموذج من الصفحة');
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

    // Step 4: Submit search request
    console.log(`Searching for ID: ${searchId}`);
    
    const searchResponse = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.mot.gov.ps',
        'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      },
      body: formData,
      timeout: 15000 // 15 second timeout for search
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
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
    console.error('Error stack:', error.stack);

    // Return more detailed error information in development
    const errorResponse = {
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.',
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
      errorResponse.type = error.name;
    }

    return res.status(500).json(errorResponse);
  }
}