import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function JpgToPdfTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'
  const descBg = isDark ? '#1F1F23' : '#f9fafb'
  const descColor = isDark ? '#9CA3AF' : '#6b7280'

  async function handleConvert() {
    if (!files.length) return alert('Selecione as imagens')
    setLoading(true)
    try {
      const pdfDoc = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        let img
        if (file.type.includes('png') || file.name.toLowerCase().endsWith('.png')) {
          img = await pdfDoc.embedPng(bytes)
        } else {
          img = await pdfDoc.embedJpg(bytes)
        }
        const page = pdfDoc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-imagens-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: titleColor }}>JPG para PDF</h2>
      <div style={{background: descBg, borderRadius:8, padding:'8px 12px', fontSize:11, color: descColor, marginBottom:16, textAlign:'center', border: isDark ? '1px solid #2a2a2a' : '1px solid #f3f4f6'}}>
        Converta JPG, PNG em PDF • Mantém qualidade original • 100% no seu PC
      </div>

      <DropZone 
        onFiles={(f) => setFiles(prev => [...prev, ...f])} 
        multiple 
        isDark={isDark}
      />

      {files.length > 0 && (
        <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>
          {files.map((f, i) => (
            <div key={i} style={{background: isDark ? '#2a1f4d' : '#F5F3FF', border:`1px solid ${isDark ? '#4c1d95' : '#DDD6FE'}`, padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span style={{fontSize:12, fontWeight:600, color: isDark ? '#c4b5fd' : '#5B21B6', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'85%'}}>
                {i+1}. 🖼 {f.name} - {(f.size/1024/1024).toFixed(2)} MB
              </span>
              <button onClick={()=>setFiles(files.filter((_, idx)=> idx!==i))} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
            </div>
          ))}
          <button onClick={()=>setFiles([])} style={{fontSize:11, background:'transparent', border:0, color: descColor, cursor:'pointer', textAlign:'center', marginTop:4}}>Limpar tudo</button>
        </div>
      )}

      <button onClick={handleConvert} disabled={loading || !files.length} style={{ marginTop: 16, background: PURPLE, color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !files.length ? 0.6 : 1 }}>
        {loading ? 'Convertendo...' : `Converter ${files.length ? `(${files.length} imagens)` : ''} para PDF ↓`}
      </button>
      <p style={{marginTop:8, fontSize:11, color: isDark ? '#9ca3af' : '#6B7280', textAlign:'center'}}>Ordem das imagens = ordem no PDF • Suporta JPG e PNG • Até 50MB</p>
    </div>
  )
}
