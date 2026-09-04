import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.get('/api', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => res.json({ ok: true }));

// JUNTAR
app.post(['/api/merge','/merge','/api'], upload.any(), async (req,res)=>{
  try{
    if(!req.files||req.files.length<2) return res.status(400).json({error:'Envie pelo menos 2 PDFs'});
    const mergedPdf = await PDFDocument.create();
    for(const file of req.files){
      const pdf = await PDFDocument.load(file.buffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p=>mergedPdf.addPage(p));
    }
    const pdfBytes = await mergedPdf.save();
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition','attachment; filename="merged.pdf"');
    return res.send(Buffer.from(pdfBytes));
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}) }
});

// DIVIDIR
app.post(['/api/split','/split'], upload.any(), async (req,res)=>{
  try{
    if(!req.files||req.files.length===0) return res.status(400).json({error:'Envie 1 PDF'});
    const file = req.files[0];
    const pdf = await PDFDocument.load(file.buffer);
    const zip = new JSZip();
    for(let i=0;i<pdf.getPageCount();i++){
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      const bytes = await newPdf.save();
      zip.file(`pagina-${i+1}.pdf`, bytes);
    }
    const zipBuffer = await zip.generateAsync({type:'nodebuffer'});
    res.setHeader('Content-Type','application/zip');
    res.setHeader('Content-Disposition','attachment; filename="dividido.zip"');
    return res.send(zipBuffer);
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}) }
});

app.all('*', (req,res)=> res.status(404).json({error:'Rota não encontrada', path:req.path}));

export default app;