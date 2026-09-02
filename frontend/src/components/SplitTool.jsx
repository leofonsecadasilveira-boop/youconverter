import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function SplitTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSplit() {
    if (!file) return alert('Selecione 1 PDF')
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch(`${API_URL}/api/split`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao dividir')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-split-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Dividir PDF</h2>
      <DropZone onFiles={files => setFile(files[0])} multiple={false} />
      {file && <p style={{ marginTop: 12, fontSize: 13 }}>{file.name}</p>}
      <button onClick={handleSplit} disabled={loading} style={{ marginTop: 20, background: '#7C3AED', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
        {loading ? 'Dividindo...' : 'Dividir agora ↓'}
      </button>
    </div>
  )
}
