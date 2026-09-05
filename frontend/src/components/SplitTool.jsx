import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

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
        let msg = 'Erro ao dividir'
        try { const err = await res.json(); msg = err.error || msg } catch { msg = await res.text() }
        throw new Error(msg)
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-split-${Date.now()}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Dividir PDF</h2>
      <DropZone onFiles={(f) => setFile(f[0])} single />
      <button onClick={handleSplit} disabled={loading || !file} style={{ marginTop: 20, background: '#7C3AED', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1 }}>
        {loading ? 'Dividindo...' : 'Dividir agora ↓'}
      </button>
    </div>
  )
}
