import { PURPLE } from '../../constants/filtros.js'

export function Stepper({ step, isDark, isScanning, isTarring }) {
  const steps = [
    { n: 1, t: 'PDF', d: 'Arquivo', icon: '📄' },
    { n: 2, t: 'Modo', d: 'Escolha', icon: '🎛️' },
    { n: 3, t: 'Aplicar', d: 'Tarjas', icon: '⬛' }
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20, padding: '8px 4px', overflowX: 'auto' }}>
      {steps.map((s, idx) => {
        const isActive = step >= s.n
        const isCurrent = step === s.n
        const isDone = step > s.n
        const isBusy = isCurrent && (isScanning || isTarring)

        return (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: idx === 2 ? '0 0 auto' : 1, minWidth: 0 }}>
            <div style={{
              minWidth: 132,
              padding: '10px 14px',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              position: 'relative',
              background: isDark
                ? (isDone ? 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)' : isCurrent ? 'linear-gradient(135deg, #2e1f4f 0%, #3b2a6b 100%)' : '#1f1f1f')
                : (isDone ? 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)' : isCurrent ? 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)'),
              border: isCurrent
                ? `2px solid ${PURPLE}`
                : isDone
                  ? '1.5px solid #10b981'
                  : `1.2px solid ${isDark ? '#27272a' : isActive ? '#ddd6fe' : '#e5e7eb'}`,
              boxShadow: isCurrent
                ? `0 8px 24px ${PURPLE}22, 0 2px 8px ${PURPLE}18, inset 0 1px 0 rgba(255,255,255,0.6)`
                : isDone
                  ? '0 4px 16px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
                  : isActive
                    ? '0 2px 10px rgba(0,0,0,0.04)'
                    : 'none',
              transform: isCurrent ? 'scale(1.06) translateY(-1px)' : 'scale(1)',
              opacity: isActive ? 1 : 0.5,
              transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              overflow: 'hidden'
            }}>
              {/* brilho no atual */}
              {isCurrent && (
                <div style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  background: `radial-gradient(circle, ${PURPLE}18 0%, transparent 70%)`,
                  pointerEvents: 'none'
                }} />
              )}

              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: isDone ? 14 : 12,
                color: 'white',
                background: isDone
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : isCurrent
                    ? `linear-gradient(135deg, ${PURPLE} 0%, #7c3aed 100%)`
                    : isActive
                      ? `linear-gradient(135deg, ${PURPLE}88, #a78bfa)`
                      : isDark ? '#3f3f46' : '#e5e7eb',
                boxShadow: isDone
                  ? '0 4px 12px rgba(16,185,129,0.3)'
                  : isCurrent
                    ? `0 4px 12px ${PURPLE}40`
                    : 'none',
                position: 'relative',
                flexShrink: 0
              }}>
                {isDone ? '✓' : s.n}
              </div>

              <div style={{ lineHeight: 1.15, minWidth: 0 }}>
                <div style={{
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: '-0.2px',
                  color: isDark ? (isActive ? '#fff' : '#a1a1aa') : (isCurrent ? '#111827' : isDone ? '#065f46' : '#111827'),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <span style={{ fontSize: 11 }}>{s.icon}</span> {s.t}
                </div>
                <div style={{
                  fontSize: 10,
                  opacity: isCurrent ? 0.8 : 0.6,
                  fontWeight: isCurrent ? 700 : 500,
                  marginTop: 1,
                  color: isDone ? '#065f46' : undefined
                }}>
                  {isBusy ? 'Processando...' : s.d}
                </div>
              </div>

              {isBusy && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2.5,
                  background: `linear-gradient(90deg, ${PURPLE}, #7c3aed)`,
                  animation: 'busyBar 1.2s infinite',
                }} />
              )}
            </div>

            {idx < 2 && (
              <div style={{
                flex: 1,
                height: 4,
                margin: '0 10px',
                background: isDark ? '#27272a' : '#f3f4f6',
                borderRadius: 99,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: step > s.n ? '100%' : '0%',
                  background: step > s.n
                    ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                    : `linear-gradient(90deg, ${PURPLE}, #a78bfa)`,
                  borderRadius: 99,
                  transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: step > s.n ? '0 0 8px rgba(16,185,129,0.4)' : 'none'
                }} />
                {step === s.n + 1 && isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: '45%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                    animation: 'shimmerLine 1.3s infinite',
                    borderRadius: 99
                  }} />
                )}
              </div>
            )}
          </div>
        )
      })}
      <style>{`
        @keyframes shimmerLine { 0% { transform: translateX(-100%) } 100% { transform: translateX(300%) } }
        @keyframes busyBar { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
      `}</style>
    </div>
  )
}
