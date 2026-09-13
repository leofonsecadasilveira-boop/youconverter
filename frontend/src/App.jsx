import { useState, useEffect, lazy, Suspense, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
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

// ============ SUPABASE CLIENT ============
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ AUTH CONTEXT ============
const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  if (!user) return <Navigate to="/login" replace state={{ from: '/scanner-lgpd', reason: 'login_required' }} />
  if (needPremium && !isPremium) return <Navigate to="/pricing" replace state={{ from: '/scanner-lgpd', reason: 'premium_required' }} />
  return children
}

// ============ LOGIN PAGE ============
function LoginPage() {
  const { loginWithGoogle, user, isPremium } = useAuth()
  const location = useLocation()
  const reason = location.state?.reason
  const [isDark] = useState(() => localStorage.getItem('youconverter_theme') === 'dark')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? '#09090b' : '#f9fafb', padding: 20 }}>
      <div style={{ background: isDark ? '#18181b' : 'white', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 20, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: isDark ? 'white' : '#111' }}>Entre no YouConverter</h1>
        {reason === 'login_required' && (
          <div style={{ marginTop: 12, background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>
            🔐 Scanner LGPD exige login para continuar
          </div>
        )}
        {reason === 'premium_required' && (
          <div style={{ marginTop: 12, background: '#f5f3ff', border: '1.5px solid #ddd6fe', borderRadius: 10, padding: '10px 12px', fontSize: 12, fontWeight: 700 }}>
            💎 Scanner LGPD é Premium mesmo com login
          </div>
        )}
        <p style={{ fontSize: 13, opacity: 0.6, marginTop: 8, color: isDark ? '#a1a1aa' : '#6b7280' }}>Login com Google via Supabase • Grátis</p>
        
        {user ? (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Logado como {user.email} {isPremium && '• PRO'}</div>
            <Link to="/pricing" style={{ display: 'block', marginTop: 12, background: '#5B21B6', color: 'white', padding: '12px', borderRadius: 10, fontWeight: 900, textDecoration: 'none' }}>Ir para Premium 💳</Link>
          </div>
        ) : (
          <button onClick={loginWithGoogle} style={{ width: '100%', marginTop: 20, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ width: 20, height: 20, backgroundImage: 'url(https://www.svgrepo.com/show/475656/google-color.svg)', backgroundSize: 'contain', display: 'block' }} /> Continuar com Google
          </button>
        )}

        <div style={{ marginTop: 16 }}><Link to="/" style={{ fontSize: 12, color: '#5B21B6', fontWeight: 700 }}>← Voltar para home</Link></div>
      </div>
    </div>
  )
}

// ============ PRICING / PAYWALL ============
function PricingPage() {
  const { user, isPremium } = useAuth()
  const [isDark] = useState(() => localStorage.getItem('youconverter_theme') === 'dark')
  const navigate = useNavigate()
  const location = useLocation()
  const reason = location.state?.reason || 'premium_required'

  const handleCheckout = async () => {
    if (!user) { navigate('/login', { state: { reason: 'login_required' } }); return }
    alert('Integração Stripe/MercadoPago aqui. Por enquanto libere manual no Supabase: UPDATE profiles SET is_premium = true WHERE id = ' + user.id)
  }

  return (
    <div style={{ minHeight: '100vh', background: isDark ? '#09090b' : '#ffffff', padding: '24px 16px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', background: '#5B21B6', color: 'white', fontSize: 11, fontWeight: 900, padding: '6px 12px', borderRadius: 99, marginBottom: 12 }}>🔒 FERRAMENTA PREMIUM</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, color: isDark ? 'white' : '#111' }}>Scanner LGPD é Premium</h1>
        <p style={{ opacity: 0.7, marginTop: 8, maxWidth: 500, marginInline: 'auto', lineHeight: 1.5 }}>
          Mesmo logado você precisa de Premium para usar. Essa ferramenta processa CPF, CNPJ, RG e tarja PDFs — é nosso carro-chefe pago.
          <br/><br/>
          {!user ? '1. Faça login com Google. 2. Assine Premium.' : !isPremium ? `Logado como ${user.email} — falta só liberar o Premium.` : 'Você já é Premium!'}
        </p>
        <div style={{ marginTop: 20, padding: 24, background: isDark ? '#18181b' : 'white', border: '2px solid #5B21B6', borderRadius: 16, maxWidth: 360, margin: '20px auto', textAlign: 'left' }}>
          <div style={{ fontSize: 28, fontWeight: 900, textAlign: 'center' }}>R$19,90/mês</div>
          <div style={{ fontSize: 12, opacity: 0.6, textAlign: 'center', marginTop: 4 }}>Cancela quando quiser</div>
          <div style={{ fontSize: 12, marginTop: 16, lineHeight: 1.8 }}>✓ Scanner LGPD ilimitado<br/>✓ 12 filtros avançados<br/>✓ Tarja WYSIWYG<br/>✓ Sem anúncios<br/>✓ Futuras ferramentas premium</div>
          <button onClick={handleCheckout} style={{ width: '100%', marginTop: 16, background: isPremium ? '#10b981' : '#5B21B6', color: 'white', border: 'none', borderRadius: 10, padding: 12, fontWeight: 900, cursor: 'pointer' }}>{isPremium ? '✅ Você já é Premium - Usar Scanner' : !user ? '🔐 Fazer Login e Assinar' : '🔓 Assinar Premium Agora'}</button>
          {isPremium && (
            <button onClick={() => navigate('/scanner-lgpd')} style={{ width: '100%', marginTop: 8, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, padding: 10, fontWeight: 800, cursor: 'pointer' }}>→ Ir para Scanner LGPD</button>
          )}
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Link to="/" style={{ fontSize: 12, fontWeight: 700, color: '#5B21B6' }}>← Voltar</Link>
          {!user && <Link to="/login" style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>Já tenho conta? Entrar</Link>}
        </div>
      </div>
    </div>
  )
}

// ICONS
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
  { id: 'lgpd', name: 'Scanner LGPD', desc: 'Ache CPF/RG/CNPJ • Premium', customIcon: 'lgpdRoxo', premium: true, locked: true },
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
    // REGRA DE OURO: LGPD SEMPRE BLOQUEADO SE NÃO É PREMIUM, MESMO LOGADO
    if (t.id === 'lgpd') {
      if (!user) { navigate('/login', { state: { reason: 'login_required' } }); return }
      if (!isPremium) { navigate('/pricing', { state: { reason: 'premium_required' } }); return }
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
        // Nunca deveria chegar aqui sem premium, mas garante bloqueio
        return (
          <div style={{textAlign:'center', padding:'40px 20px', border: '2px dashed #5B21B6', borderRadius: 16}}>
            <div style={{ fontSize: 32 }}>💎</div>
            <h2 style={{fontWeight:900, marginTop: 8}}>Scanner LGPD é Premium</h2>
            <p style={{opacity:0.7, fontSize:13, marginTop:8, maxWidth: 380, marginInline: 'auto'}}>Mesmo logado você precisa de plano Premium. Ferramenta bloqueada por paywall duplo: login + premium.</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {!user ? <button onClick={() => navigate('/login')} style={{background:'#111', color:'white', padding:'10px 18px', borderRadius:10, border:'none', fontWeight:800}}>🔐 Fazer Login</button> : null}
              <button onClick={() => navigate('/pricing')} style={{background:'#5B21B6', color:'white', padding:'10px 18px', borderRadius:10, border:'none', fontWeight:800}}>💳 Ver planos Premium</button>
            </div>
          </div>
        )
      default: return null
    }
  }

  const PURPLE = '#5B21B6'
  const ICON_SIZE = isMobile? 28 : 36

  return (
    <div style={{minHeight:'100vh', background: isDark? '#0f0f0f' : '#ffffff', color: isDark? '#f3f4f6' : '#111827', display:'flex', flexDirection:'column'}}>
      <header style={{borderBottom: isDark? '1px solid #27272a' : '1px solid #f3f4f6', background: isDark? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:20}}>
        <div style={{maxWidth:'1400px', margin:'0 auto', padding: '12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Logo isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {user ? (
              <>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{user.email}</span>
                {isPremium ? <span style={{ background: '#10b981', color: 'white', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 99 }}>PRO</span> : <span style={{ background: '#f59e0b', color: 'white', fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 99 }}>FREE</span>}
                <button onClick={logout} style={{ fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Sair</button>
              </>
            ) : (
              <Link to="/login" style={{ background: '#111', color: 'white', padding: '9px 18px', borderRadius: 10, fontWeight: 800, fontSize: 12, textDecoration: 'none' }}>Entrar com Google</Link>
            )}
          </div>
        </div>
      </header>
      <div style={{flex:1, maxWidth:'1400px', margin:'0 auto', width:'100%', padding: '0 32px'}}>
        <div style={{textAlign:'center', paddingTop: '32px', paddingBottom:'16px'}}>
          <h1 style={{fontSize:'clamp(28px, 4vw, 46px)', fontWeight:'900'}}>Todas as ferramentas de PDF que você precisa.</h1>
          <p style={{opacity:0.6, marginTop:12}}>
            {user ? (isPremium ? '✅ Premium liberado • Scanner LGPD liberado' : `🔓 Logado como ${user.email} • Scanner LGPD bloqueado (só Premium)`) : 'Faça login • Scanner LGPD é Premium mesmo logado'}
          </p>
        </div>
        <div style={{display:'grid', gridTemplateColumns: isMobile? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(210px, 1fr))', gap: '18px', marginTop: '24px'}}>
          {TOOLS.map(t => {
            const isLocked = t.premium && !isPremium
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
              <div key={t.id} onClick={() => handleToolClick(t)} style={{
                border: isLocked ? `2px solid ${t.id==='lgpd' ? '#5B21B6' : '#e5e7eb'}` : '1px solid #e5e7eb', 
                background: isLocked && t.id==='lgpd' ? 'linear-gradient(135deg, #f5f3ff, white)' : 'white', 
                borderRadius:'16px', padding:'16px 14px', cursor:'pointer', position:'relative',
                opacity: isLocked ? 0.92 : 1,
                boxShadow: isLocked && t.id==='lgpd' ? '0 4px 18px rgba(91,33,182,0.12)' : 'none'
              }}>
                {isLocked && (
                  <div style={{
                    position:'absolute', top:8, right:8, 
                    background: t.id==='lgpd' ? '#5B21B6' : '#ef4444', 
                    color:'white', fontSize:'8px', fontWeight:900, padding:'3px 7px', borderRadius:'99px',
                    display: 'flex', alignItems: 'center', gap: 3
                  }}>
                    {user ? '💎 PREMIUM' : '🔒 LOGIN'}
                  </div>
                )}
                {t.premium && !isPremium && t.id==='lgpd' && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(0.5px)', borderRadius: 16, pointerEvents: 'none' }} />
                )}
                <div style={{ width: ICON_SIZE, height: ICON_SIZE, filter: isLocked && t.id==='lgpd' ? 'grayscale(0.2)' : 'none' }}>{getIcon()}</div>
                <div style={{fontWeight:'800', marginTop:'10px', display: 'flex', alignItems: 'center', gap: 6}}>
                  {t.name} 
                  {t.premium && <span style={{ fontSize: 9, background: isPremium ? '#10b981' : '#5B21B6', color: 'white', padding: '2px 6px', borderRadius: 99, fontWeight: 900 }}>{isPremium ? 'LIBERADO' : 'PREMIUM'}</span>}
                </div>
                <div style={{fontSize:'12px', opacity:0.6, marginTop: 2}}>{t.desc}</div>
                {t.id==='lgpd' && !isPremium && (
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#5B21B6', marginTop: 8 }}>
                    {user ? '🔒 Bloqueado mesmo logado → Assine' : '🔐 Faça login + Assine Premium'}
                  </div>
                )}
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
              <Suspense fallback={<div style={{padding:60, textAlign:'center'}}>🔒 Carregando Scanner LGPD Premium...</div>}>
                <ScannerLgpdDedicatedPage />
              </Suspense>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
