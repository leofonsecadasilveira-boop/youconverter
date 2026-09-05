import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function CompressTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState('leve')
  const [progress, setProgress] = useState('')
  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  const MODES = {
    leve: { label:'Compressão Leve', badge:'Alta qualidade', desc:'Mantém nitidez 100% • Texto selecionável' },
    equilibrado: { label:'Equilibrado', badge:'Recomendado • Alta qualidade', scale:2.5, quality:0.85, desc:'Alta qualidade • -30% a -40% de tamanho' },
    maxima_compressao: { label:'Compressão Máxima', badge:'Arquivo menor • Boa qualidade', scale:2.0, quality:0.72, desc:'Boa qualidade • -55% a -65% de tamanho' },
  }

  async function compressLeve(){ const original=file.size; const buf=await file.arrayBuffer(); const doc=await PDFDocument.load(buf); doc.setTitle(''); doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]); doc.setProducer('youconverter.com.br'); doc.setCreator('youconverter.com.br'); const out=await doc.save({useObjectStreams:true}); return {bytes:out,original} }
  async function compressPerda(m){ const {scale,quality}=MODES[m]; const original=file.size; const buf=await file.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise; const newDoc=await PDFDocument.create(); for(let i=0;i<pdf.numPages;i++){ setProgress(`Página ${i+1}/${pdf.numPages}...`); const page=await pdf.getPage(i+1); const vp=page.getViewport({scale}); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; c.width=vp.width; c.height=vp.height; await page.render({canvasContext:ctx,viewport:vp}).promise; const url=c.toDataURL('image/jpeg',quality); const jb=Uint8Array.from(atob(url.split(',')[1]),c=>c.charCodeAt(0)); const img=await newDoc.embedJpg(jb); const p=newDoc.addPage([vp.width,vp.height]); p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height}) } const out=await newDoc.save(); return {bytes:out,original} }

  async function handle(){ if(!file) return alert('Selecione PDF'); setLoading(true); setStats(null); try{ const r=mode==='leve'?await compressLeve():await compressPerda(mode); const blob=new Blob([r.bytes],{type:'application/pdf'}); const saved=Math.round((1-blob.size/r.original)*100); setStats({from:(r.original/1024/1024).toFixed(2),to:(blob.size/1024/1024).toFixed(2),pct:saved>0?saved:0}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=file.name.replace('.pdf','')+`-${mode}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000)}catch(e){alert('Erro: '+e.message)} finally{setLoading(false); setProgress('')} }

  const getBtn = (active)=>({
    padding:'12px 8px', borderRadius:12, textAlign:'center', cursor:'pointer',
    border: active?`2px solid ${PURPLE}`: isDark?'1px solid #27272a':'1px solid #e5e7eb',
    background: active? (isDark?'#2a1f3d':'#F5F3FF') : (isDark?'#1a1a1a':'white')
  })

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800, boxShadow:'0 4px 14px rgba(124,58,237,0.35)',marginBottom:16,color:titleColor}}>Comprimir PDF</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
        {Object.entries(MODES).map(([k,m])=>(
          <button key={k} onClick={()=>setMode(k)} style={getBtn(mode===k)}>
            <div style={{fontWeight:800, boxShadow:'0 4px 14px rgba(124,58,237,0.35)',fontSize:12,color:mode===k?PURPLE:(isDark?'#f3f4f6':'#111827'), lineHeight:'1.2'}}>{m.label}</div>
            <div style={{fontSize:10,color:mode===k?PURPLE:(isDark?'#9ca3af':'#6b7280'), marginTop:4, fontWeight:600}}>{m.badge}</div>
          </button>
        ))}
      </div>
      <div style={{background: isDark?'rgba(124,58,237,0.12)':'rgba(124,58,237,0.08)', border:`1px solid ${PURPLE}`, borderRadius:8, padding:'8px 12px', fontSize:11, color:isDark?'#c4b5fd':PURPLE, marginBottom:16, textAlign:'center', fontWeight:600}}>
        {MODES[mode].desc}
      </div>
      <div style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:24, textAlign:'center', background: isDark?'#1a1a1a':'#fafafa'}}>
        <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        <div style={{marginTop:10,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste um PDF ou clique acima</div>
        {file && <div style={{marginTop:12,fontSize:13,fontWeight:600,color:isDark?'#f3f4f6':'#111827'}}>📄 {file.name}</div>}
      </div>
      {progress && <div style={{marginTop:10,fontSize:12,color:PURPLE,fontWeight:600,textAlign:'center'}}>{progress}</div>}
      {stats && <div style={{marginTop:12, background:isDark?'#052e16':'#ECFDF5', border:'1px solid #A7F3D0', padding:'12px', borderRadius:8, fontSize:13, color:isDark?'#6ee7b7':'#065F46', fontWeight:700, textAlign:'center'}}>✅ {stats.from} MB → {stats.to} MB {stats.pct>0?`(-${stats.pct}%)`:'(já otimizado)'}</div>}
      <button onClick={handle} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:12,fontWeight:800, boxShadow:'0 4px 14px rgba(124,58,237,0.35)',cursor:'pointer',width:'100%',opacity:loading||!file?0.6:1}}>
        {loading?progress||'Comprimindo...':`Comprimir - ${MODES[mode].label} ↓`}
      </button>
    </div>
  )
}
