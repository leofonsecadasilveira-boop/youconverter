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
          style={{ height:'28px', width:'auto' }} 
        />
      </button>
    </div>
  )
}