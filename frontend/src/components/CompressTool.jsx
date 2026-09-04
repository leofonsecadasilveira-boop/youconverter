import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function CompressTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleCompress() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(`${API_URL}/api/compress`, { method: 'POST', body: fd })
      
      if (!res.ok) {
        // FIX: Lê o body só UMA vez como texto - evita "body stream already read"
        const text = await res.text()
        let msg = text || 'Erro ao comprimir'
        try {
          const errJson = JSON.parse(text)
          msg = errJson.error || msg
        } catch {}
        throw new Error(msg)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-compressed-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error(e)
      alert(e.message)
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
          <span style={{fontWeight:600, color:'#5B21B6', fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'80%'}}>📄 {file.name} - {(file.size/1024/1024).toFixed(2)} MB</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:'#7C3AED', cursor:'pointer', fontWeight:700}}>X</button>
        </div>
      )}

      <button onClick={handleCompress} disabled={loading || !file} style={{ marginTop: 20, background: '#7C3AED', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1 }}>
        {loading ? 'Comprimindo...' : 'Comprimir agora ↓'}
      </button>
    </div>
  )
}
