import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function JpgToPdfTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'
  const bannerBg = isDark ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)'
  const bannerColor = isDark ? '#c4b5fd' : PURPLE

  async function handleConvert(){
    if(!files.length) return alert('Selecione imagens')
    setLoading(true)
    try{
      const pdfDoc = await PDFDocument.create()
      for(const file of files){
        const bytes = await file.arrayBuffer()
        let img = file.type.includes('png') || file.name.toLowerCase().endsWith('.png') ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
        const page = pdfDoc.addPage([img.width, img.height])
        page.drawImage(img,{x:0,y:0,width:img.width,height:img.height})
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes],{type:'application/pdf'})
      const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`youconverter-imagens-${Date.now()}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000)
    }catch(e){ alert('Erro: '+e.message) } finally{ setLoading(false) }
  }

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:16,color:titleColor}}>JPG para PDF</h2>
      <div style={{background:bannerBg, border:`1px solid ${PURPLE}`, borderRadius:8, padding:'10px 12px', fontSize:11, color:bannerColor, marginBottom:16, textAlign:'center', fontWeight:600}}>
        🔒 YouConverter Engine • Mantém qualidade original • 100% no seu PC
      </div>
      <div style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:24, textAlign:'center', background: isDark?'#1a1a1a':'#fafafa'}}>
        <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>Escolher Arquivos
          <input type="file" accept="image/*" multiple onChange={e=>setFiles(prev=>[...prev,...Array.from(e.target.files||[])])} style={{display:'none'}} />
        </label>
        <div style={{marginTop:10,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste JPG/PNG ou clique acima</div>
      </div>
      <DropZone onFiles={(f)=>setFiles(prev=>[...prev,...f])} multiple isDark={isDark} hideUI />
      {files.length>0 && <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>
        {files.map((f,i)=><div key={i} style={{background:isDark?'#2a1f4d':'#F5F3FF', border:`1px solid ${isDark?'#4c1d95':'#DDD6FE'}`, padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:12,fontWeight:600,color:isDark?'#c4b5fd':'#5B21B6', maxWidth:'85%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{i+1}. 🖼 {f.name}</span>
          <button onClick={()=>setFiles(files.filter((_,idx)=>idx!==i))} style={{background:'transparent',border:0,color:PURPLE,fontWeight:700,cursor:'pointer'}}>X</button>
        </div>)}
        <button onClick={()=>setFiles([])} style={{fontSize:11, background:'transparent', border:0, color:isDark?'#9ca3af':'#6b7280', cursor:'pointer', textAlign:'center'}}>Limpar tudo</button>
      </div>}
      <button onClick={handleConvert} disabled={loading||!files.length} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'14px 24px',borderRadius:10,fontWeight:800,cursor:'pointer',width:'100%',opacity:loading||!files.length?0.6:1}}>
        {loading?'Convertendo...':`Converter ${files.length?`(${files.length} imagens)`:''} para PDF ↓`}
      </button>
    </div>
  )
}
