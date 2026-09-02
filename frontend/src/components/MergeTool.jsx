import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function MergeTool() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleMerge() {
    if (files.length < 2) return alert('Selecione pelo menos 2 PDFs')
    setLoading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f)) // campo 'files' agora bate com backend corrigido
      const res = await fetch(`${API_URL}/api/merge`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Erro ao juntar')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-merged-${Date.now()}.pdf`
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
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Juntar PDFs</h2>
      <DropZone onFiles={setFiles} />
      {files.length > 0 && <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>{files.length} arquivos selecionados • arraste para reordenar em breve</p>}
      <button onClick={handleMerge} disabled={loading} style={{ marginTop: 20, background: '#7C3AED', color: '#fff', border: 0, padding: '12px 24px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%', opacity: loading ? 0.7 : 1 }}>
        {loading ? 'Juntando...' : 'Juntar agora ↓'}
      </button>
    </div>
  )
}
