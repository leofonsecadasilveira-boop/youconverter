import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createWorker } from 'tesseract.js';

dotenv.config();
const app = express();

app.use(helmet());
app.use(rateLimit({ windowMs: 15*60*1000, max: 200 }));
app.use(cors({ origin: true }));
app.use(express.json());

const TMP = path.join(os.tmpdir(), 'youconverter-tmp');
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true });
const del = f => { try{ fs.unlinkSync(f) }catch{} };
const upload = multer({ storage: multer.diskStorage({
  destination: (_,__,cb) => cb(null, TMP),
  filename: (_,f,cb) => cb(null, `${Date.now()}-${f.originalname.replace(/[^a-z0-9.-]/gi,'_')}`)
}), limits: { fileSize: 50*1024*1024 } });

app.get('/api', (_,res) => res.send('YouConverter API 🚀'));
app.get('/api/health', (_,res) => res.json({ status: 'ok' }));

// --- MERGE / SPLIT / COMPRESS (mesma lógica, só que enxuta) ---
app.post('/api/merge', upload.any(), async (req,res) => {
  const files = req.files || [];
  if (files.length < 2) return res.status(400).json({ error: 'Envie 2 PDFs' });
  try {
    const merged = await PDFDocument.create();
    for (const f of files) {
      const pdf = await PDFDocument.load(fs.readFileSync(f.path));
      (await merged.copyPages(pdf, pdf.getPageIndices())).forEach(p=>merged.addPage(p));
    }
    const out = path.join(TMP, `merged-${Date.now()}.pdf`);
    fs.writeFileSync(out, await merged.save());
    files.forEach(f=>del(f.path));
    res.download(out, 'merged.pdf', ()=>del(out));
  } catch(e){ files.forEach(f=>del(f.path)); res.status(500).json({ error: e.message }); }
});

app.post('/api/split', upload.any(), async (req,res) => {
  const f = req.files?.[0]; if(!f) return res.status(400).json({ error: 'Envie 1 PDF' });
  try {
    const pdf = await PDFDocument.load(fs.readFileSync(f.path));
    res.set({ 'Content-Type':'application/zip', 'Content-Disposition':'attachment; filename=split.zip' });
    const zip = archiver('zip'); zip.pipe(res);
    for(let i=0;i<pdf.getPageCount();i++){
      const n = await PDFDocument.create(); const [p] = await n.copyPages(pdf,[i]); n.addPage(p);
      zip.append(Buffer.from(await n.save()), { name: `pagina-${i+1}.pdf` });
    }
    await zip.finalize(); del(f.path);
  } catch(e){ del(f.path); res.status(500).json({ error: 'Erro split' }); }
});

app.post('/api/compress', upload.any(), async (req,res) => {
  const f = req.files?.[0]; if(!f) return res.status(400).json({ error: 'Envie 1 PDF' });
  try {
    const pdf = await PDFDocument.load(fs.readFileSync(f.path));
    const bytes = await pdf.save({ useObjectStreams: true }); del(f.path);
    res.set({ 'Content-Type':'application/pdf' }).send(Buffer.from(bytes));
  } catch(e){ del(f.path); res.status(500).json({ error: 'Erro compress' }); }
});

// --- LGPD HÍBRIDO 6MB - REGEX OCULTA AQUI, NUNCA NO FRONTEND ---
const RX = { CPF:/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, CNPJ:/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, RG:/\b\d{2}\.\d{3}\.\d{3}-?[\dX]\b/g };
app.post('/api/lgpd-scan', rateLimit({ windowMs:5*60*1000, max:20 }), upload.single('pdf'), async (req,res) => {
  const f = req.file; if(!f) return res.status(400).json({ error: 'Envie PDF' });
  try {
    const w = await createWorker('por+eng'); const {data:{text}} = await w.recognize(f.path); await w.terminate(); del(f.path);
    let achados=[]; for(const [k,r] of Object.entries(RX)){ const m=text.match(r); if(m) achados.push(`${k}: ${[...new Set(m)].slice(0,10).join(', ')}`); }
    res.json({ achados: achados.length? achados : ['✅ Nenhum dado encontrado'] });
  } catch(e){ del(f.path); res.status(500).json({ error: e.message }); }
});

app.post('/api/ocr-lgpd', (req,res)=>{ req.url='/api/lgpd-scan'; app.handle(req,res); });

if(process.env.NODE_ENV!=='production'){
  app.listen(process.env.PORT||3001, ()=>console.log('Backend 3001'));
}
export default app;