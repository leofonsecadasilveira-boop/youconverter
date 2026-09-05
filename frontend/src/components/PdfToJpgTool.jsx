import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default 
// original below
 PdfToJpgTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [quality, setQuality] = useState('alta')
  const PURPLE = '#5B21B6'
  const titleColor = isDark ? '#f3f4f6' : '#111827'
  const bannerBg = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)'
  const bannerColor = isDark ? '#c4b5fd' : PURPLE

  async function handleConvert(){
    if(!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try{
      const buf=await file.arrayBuffer()
      const pdf=await pdfjsLib.getDocument({data:buf}).promise
      const scale=quality==='alta'?2.5:1.5
      const jq=quality==='alta'?0.92:0.75
      for(let i=0;i<pdf.numPages;i++){
        setProgress(`Baixando página ${i+1}/${pdf.numPages}...`)
        const page=await pdf.getPage(i+1)
        const vp=page.getViewport({scale})
        const c=document.createElement('canvas'); const ctx=c.getContext('2d')
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'
        c.width=vp.width; c.height=vp.height
        await page.render({canvasContext:ctx,viewport:vp}).promise
        const url=c.toDataURL('image/jpeg',jq)
        const a=document.createElement('a'); a.href=url; a.download=`${file.name.replace(/\.pdf$/i,'')}-pagina-${i+1}.jpg`; document.body.appendChild(a); a.click(); a.remove()
        await new Promise(r=>setTimeout(r,300))
      }
      setProgress(`✅ ${pdf.numPages} imagens baixadas!`); setTimeout(()=>setProgress(''),3000)
    }catch(e){ alert('Erro: '+e.message) } finally{ setLoading(false) }
  }

  const getBtn = (active)=>({
    padding:'12px', borderRadius:10, cursor:'pointer', textAlign:'center',
    border: active?`2px solid ${PURPLE}`: isDark?'1px solid #27272a':'1px solid #e5e7eb',
    background: active? (isDark?'#2a1f3d':'#2a1f4d') : (isDark?'#1a1a1a':'white')
  })

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:titleColor}}>PDF para JPG</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <button onClick={()=>setQuality('alta')} style={getBtn(quality==='alta')}>
          <div style={{fontWeight:800,fontSize:12,color:quality==='alta'?PURPLE:(isDark?'#f3f4f6':'#111827')}}>Alta qualidade</div>
          <div style={{fontSize:10,color:isDark?'#9ca3af':'#6b7280',marginTop:4}}>180 DPI</div>
        </button>
        <button onClick={()=>setQuality('media')} style={getBtn(quality==='media')}>
          <div style={{fontWeight:800,fontSize:12,color:quality==='media'?PURPLE:(isDark?'#f3f4f6':'#111827')}}>Arquivo menor</div>
          <div style={{fontSize:10,color:isDark?'#9ca3af':'#6b7280',marginTop:4}}>108 DPI</div>
        </button>
      </div>
      <div style={{background:bannerBg, border:`1px solid ${PURPLE}`, borderRadius:8, padding:'10px 12px', fontSize:11, color:bannerColor, marginBottom:16, textAlign:'center', fontWeight:600}}>
        🔒 YouConverter Engine • Cada página vira 1 JPG • Privado e seguro
      </div>
      <div style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:24, textAlign:'center', background: isDark?'#1a1a1a':'#fafafa'}}>
        <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        <div style={{marginTop:10,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste um PDF ou clique acima</div>
        {file && <div style={{marginTop:12,fontSize:13,fontWeight:600,color:isDark?'#f3f4f6':'#111827'}}>📄 {file.name}</div>}
      </div>
      <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} hideUI />
      {progress && <div style={{marginTop:10,fontSize:12,color:PURPLE,fontWeight:600,textAlign:'center'}}>{progress}</div>}
      <button onClick={handleConvert} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'16px 26px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!file?0.35:1}}>
        {loading?(progress||'Convertendo...'):'Converter para JPG ↓'}
      </button>
    </div>
  )
}
