import { useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import MergeTool from './components/MergeTool'
import SplitTool from './components/SplitTool'
import CompressTool from './components/CompressTool'
import Logo from './components/Logo'

const TOOLS = [
  { id: 'merge', name: 'Juntar PDF', desc: 'Junte vários PDFs em um só', icon: '🔗', active: true },
  { id: 'split', name: 'Dividir PDF', desc: 'Separe um PDF em vários', icon: '✂️', active: true },
  { id: 'compress', name: 'Comprimir PDF', desc: 'Reduza o tamanho', icon: '📦', active: true },
  { id: 'jpg2pdf', name: 'JPG para PDF', desc: 'Imagens em PDF', icon: '🖼️', active: false },
  { id: 'pdf2jpg', name: 'PDF para JPG', desc: 'Extraia imagens', icon: '🎨', active: false },
  { id: 'protect', name: 'Proteger PDF', desc: 'Coloque senha', icon: '🔒', active: false },
]

export default function App() {
  const [activeTool, setActiveTool] = useState('merge')

  const renderTool = () => {
    switch(activeTool) {
      case 'merge': return <MergeTool />
      case 'split': return <SplitTool />
      case 'compress': return <CompressTool />
      default: return (
        <div style={{textAlign:'center', padding:'40px', background:'#f9f7ff', borderRadius:'16px', border:'2px dashed #e9d5ff'}}>
          <div style={{fontSize:'32px'}}>🚧</div>
          <h3 style={{marginTop:'10px', fontWeight:'700'}}>Em breve no Pro</h3>
          <p style={{color:'#6b7280', fontSize:'13px'}}>Essa ferramenta será liberada na próxima atualização.</p>
        </div>
      )
    }
  }

  return (
    <div style={{minHeight:'100vh', background:'#ffffff', fontFamily:'Inter, system-ui, sans-serif', color:'#111827', display:'flex', flexDirection:'column'}}>
      {/* HEADER CORRIGIDO - Ferramentas e Preços de volta */}
      <header style={{borderBottom:'1px solid #f3f4f6', background:'rgba(255,255,255,0.95)', backdropFilter:'blur(10px)', flexShrink:0, position:'sticky', top:0, zIndex:10}}>
        <div style={{maxWidth:'1200px', margin:'0 auto', padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <Logo />
            <span style={{background:'#f3e8ff', color:'#7c3aed', fontSize:'10px', fontWeight:'700', padding:'3px 7px', borderRadius:'999px'}}>BETA</span>
          </div>
          <nav style={{display:'flex', alignItems:'center', gap:'22px', fontSize:'14px', fontWeight:'500'}}>
            <span style={{cursor:'pointer'}}>Ferramentas</span>
            <span style={{cursor:'pointer'}}>Preços</span>
            <span style={{cursor:'pointer', color:'#6b7280'}} className="hide-mobile">Entrar</span>
            <button style={{background:'#7c3aed', color:'white', padding:'8px 16px', borderRadius:'10px', border:'none', fontWeight:'700', cursor:'pointer', fontSize:'13px'}}>Começar Grátis</button>
          </nav>
        </div>
      </header>

      <div style={{flex:1, display:'flex', flexDirection:'column', maxWidth:'1200px', margin:'0 auto', width:'100%', padding:'0 24px'}}>
        <div style={{textAlign:'center', paddingTop:'18px', paddingBottom:'10px', flexShrink:0}}>
          <h1 style={{fontSize:'clamp(26px, 4vw, 36px)', fontWeight:'900', letterSpacing:'-1.2px', lineHeight:'1.05', maxWidth:'700px', margin:'0 auto'}}>
            Todas as ferramentas de PDF que você precisa.
          </h1>
          <p style={{color:'#6b7280', fontSize:'14px', marginTop:'8px', maxWidth:'600px', margin:'8px auto 0'}}>
            Junte, divida, comprima e converta em segundos. Seguro e com servidores no Brasil.
          </p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(155px, 1fr))', gap:'10px', marginTop:'14px', flexShrink:0}}>
          {TOOLS.map(t => (
            <div 
              key={t.id}
              onClick={() => t.active && setActiveTool(t.id)}
              style={{
                border: activeTool===t.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                background: activeTool===t.id ? '#f9f7ff' : 'white',
                borderRadius:'12px',
                padding:'12px',
                cursor: t.active ? 'pointer' : 'not-allowed',
                opacity: t.active ? 1 : 0.55,
                transition:'all .15s',
                textAlign:'left'
              }}
            >
              <div style={{fontSize:'18px'}}>{t.icon}</div>
              <div style={{fontWeight:'700', marginTop:'6px', fontSize:'13px'}}>{t.name}</div>
              <div style={{fontSize:'11px', color:'#6b7280', marginTop:'2px', lineHeight:'1.2'}}>{t.desc}</div>
            </div>
          ))}
        </div>

        <div style={{maxWidth:'900px', width:'100%', margin:'16px auto 0', flexShrink:0}}>
          <div style={{background:'white', border:'1px solid #e5e7eb', borderRadius:'16px', padding:'18px', boxShadow:'0 8px 24px rgba(0,0,0,0.04)'}}>
            {renderTool()}
          </div>
          <div style={{marginTop:'10px', background:'#f9fafb', border:'1px solid #f3f4f6', borderRadius:'10px', padding:'8px 14px', display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'12px', flexWrap:'wrap', gap:'6px'}}>
            <span>🆓 <b>Grátis:</b> 2/dia • até 50MB</span>
            <span style={{color:'#7c3aed', fontWeight:'700', cursor:'pointer'}}>Desbloqueie ilimitado por R$19,90/mês →</span>
          </div>
        </div>
        <div style={{flex:1, minHeight:'10px'}}></div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          nav { gap: 12px !important; font-size: 13px !important; }
        }
      `}</style>
      <Analytics />
    </div>
  )
}
