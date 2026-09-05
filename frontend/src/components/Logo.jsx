export default function Logo({ isDark, onToggle }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
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
            height:'34px', 
            width:'auto',
            // ESSA LINHA FAZ A MÁGICA NO MODO NOTURNO
            filter: isDark ? 'brightness(0) invert(1)' : 'none',
            transition:'filter 0.2s, height 0.2s'
          }} 
        />
      </button>
      <span style={{
        fontSize:'10px',
        fontWeight:700,
        background: isDark ? '#5B21B6' : '#ede9fe',
        color: isDark ? 'white' : '#5B21B6',
        padding:'3px 8px',
        borderRadius:'999px'
      }}>BETA</span>
    </div>
  )
}
