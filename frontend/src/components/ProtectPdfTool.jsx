
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function ProtectPdfTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  async function handleProtect(){
    if(!file) return alert('Selecione 1 PDF'); if(!password) return alert('Digite a senha'); if(password!==confirm) return alert('Senhas não conferem'); setLoading(true)
    try{ const buffer=await file.arrayBuffer(); const srcDoc=await PDFDocument.load(buffer); const newDoc=await PDFDocument.create(); const pages=await newDoc.copyPages(srcDoc,srcDoc.getPageIndices()); pages.forEach(p=>newDoc.addPage(p)); const pdfBytes=await newDoc.save({ userPassword: password, ownerPassword: password }); const blob=new Blob([pdfBytes],{type:'application/pdf'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=file.name.replace('.pdf','')+'-protegido.pdf'; document.body.appendChild(a); a.click(); a.remove() }catch(e){alert('Erro: '+e.message)} finally{setLoading(false)} }
  const inputStyle={padding:'12px',borderRadius:8,border:isDark?'1px solid #3f3f46':'1px solid #e5e7eb',background:isDark?'#1e1b2e':'#ffffff',color:isDark?'#fff':'#111827',width:'100%',boxSizing:'border-box'}
  return (<div>
    <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:isDark?'#f3f4f6':'#111827'}}>Proteger PDF com Senha</h2>
    <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} accept=".pdf" />
    {file && <div style={{marginTop:12,background:isDark?'#27272a':'#F5F3FF',border:isDark?'1px solid #3f3f46':'1px solid #DDD6FE',padding:'10px 12px',borderRadius:8,display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,fontWeight:600,color:isDark?'#f3f4f6':'#5B21B6'}}>{file.name}</span><button onClick={()=>setFile(null)} style={{background:'transparent',border:0,color:PURPLE,fontWeight:700,cursor:'pointer'}}>X</button></div>}
    <div style={{marginTop:16,display:'flex',flexDirection:'column',gap:10}}><input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} style={inputStyle} /><input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} style={inputStyle} /></div>
    <button onClick={handleProtect} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!file?0.6:1}}>{loading?'Protegendo...':'Proteger com senha 🔒 ↓'}</button>
  </div>)
}
