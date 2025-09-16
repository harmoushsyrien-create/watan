// Debug MOT response to see what HTML we're getting
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { searchId } = req.body;

    if (!searchId || !/^\d{7,10}$/.test(searchId)) {
      return res.status(400).json({
        success: false,
        message: 'رقم الهوية يجب أن يكون بين 7 و 10 أرقام'
      });
    }

    console.log(`Debug MOT response for search ID: ${searchId}`);

    const axios = require('axios');
    const https = require('https');

    // Create HTTPS agent that bypasses SSL verification
    const httpsAgent = new https.Agent({ 
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method'
    });

    // Step 1: Get initial page
    console.log('Getting initial page...');
    const initialResponse = await axios.get('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
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

    const initialHtml = initialResponse.data;
    console.log('Initial page HTML length:', initialHtml.length);

    // Step 2: Extract form tokens
    const viewStateMatch = initialHtml.match(/id="__VIEWSTATE".*?value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/id="__VIEWSTATEGENERATOR".*?value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/id="__EVENTVALIDATION".*?value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      throw new Error('Failed to extract form tokens');
    }

    const viewState = viewStateMatch[1];
    const viewStateGenerator = viewStateGeneratorMatch[1];
    const eventValidation = eventValidationMatch[1];

    console.log('Form tokens extracted successfully');

    // Step 3: Prepare form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('TextBox1', searchId);
    formData.append('btnSearch', 'بحث');

    console.log(`Searching for ID: ${searchId}`);

    // Step 4: Submit search
    const searchResponse = await axios.post('https://www.mot.gov.ps/mot_Ser/Exam.aspx', formData.toString(), {
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

    const resultHtml = searchResponse.data;
    console.log('Search result HTML length:', resultHtml.length);

    // Return the full HTML for debugging
    return res.status(200).json({
      success: true,
      searchId: searchId,
      initialHtmlLength: initialHtml.length,
      resultHtmlLength: resultHtml.length,
      resultHtml: resultHtml,
      hasTable1: resultHtml.includes('id="Table1"'),
      hasTable: resultHtml.includes('<table'),
      hasError: resultHtml.includes('class="danger"') || resultHtml.includes('class="error"'),
      preview: {
        first1000: resultHtml.substring(0, 1000),
        last1000: resultHtml.substring(resultHtml.length - 1000)
      }
    });

  } catch (error) {
    console.error('Debug MOT response error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
