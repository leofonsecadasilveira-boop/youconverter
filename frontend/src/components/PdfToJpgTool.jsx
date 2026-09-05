import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'
import JSZip from 'jszip'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfToJpgTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [quality, setQuality] = useState('alta') // alta | media

  async function handleConvert() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const zip = new JSZip()
      const scale = quality === 'alta' ? 2.5 : 1.5
      const jpegQuality = quality === 'alta' ? 0.92 : 0.75

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(`Convertendo página ${i + 1}/${pdf.numPages}...`)
        const page = await pdf.getPage(i + 1)
        const viewport = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: ctx, viewport }).promise
        const dataUrl = canvas.toDataURL('image/jpeg', jpegQuality)
        const base64 = dataUrl.split(',')[1]
        zip.file(`pagina-${i + 1}.jpg`, base64, { base64: true })
      }

      setProgress('Gerando ZIP...')
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf','') + `-imagens.zip`
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) { console.error(e); alert('Erro: ' + e.message) }
    finally { setLoading(false); setProgress('') }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>PDF para JPG</h2>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <button onClick={()=>setQuality('alta')} style={{
          padding:'12px', borderRadius:10, border: quality==='alta'?'2px solid #7C3AED':'1px solid #2A2A2A',
          background: quality==='alta'?'#F5F3FF':'#1A1A1A', cursor:'pointer'
        }}>
          <div style={{fontWeight:800, fontSize:12, color: quality==='alta'?'#5B21B6':'#E5E7EB'}}>Alta qualidade</div>
          <div style={{fontSize:10, color:'#9CA3AF', marginTop:4}}>180 DPI • Recomendado</div>
        </button>
        <button onClick={()=>setQuality('media')} style={{
          padding:'12px', borderRadius:10, border: quality==='media'?'2px solid #7C3AED':'1px solid #2A2A2A',
          background: quality==='media'?'#F5F3FF':'#1A1A1A', cursor:'pointer'
        }}>
          <div style={{fontWeight:800, fontSize:12, color: quality==='media'?'#5B21B6':'#E5E7EB'}}>Arquivo menor</div>
          <div style={{fontSize:10, color:'#9CA3AF', marginTop:4}}>108 DPI • -60%</div>
        </button>
      </div>

      <DropZone onFiles={(f) => setFile(f[0])} single accept=".pdf" />

      {file && (
        <div style={{marginTop:12, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:'#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:'#7C3AED', fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}

      {progress && <div style={{marginTop:10, fontSize:12, color:'#7C3AED', fontWeight:600, textAlign:'center'}}>{progress}</div>}

      <button onClick={handleConvert} disabled={loading || !file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1 }}>
        {loading ? progress || 'Convertendo...' : 'Converter para JPG ↓ (ZIP)'}
      </button>
      <p style={{marginTop:8, fontSize:11, color:'#6B7280', textAlign:'center'}}>Cada página vira 1 JPG • Baixa tudo em ZIP • 100% no seu PC</p>
    </div>
  )
}
