// MOT Service for theoretical exam results
// This uses our server-side API to fetch data from the MOT website

export const fetchTheoreticalExamResult = async (searchId) => {
  if (!searchId) {
    throw new Error('رقم الهوية مطلوب');
  }

  console.log('Fetching from MOT website via server-side API...');

  try {
    const response = await fetch('/api/mot-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchId }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle 503 Service Unavailable with fallback information
      if (response.status === 503 && result.fallback) {
        const error = new Error(result.message || 'لا يمكن الوصول لموقع وزارة المواصلات');
        error.fallback = result.fallback;
        error.status = 503;
        throw error;
      }
      throw new Error(result.message || `HTTP error! status: ${response.status}`);
    }

    if (!result.success) {
      // Handle 503 Service Unavailable with fallback information
      if (result.fallback) {
        const error = new Error(result.message || 'لا يمكن الوصول لموقع وزارة المواصلات');
        error.fallback = result.fallback;
        error.status = 503;
        throw error;
      }
      throw new Error(result.message || 'فشل في جلب النتائج');
    }

    if (!result.found) {
      return {
        status: 'success',
        found: false,
        message: result.message || 'لم يتم العثور على نتيجة لرقم الهوية المدخل'
      };
    }

    return {
      status: 'success',
      found: true,
      tables: [{
        rows: result.data.rows
      }]
    };

  } catch (error) {
    console.error('MOT API Error:', error);
    throw new Error(error.message || 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات');
  }
};

