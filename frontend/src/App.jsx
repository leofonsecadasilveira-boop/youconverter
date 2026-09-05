import { useState, useEffect } from 'react'
import MergeTool from './components/MergeTool'
import SplitTool from './components/SplitTool'
import CompressTool from './components/CompressTool'
import JpgToPdfTool from './components/JpgToPdfTool'
import PdfToJpgTool from './components/PdfToJpgTool'
import ProtectPdfTool from './components/ProtectPdfTool'
import RotateTool from './components/RotatePdfTool'
import ExtractTool from './components/ExtractPagesTool'
import UnlockTool from './components/UnlockPdfTool'
import Logo from './components/Logo'

// OPÇÃO B: Girar vira primeiro da linha de baixo, Extrair e Proteger trocam
const TOOLS = [
  { id: 'merge', name: 'Juntar PDF', desc: 'Junte vários PDFs em um só', icon: '🔗' },
  { id: 'split', name: 'Dividir PDF', desc: 'Separe um PDF em vários', icon: '✂' },
  { id: 'compress', name: 'Comprimir PDF', desc: 'Reduza o tamanho', icon: '📦' },
  { id: 'jpg2pdf', name: 'JPG para PDF', desc: 'Imagens em PDF', icon: '🖼' },
  { id: 'pdf2jpg', name: 'PDF para JPG', desc: 'Extraia imagens', icon: '🎨' },
  { id: 'rotate', name: 'Girar PDF', desc: 'Gire as páginas', icon: '🔄' },
  { id: 'extract', name: 'Extrair Páginas', desc: 'Extraia só algumas', icon: '📄' },
  { id: 'protect', name: 'Proteger PDF', desc: 'Coloque senha', icon: '🔒' },
  { id: 'unlock', name: 'Desbloquear PDF', desc: 'Remova a senha', icon: '🔓' },
]

export default function App() {
  const [activeTool, setActiveTool] = useState('merge')
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('youconverter_theme')
    if (saved) return saved === 'dark'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    localStorage.setItem('youconverter_theme', isDark? 'dark' : 'light')
  }, [isDark])

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
      default: return null
    }
  }

  return (
    <div style={{minHeight:'100vh', background: isDark? '#0f0f0f' : '#ffffff', fontFamily:'Inter, system-ui, sans-serif', color: isDark? '#f3f4f6' : '#111827', display:'flex', flexDirection:'column', transition:'background.2s, color.2s'}}>
      <header style={{borderBottom: isDark? '1px solid #27272a' : '1px solid #f3f4f6', background: isDark? 'rgba(26,26,26,0.9)' : 'rgba(255,255,255,0.9)', backdropFilter:'blur(12px)', position:'sticky', top:0, zIndex:20}}>
        <div style={{maxWidth:'1400px', margin:'0 auto', padding:'12px 32px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <Logo isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          <nav style={{display:'flex', alignItems:'center', gap:'24px', fontSize:'14px', fontWeight:'500'}}>
            <span style={{cursor:'pointer', opacity:0.8}}>Ferramentas</span>
            <span style={{cursor:'pointer', opacity:0.8}}>Preços</span>
            <span style={{cursor:'pointer', color: isDark? '#a1a1aa' : '#6b7280'}} className="hide-mobile">Entrar</span>
            <button style={{background:'#7c3aed', color:'white', padding:'9px 18px', borderRadius:'10px', border:'none', fontWeight:'700', cursor:'pointer', fontSize:'13px'}}>Começar Grátis</button>
          </nav>
        </div>
      </header>

      <div style={{flex:1, display:'flex', flexDirection:'column', maxWidth:'1400px', margin:'0 auto', width:'100%', padding:'0 32px'}}>
        <div style={{textAlign:'center', paddingTop:'32px', paddingBottom:'16px'}}>
          <h1 style={{fontSize:'clamp(32px, 4vw, 46px)', fontWeight:'900', letterSpacing:'-1.4px', lineHeight:'1.05', maxWidth:'680px', margin:'0 auto', textWrap:'balance'}}>
            Todas as ferramentas de PDF que você precisa.
          </h1>
          <p style={{color: isDark? '#a1a1aa' : '#6b7280', fontSize:'17px', marginTop:'12px', maxWidth:'650px', margin:'12px auto 0'}}>
            Junte, divida, comprima e converta em segundos. Seguro e com servidores no Brasil.
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(210px, 1fr))', gap:'18px', marginTop:'24px'}}>
          {TOOLS.map(t => (
            <div
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              className="tool-card"
              style={{
                border: activeTool===t.id? '2px solid #7c3aed' : (isDark? '1px solid #27272a' : '1px solid #e5e7eb'),
                background: activeTool===t.id? (isDark? '#2a1f3d' : '#f9f7ff') : (isDark? '#1f1f1f' : 'white'),
                borderRadius:'16px',
                padding:'20px 18px',
                cursor: 'pointer',
                transition:'all.18s ease',
                textAlign:'left',
                color: isDark? 'white' : '#111827',
                minHeight:'108px',
                display:'flex',
                flexDirection:'column',
                justifyContent:'center'
              }}
            >
              <div style={{fontSize:'28px'}}>{t.icon}</div>
              <div style={{fontWeight:'700', marginTop:'12px', fontSize:'15.5px', lineHeight:'1.3'}}>{t.name}</div>
              <div style={{fontSize:'12.5px', color: isDark? '#a1a1aa' : '#6b7280', marginTop:'6px', lineHeight:'1.4'}}>{t.desc}</div>
            </div>
          ))}
        </div>

        {/* ÁREA COM INSTRUÇÕES LATERAIS - SÓ DESKTOP */}
        <div className="action-area-wrapper" style={{display:'grid', gridTemplateColumns:'220px 1fr 220px', gap:'24px', marginTop:'32px', alignItems:'start'}}>
          
          {/* ESQUERDA */}
          <div className="side-info" style={{paddingTop:'8px'}}>
            <div style={{background: isDark? '#1a1a1a' : '#f9fafb', border: isDark? '1px solid #27272a' : '1px solid #f3f4f6', borderRadius:'12px', padding:'16px'}}>
              <div style={{fontSize:'13px', fontWeight:'800', marginBottom:'8px'}}>🔒 100% privado e seguro</div>
              <div style={{fontSize:'12.5px', color: isDark? '#a1a1aa' : '#6b7280', lineHeight:'1.5'}}>
                Seus arquivos nunca saem do seu computador. Tudo acontece no seu navegador.
              </div>
            </div>
          </div>

          {/* CENTRO - FERRAMENTA */}
          <div>
            <div style={{background: isDark? '#1f1f1f' : 'white', border: isDark? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius:'16px', padding:'20px', boxShadow: isDark? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)'}}>
              {renderTool()}
            </div>
            <div style={{marginTop:'12px', background: isDark? '#1a1a1a' : '#f9fafb', border: isDark? '1px solid #27272a' : '1px solid #f3f4f6', borderRadius:'10px', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', flexWrap:'wrap', gap:'6px', color: isDark? '#a1a1aa' : '#111'}}>
              <span>🆓 <b>Grátis:</b> 9 ferramentas • 100% no seu PC</span>
              <span style={{color:'#a78bfa', fontWeight:'700', cursor:'pointer'}}>Desbloqueie ilimitado por R$19,90/mês →</span>
            </div>
          </div>

          {/* DIREITA */}
          <div className="side-info" style={{paddingTop:'8px'}}>
            <div style={{background: isDark? '#1a1a1a' : '#f9fafb', border: isDark? '1px solid #27272a' : '1px solid #f3f4f6', borderRadius:'12px', padding:'16px'}}>
              <div style={{fontSize:'13px', fontWeight:'800', marginBottom:'10px'}}>⚡ Como funciona?</div>
              <div style={{display:'flex', flexDirection:'column', gap:'8px', fontSize:'12.5px', color: isDark? '#d4d4d8' : '#374151', lineHeight:'1.4'}}>
                <div><b>1. Escolha</b> o que quer fazer ali em cima</div>
                <div><b>2. Arraste</b> seu PDF pra cá ou clique em <b>Escolher Arquivo</b></div>
                <div><b>3. Clique</b> no botão roxo e seu arquivo novo já baixa sozinho</div>
              </div>
            </div>
          </div>

        </div>

        <div style={{flex:1, minHeight:'24px'}}></div>
      </div>

      <footer style={{borderTop: isDark? '1px solid #27272a' : '1px solid #f3f4f6', padding:'16px 24px', textAlign:'center', fontSize:'12px', color: isDark? '#52525b' : '#9ca3af'}}>
        © 2026 YouConverter • Feito no Brasil 🇧🇷 • 100% client-side
      </footer>

      <style>{`
       .tool-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(124,58,237,0.12); }
        @media (max-width: 1024px) {
         .action-area-wrapper { grid-template-columns: 1fr !important; }
         .side-info { display: none !important; }
        }
        @media (max-width: 768px) {
         .hide-mobile { display: none!important; }
        }
      `}</style>
    </div>
  )
}
