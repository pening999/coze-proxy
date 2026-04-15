// /api/coze.js (Vercel Serverless Function)
import axios from 'axios';

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 从环境变量读取敏感信息（在Vercel后台设置）
  const API_KEY = process.env.COZE_API_KEY;
  const COZE_API_URL = 'https://api.coze.cn/open_api/v2/chat';

  try {
    const response = await axios.post(COZE_API_URL, req.body, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: req.body.stream ? 'stream' : 'json'
    });

    // 转发响应头
    Object.keys(response.headers).forEach(key => {
      res.setHeader(key, response.headers[key]);
    });
    res.status(response.status);

    // 流式数据直接转发
    if (req.body.stream) {
      response.data.pipe(res);
    } else {
      res.send(response.data);
    }
  } catch (error) {
    console.error('代理请求出错：', error.message);
    res.status(error.response?.status || 500).send(error.response?.data || { msg: '代理请求失败' });
  }
}
