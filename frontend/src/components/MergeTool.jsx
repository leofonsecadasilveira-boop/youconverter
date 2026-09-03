import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function MergeTool({ isDark }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleMerge() {
    if (files.length < 2) return alert('Selecione pelo menos 2 PDFs')
    setLoading(true)
    try {
      const fd = new FormData()
      files.forEach(f => fd.append('files', f))

      const res = await fetch(`${API_URL}/api/merge`, { 
        method: 'POST', 
        body: fd 
      })

      if (!res.ok) {
        // LÊ O BODY SÓ UMA VEZ
        const rawText = await res.text()
        let msg = 'Erro ao juntar PDFs'
        try {
          const parsed = JSON.parse(rawText)
          msg = parsed.error || msg
        } catch {
          if (rawText) msg = rawText
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
      setTimeout(() => URL.revokeObjectURL(url), 2000)
      setFiles([])
    } catch (e) {
      console.error(e)
      alert(e.message || 'Falha na conexão com a API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: isDark? 'white' : '#111' }}>Juntar PDFs</h2>
      <DropZone onFiles={setFiles} isDark={isDark} />
      {files.length > 0 && (
        <p style={{ marginTop: 12, fontSize: 13, color: isDark? '#a1a1aa' : '#6b7280' }}>
          {files.length} arquivos selecionados
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