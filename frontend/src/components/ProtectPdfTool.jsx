import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function ProtectPdfTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const PURPLE='#7C3AED'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  async function handleProtect() {
    if (!file) return alert('Selecione 1 PDF')
    if (!password) return alert('Digite a senha')
    if (password !== confirm) return alert('Senhas não conferem')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const newDoc = await PDFDocument.create()
      const srcDoc = await PDFDocument.load(buffer)
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices())
      pages.forEach(p => newDoc.addPage(p))
      const finalBytes = await newDoc.save({ userPassword: password, ownerPassword: password })
      const blob = new Blob([finalBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace('.pdf','') + '-protegido.pdf'
      document.body.appendChild(a); a.click(); a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (e) { alert('Erro: '+e.message) } finally { setLoading(false) }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16, color:titleColor }}>Proteger PDF com Senha</h2>
      <div style={{background:isDark?'#27272a':'#f3f4f6', borderRadius:8, padding:'8px 12px', fontSize:11, color:isDark?'#a1a1aa':'#6b7280', marginBottom:16, textAlign:'center'}}>
        Adicione senha • Criptografia AES 256-bit • Privado e seguro
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single accept=".pdf" isDark={isDark} />
      {file && (
        <div style={{marginTop:12, background:isDark?'#2a1f4d':'#F5F3FF', border:'1px solid #7C3AED', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:isDark?'#ddd6fe':'#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:PURPLE, fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'12px', borderRadius:8, border:'1px solid #3f3f46', background:isDark?'#18181b':'white', color:isDark?'#fff':'#111827'}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{padding:'12px', borderRadius:8, border:'1px solid #3f3f46', background:isDark?'#18181b':'white', color:isDark?'#fff':'#111827'}} />
      </div>
      <button onClick={handleProtect} disabled={loading || !file} style={{ marginTop: 16, background: PURPLE, color: '#fff', border: 0, padding: '14px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.45 : 1, boxShadow: loading||!file?'none':'0 4px 14px rgba(124,58,237,0.35)' }}>
        {loading ? 'Protegendo...' : 'Proteger com senha 🔒 ↓'}
      </button>
    </div>
  )
}
