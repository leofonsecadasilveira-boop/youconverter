export default function Logo({ isDark, onToggle }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
      <div style={{width:'44px', height:'44px', background:'#5B21B6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'white', fontSize:'17px', boxShadow:'0 4px 12px rgba(91,33,182,0.4)'}}>YC</div>
      <span style={{fontWeight:'900', fontSize:'23px', letterSpacing:'-0.7px', color: isDark ? '#fff' : '#111827'}}>You<span style={{color:'#5B21B6'}}>C</span>onverter</span>
      <span style={{background:isDark?'#2a1f3d':'#f5f3ff', color:'#5B21B6', fontSize:'10px', fontWeight:'900', padding:'5px 12px', borderRadius:'20px', border:'1px solid #ddd6fe'}}>BETA</span>
      <button onClick={onToggle} style={{marginLeft:'6px', background:isDark?'#27272a':'#f3f4f6', border:'1px solid '+(isDark?'#3f3f46':'#e5e7eb'), borderRadius:'20px', padding:'6px 12px', fontSize:'12px', cursor:'pointer'}}>{isDark?'☀️':'🌙'}</button>
    </div>
  )
}
