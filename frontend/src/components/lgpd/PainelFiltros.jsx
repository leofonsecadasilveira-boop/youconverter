import { useState } from 'react'
import { PURPLE } from '../../constants/filtros.js'
import { ConfigAvancadaJanela } from './ConfigAvancadaJanela.jsx'

export function PainelFiltros({ 
  filtros, isDark, onToggleFiltro, onSelecionarTodos, onLimparTodos, onTrocarModo, 
  advancedEnabled, onToggleAdvanced, onApplyAdvanced, 
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
  const [showAdv, setShowAdv] = useState(false)

  function handleCloseAdv(){
    if(onApplyAdvanced) onApplyAdvanced()
    setShowAdv(false)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <h4 style={{ fontWeight: 900, fontSize: 13, margin: 0 }}>Filtros - {filtros.filter(f=>f.active).length} ativos / {filtros.length} tipos</h4>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={onSelecionarTodos} style={{ fontSize: 10, background: isDark ? '#27272a' : '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Todos</button>
          <button onClick={onLimparTodos} style={{ fontSize: 10, background: isDark ? '#27272a' : '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Limpar</button>
          <button onClick={onTrocarModo} style={{ fontSize: 10, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>Trocar modo</button>
          <button onClick={() => setShowAdv(true)} style={{ fontSize: 10, background: PURPLE, color: 'white', border: `1px solid ${PURPLE}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontWeight: 800 }}>⚙️ Config Avançada</button>
        </div>
      </div>
      {showAdv && (
        <ConfigAvancadaJanela 
          isDark={isDark} 
          isOpen={showAdv} 
          onClose={handleCloseAdv} 
          advancedEnabled={advancedEnabled} 
          onToggleAdvanced={onToggleAdvanced} 
          uiFont={uiFont} 
          setUiFont={setUiFont} 
          uiSize={uiSize} 
          setUiSize={setUiSize} 
          customColors={customColors} 
          setCustomColors={setCustomColors}
          tarjaColor={tarjaColor}
          setTarjaColor={setTarjaColor}
          themeMode={themeMode} setThemeMode={setThemeMode}
          uiDensity={uiDensity} setUiDensity={setUiDensity}
          zoomDefault={zoomDefault} setZoomDefault={setZoomDefault}
          previewBg={previewBg} setPreviewBg={setPreviewBg}
          showDashed={showDashed} setShowDashed={setShowDashed}
          confirmRemove={confirmRemove} setConfirmRemove={setConfirmRemove}
          highContrast={highContrast} setHighContrast={setHighContrast}
          reduceMotion={reduceMotion} setReduceMotion={setReduceMotion}
        />
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8, marginBottom: 14 }}>
        {filtros.map(f => (
          <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: f.active ? (isDark ? '#2a1f3d' : '#f5f3ff') : (isDark ? '#1a1a1a' : '#f9fafb'), border: f.active ? `2px solid ${f.color}` : `1px solid ${isDark ? '#27272a' : '#e5e7eb'}`, borderRadius: 10, padding: '8px 10px', cursor: 'pointer' }}>
            <input type="checkbox" checked={f.active} onChange={() => onToggleFiltro(f.id)} style={{ accentColor: f.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 12 }}>{f.label}</div>
              <div style={{ fontSize: 10, opacity: 0.6 }}>{f.desc || f.id}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}
