import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function MergeTool() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleMerge() {
    if (files.length < 2) return alert('Selecione pelo menos 2 PDFs')
    setLoading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f)) // tem que ser 'files' igual ao backend

      const res = await fetch(`${API_URL}/api/merge`, { 
        method: 'POST', 
        body: fd 
      })

      if (!res.ok) {
        // tenta ler erro como json, se falhar pega como texto
        let msg = 'Erro ao juntar PDFs'
        try {
          const err = await res.json()
          msg = err.error || msg
        } catch {
          msg = await res.text()
        }
        throw new Error(msg)
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `youconverter-merged-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error(e)
      alert(e.message || 'Falha na conexão com a API. Verifique se o backend está no ar em /api/merge')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Juntar PDFs</h2>
      <DropZone onFiles={setFiles} />
      {files.length > 0 && (
        <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
          {files.length} arquivos selecionados • arraste para reordenar em breve
        </p>
      )}
      <button 
        onClick={handleMerge} 
        disabled={loading || files.length < 2} 
        style={{ 
          marginTop: 20, 
          background: '#7C3AED', 
          color: '#fff', 
          border: 0, 
          padding: '12px 24px', 
          borderRadius: 10, 
          fontWeight: 700, 
          cursor: loading ? 'not-allowed' : 'pointer', 
          width: '100%', 
          opacity: loading || files.length < 2 ? 0.6 : 1 
        }}
      >
        {loading ? 'Juntando...' : 'Juntar agora ↓'}
      </button>
    </div>
  )
}
