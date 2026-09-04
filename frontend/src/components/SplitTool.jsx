import { useState } from 'react'
import DropZone from './DropZone.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function SplitTool({ isDark }) {
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
        try { const err = await res.json(); msg = err.error || msg } catch {
          try { msg = await res.text() } catch {}
        }
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
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color: isDark? '#fff' : '#111' }}>Dividir PDF</h2>
      <DropZone onFiles={(f) => setFile(f[0])} single isDark={isDark} />

      {/* AQUI QUE MOSTRA QUE CARREGOU */}
      {file && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: isDark? '#2a1f3d' : '#f5f3ff',
          border: isDark? '1px solid #4c1d95' : '1px solid #ddd6fe',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 24 }}>📄</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: isDark? '#fff' : '#111', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
              <div style={{ fontSize: 11, color: isDark? '#a1a1aa' : '#6b7280' }}>{(file.size/1024/1024).toFixed(2)} MB • pronto para dividir</div>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            style={{ background: isDark? '#27272a' : '#fff', border: isDark? '1px solid #3f3f46' : '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: isDark? '#fff' : '#111' }}
          >
            ✕
          </button>
        </div>
      )}

      <button onClick={handleSplit} disabled={loading ||!file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: file? 'pointer' : 'not-allowed', width: '100%', opacity: loading ||!file? 0.5 : 1, transition: 'all.2s' }}>
        {loading? 'Dividindo...' : file? `Dividir ${file.name} ↓` : 'Dividir agora ↓'}
      </button>
    </div>
  )
}