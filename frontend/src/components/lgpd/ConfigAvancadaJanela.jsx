import { useState, useRef, useEffect } from 'react'
import { FILTROS_AVANCADOS } from '../../constants/filtros.js'

const PURPLE = '#5B21B6'
const PURPLE_LIGHT = '#ede9fe'
const PURPLE_BORDER = '#d8b4fe'

const CORES_TARJA = [
  { id: 'preta', label: 'Preta • clássica', value: '#000000', bg: '#000000' },
  { id: 'branca', label: 'Branca • discreta', value: '#ffffff', bg: '#ffffff', borda: true },
  { id: 'roxa', label: 'Roxa • YouConverter', value: '#5B21B6', bg: '#5B21B6' },
  { id: 'fundo', label: 'Lilás claro • suave', value: '#ede9fe', bg: '#ede9fe', borda: true },
  { id: 'vermelha', label: 'Vermelha • alerta', value: '#ef4444', bg: '#ef4444' },
  { id: 'laranja', label: 'Laranja • destaque', value: '#f97316', bg: '#f97316' },
  { id: 'amarela', label: 'Amarela • marca-texto', value: '#eab308', bg: '#eab308' },
  { id: 'verde', label: 'Verde • seguro', value: '#10b981', bg: '#10b981' },
  { id: 'azul', label: 'Azul • confiança', value: '#3b82f6', bg: '#3b82f6' },
  { id: 'rosa', label: 'Rosa • suave', value: '#ec4899', bg: '#ec4899' },
  { id: 'cinza', label: 'Cinza • neutro', value: '#6b7280', bg: '#6b7280' },
  { id: 'marrom', label: 'Marrom • discreto', value: '#92400e', bg: '#92400e' },
]

const FONTES_AGRADAVEIS = [
  { label: 'Inter • Moderna e equilibrada', value: 'Inter, sans-serif' },
  { label: 'Roboto • Clássica Google', value: 'Roboto, sans-serif' },
  { label: 'Open Sans • Leitura fácil e amigável', value: 'Open Sans, sans-serif' },
  { label: 'Lato • Elegante e suave', value: 'Lato, sans-serif' },
  { label: 'Poppins • Arredondada e acolhedora', value: 'Poppins, sans-serif' },
  { label: 'Montserrat • Forte e marcante', value: 'Montserrat, sans-serif' },
  { label: 'Nunito • Suave e redonda', value: 'Nunito, sans-serif' },
  { label: 'Source Sans • Profissional e clara', value: 'Source Sans 3, sans-serif' },
  { label: 'Raleway • Leve e sofisticada', value: 'Raleway, sans-serif' },
  { label: 'Work Sans • Limpa e técnica', value: 'Work Sans, sans-serif' },
  { label: 'Ubuntu • Moderna e humana', value: 'Ubuntu, sans-serif' },
  { label: 'Merriweather • Serif clássica confortável', value: 'Merriweather, serif' },
  { label: 'Playfair • Serif chique e elegante', value: 'Playfair Display, serif' },
  { label: 'Lora • Serif aconchegante', value: 'Lora, serif' },
  { label: 'JetBrains • Técnica e monoespaçada', value: 'JetBrains Mono, monospace' },
  { label: 'Fira Sans • Leve e profissional', value: 'Fira Sans, sans-serif' },
]

const TAMANHOS = [
  { label: '11px • Compacta', value: 11 },
  { label: '12px • Padrão equilibrado', value: 12 },
  { label: '13px • Confortável', value: 13 },
  { label: '14px • Grande e legível', value: 14 },
  { label: '15px • Extra grande', value: 15 },
  { label: '16px • Máxima', value: 16 },
]

const TEMAS = [
  { id: 'claro', label: 'Claro', desc: 'Fundo branco', icon: '☀️' },
  { id: 'escuro', label: 'Escuro', desc: 'Fundo escuro', icon: '🌙' },
  { id: 'auto', label: 'Automático', desc: 'Segue sistema', icon: '💻' },
]

const DENSIDADES = [
  { id: 'compacta', label: 'Compacta', desc: 'Mais conteúdo na tela' },
  { id: 'padrao', label: 'Padrão', desc: 'Equilibrado' },
  { id: 'confortavel', label: 'Confortável', desc: 'Mais espaçado' },
]

const ZOOMS = [
  { label: '80%', value: 0.8 },
  { label: '100%', value: 1.0 },
  { label: '120% • Padrão', value: 1.2 },
  { label: '150% • Grande', value: 1.5 },
]

const PREVIEW_BGS = [
  { label: 'Cinza claro • padrão', value: '#f3f4f6', bg: '#f3f4f6' },
  { label: 'Branco puro', value: '#ffffff', bg: '#ffffff' },
  { label: 'Grafite escuro', value: '#1f1f23', bg: '#1f1f23' },
  { label: 'Azul acinzentado', value: '#e2e8f0', bg: '#e2e8f0' },
  { label: 'Bege suave', value: '#fef3c7', bg: '#fef3c7' },
]

function Toggle({ checked, onChange, isDark }){
  return (
    <button onClick={()=>onChange(!checked)} style={{
      width: 36, height: 20, borderRadius: 99,
      background: checked ? PURPLE : (isDark ? '#3f3f46' : '#e5e7eb'),
      border: `1px solid ${checked ? PURPLE : '#d1d5db'}`,
      position: 'relative', cursor: 'pointer', transition: 'all 0.2s',
      flexShrink: 0
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: 99, background: 'white',
        position: 'absolute', top: 2, left: checked ? 19 : 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all 0.2s'
      }} />
    </button>
  )
}

function Dropdown({ label, value, options, onChange, isDark }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const current = options.find(o => o.value === value) || options[0]

  useEffect(()=>{
    function handleClickOutside(e){
      if(btnRef.current && !btnRef.current.contains(e.target)){
        const dd = document.querySelectorAll('[data-dropdown-list]')
        let inside = false
        dd.forEach(el=>{ if(el.contains(e.target)) inside=true })
        if(!inside) setOpen(false)
      }
    }
    if(open){
      document.addEventListener('mousedown', handleClickOutside)
      return ()=>document.removeEventListener('mousedown', handleClickOutside)
    }
  },[open])

  const toggle = () => {
    if(!open && btnRef.current){
      const rect = btnRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPos({
        top: spaceBelow < 280 ? rect.top - 270 - 8 : rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      })
    }
    setOpen(!open)
  }

  return (
    <div style={{ position: 'relative', flex: 1, zIndex: open ? 10000 : 1 }}>
      <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6, opacity: 0.9, color: isDark ? '#e5e7eb' : '#374151' }}>{label}</div>
      <button ref={btnRef} onClick={toggle} style={{ 
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        background: isDark? '#27272a' : 'white', 
        border: `1.5px solid ${open? PURPLE : isDark? '#3f3f46' : '#d1d5db'}`, 
        borderRadius: 10, padding: '11px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        boxShadow: open ? `0 0 0 3px ${PURPLE}20` : 'none', transition: 'all 0.15s'
      }}>
        <span style={{ fontFamily: label.toLowerCase().includes('fonte') ? value : undefined, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{current.label}</span>
        <span style={{ fontSize: 11, marginLeft: 8, transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>▼</span>
      </button>
      {open && (
        <div data-dropdown-list style={{ 
          position: 'fixed', top: pos.top, left: pos.left, width: pos.width,
          background: isDark? '#1f1f1f' : 'white', 
          border: `1.5px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, 
          borderRadius: 12, maxHeight: 270, overflowY: 'auto', zIndex: 10001,
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        }}>
          {options.map((opt, idx) => (
            <div key={idx} onClick={() => { onChange(opt.value); setOpen(false) }} style={{ 
              padding: '11px 12px', fontSize: 12, cursor: 'pointer', 
              background: opt.value === value? '#f5f3ff' : 'transparent', 
              fontWeight: opt.value === value? 800 : 500, 
              borderBottom: `1px solid ${isDark? '#27272a' : '#f9fafb'}`,
              fontFamily: label.toLowerCase().includes('fonte') ? opt.value : undefined,
              color: isDark ? '#e5e7eb' : '#111',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span>{opt.label}</span>
              {opt.value === value && <span style={{ color: PURPLE, fontWeight: 900 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SecaoQuadrinho({ isDark, titulo, subtitulo, icone, children }){
  return (
    <div style={{ 
      border: `1.5px solid ${PURPLE_BORDER}`, borderRadius: 14, padding: 14,
      background: isDark ? '#1f1f21' : 'white', boxShadow: `0 2px 12px ${PURPLE}0A`
    }}>
      <div style={{ fontWeight: 900, fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 9, borderBottom: `1px dashed ${isDark ? '#3f3f46' : '#e9d5ff'}` }}>
        <span style={{ background: PURPLE_LIGHT, color: PURPLE, padding: '4px 9px', borderRadius: 8, fontSize: 11, fontWeight: 800, border: `1px solid ${PURPLE_BORDER}` }}>{icone}</span>
        <div>
          <div style={{ letterSpacing: '-0.01em' }}>{titulo}</div>
          {subtitulo && <div style={{ fontSize: 10.5, fontWeight: 500, opacity: 0.65, marginTop: 2 }}>{subtitulo}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}

export function ConfigAvancadaJanela({ 
  isDark, isOpen, onClose, 
  advancedEnabled, onToggleAdvanced, 
  uiFont, setUiFont, uiSize, setUiSize, 
  customColors, setCustomColors, tarjaColor, setTarjaColor,
  themeMode, setThemeMode,
  uiDensity, setUiDensity,
  zoomDefault, setZoomDefault,
  previewBg, setPreviewBg,
  showDashed, setShowDashed,
  confirmRemove, setConfirmRemove,
  highContrast, setHighContrast,
  reduceMotion, setReduceMotion
}) {
  const [newColor, setNewColor] = useState('#ff0000')
  const [activeTab, setActiveTab] = useState('tarjas')
  if (!isOpen) return null
  const todasCores = [...CORES_TARJA, ...customColors.map((c,i) => ({ id: 'custom'+i, label: 'Custom', value: c, bg: c }))]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div style={{ 
        width: 860, maxWidth: '96vw', height: 720, minHeight: 720, maxHeight: '90vh',
        background: isDark? '#18181b' : 'white', borderRadius: 20, 
        border: `1.5px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, 
        display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.5)' 
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ height: 5, background: `linear-gradient(90deg, ${PURPLE}, #7c3aed, #ec4899)`, flexShrink: 0 }} />
        
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${isDark? '#27272a' : '#f3f4f6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark? '#1f1f1f' : '#fdfcff', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 19, display: 'flex', gap: 10, alignItems: 'center', letterSpacing: '-0.02em' }}>
              <span style={{ background: `linear-gradient(135deg, ${PURPLE}, #7c3aed)`, color: 'white', width: 36, height: 36, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: `0 4px 12px ${PURPLE}30` }}>⚙</span> 
              Configurações Avançadas
            </div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4, fontWeight: 500 }}>{FILTROS_AVANCADOS.length} filtros inteligentes • {CORES_TARJA.length} cores • Experiência totalmente personalizável</div>
          </div>
          <button onClick={onClose} style={{ background: isDark? '#27272a' : '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 10, width: 40, height: 40, cursor: 'pointer', fontSize: 16, fontWeight: 800 }}>✕</button>
        </div>

        <div style={{ display: 'flex', background: isDark? '#0f0f10' : '#f9fafb', borderBottom: `1px solid ${isDark? '#27272a' : '#e5e7eb'}`, padding: '0 10px', gap: 6, flexShrink: 0 }}>
          <button onClick={()=>setActiveTab('tarjas')} style={{
            flex: 1, padding: '14px 16px', fontSize: 13, fontWeight: 900,
            border: 'none', borderBottom: `3px solid ${activeTab==='tarjas' ? PURPLE : 'transparent'}`,
            background: activeTab==='tarjas' ? (isDark ? '#18181b' : 'white') : 'transparent',
            color: activeTab==='tarjas' ? PURPLE : (isDark ? '#a1a1aa' : '#6b7280'),
            cursor: 'pointer', borderRadius: activeTab==='tarjas' ? '12px 12px 0 0' : '10px', marginTop: 6, transition: 'all 0.15s'
          }}>🎨 Tarjas <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.7, marginLeft: 6 }}>cores, filtros & comportamento</span></button>
          <button onClick={()=>setActiveTab('pagina')} style={{
            flex: 1, padding: '14px 16px', fontSize: 13, fontWeight: 900,
            border: 'none', borderBottom: `3px solid ${activeTab==='pagina' ? PURPLE : 'transparent'}`,
            background: activeTab==='pagina' ? (isDark ? '#18181b' : 'white') : 'transparent',
            color: activeTab==='pagina' ? PURPLE : (isDark ? '#a1a1aa' : '#6b7280'),
            cursor: 'pointer', borderRadius: activeTab==='pagina' ? '12px 12px 0 0' : '10px', marginTop: 6, transition: 'all 0.15s'
          }}>📄 Página <span style={{ fontWeight: 500, fontSize: 11, opacity: 0.7, marginLeft: 6 }}>aparência & acessibilidade</span></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 18 }}>
          
          {activeTab==='tarjas' && (
            <>
              <SecaoQuadrinho isDark={isDark} icone="🔍 1" titulo="Filtros Extras Inteligentes" subtitulo={`${Object.values(advancedEnabled||{}).filter(Boolean).length} ativos • Detecta dados sensíveis que o modo normal não pega`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 8 }}>
                  {FILTROS_AVANCADOS.map(f => {
                    const enabled = !!advancedEnabled[f.id]
                    return (
                      <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 11px', borderRadius: 10, border: enabled? `1.5px solid ${f.color}` : `1px solid ${isDark? '#27272a' : '#e5e7eb'}`, background: enabled? `${f.color}14` : isDark? '#27272a' : '#f9fafb', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <input type="checkbox" checked={enabled} onChange={() => onToggleAdvanced(f.id)} style={{ accentColor: f.color, width: 14, height: 14 }} />
                        <div style={{ width: 9, height: 9, borderRadius: 99, background: f.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, lineHeight: 1.25 }}><div style={{ fontWeight: 800, fontSize: 11 }}>{f.label}</div><div style={{ fontSize: 9.5, opacity: 0.65 }}>{f.desc}</div></div>
                        <div style={{ fontSize: 8, fontWeight: 900, background: enabled? f.color : isDark? '#3f3f46' : '#e5e7eb', color: enabled? 'white' : isDark? '#a1a1aa' : '#6b7280', padding: '3px 7px', borderRadius: 99 }}>{enabled? 'ON' : 'OFF'}</div>
                      </label>
                    )
                  })}
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="🎨 2" titulo="Cores da Tarja" subtitulo={`${todasCores.length} opções • Escolha como suas tarjas vão aparecer no PDF final`}>
                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap', marginBottom: 12 }}>
                  {todasCores.map(c => {
                    const isSel = tarjaColor === c.value
                    return (
                      <button key={c.id+c.value} title={c.label} onClick={() => setTarjaColor && setTarjaColor(c.value)} style={{ width: 38, height: 38, borderRadius: 11, background: c.bg, cursor: 'pointer', border: isSel? `3px solid ${PURPLE}` : `1.5px solid ${c.borda? '#9ca3af' : isDark? '#3f3f46' : '#e5e7eb'}`, boxShadow: isSel? `0 0 0 2px white, 0 0 0 4px ${PURPLE}40` : '0 2px 6px rgba(0,0,0,0.08)', transform: isSel? 'scale(1.1)' : 'scale(1)', transition: 'all 0.15s', position: 'relative' }}>
                        {isSel && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.value === '#ffffff' || c.value === '#ede9fe' || c.value === '#eab308' ? '#111' : 'white', fontSize: 13, fontWeight: 900 }}>✓</span>}
                      </button>
                    )
                  })}
                  {customColors.map((col, i) => (
                    <div key={'custom-div-'+i} style={{ width: 38, height: 38, borderRadius: 11, background: col, border: '1.5px solid #d1d5db', position: 'relative', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                      <button onClick={() => { const n = customColors.filter((_, idx) => idx!== i); setCustomColors(n); localStorage.setItem('lgpd_custom_colors', JSON.stringify(n)) }} style={{ position: 'absolute', top: -7, right: -7, width: 18, height: 18, borderRadius: 99, background: '#ef4444', color: 'white', border: '2px solid white', fontSize: 10, cursor: 'pointer', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: isDark? '#18181b' : '#f9fafb', border: `1px solid ${isDark? '#27272a' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 10px' }}>
                  <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: 38, height: 32, border: 'none', padding: 0, cursor: 'pointer', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 800 }}>Criar cor personalizada</div><div style={{ fontSize: 10, opacity: 0.6 }}>{newColor} • sua cor, seu estilo</div></div>
                  <button onClick={() => { if (!customColors.includes(newColor)) { const n = [...customColors, newColor]; setCustomColors(n); localStorage.setItem('lgpd_custom_colors', JSON.stringify(n)) } }} style={{ background: PURPLE, color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>+ Salvar cor</button>
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="⚙️ 3" titulo="Comportamento das Tarjas" subtitulo="Controle como as tarjas se comportam no preview">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#27272a' : '#f9fafb', border: `1px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div><div style={{ fontWeight: 800, fontSize: 11 }}>Mostrar tarjas desmarcadas (tracejado)</div><div style={{ fontSize: 10, opacity: 0.6 }}>Se desligado, só aparecem as marcadas para aplicar</div></div>
                    <Toggle checked={showDashed} onChange={setShowDashed} isDark={isDark} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#27272a' : '#f9fafb', border: `1px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div><div style={{ fontWeight: 800, fontSize: 11 }}>Confirmar antes de remover</div><div style={{ fontSize: 10, opacity: 0.6 }}>Evita apagar tarja sem querer</div></div>
                    <Toggle checked={confirmRemove} onChange={setConfirmRemove} isDark={isDark} />
                  </div>
                </div>
              </SecaoQuadrinho>
            </>
          )}

          {activeTab==='pagina' && (
            <>
              <SecaoQuadrinho isDark={isDark} icone="✍️ 4" titulo="Tipografia da Ferramenta" subtitulo="Muda a aparência de toda a interface • Mais conforto e personalidade">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <Dropdown label="Fonte da letra • 16 opções agradáveis" value={uiFont} options={FONTES_AGRADAVEIS} onChange={v => { setUiFont(v); localStorage.setItem('lgpd_ui_font', v) }} isDark={isDark} />
                  <Dropdown label="Tamanho da letra" value={uiSize} options={TAMANHOS} onChange={v => { setUiSize(v); localStorage.setItem('lgpd_ui_size', v) }} isDark={isDark} />
                </div>
                <div style={{ marginTop: 14, background: isDark? '#27272a' : 'white', border: `1.5px solid ${PURPLE}25`, borderRadius: 12, padding: '12px 14px', fontFamily: uiFont, fontSize: uiSize }}>
                  <div style={{ fontWeight: 900, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>👁️ Prévia ao vivo da sua escolha</span>
                    <span style={{ background: PURPLE, color: 'white', padding: '3px 8px', borderRadius: 8, fontSize: 10, fontWeight: 800 }}>{uiFont.split(',')[0]} • {uiSize}px</span>
                  </div>
                  <div style={{ marginTop: 8, lineHeight: 1.5 }}>Essa tipografia será aplicada em toda a ferramenta para deixar sua experiência mais agradável e com a sua cara.</div>
                  <div style={{ marginTop: 6, fontSize: Math.max(10, uiSize-2), opacity: 0.65, fontStyle: 'italic' }}>Ex: CPF 123.456.789-00 • E-mail contato@empresa.com • CEP 01310-100 • (11) 98765-4321</div>
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="🌓 5" titulo="Tema da Página" subtitulo="Claro, escuro ou automático • Escolha como você prefere trabalhar">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {TEMAS.map(t=>{
                    const active = themeMode===t.id
                    return (
                      <button key={t.id} onClick={()=>setThemeMode(t.id)} style={{
                        padding: '12px 10px', borderRadius: 10, border: active ? `2px solid ${PURPLE}` : `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
                        background: active ? (isDark ? '#2a1f3d' : '#f5f3ff') : (isDark ? '#27272a' : 'white'),
                        cursor: 'pointer', textAlign: 'left'
                      }}>
                        <div style={{ fontSize: 18 }}>{t.icon}</div>
                        <div style={{ fontWeight: 800, fontSize: 11, marginTop: 4 }}>{t.label}</div>
                        <div style={{ fontSize: 9, opacity: 0.6 }}>{t.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="📐 6" titulo="Densidade e Layout" subtitulo="Quanto de espaço e respiro a interface tem">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {DENSIDADES.map(d=>{
                    const active = uiDensity===d.id
                    return (
                      <button key={d.id} onClick={()=>setUiDensity(d.id)} style={{
                        padding: '10px', borderRadius: 10, border: active ? `2px solid ${PURPLE}` : `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
                        background: active ? (isDark ? '#2a1f3d' : '#f5f3ff') : (isDark ? '#27272a' : 'white'),
                        cursor: 'pointer', textAlign: 'left'
                      }}>
                        <div style={{ fontWeight: 800, fontSize: 11 }}>{d.label}</div>
                        <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{d.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="🔍 7" titulo="Preview do PDF" subtitulo="Zoom padrão e cor de fundo do visualizador">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>Zoom padrão ao abrir</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {ZOOMS.map(z=>{
                        const active = zoomDefault===z.value
                        return (
                          <button key={z.value} onClick={()=>setZoomDefault(z.value)} style={{
                            padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                            border: active ? `2px solid ${PURPLE}` : `1px solid ${isDark ? '#3f3f46' : '#e5e7eb'}`,
                            background: active ? PURPLE : (isDark ? '#27272a' : 'white'),
                            color: active ? 'white' : (isDark ? '#e5e7eb' : '#111'),
                            cursor: 'pointer'
                          }}>{z.label}</button>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 6 }}>Cor de fundo do preview</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {PREVIEW_BGS.map(bg=>{
                        const active = previewBg===bg.value
                        return (
                          <button key={bg.value} onClick={()=>setPreviewBg(bg.value)} title={bg.label} style={{
                            width: 32, height: 32, borderRadius: 8, background: bg.bg,
                            border: active ? `2.5px solid ${PURPLE}` : `1px solid ${isDark ? '#3f3f46' : '#d1d5db'}`,
                            boxShadow: active ? `0 0 0 3px ${PURPLE}20` : 'none',
                            cursor: 'pointer'
                          }} />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </SecaoQuadrinho>

              <SecaoQuadrinho isDark={isDark} icone="♿ 8" titulo="Acessibilidade e Conforto" subtitulo="Deixe a ferramenta mais confortável para uso prolongado">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#27272a' : '#f9fafb', border: `1px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div><div style={{ fontWeight: 800, fontSize: 11 }}>Alto contraste</div><div style={{ fontSize: 10, opacity: 0.6 }}>Bordas mais fortes e tarjas mais visíveis</div></div>
                    <Toggle checked={highContrast} onChange={setHighContrast} isDark={isDark} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark ? '#27272a' : '#f9fafb', border: `1px solid ${isDark? '#3f3f46' : '#e5e7eb'}`, borderRadius: 10, padding: '10px 12px' }}>
                    <div><div style={{ fontWeight: 800, fontSize: 11 }}>Reduzir animações</div><div style={{ fontSize: 10, opacity: 0.6 }}>Menos movimento, mais desempenho</div></div>
                    <Toggle checked={reduceMotion} onChange={setReduceMotion} isDark={isDark} />
                  </div>
                </div>
              </SecaoQuadrinho>

              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '11px 12px', fontSize: 11, display: 'flex', gap: 8, lineHeight: 1.4 }}>
                <span style={{ fontSize: 15 }}>💡</span>
                <div><b>Dica:</b> tema escuro + densidade confortável + fundo grafite é a combinação queridinha para quem passa horas tarjando documentos. Zoom 120% é o equilíbrio perfeito entre visão e performance.</div>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: '14px 20px', borderTop: `1px solid ${isDark? '#27272a' : '#f3f4f6'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: isDark? '#1f1f1f' : '#fafafe', flexShrink: 0 }}>
          <div style={{ fontSize: 11, opacity: 0.7, lineHeight: 1.3 }}>
            <div style={{ fontWeight: 700 }}><b>{Object.values(advancedEnabled||{}).filter(Boolean).length}</b> filtros extras • <b>{todasCores.length}</b> cores • {themeMode} • {uiDensity}</div>
            <div style={{ fontSize: 10 }}>{uiFont.split(',')[0]} • {uiSize}px • zoom {Math.round(zoomDefault*100)}% • YouConverter LGPD</div>
          </div>
          <button onClick={onClose} style={{ background: `linear-gradient(135deg, ${PURPLE}, #7c3aed)`, color: 'white', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 900, fontSize: 13, cursor: 'pointer', boxShadow: `0 6px 16px ${PURPLE}35` }}>✓ Aplicar e Fechar</button>
        </div>
      </div>
    </div>
  )
}
