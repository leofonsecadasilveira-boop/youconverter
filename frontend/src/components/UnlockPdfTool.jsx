import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function UnlockTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    if (!file) return alert('Selecione 1 PDF')
    if (!password) return alert('Digite a senha do PDF')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      // tenta carregar com senha
      const srcDoc = await PDFDocument.load(buffer, { password })
      const newDoc = await PDFDocument.create()
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices())
      pages.forEach(p => newDoc.addPage(p))
      const pdfBytes = await newDoc.save() // salva sem senha
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-desbloqueado.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) {
      console.error(e)
      alert('Senha incorreta ou PDF não protegido: ' + e.message)
    } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Desbloquear PDF</h2>
      <div style={{background: isDark ? '#27272a' : '#1F1F23', borderRadius:8, padding:'8px 12px', fontSize:11, color:'#9CA3AF', marginBottom:16, textAlign:'center'}}>
        Remova a senha • Se você souber a senha • 100% no seu PC
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single />
      {file && (
        <div style={{marginTop:12, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:'#5B21B6'}}>🔒 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:'#7C3AED', fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Senha atual do PDF" style={{marginTop:12, width:'100%', padding:'12px', borderRadius:8, border:'1px solid #3f3f46', background:'#18181b', color:'#fff'}} />
      <button onClick={handleUnlock} disabled={loading || !file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '14px 24px', borderRadius: 10, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1 }}>
        {loading ? 'Desbloqueando...' : 'Desbloquear PDF 🔓 ↓'}
      </button>
      <p style={{marginTop:8, fontSize:10, color:'#6B7280', textAlign:'center'}}>Você precisa saber a senha. Não quebramos senha, só removemos se você souber.</p>
    </div>
  )
}
