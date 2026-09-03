import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import archiver from 'archiver';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS - libera localhost para dev e seu dominio para prod
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Multer CORRIGIDO - só storage, sem dest duplicado
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas PDFs são permitidos'));
    }
  }
});

// Auto-delete de arquivos antigos
const DELETE_MINUTES = parseInt(process.env.DELETE_AFTER_MINUTES || '60');
setInterval(() => {
  try {
    fs.readdirSync(TMP_DIR).forEach(file => {
      const filePath = path.join(TMP_DIR, file);
      try {
        const stats = fs.statSync(filePath);
        const diffMin = (Date.now() - stats.mtimeMs) / 1000 / 60;
        if (diffMin > DELETE_MINUTES) {
          fs.unlinkSync(filePath);
          console.log(`auto-delete ${file} apos ${DELETE_MINUTES}min`);
        }
      } catch {}
    });
  } catch {}
}, 60 * 1000);

app.get('/', (req, res) => res.send('YouConverter API - Online 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// MERGE - CORRIGIDO: aceita 'files', 'pdfs', 'file' - qualquer nome
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
    
    // limpa uploads
    files.forEach(f => { try{ fs.unlinkSync(f.path) }catch{} });

    res.download(outPath, 'youconverter-merged.pdf', (err) => {
      if (!err) { try{ fs.unlinkSync(outPath) }catch{} }
    });
  } catch (e) {
    console.error('MERGE ERROR:', e);
    // limpa em caso de erro
    try { files.forEach(f => fs.unlinkSync(f.path)) } catch {}
    res.status(500).json({ error: 'Erro ao juntar PDFs: ' + e.message });
  }
});

// SPLIT - CORRIGIDO: aceita qualquer campo
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

// COMPRESS - CORRIGIDO: aceita qualquer campo
app.post('/api/compress', upload.any(), async (req, res) => {
  let file = req.files && req.files[0];
  let output = null;
  try {
    if (!file) return res.status(400).json({ error: 'Envie 1 PDF' });

    const input = file.path;
    output = path.join(TMP_DIR, `compressed-${Date.now()}.pdf`);
    
    execSync(`qpdf --compress-streams=y --recompress-flate --object-streams=generate "${input}" "${output}"`);
    try{ fs.unlinkSync(input) }catch{}
    
    res.download(output, 'youconverter-compressed.pdf', (err) => {
      if (!err) { try{ fs.unlinkSync(output) }catch{} }
    });
  } catch (e) {
    console.error('COMPRESS ERROR:', e.message);
    try { if (file) fs.unlinkSync(file.path) } catch {}
    try { if (output && fs.existsSync(output)) fs.unlinkSync(output) } catch {}
    if (!res.headersSent) res.status(500).json({ error: 'Erro ao comprimir - tente outro arquivo' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend YouConverter rodando na porta ${PORT}`);
});
