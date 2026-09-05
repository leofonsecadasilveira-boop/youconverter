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
            Junte, divida, comprima e converta em segundos. Feito no Brasil, rápido, seguro e privado.
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

        
        {/* ÁREA COM INSTRUÇÕES LATERAIS - QUADROS INDEPENDENTES COM ALTURA FIXA */}
        <div className="action-area-wrapper" style={{display:'flex', gap:'28px', marginTop:'32px', alignItems:'flex-start'}}>
          
          {/* ESQUERDA - QUADRO FIXO INDEPENDENTE */}
          <div style={{width:'300px', minWidth:'300px', height:'380px', flexShrink:0, position:'sticky', top:'90px'}}>
            <div style={{
              background: isDark? 'linear-gradient(135deg, #1e1e1e 0%, #162030 100%)' : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: isDark? '1px solid #3f3f46' : '1px solid #bfdbfe',
              borderLeft: '4px solid #3b82f6',
              borderRadius:'16px', 
              padding:'24px 20px',
              width:'100%',
              height:'100%',
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              boxSizing:'border-box'
            }}>
              <div style={{width:'48px', height:'48px', borderRadius:'12px', background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px', marginBottom:'14px', boxShadow:'0 4px 12px rgba(59,130,246,0.25)'}}>🔒</div>
              <div style={{fontSize:'16px', fontWeight:'900', marginBottom:'12px', lineHeight:'1.2', color: isDark? 'white' : '#111827'}}>🇧🇷 Feito no Brasil</div>
              <div style={{fontSize:'14.5px', color: isDark? '#d4d4d8' : '#4b5563', lineHeight:'1.6'}}>
                Criado aqui, com <b style={{color: isDark? 'white' : '#111827'}}>privacidade em primeiro lugar</b>. Seus arquivos são apagados automaticamente após o uso. Suporte em português, pensado para a LGPD.
              </div>
              <div style={{marginTop:'16px', fontSize:'11px', fontWeight:'800', letterSpacing:'0.8px', textTransform:'uppercase', color:'#3b82f6'}}>• PRIVADO • SEGURO • BRASILEIRO</div>
            </div>
          </div>

          {/* CENTRO - FERRAMENTA - ALTURA VARIÁVEL */}
          <div style={{flex:1, minWidth:'400px'}}>
            <div style={{background: isDark? '#1f1f1f' : 'white', border: isDark? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius:'16px', padding:'22px', boxShadow: isDark? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.06)', minHeight:'380px', display:'flex', flexDirection:'column'}}>
              <div style={{flex:1}}>
                {renderTool()}
              </div>
            </div>
            <div style={{marginTop:'12px', background: isDark? '#1a1a1a' : '#f9fafb', border: isDark? '1px solid #27272a' : '1px solid #f3f4f6', borderRadius:'10px', padding:'10px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', flexWrap:'wrap', gap:'6px', color: isDark? '#a1a1aa' : '#111'}}>
              <span>🆓 <b>Grátis:</b> 9 ferramentas • Privado e seguro</span>
              <span style={{color:'#a78bfa', fontWeight:'700', cursor:'pointer'}}>Desbloqueie ilimitado por R$19,90/mês →</span>
            </div>
          </div>

          {/* DIREITA - QUADRO FIXO INDEPENDENTE */}
          <div style={{width:'320px', minWidth:'320px', height:'380px', flexShrink:0, position:'sticky', top:'90px'}}>
            <div style={{
              background: isDark? '#1e1e1e' : 'white',
              border: isDark? '1px solid #3f3f46' : '1px solid #e5e7eb',
              borderLeft: '4px solid #f59e0b',
              borderRadius:'16px', 
              padding:'22px 20px',
              width:'100%',
              height:'100%',
              display:'flex',
              flexDirection:'column',
              justifyContent:'center',
              boxSizing:'border-box'
            }}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
                <div style={{width:'28px', height:'28px', borderRadius:'8px', background: isDark? '#78350f' : '#fef3c7', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px'}}>⚡</div>
                <div style={{fontWeight:'800', fontSize:'15px', color: isDark? 'white' : '#111827'}}>Como funciona?</div>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
                <div style={{display:'flex', gap:'12px'}}>
                  <div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:'#7c3aed', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>1</div>
                  <div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Escolha</b> o que quer fazer ali em cima</div>
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                  <div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:'#7c3aed', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>2</div>
                  <div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Arraste</b> seu PDF pra cá ou clique em <b>Escolher Arquivo</b></div>
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                  <div style={{minWidth:'32px', height:'32px', borderRadius:'10px', background:'#10b981', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', fontSize:'13px'}}>3</div>
                  <div style={{fontSize:'13.5px', lineHeight:'1.4', color: isDark? '#d4d4d8' : '#374151'}}><b style={{color: isDark? 'white' : '#111827'}}>Clique</b> no botão roxo e seu arquivo novo <b style={{color:'#10b981'}}>já baixa sozinho</b></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <footer style={{borderTop: isDark? '1px solid #27272a' : '1px solid #f3f4f6', padding:'16px 24px', textAlign:'center', fontSize:'12px', color: isDark? '#52525b' : '#9ca3af'}}>
        © 2026 YouConverter • Feito no Brasil 🇧🇷 • 100% client-side
      </footer>

      <style>{`
       .tool-card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(124,58,237,0.12); }
        @media (max-width: 1200px) {
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
