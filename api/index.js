import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';

const app = express();
app.use(cors({ origin: true }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api', (req, res) => res.json({ ok: true }));
app.post('/api/merge', upload.any(), async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length < 2) return res.status(400).json({ error: 'Envie 2 PDFs' });
    const merged = await PDFDocument.create();
    for (const f of files) {
      const pdf = await PDFDocument.load(f.buffer);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(bytes));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default app;
