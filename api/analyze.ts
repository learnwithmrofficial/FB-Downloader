import { analyzeUrl } from '../server/analyzer.js';

export default async function handler(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { url } = req.body || {};
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const info = await analyzeUrl(url);
    return res.status(200).json(info);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to analyze URL' });
  }
}
