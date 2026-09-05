import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import DropZone from './DropZone.jsx'

export default function ProtectPdfTool({ isDark }) {
  const [file, setFile] = useState(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleProtect() {
    if (!file) return alert('Selecione 1 PDF')
    if (!password) return alert('Digite a senha')
    if (password!== confirm) return alert('Senhas nao conferem')
    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pdfBytes = await pdfDoc.save({
        userPassword: password,
        ownerPassword: password + '_owner',
        useObjectStreams: false
      })
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-PROTEGIDO.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 1500)
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Proteger PDF com Senha</h2>
      <DropZone onFiles={(f) => setFile(f[0])} single />
      {file && <div style={{marginTop:12, fontSize:12}}>📄 {file.name}</div>}
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%'}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%'}} />
      </div>
      <button onClick={handleProtect} disabled={loading ||!file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '16px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', width: '100%'}}>
        {loading? 'Criptografando...' : 'Proteger com senha'}
      </button>
    </div>
  )
}
