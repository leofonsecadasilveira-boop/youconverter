import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'

import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

export default function PdfToJpgTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [quality, setQuality] = useState('alta')

  const PURPLE = '#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  async function handleConvert() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
      const scale = quality === 'alta' ? 2.5 : 1.5
      const jpegQuality = quality === 'alta' ? 0.92 : 0.75

      for (let i = 0; i < pdf.numPages; i++) {
        setProgress(`Baixando página ${i + 1}/${pdf.numPages}...`)
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
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${file.name.replace(/\.pdf$/i,'')}-pagina-${i+1}.jpg`
        document.body.appendChild(a)
        a.click()
        a.remove()
        await new Promise(r => setTimeout(r, 300))
      }
      setProgress(`✅ ${pdf.numPages} imagens baixadas!`)
      setTimeout(()=>setProgress(''), 3000)
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // ESTILO CORRIGIDO - segue o padrão do CompressTool
  const getButtonStyle = (active) => {
    if (active) {
      return {
        padding:'12px',
        borderRadius:10,
        border:`2px solid ${PURPLE}`,
        background: isDark ? '#2a1f3d' : '#f5f3ff',
        cursor:'pointer',
        transition:'all .2s'
      }
    } else {
      return {
        padding:'12px',
        borderRadius:10,
        border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
        background: isDark ? '#1f1f1f' : 'white',
        cursor:'pointer',
        transition:'all .2s'
      }
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: titleColor }}>PDF para JPG</h2>
      
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <button onClick={()=>setQuality('alta')} style={getButtonStyle(quality==='alta')}>
          <div style={{fontWeight:800, fontSize:12, color: quality==='alta' ? PURPLE : (isDark ? '#e5e7eb' : '#111827')}}>Alta qualidade</div>
          <div style={{fontSize:10, color: isDark ? '#9ca3af' : '#6b7280', marginTop:4}}>180 DPI • Recomendado</div>
        </button>
        <button onClick={()=>setQuality('media')} style={getButtonStyle(quality==='media')}>
          <div style={{fontWeight:800, fontSize:12, color: quality==='media' ? PURPLE : (isDark ? '#e5e7eb' : '#111827')}}>Arquivo menor</div>
          <div style={{fontSize:10, color: isDark ? '#9ca3af' : '#6b7280', marginTop:4}}>108 DPI</div>
        </button>
      </div>

      <div style={{
        background: isDark ? '#1a1a1a' : '#f9fafb',
        border: isDark ? '1px solid #27272a' : '1px solid #f3f4f6',
        borderRadius:8, padding:'8px 12px', fontSize:11,
        color: isDark ? '#9ca3af' : '#6b7280',
        marginBottom:16, textAlign:'center'
      }}>
        Cada página vira 1 JPG em alta qualidade • 100% no seu PC
      </div>

      <DropZone onFiles={(f) => setFile(f[0])} single isDark={isDark} />

      {file && (
        <div style={{
          marginTop:12,
          background: isDark ? '#2a1f4d' : '#F5F3FF',
          border: `1px solid ${isDark ? '#4c1d95' : '#DDD6FE'}`,
          padding:'10px 12px', borderRadius:8,
          display:'flex', justifyContent:'space-between'
        }}>
          <span style={{fontSize:12, fontWeight:600, color: isDark ? '#c4b5fd' : '#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}

      {progress && <div style={{marginTop:10, fontSize:12, color:PURPLE, fontWeight:600, textAlign:'center'}}>{progress}</div>}

      <button onClick={handleConvert} disabled={loading || !file} style={{
        marginTop: 16, background: PURPLE, color: '#fff', border: 0,
        padding: '14px 24px', borderRadius: 10, fontWeight: 800,
        cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1
      }}>
        {loading ? (progress || 'Convertendo...') : 'Converter para JPG ↓'}
      </button>
    </div>
  )
}
