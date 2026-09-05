
import { useState, useCallback } from 'react'
export default function DropZone({ onFiles, multiple=false, single=false, isDark, hideUI=false, accept=".pdf,.jpg,.jpeg,.png" }) {
  const [dragOver, setDragOver] = useState(false)
  const PURPLE = '#7C3AED'
  const handleDrop = useCallback((e)=>{
    e.preventDefault(); setDragOver(false)
    const files = Array.from(e.dataTransfer.files||[]).filter(f=> f.type==='application/pdf' || f.type.startsWith('image/') || f.name.match(/\.(pdf|jpg|jpeg|png)$/i))
    if(files.length) onFiles(files)
  },[onFiles])
  const handleChange = (e)=>{
    const files = Array.from(e.target.files||[])
    if(files.length) onFiles(files)
    e.target.value=''
  }
  if (hideUI) {
    return (
      <div 
        onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}}
        onDragLeave={()=>setDragOver(false)}
        onDrop={handleDrop}
        style={{
          position:'fixed', inset:0, 
          background: dragOver ? 'rgba(124,58,237,0.08)' : 'transparent',
          border: dragOver ? `3px dashed ${PURPLE}` : 'none',
          pointerEvents: dragOver ? 'auto' : 'none',
          zIndex:9999, display: dragOver ? 'flex' : 'none',
          alignItems:'center', justifyContent:'center', fontWeight:800, color:PURPLE
        }}
      >Solte os arquivos aqui</div>
    )
  }
  return (
    <div 
      onDragOver={(e)=>{e.preventDefault(); setDragOver(true)}}
      onDragLeave={()=>setDragOver(false)}
      onDrop={handleDrop}
      style={{
        border:`2px dashed ${dragOver?PURPLE:'#7C3AED'}`,
        borderRadius:12,
        padding:'28px 20px',
        textAlign:'center',
        background: isDark ? (dragOver ? '#2a1f3d' : '#18181b') : (dragOver ? '#F5F3FF' : '#fafafa'),
        transition:'all 0.2s',
        cursor:'pointer'
      }}
    >
      <label style={{display:'inline-block', background:PURPLE, color:'#fff', padding:'12px 24px', borderRadius:10, cursor:'pointer', fontWeight:800, fontSize:14, boxShadow:'0 4px 12px rgba(124,58,237,0.3)'}}>
        Escolher Arquivo
        <input type="file" accept={accept} multiple={multiple && !single} onChange={handleChange} style={{display:'none'}} />
      </label>
      <div style={{marginTop:12,fontSize:12,color:isDark?'#a1a1aa':'#6b7280', fontWeight:500}}>
        Arraste um PDF ou clique acima
      </div>
    </div>
  )
}
