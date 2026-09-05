export default function Logo({ isDark, onToggle }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
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
            height:'28px', 
            width:'auto',
            // ESSA LINHA FAZ A MÁGICA NO MODO NOTURNO
            filter: isDark ? 'brightness(0) invert(1)' : 'none'
          }} 
        />
      </button>
      <span style={{
        fontSize:'10px',
        fontWeight:700,
        background: isDark ? '#7c3aed' : '#ede9fe',
        color: isDark ? 'white' : '#7c3aed',
        padding:'2px 6px',
        borderRadius:'999px'
      }}>BETA</span>
    </div>
  )
}