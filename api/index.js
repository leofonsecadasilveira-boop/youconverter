const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { PDFDocument } = require('pdf-lib');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.json({ ok: true }));

const mergeHandler = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Envie pelo menos 2 PDFs' });
    }
    const mergedPdf = await PDFDocument.create();
    for (const file of req.files) {
      const pdf = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }
    const pdfBytes = await mergedPdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="merged.pdf"');
    return res.send(Buffer.from(pdfBytes));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro ao juntar PDFs', details: e.message });
  }
};

app.post('/api/merge', upload.any(), mergeHandler);
app.post('/merge', upload.any(), mergeHandler);
app.post('/api', upload.any(), mergeHandler);

app.all('*', (req, res) => {
  console.log('Rota não encontrada:', req.method, req.path, req.url);
  res.status(404).json({ error: 'Rota não encontrada', method: req.method, path: req.path, url: req.url });
});

module.exports = app;