export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'ID is required' });
  }

  try {
    // First, get the initial page to extract VIEWSTATE values
    const initialResponse = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!initialResponse.ok) {
      throw new Error(`HTTP error! status: ${initialResponse.status}`);
    }

    const initialHtml = await initialResponse.text();
    
    // Extract VIEWSTATE values from the HTML
    const viewStateMatch = initialHtml.match(/name="__VIEWSTATE" id="__VIEWSTATE" value="([^"]+)"/);
    const viewStateGeneratorMatch = initialHtml.match(/name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="([^"]+)"/);
    const eventValidationMatch = initialHtml.match(/name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="([^"]+)"/);

    if (!viewStateMatch || !viewStateGeneratorMatch || !eventValidationMatch) {
      throw new Error('Failed to extract form tokens');
    }

    // Prepare form data for POST request
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewStateMatch[1]);
    formData.append('__VIEWSTATEGENERATOR', viewStateGeneratorMatch[1]);
    formData.append('__EVENTVALIDATION', eventValidationMatch[1]);
    formData.append('TextBox1', id);
    formData.append('btnSearch', 'بحث');

    // Make the POST request to get exam results
    const response = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx',
        'Origin': 'https://www.mot.gov.ps',
        'Upgrade-Insecure-Requests': '1',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const resultHtml = await response.text();
    
    // Parse the HTML response to extract exam results
    const parsedData = parseExamResultHtml(resultHtml);
    
    if (!parsedData.name) {
      return res.status(200).json({ 
        success: true, 
        found: false, 
        message: 'No results found for this ID' 
      });
    }

    // Calculate if passed (score >= 25 and final result contains "ناجح")
    const score = parseFloat(parsedData.examResult || 0);
    const minScore = 25;
    parsedData.passed = score >= minScore && parsedData.finalResult?.includes('ناجح');

    return res.status(200).json({
      success: true,
      found: true,
      data: parsedData
    });

  } catch (error) {
    console.error('MOT API Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}

// Helper function to parse HTML response
function parseExamResultHtml(html) {
  const data = {};
  
  // Extract name
  const nameMatch = html.match(/<span id="lblName" class="pull-right">([^<]+)<\/span>/);
  if (nameMatch) data.name = nameMatch[1].trim();
  
  // Extract exam date
  const dateMatch = html.match(/<span id="lblDate" class="pull-right">([^<]+)<\/span>/);
  if (dateMatch) data.examDate = dateMatch[1].trim();
  
  // Extract license degree
  const degreeMatch = html.match(/<span id="lblDegree" class="pull-right">([^<]+)<\/span>/);
  if (degreeMatch) data.licenseDegree = degreeMatch[1].trim();
  
  // Extract max result
  const maxMatch = html.match(/<span id="lblMax" class="pull-right">([^<]+)<\/span>/);
  if (maxMatch) data.maxResult = parseInt(maxMatch[1].trim()) || 30;
  
  // Extract exam result
  const resultMatch = html.match(/<span id="lblResult_" class="pull-right">([^<]+)<\/span>/);
  if (resultMatch) data.examResult = resultMatch[1].trim();
  
  // Extract need tester
  const needTesterMatch = html.match(/<span id="lblNeedtester" class="pull-right">([^<]+)<\/span>/);
  if (needTesterMatch) data.needTester = needTesterMatch[1].trim();
  
  // Extract final result
  const finalResultMatch = html.match(/<span id="lblAllResult" class="pull-right">([^<]+)<\/span>/);
  if (finalResultMatch) data.finalResult = finalResultMatch[1].trim();
  
  // Extract questions count
  const questionsMatch = html.match(/<span id="lblQuestions" class="pull-right">([^<]+)<\/span>/);
  if (questionsMatch) data.questions = questionsMatch[1].trim();
  
  return data;
}
