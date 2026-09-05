
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function UnlockTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  async function handleUnlock(){
    if(!file) return alert('Selecione 1 PDF'); if(!password) return alert('Digite a senha'); setLoading(true)
    try{ const buffer=await file.arrayBuffer(); const srcDoc=await PDFDocument.load(buffer,{password}); const newDoc=await PDFDocument.create(); const pages=await newDoc.copyPages(srcDoc,srcDoc.getPageIndices()); pages.forEach(p=>newDoc.addPage(p)); const pdfBytes=await newDoc.save(); const blob=new Blob([pdfBytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=file.name.replace(/\.pdf$/i,'')+'-desbloqueado.pdf'; document.body.appendChild(a); a.click(); a.remove() }catch(e){alert('Senha incorreta: '+e.message)} finally{setLoading(false)} }
  const inputStyle={marginTop:12,width:'100%',padding:'12px',borderRadius:8,border:isDark?'1px solid #3f3f46':'1px solid #e5e7eb',background:isDark?'#1e1b2e':'white',color:isDark?'#fff':'#111827',boxSizing:'border-box'}
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>Desbloquear PDF</h2>
    <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} accept=".pdf" />
    {file && <div style={{marginTop:12,background:isDark?'#27272a':'#F5F3FF',border:isDark?'1px solid #3f3f46':'1px solid #DDD6FE',padding:'10px 12px',borderRadius:8,display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:isDark?'#f3f4f6':'#5B21B6'}}>{file.name}</span><button onClick={()=>setFile(null)} style={{background:'transparent',border:0,color:PURPLE,fontWeight:700,cursor:'pointer'}}>X</button></div>}
    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha atual do PDF" style={inputStyle} />
    <button onClick={handleUnlock} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!file?0.6:1}}>{loading?'Desbloqueando...':'Desbloquear PDF 🔓 ↓'}</button>
  </div>)
}
