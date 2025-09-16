import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
const app = express();

app.use(cors());
app.use(express.json());

const TARGET_URL = 'http://www.mot.gov.ps/mot_Ser/Exam.aspx';

app.post('/exam', async (req, res) => {
  try {
    // 1. GET to fetch tokens and cookies
    const getResp = await fetch(TARGET_URL, { method: 'GET' });
    const cookies = getResp.headers.get('set-cookie');
    const html = await getResp.text();
    console.log('Cookies:', cookies); // Log cookies

    // 2. Parse tokens from HTML
    const viewState = html.match(/id="__VIEWSTATE" value="([^"]+)"/)?.[1];
    const viewStateGen = html.match(/id="__VIEWSTATEGENERATOR" value="([^"]+)"/)?.[1];
    const eventValidation = html.match(/id="__EVENTVALIDATION" value="([^"]+)"/)?.[1];

    if (!viewState || !viewStateGen || !eventValidation) {
      return res.status(500).json({ error: 'Failed to extract tokens' });
    }

    // 3. Prepare form data
    const formData = new URLSearchParams();
    formData.append('__VIEWSTATE', viewState);
    formData.append('__VIEWSTATEGENERATOR', viewStateGen);
    formData.append('__EVENTVALIDATION', eventValidation);
    formData.append('TextBox1', req.body.id);
    formData.append('btnSearch', 'بحث');
    console.log('POST DATA:', formData.toString()); // Log POST data

    // 4. POST with cookies
    const postHeaders = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies || '',
      'User-Agent': 'Mozilla/5.0',
      'Referer': TARGET_URL,
      'Origin': 'http://www.mot.gov.ps',
    };
    console.log('POST HEADERS:', postHeaders); // Log POST headers

    const postResp = await fetch(TARGET_URL, {
      method: 'POST',
      headers: postHeaders,
      body: formData.toString(),
    });
    const postHtml = await postResp.text();
    console.log(postHtml); // Log the response HTML
    res.send(postHtml);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Proxy running on http://localhost:3001')); 