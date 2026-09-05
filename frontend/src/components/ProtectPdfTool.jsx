import { useState } from 'react'

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
      const QPDFModule = await import('qpdf-wasm-esm-embedded')
      const QPDF = QPDFModule.default || QPDFModule.QPDF || QPDFModule
      const qpdf = await QPDF()
      const buffer = new Uint8Array(await file.arrayBuffer())
      qpdf.FS.writeFile('/input.pdf', buffer)
      qpdf.callMain([
        '/input.pdf',
        '--encrypt', password, password + '_owner', '256',
        '--print=full',
        '--extract=y',
        '--',
        '/output.pdf'
      ])
      const outBuffer = qpdf.FS.readFile('/output.pdf')
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
      alert('✅ PDF protegido! Senha: ' + password)
    } catch (e) {
      console.error(e)
      alert('Erro: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const PURPLE = '#7C3AED'
  // CORES QUE RESPEITAM O TEMA DO SITE
  const isLight = !isDark
  const cardBg = isDark ? '#1e1e1e' : '#ffffff'
  const dropBg = isDark ? '#18181b' : '#fafafa'
  const inputBg = isDark ? '#2a2a2a' : '#f9fafb'
  const textColor = isDark ? '#f3f4f6' : '#111827'
  const subTextColor = isDark ? '#a1a1aa' : '#6b7280'
  const borderColor = isDark ? '#3f3f46' : '#e5e7eb'
  const titleColor = isDark ? '#f3f4f6' : '#111827'

  return (
    <div style={{maxWidth:600, margin:'0 auto'}}>
      <h2 style={{fontSize:22, fontWeight:800, marginBottom:16, color: titleColor}}>Proteger PDF com Senha 🔒</h2>
      
      <div style={{
        background: isDark ? 'rgba(124, 58, 237, 0.12)' : 'rgba(124, 58, 237, 0.08)', 
        border: `1px solid ${PURPLE}`, 
        borderRadius:8, 
        padding:'10px 12px', 
        fontSize:11, 
        color: isDark ? '#c4b5fd' : PURPLE, 
        marginBottom:16, 
        textAlign:'center',
        fontWeight:600
      }}>
        🔒 YouConverter Engine • AES-256 • 100% no seu navegador
      </div>

      <div style={{
        border:`2px dashed ${PURPLE}`, 
        borderRadius:12, 
        padding:24, 
        textAlign:'center', 
        background: dropBg
      }}>
        <label style={{display:'inline-block', background: PURPLE, color:'#fff', padding:'10px 20px', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:14}}>
          Escolher Arquivo
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files?.[0]||null)} style={{display:'none'}} />
        </label>
        {file && <div style={{marginTop:12, fontSize:13, fontWeight:600, color: textColor, wordBreak:'break-all'}}>📄 {file.name}</div>}
        {!file && <div style={{marginTop:10, fontSize:12, color: subTextColor}}>Arraste um PDF ou clique acima</div>}
      </div>

      <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
        <input 
          type="password" 
          placeholder="Digite a senha" 
          value={password} 
          onChange={e=>setPassword(e.target.value)} 
          style={{
            padding:'14px', 
            borderRadius:10, 
            border:`1px solid ${borderColor}`, 
            width:'100%', 
            background: inputBg, 
            color: textColor, 
            fontSize:14,
            outline:'none'
          }} 
        />
        <input 
          type="password" 
          placeholder="Confirme a senha" 
          value={confirm} 
          onChange={e=>setConfirm(e.target.value)} 
          style={{
            padding:'14px', 
            borderRadius:10, 
            border:`1px solid ${borderColor}`, 
            width:'100%', 
            background: inputBg, 
            color: textColor, 
            fontSize:14,
            outline:'none'
          }} 
        />
      </div>

      <button onClick={handleProtect} disabled={loading || !file} 
        style={{
          marginTop:16, 
          background: PURPLE, 
          color:'#fff', 
          border:0, 
          padding:'16px', 
          borderRadius:12, 
          fontWeight:800, 
          cursor:'pointer', 
          width:'100%', 
          opacity: loading||!file?0.6:1, 
          fontSize:15,
          transition:'0.2s'
        }}>
        {loading ? 'Criptografando...' : 'Proteger com senha 🔒'}
      </button>
    </div>
  )
}
