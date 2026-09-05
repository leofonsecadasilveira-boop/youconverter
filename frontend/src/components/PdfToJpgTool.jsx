
import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
export default function PdfToJpgTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [quality, setQuality] = useState('alta')
  const PURPLE = '#7C3AED'
  async function handleConvert(){
    if(!file) return alert('Selecione 1 PDF'); setLoading(true)
    try{
      const buf=await file.arrayBuffer(); const pdf=await pdfjsLib.getDocument({data:buf}).promise
      const scale=quality==='alta'?2.5:1.5; const jq=quality==='alta'?0.92:0.75
      for(let i=0;i<pdf.numPages;i++){ setProgress(`Página ${i+1}/${pdf.numPages}...`); const page=await pdf.getPage(i+1); const vp=page.getViewport({scale}); const c=document.createElement('canvas'); const ctx=c.getContext('2d'); c.width=vp.width; c.height=vp.height; await page.render({canvasContext:ctx,viewport:vp}).promise; const url=c.toDataURL('image/jpeg',jq); const a=document.createElement('a'); a.href=url; a.download=`${file.name.replace(/\.pdf$/i,'')}-pagina-${i+1}.jpg`; document.body.appendChild(a); a.click(); a.remove(); await new Promise(r=>setTimeout(r,300)) }
      setProgress(`✅ ${pdf.numPages} imagens!`); setTimeout(()=>setProgress(''),3000)
    }catch(e){alert('Erro: '+e.message)} finally{setLoading(false)}
  }
  const getBtn = (active)=>({padding:'12px',borderRadius:10,cursor:'pointer',textAlign:'center',border:active?`2px solid ${PURPLE}`:isDark?'1px solid #27272a':'1px solid #e5e7eb',background:active?PURPLE:(isDark?'#1e1b2e':'white')})
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>PDF para JPG</h2>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
      {[{k:'alta',label:'Alta qualidade',sub:'180 DPI • Recomendado'},{k:'media',label:'Arquivo menor',sub:'108 DPI • -60%'}].map(o=>{
        const active=quality===o.k
        return <button key={o.k} onClick={()=>setQuality(o.k)} style={getBtn(active)}><div style={{fontWeight:800,fontSize:12,color:active?'#fff':(isDark?'#f3f4f6':'#111827')}}>{o.label}</div><div style={{fontSize:10,color:active?'#fff':(isDark?'#9ca3af':'#6b7280'),marginTop:4,opacity:active?0.85:1}}>{o.sub}</div></button>
      })}
    </div>
    <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} accept=".pdf" />
    {file && <div style={{marginTop:10,fontSize:13,fontWeight:600,color:isDark?'#f3f4f6':'#111827',textAlign:'center'}}>📄 {file.name}</div>}
    {progress && <div style={{marginTop:10,fontSize:12,color:PURPLE,fontWeight:600,textAlign:'center'}}>{progress}</div>}
    <button onClick={handleConvert} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!file?0.6:1}}>{loading?(progress||'Convertendo...'):'Converter para JPG ↓'}</button>
  </div>)
}
