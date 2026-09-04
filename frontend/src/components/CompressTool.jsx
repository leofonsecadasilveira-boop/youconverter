import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function CompressTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  async function handleCompress() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const originalSize = file.size
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)

      pdfDoc.setTitle('')
      pdfDoc.setAuthor('')
      pdfDoc.setSubject('')
      pdfDoc.setKeywords([])
      pdfDoc.setProducer('youconverter.com.br')
      pdfDoc.setCreator('youconverter.com.br')

      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      })

      const blob = new Blob([compressedBytes], { type: 'application/pdf' })
      setStats({
        from: (originalSize / 1024 / 1024).toFixed(2),
        to: (blob.size / 1024 / 1024).toFixed(2),
        pct: Math.round((1 - blob.size / originalSize) * 100)
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf','') + '-comprimido.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)

    } catch (e) {
      console.error(e)
      alert('Erro ao comprimir: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Comprimir PDF</h2>
      <DropZone onFiles={(f) => setFile(f[0])} single />

      {file && (
        <div style={{marginTop:16, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'12px 14px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontWeight:600, color:'#5B21B6', fontSize:14}}>📄 {file.name} - {(file.size/1024/1024).toFixed(2)} MB</span>
          <button onClick={()=>{setFile(null); setStats(null)}} style={{background:'transparent', border:0, color:'#7C3AED', cursor:'pointer', fontWeight:700}}>X</button>
        </div>
      )}

      {stats && (
        <div style={{marginTop:12, background:'#ECFDF5', border:'1px solid #A7F3D0', padding:'10px', borderRadius:8, fontSize:13, color:'#065F46', fontWeight:600}}>
          ✅ {stats.from} MB → {stats.to} MB ( -{stats.pct}% )
        </div>
      )}

      <button onClick={handleCompress} disabled={loading ||!file} style={{ marginTop: 20, background: '#7C3AED', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading ||!file? 0.6 : 1 }}>
        {loading? 'Comprimindo...' : 'Comprimir agora ↓'}
      </button>
      <p style={{marginTop:8, fontSize:11, color:'#9CA3AF', textAlign:'center'}}>Comprime 100% no seu navegador • Seguro e sem limite da Vercel • Até 50MB</p>
    </div>
  )
}