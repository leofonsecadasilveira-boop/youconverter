import { useState, useEffect, lazy, Suspense, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
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
const ScannerLgpdDedicatedPage = lazy(() => import('./Pages/ScannerLgpdPage'))

// ============ SUPABASE CLIENT - CORRIGIDO ANTI TELA BRANCA ============
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// NÃO quebra se .env faltar - evita tela branca
let supabase
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontrados em frontend/.env')
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ error: { message: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no frontend/.env e reinicie o npm run dev' } }),
      signOut: async () => {}
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: async () => ({ data: null }) }) }),
      insert: () => ({ select: () => ({ single: async () => ({ data: null }) }) })
    })
  }
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}
export { supabase }

// ============ AUTH CONTEXT COM SUPABASE ============
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) { setLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) setProfile(data)
    else {
      const { data: newProfile } = await supabase.from('profiles').insert({ id: userId, is_premium: false }).select().single()
      setProfile(newProfile)
    }
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: import.meta.env.VITE_SITE_URL || window.location.origin }
    })
    if (error) alert(error.message)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const value = {
    user,
    profile,
    isPremium: profile?.is_premium || false,
    loading,
    loginWithGoogle,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() { return useContext(AuthContext) }

function ProtectedRoute({ children, needPremium = false }) {
  const { user, isPremium, loading } = useAuth()
  if (loading) return <div style={{ padding: 60, textAlign: 'center' }}>🔒 Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (needPremium && !isPremium) return <Navigate to="/pricing" replace />
  return children
}

// ============ LOGIN PAGE COM SUPABASE ============
function LoginPage() {
  const { loginWithGoogle } = useAuth()
  const [isDark] = useState(() => localStorage.getItem('youconverter_theme') === 'dark')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#09090b' : '#f9fafb', padding: 20 }}>
      <div style={{ background: isDark ? '#18181b' : 'white', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: isDark ? 'white' : '#111' }}>Entre no YouConverter</h1>
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: 8, color: isDark ? '#a1a1aa' : '#6b7280' }}>Supabase Auth • Login com Google 100% grátis</p>
        {!supabaseUrl && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 8, borderRadius: 8, fontSize: 11, marginTop: 12, textAlign: 'left' }}>❌ .env não encontrado<br/>Configure VITE_SUPABASE_URL em frontend/.env</div>}
        <button onClick={loginWithGoogle} style={{ width: '100%', marginTop: 20, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ width: 20, height: 20, backgroundImage: 'url(https://www.svgrepo.com/show/475656/google-color.svg)', backgroundSize: 'contain', display: 'block' }} /> Continuar com Google
        </button>
        <div style={{ marginTop: 16 }}><Link to="/" style={{ fontSize: 12, color: '#5B21B6', fontWeight: 700 }}>← Voltar para home</Link></div>
      </div>
    </div>
  )
}

// ============ PRICING ============
function PricingPage() {
  const { user, isPremium } = useAuth()
  const [isDark] = useState(() => localStorage.getItem('youconverter_theme') === 'dark')
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!user) { navigate('/login'); return }
    alert('Integração Stripe/MercadoPago aqui. Por enquanto vou liberar manual no Supabase: UPDATE profiles SET is_premium = true WHERE id = seu_id')
  }

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#09090b' : '#ffffff', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: isDark ? 'white' : '#111' }}>Premium</h1>
        <p style={{ opacity: 0.6, marginTop: 8 }}>Scanner LGPD liberado pra quem paga • Supabase controla tudo</p>
        <div style={{ marginTop: 20, padding: 20, background: isDark ? '#18181b' : 'white', border: '2px solid #5B21B6', borderRadius: 16, maxWidth: 320, margin: '20px auto' }}>
          <div style={{ fontSize: 28, fontWeight: 900 }}>R$19,90/mês</div>
          <div style={{ fontSize: 12, marginTop: 10, lineHeight: 1.6 }}>✓ Scanner LGPD<br/>✓ Futuras ferramentas premium</div>
          <button onClick={handleCheckout} style={{ width: '100%', marginTop: 16, background: '#5B21B6', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontWeight: 900, cursor: 'pointer' }}>{isPremium ? '✅ Você já é Premium' : '🔓 Assinar Premium'}</button>
        </div>
      </div>
    </div>
  )
}

// ICONS (mesmos)
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
  { id: 'merge', name: 'Juntar PDF', desc: 'Junte vários PDFs em um só', customIcon: 'juntarV1' },
  { id: 'split', name: 'Dividir PDF', desc: 'Separe um PDF em vários', customIcon: 'dividirRoxo' },
  { id: 'compress', name: 'Comprimir PDF', desc: 'Reduza o tamanho', customIcon: 'comprimirRoxo' },
  { id: 'jpg2pdf', name: 'JPG para PDF', desc: 'Imagens em PDF', customIcon: 'monalisaRoxo' },
  { id: 'pdf2jpg', name: 'PDF para JPG', desc: 'Extraia imagens', customIcon: 'paletteRoxo' },
  { id: 'rotate', name: 'Girar PDF', desc: 'Gire as páginas', customIcon: 'girarRoxo' },
  { id: 'extract', name: 'Extrair Páginas', desc: 'Extraia só algumas', customIcon: 'extrairRoxo' },
  { id: 'protect', name: 'Proteger PDF', desc: 'Coloque senha', customIcon: 'protegerRoxo' },
  { id: 'unlock', name: 'Desbloquear PDF', desc: 'Remova a senha', customIcon: 'desbloquearRoxo' },
  { id: 'lgpd', name: 'Scanner LGPD', desc: 'Ache CPF/RG/CNPJ', customIcon: 'lgpdRoxo', premium: true, locked: true },
]

function Dashboard() {
  const [activeTool, setActiveTool] = useState('merge')
  const [isMobile, setIsMobile] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('youconverter_theme') === 'dark')
  const navigate = useNavigate()
  const { user, isPremium, logout } = useAuth()

  useEffect(() => { localStorage.setItem('youconverter_theme', isDark? 'dark' : 'light') }, [isDark])
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleToolClick = (t) => {
    if (t.id === 'lgpd') {
      if (!user) { navigate('/login'); return }
      if (!isPremium) { navigate('/pricing'); return }
      navigate('/scanner-lgpd'); return
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
        if (!isPremium) {
          return (
            <div style={{textAlign:'center', padding:'40px 20px'}}>
              <h2 style={{fontWeight:900}}>Scanner LGPD é Premium</h2>
              <p style={{opacity:0.6, fontSize:13, marginTop:8}}>Login com Google + plano Premium via Supabase</p>
              <button onClick={() => navigate('/pricing')} style={{marginTop:16, background:'#5B21B6', color:'white', padding:'10px 20px', borderRadius:10, border:'none', fontWeight:800}}>💳 Ver planos</button>
            </div>
          )
        }
        navigate('/scanner-lgpd'); return null
      default: return null
    }
  }

  const PURPLE = '#5B21B6'
  const ICON_SIZE = isMobile? 28 : 36

  if (!supabaseUrl || !supabaseAnonKey) {
    return (
      <div style={{ minHeight: '100vh', padding: 40, fontFamily: 'Inter, sans-serif', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontWeight: 900, fontSize: 24 }}>⚠️ Configure o .env - sem isso fica branco</h1>
        <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', padding: 20, borderRadius: 12, marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>
          Seu <b>frontend/.env</b> não está sendo lido. Crie/edite com:<br/><br/>
          <code style={{ background: 'white', padding: '12px 14px', borderRadius: 8, display: 'block', fontSize: 12 }}>
            VITE_SUPABASE_URL=https://xxxx.supabase.co<br/>
            VITE_SUPABASE_ANON_KEY=sb_publishable_ou_eyJ...<br/>
            VITE_SITE_URL=http://localhost:7132
          </code>
          <br/>Depois:<br/>
          1. Salve o arquivo<br/>
          2. <b>taskkill /F /IM node.exe</b><br/>
          3. <b>npm run dev -- --port 7132 --host</b><br/><br/>
          URL atual: {String(supabaseUrl)}<br/>Key: {supabaseAnonKey ? 'presente ('+supabaseAnonKey.slice(0,15)+'...)' : 'FALTANDO'}
        </div>
      </div>
    )
  }

  return (
    <div style={{minHeight:'100vh', background: isDark? '#0f0f0f' : '#ffffff', color: isDark? '#f3f4f6' : '#111827', display:'flex', flexDirection:'column'}}>
      <header style={{borderBottom: isDark? '1px solid #27272a' : '1px solid #f3f4f6', background: isDark? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:20}}>
        <div style={{maxWidth:'1400px', margin:'0 auto', padding: '12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Logo isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {user ? (
              <>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{user.email}</span>
                {isPremium && <span style={{ background: '#10b981', color: 'white', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 99 }}>PRO</span>}
                <button onClick={logout} style={{ fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Sair</button>
              </>
            ) : (
              <Link to="/login" style={{ background: '#111', color: 'white', padding: '9px 18px', borderRadius: 10, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>Entrar com Google (Supabase)</Link>
            )}
          </div>
        </div>
      </header>
      <div style={{flex:1, maxWidth:'1400px', margin:'0 auto', width:'100%', padding: '0 32px'}}>
        <div style={{textAlign:'center', paddingTop: '32px', paddingBottom:'16px'}}>
          <h1 style={{fontSize:'clamp(28px, 4vw, 46px)', fontWeight:'900'}}>Todas as ferramentas de PDF que você precisa.</h1>
          <p style={{opacity:0.6, marginTop:12}}>{isPremium ? '✅ Premium liberado via Supabase' : 'Login com Google via Supabase • Scanner LGPD é Premium'}</p>
        </div>
        <div style={{display:'grid', gridTemplateColumns: isMobile? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginTop: '24px'}}>
          {TOOLS.map(t => {
            const isLocked = t.locked && !isPremium
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
              return null
            }
            return (
              <div key={t.id} onClick={() => handleToolClick(t)} style={{border: '1px solid #e5e7eb', background: 'white', borderRadius:'16px', padding:'16px 14px', cursor:'pointer', position:'relative'}}>
                {isLocked && <div style={{position:'absolute', top:6, right:6, background:'#ef4444', color:'white', fontSize:'8px', fontWeight:900, padding:'2px 6px', borderRadius:'6px'}}>{user ? '💳 PREMIUM' : '🔒 LOGIN'}</div>}
                <div style={{ width: ICON_SIZE, height: ICON_SIZE }}>{getIcon()}</div>
                <div style={{fontWeight:'700', marginTop:'10px'}}>{t.name}</div>
                <div style={{fontSize:'12px', opacity:0.6}}>{t.desc}</div>
              </div>
            )
          })}
        </div>
        <div style={{marginTop:32, background:'white', border:'1px solid #e5e7eb', borderRadius:16, padding:22}}>
          <Suspense fallback={<div>Carregando...</div>}>{renderTool()}</Suspense>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/scanner-lgpd" element={
            <ProtectedRoute needPremium={true}>
              <Suspense fallback={<div style={{padding:60, textAlign:'center'}}>🔒 Carregando Scanner LGPD...</div>}>
                <ScannerLgpdDedicatedPage />
              </Suspense>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
