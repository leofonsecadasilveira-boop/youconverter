
import { useState } from 'react'
import { PDFDocument, degrees } from 'pdf-lib'
import DropZone from './DropZone.jsx'
export default function RotateTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [angle, setAngle] = useState(90)
  const PURPLE = '#7C3AED'
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
      a.href = url; a.download = file.name.replace(/\.pdf$/i,'') + `-girado-${angle}deg.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) { alert('Erro: ' + e.message) } finally { setLoading(false) }
  }
  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, marginBottom:16, color:isDark?'#f3f4f6':'#111827' }}>Girar PDF</h2>
      <div style={{background: isDark ? '#27272a' : '#1F1F23', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#9CA3AF', marginBottom:16, textAlign:'center'}}>
        Gire todas as páginas • 90° 180° 270° • 100% no seu PC
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single isDark={isDark} accept=".pdf" />
      {file && (
        <div style={{marginTop:12, background:isDark?'#27272a':'#F5F3FF', border:isDark?'1px solid #3f3f46':'1px solid #DDD6FE', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:isDark?'#f3f4f6':'#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}
      <div style={{marginTop:16, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
        {[90,180,270].map(a => {
          const active = angle===a
          return (
          <button key={a} onClick={()=>setAngle(a)} style={{
            padding:'12px', borderRadius:10, border: active?`2px solid ${PURPLE}`:'1px solid '+(isDark?'#27272a':'#e5e7eb'),
            background: active?PURPLE:(isDark?'#18181b':'white'), cursor:'pointer', fontWeight:800, fontSize:13,
            color: active?'#ffffff':(isDark?'#e5e7eb':'#111827')
          }}>{a}°</button>
        )})}
      </div>
      <button onClick={handleRotate} disabled={loading || !file} style={{ marginTop:16, background:PURPLE, color:'#fff', border:0, padding:'14px 24px', borderRadius:10, fontWeight:800, cursor:'pointer', width:'100%', opacity:loading||!file?0.6:1 }}>
        {loading ? 'Girando...' : `Girar ${angle}° ↻ ↓`}
      </button>
    </div>
  )
}
