import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Na Vercel só pode escrever em /tmp
const TMP_DIR = path.join(os.tmpdir(), 'youconverter-tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.get('/api', (req, res) => res.send('YouConverter API - Online 🚀'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/merge', upload.any(), async (req, res) => {
  let files = req.files || [];
  try {
    if (!files || files.length < 2) {
      return res.status(400).json({ error: `Envie pelo menos 2 PDFs. Recebi ${files?.length || 0}` });
    }
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const bytes = fs.readFileSync(file.path);
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }
    const mergedBytes = await mergedPdf.save();
    const outPath = path.join(TMP_DIR, `merged-${Date.now()}.pdf`);
    fs.writeFileSync(outPath, mergedBytes);
    files.forEach(f => { try{ fs.unlinkSync(f.path) }catch{} });
    res.download(outPath, 'youconverter-merged.pdf', () => { try{ fs.unlinkSync(outPath) }catch{} });
  } catch (e) {
    console.error('MERGE ERROR:', e);
    try { files.forEach(f => fs.unlinkSync(f.path)) } catch {}
    res.status(500).json({ error: 'Erro ao juntar PDFs: ' + e.message });
  }
});

app.post('/api/split', upload.any(), async (req, res) => {
  let file = req.files && req.files[0];
  try {
    if (!file) return res.status(400).json({ error: 'Envie 1 PDF' });
    const bytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(bytes);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=youconverter-split-${Date.now()}.zip`);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      const newBytes = await newPdf.save();
      archive.append(Buffer.from(newBytes), { name: `pagina-${i+1}.pdf` });
    }
    await archive.finalize();
    try{ fs.unlinkSync(file.path) }catch{}
  } catch (e) {
    console.error('SPLIT ERROR:', e);
    try { if (file) fs.unlinkSync(file.path) } catch {}
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao dividir PDF' });
  }
});

app.post('/api/compress', upload.any(), async (req, res) => {
  let file = req.files && req.files[0];
  try {
    if (!file) return res.status(400).json({ error: 'Envie 1 PDF' });
    const bytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(bytes);
    const compressedBytes = await pdf.save({ useObjectStreams: true });
    try{ fs.unlinkSync(file.path) }catch{}
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=youconverter-compressed.pdf');
    res.send(Buffer.from(compressedBytes));
  } catch (e) {
    console.error('COMPRESS ERROR:', e);
    try { if (file) fs.unlinkSync(file.path) } catch {}
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao comprimir' });
  }
});

// Só roda listen local, na Vercel exporta o app
if (process.env.NODE_ENV!== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => console.log(`Backend rodando na porta ${PORT}`));
}

export default app;