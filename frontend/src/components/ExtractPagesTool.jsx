
import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function ExtractTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState('')
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const PURPLE = '#7C3AED'
  async function onFile(f) {
    setFile(f)
    try { const buf = await f.arrayBuffer(); const doc = await PDFDocument.load(buf); setTotal(doc.getPageCount()); setPages(`1-${doc.getPageCount()}`) } catch {}
  }
  function parsePages(input, max) {
    const result = new Set()
    input.split(',').forEach(part => {
      part = part.trim()
      if (part.includes('-')) {
        const [s,e] = part.split('-').map(n=>parseInt(n.trim()))
        if (!isNaN(s) && !isNaN(e)) { for (let i=Math.max(1,s); i<=Math.min(max,e); i++) result.add(i-1) }
      } else { const n = parseInt(part); if (!isNaN(n) && n>=1 && n<=max) result.add(n-1) }
    })
    return Array.from(result).sort((a,b)=>a-b)
  }
  async function handleExtract() {
    if (!file) return alert('Selecione 1 PDF')
    if (!pages) return alert('Digite as páginas. Ex: 1,3,5-7')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer)
      const indices = parsePages(pages, srcDoc.getPageCount())
      if (!indices.length) throw new Error('Nenhuma página válida')
      const newDoc = await PDFDocument.create()
      const copied = await newDoc.copyPages(srcDoc, indices)
      copied.forEach(p => newDoc.addPage(p))
      const pdfBytes = await newDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = file.name.replace(/\.pdf$/i,'') + `-paginas-${pages.replace(/[^0-9,-]/g,'')}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) { alert('Erro: ' + e.message) } finally { setLoading(false) }
  }
  const inputStyle = { marginTop:10, width:'100%', padding:'12px', borderRadius:8, border:isDark?'1px solid #3f3f46':'1px solid #e5e7eb', background:isDark?'#18181b':'white', color:isDark?'#fff':'#111827', fontSize:14, boxSizing:'border-box' }
  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, marginBottom:16, color:isDark?'#f3f4f6':'#111827' }}>Extrair Páginas</h2>
      <div style={{background: isDark ? '#27272a' : '#1F1F23', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#9CA3AF', marginBottom:16, textAlign:'center'}}>
        Escolha páginas • Ex: 1,3,5-7 • 100% no seu PC
      </div>
      <DropZone onFiles={(f) => onFile(f[0])} single isDark={isDark} accept=".pdf" />
      {file && (
        <div style={{marginTop:12, background:isDark?'#27272a':'#F5F3FF', border:isDark?'1px solid #3f3f46':'1px solid #DDD6FE', padding:'10px 12px', borderRadius:8}}>
          <div style={{display:'flex', justifyContent:'space-between'}}>
            <span style={{fontSize:12, fontWeight:600, color:isDark?'#f3f4f6':'#5B21B6'}}>📄 {file.name} ({total} págs)</span>
            <button onClick={()=>{setFile(null); setTotal(0)}} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
          </div>
          <input value={pages} onChange={e=>setPages(e.target.value)} placeholder="Ex: 1,3,5-7" style={inputStyle} />
          <div style={{fontSize:10, color:'#9CA3AF', marginTop:6}}>Dica: 1-3 extrai 1,2,3 • 1,5 extrai só 1 e 5</div>
        </div>
      )}
      <button onClick={handleExtract} disabled={loading || !file} style={{ marginTop:16, background:PURPLE, color:'#fff', border:0, padding:'14px 24px', borderRadius:10, fontWeight:800, cursor:'pointer', width:'100%', opacity:loading||!file?0.6:1 }}>
        {loading ? 'Extraindo...' : 'Extrair páginas ↓'}
      </button>
    </div>
  )
}
