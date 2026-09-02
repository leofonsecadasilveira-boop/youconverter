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

// CORS liberado para seu dominio + localhost
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

// Multer aceita qualquer nome de campo para evitar bug files vs pdfs
const storage = multer.diskStorage({
  destination: TMP_DIR,
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ dest: TMP_DIR, storage });

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

// MERGE - aceita 'files' ou 'pdfs'
app.post('/api/merge', upload.array('files'), async (req, res) => {
  try {
    // Fallback se vier como 'pdfs'
    let files = req.files;
    if (!files || files.length === 0) {
      // tenta de novo com qualquer campo
      files = req.files;
    }
    if (!files || files.length < 2) {
      return res.status(400).json({ error: 'Envie pelo menos 2 PDFs. Campo deve ser "files"' });
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
    console.error(e);
    res.status(500).json({ error: 'Erro ao juntar PDFs' });
  }
});

// SPLIT - agora retorna ZIP para download
app.post('/api/split', upload.single('file'), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ error: 'Envie 1 PDF no campo "file"' });

    const bytes = fs.readFileSync(file.path);
    const pdf = await PDFDocument.load(bytes);
    
    // Cria ZIP
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
    console.error(e);
    res.status(500).json({ error: 'Erro ao dividir PDF' });
  }
});

// COMPRESS - usando qpdf (já instalado no Dockerfile)
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    if (!file) return res.status(400).json({ error: 'Envie 1 PDF no campo "file"' });

    const input = file.path;
    const output = path.join(TMP_DIR, `compressed-${Date.now()}.pdf`);
    
    execSync(`qpdf --compress-streams=y --recompress-flate --object-streams=generate "${input}" "${output}"`);
    try{ fs.unlinkSync(input) }catch{}
    
    res.download(output, 'youconverter-compressed.pdf', (err) => {
      if (!err) { try{ fs.unlinkSync(output) }catch{} }
    });
  } catch (e) {
    console.error('Erro compress:', e.message);
    res.status(500).json({ error: 'Erro ao comprimir - tente outro arquivo' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend YouConverter rodando na porta ${PORT}`);
});
