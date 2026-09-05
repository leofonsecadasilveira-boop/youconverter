import { useState, useEffect } from 'react'

export default function Logo({ isDark, onToggle }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{display:'flex', alignItems:'center', gap: isMobile ? '6px' : '10px'}}>
      <button 
        onClick={onToggle}
        title="Clique para modo noturno"
        style={{
          background:'transparent',
          border:'none',
          padding:0,
          cursor:'pointer',
          display:'flex',
          alignItems:'center'
        }}
      >
        <img 
          src="/logo.png" 
          alt="YouConverter"
          style={{ 
            height: isMobile ? '24px' : '34px', 
            width:'auto',
            filter: isDark ? 'brightness(0) invert(1)' : 'none',
            transition:'all 0.2s'
          }} 
        />
      </button>
      <span style={{
        fontSize: isMobile ? '8px' : '10px',
        fontWeight:700,
        background: isDark ? '#5B21B6' : '#ede9fe',
        color: isDark ? 'white' : '#5B21B6',
        padding: isMobile ? '2px 5px' : '3px 8px',
        borderRadius:'999px'
      }}>BETA</span>
    </div>
  )
}
