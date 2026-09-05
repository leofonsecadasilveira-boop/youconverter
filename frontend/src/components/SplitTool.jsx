import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function SplitTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [range, setRange] = useState('')
  const PURPLE = '#5B21B6'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  async function handleSplit() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const bytes = await file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      const total = pdf.getPageCount()
      let indices = [...Array(total).keys()]
      if (range.trim()) {
        indices = []
        range.split(',').forEach(p=>{
          const t=p.trim()
          if(t.includes('-')){ const [s,e]=t.split('-').map(n=>parseInt(n.trim())); for(let i=s;i<=e;i++) if(i>=1&&i<=total) indices.push(i-1) }
          else{ const n=parseInt(t); if(!isNaN(n)&&n>=1&&n<=total) indices.push(n-1) }
        })
      }
      if (!indices.length) return alert('Intervalo inválido')
      const newPdf = await PDFDocument.create()
      const pages = await newPdf.copyPages(pdf, indices)
      pages.forEach(p=>newPdf.addPage(p))
      const out = await newPdf.save()
      const blob = new Blob([out], {type:'application/pdf'})
      const url = URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=file.name.replace('.pdf','')+`-dividido-${Date.now()}.pdf`; document.body.appendChild(a); a.click(); a.remove()
      setTimeout(()=>URL.revokeObjectURL(url),1000)
    } catch(e){ alert('Erro: '+e.message) } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,marginBottom:12,color:titleColor}}>Dividir PDF ✂️</h2>
      {/* CORRIGIDO: estilo discreto cinza igual ao print image_e9de6f.png */}
      <div style={{background: isDark ? '#27272a' : '#f3f4f6', borderRadius:8, padding:'8px 12px', fontSize:11, color: isDark ? '#a1a1aa' : '#6b7280', marginBottom:16, textAlign:'center'}}>
        Separe páginas específicas • Ex: 1,3,5-10 • 100% no navegador
      </div>
      <div style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:24, textAlign:'center', background: isDark ? '#1a1a1a' : '#fafafa'}}>
        <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        <div style={{marginTop:10,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste um PDF ou clique acima</div>
        {file && <div style={{marginTop:12,fontSize:13,fontWeight:600,color:isDark?'#f3f4f6':'#111827'}}>📄 {file.name}</div>}
      </div>
      <DropZone onFiles={(f)=>setFile(f[0])} single isDark={isDark} hideUI />
      <input type="text" placeholder="Ex: 1,3,5-10 (vazio = todas as páginas em 1 arquivo)" value={range} onChange={e=>setRange(e.target.value)} style={{marginTop:12, padding:'14px', borderRadius:10, border:`1px solid ${isDark?'#3f3f46':'#e5e7eb'}`, width:'100%', background:isDark?'#27272a':'#f9fafb', color:isDark?'#f3f4f6':'#111827', fontSize:13, outline:'none'}} />
      <button onClick={handleSplit} disabled={loading||!file} style={{marginTop:16,background:PURPLE,color:'#fff',border:0,padding:'16px 26px',borderRadius:12,fontWeight:900,fontSize:16,cursor:'pointer',width:'100%',opacity:loading||!file?0.35:1, boxShadow: loading||!file?'none':'0 6px 20px rgba(91,33,182,0.5)'}}>
        {loading?'Dividindo...':'Dividir PDF ↓'}
      </button>
    </div>
  )
}
