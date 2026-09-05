
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function JpgToPdfTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  async function handleConvert(){
    if(!files.length) return alert('Selecione imagens'); setLoading(true)
    try{ const pdfDoc=await PDFDocument.create(); for(const file of files){ const bytes=await file.arrayBuffer(); let img=file.type.includes('png')?await pdfDoc.embedPng(bytes):await pdfDoc.embedJpg(bytes); const page=pdfDoc.addPage([img.width,img.height]); page.drawImage(img,{x:0,y:0,width:img.width,height:img.height}) } const pdfBytes=await pdfDoc.save(); const blob=new Blob([pdfBytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`youconverter-imagens-${Date.now()}.pdf`; document.body.appendChild(a); a.click(); a.remove() }catch(e){alert('Erro: '+e.message)} finally{setLoading(false)} }
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>JPG para PDF</h2>
    <DropZone onFiles={(f)=>setFiles(prev=>[...prev,...f])} multiple isDark={isDark} accept="image/*" />
    {files.length>0 && <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>{files.map((f,i)=><div key={i} style={{background:isDark?'#27272a':'#F5F3FF', border:`1px solid ${isDark?'#3f3f46':'#DDD6FE'}`, padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:isDark?'#f3f4f6':'#5B21B6'}}>{i+1}. {f.name}</span><button onClick={()=>setFiles(files.filter((_,idx)=>idx!==i))} style={{background:'transparent',border:0,color:'#7C3AED',fontWeight:700,cursor:'pointer'}}>X</button></div>)}</div>}
    <button onClick={handleConvert} disabled={loading||!files.length} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!files.length?0.6:1}}>{loading?'Convertendo...':`Converter (${files.length}) para PDF ↓`}</button>
  </div>)
}
