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

    // Use the provided form tokens from Ministry of Transportation
    console.log('Using MOT form tokens for search...');
    
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', '/wEPDwULLTE3NDUxNzM4OTcPZBYCAgMPZBYEAgcPDxYCHgRUZXh0BRwg2YbYqtmK2KzYqSDYp9mE2KfZhdiq2K3Yp9mGZGQCCQ8PFgIeB1Zpc2libGVnZBYQZg9kFgRmD2QWAmYPDxYCHwAFCtin2YTYp9iz2YVkZAIBD2QWAmYPDxYCHwAFKdin2K3ZhdivINmF2K3ZhdivINiz2YTZhdin2YYg2KfZhNi52LHYrNmHZGQCAQ9kFgRmD2QWAmYPDxYCHwAFG9iq2KfYsdmK2K4g2KfZhNin2YXYqtit2KfZhmRkAgEPZBYCZg8PFgIfAAUKMjYvMTIvMjAyMmRkAgIPZBYEZg9kFgJmDw8WAh8ABRXYr9ix2KzYqSDYp9mE2LHYrti90KlkZAIBD2QWAmYPDxYCHwAFCtiu2LXZiNi12YpkZAIDD2QWBGYPZBYCZg8PFgIfAAUb2KfZhNmG2KrZitis2Kkg2KfZhNi52LjZhdmJZGQCAQ9kFgJmDw8WAh8ABQIyNWRkAgQPZBYEZg9kFgJmDw8WAh8ABRvZhtiq2YrYrNipINin2YTYp9mF2KrYrdin2YZkZAIBD2QWAmYPDxYCHwAFAjI5ZGQCBQ9kFgRmD2QWAmYPDxYCHwAFHNio2K3Yp9is2Kkg2KXZhNmJINmB2KfYrdi12J9kZAIBD2QWAmYPDxYCHwAFBNmE2KdkZAIGD2QWBGYPZBYCZg8PFgIfAAUf2KfZhNmG2KrZitis2Kkg2KfZhNmG2YfYp9im2YrYqWRkAgEPZBYCZg8PFgIfAAUI2YbYp9is2K1kZAIHD2QWBGYPZBYCZg8PFgIfAAUV2LnYr9ivINin2YTYo9iz2KbZhNipZGQCAQ9kFgJmDw8WAh8ABQIzMGRkZHl0iKYYnkD5yZ8pdppJfgHGx09fH1Z6wpPndUDP+Ao0');
    formData.append('__VIEWSTATEGENERATOR', 'B171495F');
    formData.append('__EVENTVALIDATION', '/wEdAAOgR6MNOQADpgOo0rB9liJaESCFkFW/RuhzY1oLb/NUVI7U3Vc0WZ+wxclqyPFfzmMwoO61meGJ6BFa7wXcco1wbb0gXTdG1eUDVw9NwZr5iw==');
    formData.append('TextBox1', searchId);
    formData.append('btnSearch', 'بحث');

    // Step 2: Submit search request
    console.log(`Searching for ID: ${searchId}`);
    
    const searchResponse = await fetch('https://www.mot.gov.ps/mot_Ser/Exam.aspx', {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://www.mot.gov.ps',
        'Referer': 'https://www.mot.gov.ps/mot_Ser/Exam.aspx'
      },
      body: formData
    });

    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
    }

    const resultHtml = await searchResponse.text();
    console.log('Search response received');

    // Step 3: Parse results using regex
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

    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}