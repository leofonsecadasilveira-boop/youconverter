import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'

// FIX: Usa a mesma versão do worker que a lib instalada (resolve o erro API version mismatch)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`

export default function CompressTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState('equilibrado')
  const [progress, setProgress] = useState('')

  const MODES = {
    maxima: { 
      label: 'Qualidade Máxima', 
      badge: 'Alta qualidade',
      scale: null, 
      quality: null, 
      desc: 'Mantém nitidez original • Texto selecionável' 
    },
    equilibrado: { 
      label: 'Equilibrado', 
      badge: 'Recomendado',
      scale: 1.8, 
      quality: 0.75, 
      desc: 'Equilíbrio perfeito • -50% de tamanho' 
    },
    maxima_compressao: { 
      label: 'Compressão Máxima', 
      badge: 'Arquivo menor 🔥',
      scale: 1.2, 
      quality: 0.6, 
      desc: 'Máxima compressão • -80% de tamanho' 
    },
  }

  async function compressQualidadeMaxima() {
    const originalSize = file.size
    const buffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(buffer)
    pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject(''); pdfDoc.setKeywords([]);
    pdfDoc.setProducer('youconverter.com.br'); pdfDoc.setCreator('youconverter.com.br')
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
    return { bytes: compressedBytes, originalSize }
  }

  async function compressComPerda(targetMode) {
    const { scale, quality } = MODES[targetMode]
    const originalSize = file.size
    const buffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    const newPdfDoc = await PDFDocument.create()

    for (let i = 0; i < pdf.numPages; i++) {
      setProgress(`Página ${i + 1}/${pdf.numPages}...`)
      const page = await pdf.getPage(i + 1)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: context, viewport }).promise
      const jpegDataUrl = canvas.toDataURL('image/jpeg', quality)
      const jpegBytes = Uint8Array.from(atob(jpegDataUrl.split(',')[1]), c => c.charCodeAt(0))
      const jpegImage = await newPdfDoc.embedJpg(jpegBytes)
      const pdfPage = newPdfDoc.addPage([viewport.width, viewport.height])
      pdfPage.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height })
    }
    const compressedBytes = await newPdfDoc.save()
    return { bytes: compressedBytes, originalSize }
  }

  async function handleCompress() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true); setStats(null)
    try {
      const result = mode === 'maxima' ? await compressQualidadeMaxima() : await compressComPerda(mode)
      const blob = new Blob([result.bytes], { type: 'application/pdf' })
      const saved = Math.round((1 - blob.size / result.originalSize) * 100)
      setStats({
        from: (result.originalSize / 1024 / 1024).toFixed(2),
        to: (blob.size / 1024 / 1024).toFixed(2),
        pct: saved > 0 ? saved : 0
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf','') + `-${mode}.pdf`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error(e); alert('Erro: ' + e.message)
    } finally { setLoading(false); setProgress('') }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Comprimir PDF</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
        {Object.entries(MODES).map(([key, m]) => (
          <button key={key} onClick={()=>setMode(key)} style={{
            padding:'12px 8px', borderRadius:10, border: mode===key?'2px solid #7C3AED':'1px solid #2A2A2A',
            background: mode===key?'#F5F3FF':'#1A1A1A', cursor:'pointer', textAlign:'center'
          }}>
            <div style={{fontWeight:800, fontSize:12, color: mode===key?'#5B21B6':'#E5E7EB', lineHeight:'1.2'}}>{m.label}</div>
            <div style={{fontSize:10, color: mode===key?'#7C3AED':'#9CA3AF', marginTop:4, fontWeight:600}}>{m.badge}</div>
          </button>
        ))}
      </div>
      <div style={{background:'#1F1F23', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#9CA3AF', marginBottom:16, textAlign:'center'}}>
        {MODES[mode].desc}
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single />
      {file && (
        <div style={{marginTop:16, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'12px 14px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontWeight:600, color:'#5B21B6', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%'}}>📄 {file.name} - {(file.size/1024/1024).toFixed(2)} MB</span>
          <button onClick={()=>{setFile(null); setStats(null)}} style={{background:'transparent', border:0, color:'#7C3AED', cursor:'pointer', fontWeight:700}}>X</button>
        </div>
      )}
      {progress && <div style={{marginTop:10, fontSize:12, color:'#7C3AED', fontWeight:600, textAlign:'center'}}>{progress}</div>}
      {stats && (
        <div style={{marginTop:12, background:'#ECFDF5', border:'1px solid #A7F3D0', padding:'12px', borderRadius:8, fontSize:13, color:'#065F46', fontWeight:700, textAlign:'center'}}>
          ✅ {stats.from} MB → {stats.to} MB {stats.pct > 0 ? `(-${stats.pct}%)` : '(já otimizado)'}
        </div>
      )}
      <button onClick={handleCompress} disabled={loading ||!file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading ||!file? 0.6 : 1 }}>
        {loading? progress || 'Comprimindo...' : `Comprimir - ${MODES[mode].label} ↓`}
      </button>
      <p style={{marginTop:8, fontSize:11, color:'#6B7280', textAlign:'center'}}>100% no seu aparelho • Seguro e privado • Até 50MB</p>
    </div>
  )
}
