import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Logo from './components/Logo'

const MergeTool = lazy(() => import('./components/MergeTool'))
const SplitTool = lazy(() => import('./components/SplitTool'))
const CompressTool = lazy(() => import('./components/CompressTool'))
const JpgToPdfTool = lazy(() => import('./components/JpgToPdfTool'))
const PdfToJpgTool = lazy(() => import('./components/PdfToJpgTool'))
const ProtectPdfTool = lazy(() => import('./components/ProtectPdfTool'))
const RotateTool = lazy(() => import('./components/RotatePdfTool'))
const ExtractTool = lazy(() => import('./components/ExtractPagesTool'))
const UnlockTool = lazy(() => import('./components/UnlockPdfTool'))

// Página dedicada - vai usar seu scanner atual exato
const ScannerLgpdDedicatedPage = lazy(() => import('./Pages/ScannerLgpdPage'))

const iconBase = (url) => ({
  width: '100%', height: '100%', display: 'block',
  backgroundImage: `url(${url})`, backgroundSize: 'contain',
  backgroundRepeat: 'no-repeat', backgroundPosition: 'center',
  transform: 'scale(1.20)', transformOrigin: 'center',
})

const JuntarPremiumV1Icon = ({ size = 36, isDark = false }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/folhas-sobrepostas-icon.webp'), filter: isDark? 'drop-shadow(0 1.5px 3px rgba(0,0,0,0.3))' : 'drop-shadow(0 1px 1px rgba(124,58,237,0.15))' }} />
  </span>
)
const DividirPremiumIcon = ({ size = 36 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={iconBase('/tesoura-icon.webp')} />
  </span>
)
const ComprimirPremiumIcon = ({ size = 40 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={iconBase('/caixinha-icon.webp')} />
  </span>
)
const Pdf2JpgPremiumIcon = ({ size = 40 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={iconBase('/paleta-icon.webp')} />
  </span>
)
const GirarPremiumIcon = ({ size = 36 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/girar-pdf-icon.webp'), transform: 'scale(1.25)' }} />
  </span>
)
const MonalisaPremiumIcon = ({ size = 64 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/monalisa-icon.webp'), transform: 'scale(1.18)' }} />
  </span>
)
const ExtrairPremiumIcon = ({ size = 36 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/extrair-pdf-icon.webp'), transform: 'scale(1.45)' }} />
  </span>
)
const ProtegerPremiumIcon = ({ size = 50 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/proteger-pdf-icon.webp'), width: '100%', height: '100%', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transform: 'scale(1.50)', filter: 'drop-shadow(0 2px 6px rgba(91,33,182,0.25))' }} />
  </span>
)
const DesbloquearPremiumIcon = ({ size = 50 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/desbloquear-pdf-icon.webp'), width: '100%', height: '100%', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transform: 'scale(1.50)', filter: 'drop-shadow(0 2px 6px rgba(91,33,182,0.25))' }} />
  </span>
)
const ScannerLGPDPremiumIcon = ({ size = 36 }) => (
  <span style={{ width: size, height: size, display: 'block', flexShrink: 0, overflow: 'visible' }}>
    <span style={{ ...iconBase('/lgpd-icon.webp'), width: '100%', height: '100%', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', transform: 'scale(1.50)', filter: 'drop-shadow(0 2px 6px rgba(91,33,182,0.25))' }} />
  </span>
)

const TOOLS = [
  { id: 'merge', name: 'Juntar PDF', desc: 'Junte vários PDFs em um só', icon: null, customIcon: 'juntarV1' },
  { id: 'split', name: 'Dividir PDF', desc: 'Separe um PDF em vários', icon: null, customIcon: 'dividirRoxo' },
  { id: 'compress', name: 'Comprimir PDF', desc: 'Reduza o tamanho', icon: null, customIcon: 'comprimirRoxo' },
  { id: 'jpg2pdf', name: 'JPG para PDF', desc: 'Imagens em PDF', icon: null, customIcon: 'monalisaRoxo' },
  { id: 'pdf2jpg', name: 'PDF para JPG', desc: 'Extraia imagens', icon: null, customIcon: 'paletteRoxo' },
  { id: 'rotate', name: 'Girar PDF', desc: 'Gire as páginas', icon: null, customIcon: 'girarRoxo' },
  { id: 'extract', name: 'Extrair Páginas', desc: 'Extraia só algumas', icon: null, customIcon: 'extrairRoxo' },
  { id: 'protect', name: 'Proteger PDF', desc: 'Coloque senha', icon: null, customIcon: 'protegerRoxo' },
  { id: 'unlock', name: 'Desbloquear PDF', desc: 'Remova a senha', icon: null, customIcon: 'desbloquearRoxo' },
  { id: 'lgpd', name: 'Scanner LGPD', desc: 'Ache CPF/RG/CNPJ', icon: null, customIcon: 'lgpdRoxo', premium: true, locked: true },
]

function Dashboard() {
  const [activeTool, setActiveTool] = useState('merge')
  const [lgpdUnlocked, setLgpdUnlocked] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('youconverter_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.setItem('youconverter_theme', isDark? 'dark' : 'light')
    const savedLgpd = localStorage.getItem('lgpd_unlocked')
    if (savedLgpd === 'true') setLgpdUnlocked(true)
  }, [isDark])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleToolClick = (t) => {
    if (t.id === 'lgpd') {
      if (!lgpdUnlocked) {
        const pwd = prompt('🔒 Ferramenta bloqueada\nDigite a senha para liberar o Scanner LGPD:')
        if (pwd === 'Andreoni') {
          setLgpdUnlocked(true)
          localStorage.setItem('lgpd_unlocked', 'true')
          navigate('/scanner-lgpd')
        } else if (pwd!== null) {
          alert('Senha incorreta')
        }
        return
      }
      navigate('/scanner-lgpd')
      return
    }
    setActiveTool(t.id)
    window.scrollTo({top:0, behavior:'smooth'})
  }

  const renderTool = () => {
    switch(activeTool) {
      case 'merge': return <MergeTool isDark={isDark} />
      case 'split': return <SplitTool isDark={isDark} />
      case 'compress': return <CompressTool isDark={isDark} />
      case 'jpg2pdf': return <JpgToPdfTool isDark={isDark} />
      case 'pdf2jpg': return <PdfToJpgTool isDark={isDark} />
      case 'protect': return <ProtectPdfTool isDark={isDark} />
      case 'rotate': return <RotateTool isDark={isDark} />
      case 'extract': return <ExtractTool isDark={isDark} />
      case 'unlock': return <UnlockTool isDark={isDark} />
      case 'lgpd':
        if (!lgpdUnlocked) {
          return (
            <div style={{textAlign:'center', padding:'40px 20px'}}>
              <div style={{display:'flex', justifyContent:'center', marginBottom:16}}><ScannerLGPDPremiumIcon size={72} isDark={isDark} /></div>
              <h2 style={{fontWeight:900, marginTop:12}}>Scanner LGPD Bloqueado</h2>
              <p style={{opacity:0.6, fontSize:13, marginTop:8}}>Esta ferramenta está em testes internos.<br/>Clique no card e digite a senha: <b>Andreoni</b></p>
              <button onClick={() => {
                const pwd = prompt('Digite a senha:')
                if (pwd === 'Andreoni') {
                  setLgpdUnlocked(true)
                  localStorage.setItem('lgpd_unlocked', 'true')
                  navigate('/scanner-lgpd')
                } else if (pwd!== null) alert('Senha incorreta')
              }} style={{marginTop:16, background:'#5B21B6', color:'white', padding:'10px 20px', borderRadius:10, border:'none', fontWeight:800}}>🔓 Desbloquear e ir pra página dedicada</button>
            </div>
          )
        }
        navigate('/scanner-lgpd')
        return null
      default: return null
    }
  }

  const PURPLE = '#5B21B6'
  const isLgpdWorkspace = activeTool === 'lgpd' && lgpdUnlocked
  const ICON_SIZE = isMobile? 28 : 36

  return (
    <div style={{minHeight:'100vh', background: isDark? '#0f0f0f' : '#ffffff', fontFamily:'Inter, system-ui, sans-serif', color: isDark? '#f3f4f6' : '#111827', display:'flex', flexDirection:'column', transition:'background.2s, color.2s', overflowX:'hidden', maxWidth:'100vw'}}>
      <header style={{borderBottom: isDark? '1px solid #27272a' : '1px solid #f3f4f6', background: isDark? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:20, width:'100%', maxWidth:'100vw', boxSizing:'border-box', overflow:'hidden'}}>
        <div style={{maxWidth:'1400px', margin:'0 auto', padding: isMobile? '10px 12px' : '12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', boxSizing:'border-box', gap: isMobile? '8px' : '16px'}}>
          <div style={{flexShrink:1, minWidth:0, overflow:'hidden'}}>
            <Logo isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        </div>
      </header>

      <div style={{flex:1, display:'flex', flexDirection:'column', maxWidth:'1400px', margin:'0 auto', width:'100%', padding: isMobile? '0 12px' : '0 32px', boxSizing:'border-box', overflowX:'hidden'}}>
        {!isLgpdWorkspace? (
          <div style={{textAlign:'center', paddingTop: isMobile? '20px' : '32px', paddingBottom:'16px', transition:'all.3s ease'}}>
            <h1 style={{fontSize:'clamp(28px, 4vw, 46px)', fontWeight:'900', letterSpacing:'-1.4px', lineHeight:'1.05', maxWidth:'680px', margin:'0 auto'}}>Todas as ferramentas de PDF que você precisa.</h1>
            <p style={{color: isDark? '#a1a1aa' : '#6b7280', fontSize: isMobile? '15px' : '17px', marginTop:'12px', maxWidth:'650px', margin:'12px auto 0', padding: isMobile? '0 8px' : '0'}}>Junte, divida, comprima e converta em segundos. Agora com página dedicada /scanner-lgpd.</p>
          </div>
        ) : (
          <div style={{display:'flex', alignItems:'center', gap:12, paddingTop: isMobile? '14px' : '18px', paddingBottom:'12px'}}>
            <button onClick={()=>setActiveTool('merge')} style={{background:'white', border:'1px solid #e5e7eb', borderRadius:10, padding:'6px 12px', fontSize:12, fontWeight:700, cursor:'pointer'}}>← Todas as ferramentas</button>
            <span style={{fontSize:12, opacity:0.5}}>/</span>
            <span style={{fontSize:13, fontWeight:900, display:'flex', alignItems:'center', gap:6}}><ScannerLGPDPremiumIcon size={24} isDark={isDark} /> Scanner LGPD</span>
          </div>
        )}

        <div style={{display:'grid', gridTemplateColumns: isMobile? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(210px, 1fr))', gap: isMobile? '10px' : '18px', marginTop: isLgpdWorkspace? '8px' : '24px', transition:'all.3s ease'}}>
          {TOOLS.map(t => {
            const isLocked = t.locked && !lgpdUnlocked
            const isActive = activeTool===t.id
            const getIcon = () => {
              if (t.customIcon === 'juntarV1') return <JuntarPremiumV1Icon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'dividirRoxo') return <DividirPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'comprimirRoxo') return <ComprimirPremiumIcon size={isMobile? 32 : 40} isDark={isDark} />
              if (t.customIcon === 'monalisaRoxo') return <MonalisaPremiumIcon size={isMobile? 40 : 48} isDark={isDark} />
              if (t.customIcon === 'girarRoxo') return <GirarPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'paletteRoxo') return <Pdf2JpgPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'extrairRoxo') return <ExtrairPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'protegerRoxo') return <ProtegerPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'desbloquearRoxo') return <DesbloquearPremiumIcon size={ICON_SIZE} isDark={isDark} />
              if (t.customIcon === 'lgpdRoxo') return <ScannerLGPDPremiumIcon size={ICON_SIZE} isDark={isDark} />
              return <span style={{fontSize: ICON_SIZE-6}}>{t.icon}</span>
            }
            return (
              <div key={t.id} onClick={() => handleToolClick(t)} className="tool-card"
                style={{
                  border: isActive? `2px solid ${PURPLE}` : (isDark? '1px solid #27272a' : '1px solid #e5e7eb'),
                  background: isActive? (isDark? '#2a1f3d' : '#f9f7ff') : (isDark? '#1f1f1f' : 'white'),
                  borderRadius:'16px', padding: isMobile? '14px 12px' : '16px 14px', cursor: 'pointer', transition:'all.18s ease',
                  textAlign:'left', color: isDark? 'white' : '#111827', minHeight: isMobile? '108px' : '122px', maxHeight: isMobile? '108px' : '122px',
                  display:'flex', flexDirection:'column', justifyContent:'flex-start', boxSizing:'border-box', position:'relative', opacity: isLocked? 0.9 : 1, overflow:'visible'
                }}>
                {isLocked && <div style={{position:'absolute', top:6, right:6, background:'#ef4444', color:'white', fontSize:'8px', fontWeight:900, padding:'2px 6px', borderRadius:'6px', zIndex:2}}>🔒 BLOQUEADO</div>}
                {!isLocked && t.id==='lgpd' && <div style={{position:'absolute', top:6, right:6, background:'#10b981', color:'white', fontSize:'8px', fontWeight:900, padding:'2px 6px', borderRadius:'6px', zIndex:2}}>✅ PÁGINA DEDICADA</div>}
                <div style={{ width: ICON_SIZE, height: ICON_SIZE, display:'flex', alignItems:'center', justifyContent:'flex-start', flexShrink: 0, overflow:'visible', position:'relative' }}>{getIcon()}</div>
                <div style={{fontWeight:'700', marginTop:'10px', fontSize: isMobile? '13px' : '14.5px', lineHeight:'1.25'}}>{t.name}</div>
                <div style={{fontSize:'12px', color: isDark? '#a1a1aa' : '#6b7280', marginTop:'4px', lineHeight:'1.35'}}>{t.id==='lgpd' ? 'Clique → vai pra /scanner-lgpd' : t.desc}</div>
              </div>
            )
          })}
        </div>

        <div className="action-area-wrapper" style={{display:'flex', gap:'28px', marginTop:'32px', alignItems:'flex-start', width:'100%', maxWidth:'100%', boxSizing:'border-box', flexDirection: isLgpdWorkspace? 'column' : undefined}}>
          {!isLgpdWorkspace && (
            <div style={{width:'300px', minWidth:'300px', height:'380px', flexShrink:0, position:'sticky', top:'90px'}}>
              <div style={{ background: isDark? 'linear-gradient(135deg, #1e1e1e 0%, #162030 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: isDark? '1px solid #3f3f46' : '1px solid #bfdbfe', borderLeft: '4px solid #3b82f6', borderRadius:'16px', padding:'24px 20px', width:'100%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', boxSizing:'border-box' }}>
                <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'14px', boxShadow:'0 4px 12px rgba(59,130,246,0.25)'}}>🔒</div>
                <div style={{fontSize:'16px', fontWeight:'900', marginBottom:'12px', lineHeight:'1.2', color: isDark? 'white' : '#111827'}}>🇧🇷 Feito no Brasil</div>
                <div style={{fontSize:'14.5px', color: isDark? '#d4d4d8' : '#4b5563', lineHeight:'1.6'}}>Criado aqui, com <b style={{color: isDark? 'white' : '#111827'}}>privacidade em primeiro lugar</b>. Seus arquivos são apagados automaticamente após o uso. Agora com página dedicada <Link to="/scanner-lgpd" style={{color: '#5B21B6', fontWeight:800}}>/scanner-lgpd</Link></div>
              </div>
            </div>
          )}

          <div style={{flex:1, minWidth:'0', width:'100%'}}>
            <div style={{background: isDark? '#1f1f1f' : 'white', border: isDark? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius:'16px', padding: isMobile? '16px' : '22px', boxShadow: isDark? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.06)', minHeight:'380px', display:'flex', flexDirection:'column', boxSizing:'border-box', maxWidth:'100%', overflow:'hidden'}}>
              <div style={{flex:1, minWidth:0}}>
                <Suspense fallback={<div style={{padding:'60px', textAlign:'center'}}><div className="animate-pulse">🔒 Carregando ferramenta segura...</div></div>}>
                  {renderTool()}
                </Suspense>
              </div>
            </div>
          </div>

          {!isLgpdWorkspace && (
            <div style={{width:'320px', minWidth:'320px', height:'380px', flexShrink:0, position:'sticky', top:'90px'}}>
              <div style={{ background: isDark? '#1e1e1e' : 'white', border: isDark? '1px solid #3f3f46' : '1px solid #e5e7eb', borderLeft: '4px solid #f59e0b', borderRadius:'16px', padding:'22px 20px', width:'100%', height:'100%', display:'flex', flexDirection:'column', justifyContent:'center', boxSizing:'border-box' }}>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
                  <div style={{width:'28px', height:'28px', borderRadius:'8px', background: isDark? '#78350f' : '#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>⚡</div>
                  <div style={{fontWeight:'800', fontSize:'15px', color: isDark? 'white' : '#111827'}}>Como funciona?</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                  <div style={{display:'flex', gap:'12px'}}><div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:PURPLE, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>1</div><div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Escolha</b> o que quer fazer ali em cima</div></div>
                  <div style={{display:'flex', gap:'12px'}}><div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:PURPLE, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>2</div><div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Arraste</b> seu PDF pra cá ou clique em <b>Escolher Arquivo</b></div></div>
                  <div style={{display:'flex', gap:'12px'}}><div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:'#10b981', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>3</div><div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Clique</b> no botão roxo e seu arquivo novo <b style={{color:'#10b981'}}>já baixa sozinho</b></div></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{borderTop: isDark? '1px solid #27272a' : '1px solid #f3f4f6', padding:'16px 24px', textAlign:'center', fontSize:'12px', color: isDark? '#52525b' : '#9ca3af', marginTop:'48px'}}>© 2026 YouConverter • Feito no Brasil 🇧🇷 • Privado e seguro</footer>
      <style>{`html, body { overflow-x: hidden!important; max-width: 100vw!important; } * { box-sizing: border-box; } .tool-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(91,33,182,0.12); } @media (max-width: 1200px) { .action-area-wrapper { flex-direction: column!important; } .action-area-wrapper > div { width: 100%!important; min-width: 100%!important; height: auto!important; position: static!important; } } @media (max-width: 768px) { .hide-mobile { display: none!important; } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/scanner-lgpd" element={
          <Suspense fallback={<div style={{padding:60, textAlign:'center'}}>🔒 Carregando Scanner LGPD...</div>}>
            <ScannerLgpdDedicatedPage />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  )
}
