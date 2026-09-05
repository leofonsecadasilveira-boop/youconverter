import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function CompressTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState('leve')
  const [progress, setProgress] = useState('')

  const PURPLE = '#7C3AED'

  const MODES = {
    leve: { 
      label: 'Compressão Leve', 
      badge: 'Alta qualidade',
      scale: null, 
      quality: null, 
      desc: 'Mantém nitidez 100% • Texto selecionável' 
    },
    equilibrado: { 
      label: 'Equilibrado', 
      badge: 'Recomendado • Alta qualidade',
      scale: 2.5,
      quality: 0.85,
      desc: 'Alta qualidade • -30% a -40% de tamanho' 
    },
    maxima_compressao: { 
      label: 'Compressão Máxima', 
      badge: 'Arquivo menor • Boa qualidade',
      scale: 2.0,
      quality: 0.72,
      desc: 'Boa qualidade • -55% a -65% de tamanho' 
    },
  }

  // TEMA
  const titleColor = isDark ? '#f3f4f6' : '#111827'
  const cardBgSelected = isDark ? '#2a1f4d' : '#F5F3FF'
  const cardBgUnselected = isDark ? '#1A1A1A' : '#ffffff'
  const borderSelected = `2px solid ${PURPLE}`
  const borderUnselected = isDark ? '1px solid #2A2A2A' : '1px solid #e5e7eb'
  const labelSelected = isDark ? '#c4b5fd' : '#5B21B6'
  const labelUnselected = isDark ? '#E5E7EB' : '#111827'
  const badgeSelected = PURPLE
  const badgeUnselected = isDark ? '#9CA3AF' : '#6b7280'
  const descBg = isDark ? '#1F1F23' : '#f9fafb'
  const descColor = isDark ? '#9CA3AF' : '#6b7280'

  async function compressLeve() {
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
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
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
      const result = mode === 'leve' ? await compressLeve() : await compressComPerda(mode)
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
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: titleColor }}>Comprimir PDF</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12}}>
        {Object.entries(MODES).map(([key, m]) => {
          const selected = mode===key
          return (
            <button key={key} onClick={()=>setMode(key)} style={{
              padding:'12px 8px', borderRadius:10, 
              border: selected ? borderSelected : borderUnselected,
              background: selected ? cardBgSelected : cardBgUnselected, 
              cursor:'pointer', textAlign:'center', transition:'0.2s'
            }}>
              <div style={{fontWeight:800, fontSize:12, color: selected ? labelSelected : labelUnselected, lineHeight:'1.2'}}>{m.label}</div>
              <div style={{fontSize:10, color: selected ? badgeSelected : badgeUnselected, marginTop:4, fontWeight:600}}>{m.badge}</div>
            </button>
          )
        })}
      </div>
      <div style={{background: descBg, borderRadius:8, padding:'8px 12px', fontSize:11, color: descColor, marginBottom:16, textAlign:'center', border: isDark ? '1px solid #2a2a2a' : '1px solid #f3f4f6'}}>
        {MODES[mode].desc}
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single isDark={isDark} />
      {file && (
        <div style={{marginTop:16, background: isDark ? '#2a1f4d' : '#F5F3FF', border: `1px solid ${isDark ? '#4c1d95' : '#DDD6FE'}`, padding:'12px 14px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontWeight:600, color: isDark ? '#c4b5fd' : '#5B21B6', fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%'}}>📄 {file.name} - {(file.size/1024/1024).toFixed(2)} MB</span>
          <button onClick={()=>{setFile(null); setStats(null)}} style={{background:'transparent', border:0, color:PURPLE, cursor:'pointer', fontWeight:700}}>X</button>
        </div>
      )}
      {progress && <div style={{marginTop:10, fontSize:12, color:PURPLE, fontWeight:600, textAlign:'center'}}>{progress}</div>}
      {stats && (
        <div style={{marginTop:12, background: isDark ? '#052e16' : '#ECFDF5', border:'1px solid #A7F3D0', padding:'12px', borderRadius:8, fontSize:13, color: isDark ? '#6ee7b7' : '#065F46', fontWeight:700, textAlign:'center'}}>
          ✅ {stats.from} MB → {stats.to} MB {stats.pct > 0 ? `(-${stats.pct}%)` : '(já otimizado)'}
        </div>
      )}
      <button onClick={handleCompress} disabled={loading ||!file} style={{ marginTop: 16, background: PURPLE, color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading ||!file? 0.6 : 1 }}>
        {loading? progress || 'Comprimindo...' : `Comprimir - ${MODES[mode].label} ↓`}
      </button>
      <p style={{marginTop:8, fontSize:11, color: isDark ? '#9ca3af' : '#6B7280', textAlign:'center'}}>100% no seu aparelho • Seguro e privado • Até 50MB</p>
    </div>
  )
}
