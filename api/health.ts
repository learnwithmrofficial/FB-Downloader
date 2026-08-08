export default function handler(req: any, res: any) {
  if (res.setHeader) {
    res.setHeader('Content-Type', 'application/json');
  }
  return res.status(200).json({
    status: 'ok',
    version: '3.0.0',
    software: 'Abdul Hadi Digital Skills Hub Facebook Downloader Engine',
    timestamp: new Date().toISOString(),
  });
}
