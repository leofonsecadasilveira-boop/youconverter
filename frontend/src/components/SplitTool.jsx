
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function SplitTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  async function handleSplit(){
    if(!file) return alert('Selecione 1 PDF'); setLoading(true)
    try{
      const buf=await file.arrayBuffer(); const src=await PDFDocument.load(buf); const total=src.getPageCount()
      for(let i=0;i<total;i++){ const ndoc=await PDFDocument.create(); const [p]=await ndoc.copyPages(src,[i]); ndoc.addPage(p); const bytes=await ndoc.save(); const blob=new Blob([bytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`${file.name.replace(/\.pdf$/i,'')}-pagina-${i+1}.pdf`; document.body.appendChild(a); a.click(); a.remove(); await new Promise(r=>setTimeout(r,200)) }
    }catch(e){alert('Erro: '+e.message)} finally{setLoading(false)}
  }
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>Dividir PDF</h2>
    <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} accept=".pdf" />
    {file && <div style={{marginTop:12,background:isDark?'#27272a':'#F5F3FF',border:`1px solid ${isDark?'#3f3f46':'#DDD6FE'}`,padding:'10px 12px',borderRadius:8,display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:isDark?'#f3f4f6':'#5B21B6'}}>{file.name}</span><button onClick={()=>setFile(null)} style={{background:'transparent',border:0,color:'#7C3AED',fontWeight:700,cursor:'pointer'}}>X</button></div>}
    <button onClick={handleSplit} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!file?0.6:1}}>{loading?'Dividindo...':'Dividir PDF ↓'}</button>
  </div>)
}
