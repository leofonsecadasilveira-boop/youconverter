
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function MergeTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  async function handleMerge(){
    if(files.length<2) return alert('Selecione pelo menos 2 PDFs')
    setLoading(true)
    try{
      const mergedPdf = await PDFDocument.create()
      for(const file of files){ const bytes=await file.arrayBuffer(); const pdf=await PDFDocument.load(bytes); const pages=await mergedPdf.copyPages(pdf,pdf.getPageIndices()); pages.forEach(p=>mergedPdf.addPage(p)) }
      const mergedBytes = await mergedPdf.save()
      const blob=new Blob([mergedBytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`youconverter-juntado-${Date.now()}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000)
    }catch(e){alert('Erro: '+e.message)} finally{setLoading(false)}
  }
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>Juntar PDFs</h2>
    <DropZone onFiles={(f)=>setFiles(prev=>[...prev,...f])} multiple isDark={isDark} accept=".pdf" />
    {files.length>0 && <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>{files.map((f,i)=><div key={i} style={{background:isDark?'#27272a':'#F5F3FF', border:`1px solid ${isDark?'#3f3f46':'#DDD6FE'}`, padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:isDark?'#f3f4f6':'#5B21B6'}}>{i+1}. {f.name}</span><button onClick={()=>setFiles(files.filter((_,idx)=>idx!==i))} style={{background:'transparent',border:0,color:'#7C3AED',fontWeight:700,cursor:'pointer'}}>X</button></div>)}</div>}
    <button onClick={handleMerge} disabled={loading||files.length<2} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||files.length<2?0.6:1}}>{loading?'Juntando...':`Juntar ${files.length?`(${files.length})`:''} ↓`}</button>
  </div>)
}
