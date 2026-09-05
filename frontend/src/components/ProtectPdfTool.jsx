import { useState } from 'react'
import * as mupdf from 'mupdf'

export default function ProtectPdfTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleProtect() {
    if (!file) return alert('Selecione 1 PDF')
    if (!password) return alert('Digite a senha')
    if (password !== confirm) return alert('Senhas não conferem')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const doc = mupdf.Document.openDocument(buffer, "application/pdf")
      const pdfDoc = doc.asPDF()

      // Forma correta mupdf.js: string de opções
      const opts = `encrypt=aes-256,user-password=${password},owner-password=${password}_owner,permissions=0`
      
      const outBuffer = pdfDoc.saveToBuffer(opts).asUint8Array()

      const blob = new Blob([outBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-PROTEGIDO.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 1500)
      
      doc.destroy()
      alert('✅ PDF protegido com AES-256!\nSenha: ' + password)
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const cardBg = isDark ? '#1f1f1f' : '#ffffff'
  const inputBg = isDark ? '#2a2a2a' : '#ffffff'
  const textColor = isDark ? '#f3f4f6' : '#111827'
  const borderColor = isDark ? '#3f3f46' : '#e5e7eb'

  return (
    <div style={{maxWidth:600, margin:'0 auto'}}>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16, color: textColor}}>Proteger PDF com Senha 🔒</h2>
      <div style={{background: isDark ? '#2a1f3d' : '#F5F3FF', border: isDark ? '1px solid #7C3AED' : '1px solid #DDD6FE', borderRadius:8, padding:'10px 12px', fontSize:11, color: isDark ? '#c4b5fd' : '#5B21B6', marginBottom:16, textAlign:'center'}}>
        🔐 AES-256 real • Vai pedir senha ao abrir • 100% no navegador
      </div>
      <div style={{border:`2px dashed #7C3AED`, borderRadius:12, padding:24, textAlign:'center', background: cardBg}}>
        <label style={{display:'inline-block', background:'#7C3AED', color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>
          Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        {file && <div style={{marginTop:12, fontSize:13, fontWeight:600, color: textColor, wordBreak:'break-all'}}>📄 {file.name}</div>}
        {!file && <div style={{marginTop:10, fontSize:12, color: isDark ? '#a1a1aa' : '#6b7280'}}>Arraste um PDF ou clique acima</div>}
      </div>
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} 
          style={{padding:'14px', borderRadius:10, border:`1px solid ${borderColor}`, width:'100%', background: inputBg, color: textColor, fontSize:14}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} 
          style={{padding:'14px', borderRadius:10, border:`1px solid ${borderColor}`, width:'100%', background: inputBg, color: textColor, fontSize:14}} />
      </div>
      <button onClick={handleProtect} disabled={loading || !file} 
        style={{marginTop:16, background:'#7C3AED', color:'#fff', border:0, padding:'16px', borderRadius:12, fontWeight:800, cursor:'pointer', width:'100%', opacity: loading||!file?0.6:1, fontSize:15}}>
        {loading ? 'Criptografando...' : 'Proteger com senha 🔒'}
      </button>
    </div>
  )
}
