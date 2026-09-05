import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function JpgToPdfTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  async function handleConvert() {
    if (!files.length) return alert('Selecione as imagens')
    setLoading(true)
    try {
      const pdfDoc = await PDFDocument.create()
      for (const file of files) {
        const bytes = await file.arrayBuffer()
        let img
        if (file.type.includes('png')) img = await pdfDoc.embedPng(bytes)
        else img = await pdfDoc.embedJpg(bytes)
        const page = pdfDoc.addPage([img.width, img.height])
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height })
      }
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `imagens-convertidas.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color:titleColor }}>JPG para PDF</h2>
      <div style={{background:isDark?'#27272a':'#f3f4f6', borderRadius:8, padding:'8px 12px', fontSize:11, color:isDark?'#a1a1aa':'#6b7280', marginBottom:16, textAlign:'center'}}>
        Converta JPG, PNG em PDF • Mantém qualidade original • Privado e seguro
      </div>
      <DropZone onFiles={(f) => setFiles(prev => [...prev, ...f])} accept="image/*" multiple isDark={isDark} />
      {files.length > 0 && (
        <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>
          {files.map((f, i) => (
            <div key={i} style={{background:isDark?'#2a1f4d':'#F5F3FF', border:'1px solid #7C3AED', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
              <span style={{fontSize:12, fontWeight:600, color:isDark?'#ddd6fe':'#5B21B6'}}>🖼️ {f.name} - {(f.size/1024/1024).toFixed(2)} MB</span>
              <button onClick={()=>setFiles(files.filter((_, idx)=> idx!==i))} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
            </div>
          ))}
          <button onClick={()=>setFiles([])} style={{fontSize:11, background:'transparent', border:0, color:'#9CA3AF', cursor:'pointer'}}>Limpar tudo</button>
        </div>
      )}
      <button onClick={handleConvert} disabled={loading || !files.length} style={{ marginTop: 16, background: PURPLE, color: '#fff', border: 0, padding: '14px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !files.length ? 0.45 : 1, boxShadow: loading||!files.length?'none':'0 4px 14px rgba(124,58,237,0.35)' }}>
        {loading ? 'Convertendo...' : `Converter ${files.length ? `(${files.length} imagens)` : ''} para PDF ↓`}
      </button>
    </div>
  )
}
