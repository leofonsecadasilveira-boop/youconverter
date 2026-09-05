import { useState } from 'react'

// YouConverter Engine - 100% própria, sem AGPL, sem pagar licença
// Usa qpdf-wasm (Apache 2.0) - pode usar comercialmente
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
      // Carrega qpdf-wasm dinamicamente
      const { QPDF } = await import('qpdf-wasm-esm-embedded')
      const qpdf = await QPDF.create()

      const buffer = new Uint8Array(await file.arrayBuffer())
      
      // Escreve input no FS virtual do WASM
      qpdf.FS.writeFile('/input.pdf', buffer)

      // Comando igual QPDF desktop: --encrypt user owner 256
      // 256 = AES-256
      qpdf.callMain([
        '/input.pdf',
        '--encrypt', password, password + '_owner', '256',
        '--print=full',
        '--extract=y',
        '--',
        '/output.pdf'
      ])

      const outBuffer = qpdf.FS.readFile('/output.pdf')
      
      // Limpa FS
      qpdf.FS.unlink('/input.pdf')
      qpdf.FS.unlink('/output.pdf')

      const blob = new Blob([outBuffer], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name.replace(/\.pdf$/i,'') + '-PROTEGIDO.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(()=>URL.revokeObjectURL(url), 1500)
      
      alert('✅ PDF protegido com AES-256 pela YouConverter Engine!\nSenha: ' + password)
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
      <div style={{background: isDark ? '#1f2a1f' : '#F0FDF4', border: isDark ? '1px solid #22c55e' : '1px solid #BBF7D0', borderRadius:8, padding:'10px 12px', fontSize:11, color: isDark ? '#86efac' : '#15803d', marginBottom:16, textAlign:'center'}}>
        ✅ YouConverter Engine • Apache 2.0 • AES-256 • 100% sua • Sem licença paga
      </div>
      <div style={{border:`2px dashed #22c55e`, borderRadius:12, padding:24, textAlign:'center', background: cardBg}}>
        <label style={{display:'inline-block', background:'#16a34a', color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>
          Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        {file && <div style={{marginTop:12, fontSize:13, fontWeight:600, color: textColor, wordBreak:'break-all'}}>📄 {file.name}</div>}
      </div>
      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input type="password" placeholder="Digite a senha" value={password} onChange={e=>setPassword(e.target.value)} 
          style={{padding:'14px', borderRadius:10, border:`1px solid ${borderColor}`, width:'100%', background: inputBg, color: textColor, fontSize:14}} />
        <input type="password" placeholder="Confirme a senha" value={confirm} onChange={e=>setConfirm(e.target.value)} 
          style={{padding:'14px', borderRadius:10, border:`1px solid ${borderColor}`, width:'100%', background: inputBg, color: textColor, fontSize:14}} />
      </div>
      <button onClick={handleProtect} disabled={loading || !file} 
        style={{marginTop:16, background:'#16a34a', color:'#fff', border:0, padding:'16px', borderRadius:12, fontWeight:800, cursor:'pointer', width:'100%', opacity: loading||!file?0.6:1, fontSize:15}}>
        {loading ? 'Criptografando...' : 'Proteger com senha 🔒'}
      </button>
    </div>
  )
}
