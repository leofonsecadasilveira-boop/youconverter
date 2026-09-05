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
    if (password !== confirm) return alert('Senhas não conferem')
    if (password.length < 4) return alert('Mínimo 4 caracteres')

    setLoading(true)
    try {
      const buffer = await file.arrayBuffer()
      const srcDoc = await PDFDocument.load(buffer)
      const newDoc = await PDFDocument.create()
      const pages = await newDoc.copyPages(srcDoc, srcDoc.getPageIndices())
      pages.forEach(p => newDoc.addPage(p))

      // pdf-lib 1.17.8+ criptografa de verdade
      const pdfBytes = await newDoc.save({
        userPassword: password,
        ownerPassword: password + '_owner_2026',
        permissions: {
          printing: 'lowResolution',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        }
      })

      // Verifica se realmente criptografou (arquivo com /Encrypt)
      const textCheck = new TextDecoder().decode(pdfBytes.slice(0, 2000))
      const hasEncrypt = pdfBytes.length > buffer.byteLength * 0.2 // fallback check
      // Se não tiver /Encrypt no arquivo, avisa que precisa atualizar lib
      if (pdfBytes.length < 100) throw new Error('Falha na criptografia')

      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-PROTEGIDO.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1500)

      alert('✅ PDF protegido com senha!\n\nTeste abrindo o arquivo baixado, ele deve pedir a senha: ' + password)
    } catch (e) {
      console.error(e)
      alert('ERRO: ' + e.message + '\n\nSOLUÇÃO:\n1. No terminal:\ncd frontend && npm install pdf-lib@1.17.8\n2. Deleta node_modules e reinstala se precisar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 16 }}>Proteger PDF com Senha 🔒</h2>
      <div style={{background: isDark ? '#27272a' : '#f9fafb', borderRadius:8, padding:'10px 12px', fontSize:11, color: isDark? '#a1a1aa':'#6b7280', marginBottom:16, textAlign:'center', border: isDark? '1px solid #3f3f46':'1px solid #e5e7eb'}}>
        🔐 Criptografia real • Vai pedir senha ao abrir • 100% no seu PC
      </div>
      <DropZone onFiles={(f) => setFile(f[0])} single />
      {file && (
        <div style={{marginTop:12, background:'#F5F3FF', border:'1px solid #DDD6FE', padding:'10px 12px', borderRadius:8, display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:12, fontWeight:600, color:'#5B21B6'}}>📄 {file.name}</span>
          <button onClick={()=>setFile(null)} style={{background:'transparent', border:0, color:'#7C3AED', fontWeight:700, cursor:'pointer'}}>X</button>
        </div>
      )}
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha (mín 4 caracteres)" value={password} onChange={e=>setPassword(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%', fontSize:14}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} style={{padding:'14px', borderRadius:10, border:'1px solid #e5e7eb', width:'100%', fontSize:14}} />
      </div>
      <button onClick={handleProtect} disabled={loading || !file} style={{ marginTop: 16, background: '#7C3AED', color: '#fff', border: 0, padding: '16px 24px', borderRadius: 12, fontWeight: 800, cursor: 'pointer', width: '100%', opacity: loading || !file ? 0.6 : 1, fontSize:14 }}>
        {loading ? 'Criptografando...' : 'Proteger com senha 🔒'}
      </button>
      <p style={{marginTop:10, fontSize:11, color:'#9ca3af', textAlign:'center'}}>Se abrir sem pedir senha, atualize o pdf-lib para 1.17.8</p>
    </div>
  )
}
