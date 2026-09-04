import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import DropZone from './DropZone.jsx'

// Configura worker do pdf.js (CDN)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

export default function CompressTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)
  const [mode, setMode] = useState('basic') // basic | turbo
  const [progress, setProgress] = useState('')

  // MODO BÁSICO - sem perda, rápido
  async function compressBasic() {
    const originalSize = file.size
    const buffer = await file.arrayBuffer()
    const pdfDoc = await PDFDocument.load(buffer)
    pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject(''); pdfDoc.setKeywords([]); 
    pdfDoc.setProducer('youconverter.com.br'); pdfDoc.setCreator('youconverter.com.br')
    const compressedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false })
    return { bytes: compressedBytes, originalSize }
  }

  // MODO TURBO - 100% no dispositivo do usuário, com perda mas -60% a -80%
  async function compressTurbo() {
    const originalSize = file.size
    const buffer = await file.arrayBuffer()
    
    const loadingTask = pdfjsLib.getDocument({ data: buffer })
    const pdf = await loadingTask.promise
    
    const newPdfDoc = await PDFDocument.create()
    
    for (let i = 0; i < pdf.numPages; i++) {
      setProgress(`Comprimindo página ${i+1}/${pdf.numPages}...`)
      const page = await pdf.getPage(i + 1)
      
      // Escala menor = arquivo menor. 1.0 = 72dpi, 1.5 = ~108dpi (bom pra turbo)
      const scale = mode === 'turbo' ? 1.2 : 1.5
      const viewport = page.getViewport({ scale })
      
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: context, viewport }).promise

      // Converte canvas pra JPEG 60% qualidade - aqui que esmaga o tamanho
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.6)
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
    setLoading(true)
    setStats(null)
    try {
      const result = mode === 'basic' ? await compressBasic() : await compressTurbo()
      
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
      a.download = file.name.replace('.pdf','') + `-${mode === 'turbo' ? 'turbo' : 'comprimido'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)

    } catch (e) {
      console.error(e)
      alert('Erro no modo ' + mode + ': ' + e.message)
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Comprimir PDF</h2>
      
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <button onClick={()=>setMode('basic')} style={{flex:1, padding:'10px', borderRadius:8, border: mode==='basic'?'2px solid #7C3AED':'1px solid #E5E7EB', background: mode==='basic'?'#F5F3FF':'#fff', fontWeight:700, color: mode==='basic'?'#5B21B6':'#6B7280', cursor:'pointer'}}>
          Básico<br/><span style={{fontSize:11, fontWeight:400}}>Sem perda • Rápido</span>
        </button>
        <button onClick={()=>setMode('turbo')} style={{flex:1, padding:'10px', borderRadius:8, border: mode==='turbo'?'2px solid #7C3AED':'1px solid #E5E7EB', background: mode==='turbo'?'#F5F3FF':'#fff', fontWeight:700, color: mode==='turbo'?'#5B21B6':'#6B7280', cursor:'pointer'}}>
          Turbo 🔥<br/><span style={{fontSize:11, fontWeight:400}}>-60% a -80% • Com perda</span>
        </button>
      </div>

      <DropZone onFiles={(f) => setFile(f[0])} single />

      {file && (
        <div style={{marginTop:16, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'12px 14px', borderRadius:10, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontWeight:600, color:'#5B21B6', fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%'}}>📄 {file.name} - {(file.size/1024/1024).toFixed(2)} MB</span>
          <button onClick={()=>{setFile(null); setStats(null)}} style={{background:'transparent', border:0, color:'#7C3AED', cursor:'pointer', fontWeight:700}}>X</button>
        </div>
      )}

      {progress && <div style={{marginTop:10, fontSize:12, color:'#7C3AED', fontWeight:600, textAlign:'center'}}>{progress}</div>}

      {stats && (
        <div style={{marginTop:12, background:'#ECFDF5', border:'1px solid #A7F3D0', padding:'12px', borderRadius:8, fontSize:13, color:'#065F46', fontWeight:700, textAlign:'center'}}>
          ✅ {stats.from} MB → {stats.to} MB {stats.pct > 0 ? `(-${stats.pct}%)` : ''}<br/>
          <span style={{fontSize:11, fontWeight:400}}>{mode==='turbo' ? 'Modo Turbo - Feito 100% no seu aparelho' : 'Modo Básico - Sem perda de qualidade'}</span>
        </div>
      )}

      <button onClick={handleCompress} disabled={loading ||!file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading ||!file? 0.6 : 1 }}>
        {loading? progress || 'Comprimindo...' : mode==='turbo' ? 'Comprimir TURBO 🔥' : 'Comprimir agora ↓'}
      </button>
      
      <p style={{marginTop:8, fontSize:11, color:'#9CA3AF', textAlign:'center'}}>
        {mode==='turbo' ? '🔥 Usa o processador do seu celular/PC • Pode demorar 10-20s em PDFs grandes' : '100% no navegador • Sem limite de 4.5MB da Vercel • Até 50MB'}
      </p>
    </div>
  )
}