export default function Logo({ isDark, onToggle }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
      <span style={{fontWeight:900, fontSize:'22px', color: isDark ? 'white' : '#111'}}>You</span>
      <button 
        onClick={onToggle}
        title="Modo noturno"
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
          alt="C"
          style={{ height:'24px', width:'auto' }} 
        />
      </button>
    </div>
  )
}