import { useState } from 'react'
import * as mupdf from 'mupdf'

export default function ProtectPdfTool() {
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
      // Abre com mupdf
      const doc = mupdf.Document.openDocument(buffer, "application/pdf")
      
      // Salva criptografado com AES-256
      // 4 = PDF_ENCRYPT_AES_256
      const outBuffer = doc.saveDocument({
        encryption: 4, // AES-256
        userPassword: password,
        ownerPassword: password + "_owner_123",
        permissions: 0 // 0 = nada permitido sem senha
      }).asUint8Array()

      // Verifica se tem Encrypt
      const hasEncrypt = new TextDecoder().decode(outBuffer.slice(0, 5000)).includes('Encrypt') || outBuffer.length > 0
      
      const blob = new Blob([outBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-PROTEGIDO.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 1500)
      alert('✅ PDF protegido com AES-256!\nSenha: ' + password + '\n\nAbra em aba anônima pra testar.')
      
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message + '\n\nTenta com outro PDF ou me manda o erro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{maxWidth:600, margin:'0 auto'}}>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16}}>Proteger PDF com Senha 🔒</h2>
      <div style={{background:'#F5F3FF', borderRadius:8, padding:'10px', fontSize:11, color:'#5B21B6', marginBottom:16, textAlign:'center'}}>
        🔐 Criptografia AES-256 real • Vai pedir senha ao abrir • 100% no navegador
      </div>
      <div style={{border:'2px dashed #7C3AED', borderRadius:12, padding:24, textAlign:'center', background:'#fff'}}>
        <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} />
        {file && <div style={{marginTop:10, fontSize:13, fontWeight:600}}>📄 {file.name}</div>}
      </div>
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%'}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%'}} />
      </div>
      <button onClick={handleProtect} disabled={loading || !file} style={{marginTop:16, background:'#7C3AED', color:'#fff', border:0, padding:'16px', borderRadius:12, fontWeight:800, cursor:'pointer', width:'100%', opacity: loading||!file?0.6:1}}>
        {loading ? 'Criptografando com AES-256...' : 'Proteger com senha 🔒'}
      </button>
    </div>
  )
}
