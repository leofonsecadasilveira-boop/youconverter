import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function MergeTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const PURPLE = '#5B21B6'
  const titleColor = isDark ? '#f3f4f6' : '#111827'
  const descBg = isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.08)'
  const descBorder = `1px solid ${PURPLE}`
  const descColor = isDark ? '#c4b5fd' : PURPLE

  async function handleMerge() {
    if (files.length < 2) return alert('Selecione pelo menos 2 PDFs')
    setLoading(true)
    try {
      const mergedPdf = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach(p => mergedPdf.addPage(p))
      }
      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `youconverter-juntado-${Date.now()}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(()=>URL.revokeObjectURL(url),1000)
    } catch(e){ alert('Erro: '+e.message) } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:900,marginBottom:16,color:titleColor}}>Juntar PDF 📑</h2>
      <div style={{background:descBg, border:descBorder, borderRadius:8, padding:'10px 12px', fontSize:11, color:descColor, marginBottom:16, textAlign:'center', fontWeight:600}}>
        🔒 YouConverter Engine • Privado e seguro • Seguro e privado
      </div>
      <div style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:24, textAlign:'center', background: isDark ? '#1a1a1a' : '#fafafa'}}>
        <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>Escolher Arquivos
          <input type="file" accept="application/pdf" multiple onChange={e=>setFiles(prev=>[...prev, ...Array.from(e.target.files||[])])} style={{display:'none'}} />
        </label>
        <div style={{marginTop:10,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste PDFs ou clique acima • Ordem = ordem final</div>
      </div>
      <DropZone onFiles={(f)=>setFiles(prev=>[...prev,...f])} multiple isDark={isDark} single={false} hideUI />
      {files.length>0 && <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>
        {files.map((f,i)=><div key={i} style={{background:isDark?'#2a1f4d':'#F5F3FF', border:`1px solid ${isDark?'#4c1d95':'#DDD6FE'}`, padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:12,fontWeight:600,color:isDark?'#c4b5fd':'#5B21B6', maxWidth:'85%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{i+1}. 📄 {f.name}</span>
          <button onClick={()=>setFiles(files.filter((_,idx)=>idx!==i))} style={{background:'transparent',border:0,color:PURPLE,fontWeight:700,cursor:'pointer'}}>X</button>
        </div>)}
        <button onClick={()=>setFiles([])} style={{fontSize:11, background:'transparent', border:0, color:isDark?'#9ca3af':'#6b7280', cursor:'pointer', textAlign:'center'}}>Limpar tudo</button>
      </div>}
      <button onClick={handleMerge} disabled={loading||files.length<2} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'16px 26px',borderRadius:10,fontWeight:900,cursor:'pointer',width:'100%',opacity:loading||files.length<2?0.35:1}}>
        {loading?'Juntando...':`Juntar ${files.length?`(${files.length} PDFs)`:''} ↓`}
      </button>
    </div>
  )
}
