// Service to fetch theoretical exam results from MOT website
export const fetchTheoreticalExamResult = async (searchId) => {
  try {
    console.log('Fetching from MOT website via server-side API...');
    
    const response = await fetch('/api/mot-exam-v3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ searchId }),
    });

    const result = await response.json();
    
    console.log('MOT Service - Response status:', response.status);
    console.log('MOT Service - Response ok:', response.ok);
    console.log('MOT Service - Result:', result);

    if (!response.ok) {
      throw new Error(result.message || 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.');
    }

    // Check if the API returned an error in the response body
    if (result.success === false) {
      throw new Error(result.message || 'حدث خطأ أثناء جلب البيانات من موقع وزارة المواصلات. يرجى المحاولة لاحقاً.');
    }

    return result;
  } catch (error) {
    console.error('MOT fetch error:', error);
    throw error;
  }
};