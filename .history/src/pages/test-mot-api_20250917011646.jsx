import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';

export default function TestMotApi() {
  const [searchId, setSearchId] = useState('420698060');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing MOT API v3 with search ID:', searchId);
      
      const response = await fetch('/api/mot-exam-v3', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchId }),
      });

      const data = await response.json();
      
      console.log('MOT API v3 response:', data);
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.message || 'حدث خطأ أثناء الاختبار');
      }
    } catch (err) {
      console.error('Test error:', err);
      setError(err.message || 'حدث خطأ أثناء الاختبار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        اختبار MOT API v3
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="رقم الهوية"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        
        <Button
          variant="contained"
          onClick={handleTest}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'اختبار API'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Box>
          <Alert severity={result.success ? "success" : "error"} sx={{ mb: 2 }}>
            {result.success ? 'تم الاختبار بنجاح!' : 'فشل الاختبار'}
          </Alert>
          
          <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              النتيجة:
            </Typography>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
              {JSON.stringify(result, null, 2)}
            </pre>
          </Box>
        </Box>
      )}
    </Box>
  );
}
