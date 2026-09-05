import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function RotateTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [angle, setAngle] = useState(90)
  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  async function handleRotate() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      pdfDoc.getPages().forEach(page => {
        const current = page.getRotation().angle
        page.setRotation(degrees(current + angle))
      })
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + `-girado-${angle}deg.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      alert('Erro: ' + e.message)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color:titleColor }}>Girar PDF</h2>
      <div style={{background: isDark ? '#27272a' : '#f3f4f6', borderRadius:8, padding:'8px 12px', fontSize:11, color:isDark?'#a1a1aa':'#6b7280', marginBottom:16, textAlign:'center'}}>
        Gire todas as páginas • 90° 180° 270° • Privado e seguro
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single isDark={isDark} accept=".pdf" />
      {file && (
        <div style={{marginTop:12, background:isDark?'#2a1f4d':'#F5F3FF', border:'1px solid #7C3AED', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:isDark?'#ddd6fe':'#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}
      <div style={{marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
        {[90,180,270].map(a => (
          <button key={a} onClick={()=>setAngle(a)} style={{
            padding:'12px', borderRadius:10, border: angle===a?`2px solid ${PURPLE}`:'1px solid '+(isDark?'#27272a':'#e5e7eb'),
            background: angle===a?PURPLE:(isDark?'#18181b':'white'), cursor:'pointer', fontWeight:800, fontSize:13,
            color: angle===a?'#fff':(isDark?'#f3f4f6':'#111827')
          }}>{a}°</button>
        ))}
      </div>
      <button onClick={handleRotate} disabled={loading || !file} style={{ marginTop: 16, background: PURPLE, color: '#fff', border: 0, padding: '14px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.45 : 1, boxShadow: loading||!file?'none':'0 4px 14px rgba(124,58,237,0.35)' }}>
        {loading ? 'Girando...' : `Girar ${angle}° ↻ ↓`}
      </button>
    </div>
  )
}
