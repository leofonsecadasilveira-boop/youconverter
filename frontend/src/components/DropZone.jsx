import { useState, useCallback } from 'react'
export default function DropZone({ onFiles, multiple=false, single=false, isDark, hideUI=false, accept=".pdf,.jpg,.jpeg,.png" }) {
  const [dragOver, setDragOver] = useState(false)
  const PURPLE = '#5B21B6'
  const handleDrop = useCallback((e)=>{ e.preventDefault(); setDragOver(false); const files = Array.from(e.dataTransfer.files||[]); if(files.length) onFiles(files) },[onFiles])
  const handleChange = (e)=>{ const files = Array.from(e.target.files||[]); if(files.length) onFiles(files); e.target.value='' }
  return (
    <div onDragOver={e=>{e.preventDefault(); setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onDrop={handleDrop} style={{border:`2px dashed ${PURPLE}`, borderRadius:12, padding:'28px 20px', textAlign:'center', background: isDark ? (dragOver ? '#2a1f3d' : '#18181b') : (dragOver ? '#F5F3FF' : '#fafafa'), cursor:'pointer'}}>
      <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'14px 28px', borderRadius:11, cursor:'pointer', fontWeight:900, fontSize:15, boxShadow:'0 6px 20px rgba(91,33,182,0.5)'}}>Escolher Arquivo<input type="file" accept={accept} multiple={multiple && !single} onChange={handleChange} style={{display:'none'}} /></label>
      <div style={{marginTop:12,fontSize:12,color:isDark?'#a1a1aa':'#6b7280'}}>Arraste um PDF ou clique acima</div>
    </div>
  )
}
