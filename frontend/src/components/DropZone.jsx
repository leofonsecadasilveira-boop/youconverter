import { useState } from 'react'

export default function DropZone({ onFiles, accept = '.pdf', multiple = true }) {
  const [drag, setDrag] = useState(false)
  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => {
        e.preventDefault(); setDrag(false)
        onFiles(Array.from(e.dataTransfer.files))
      }}
      style={{
        border: `2px dashed ${drag ? '#7C3AED' : '#D1D5DB'}`,
        borderRadius: 16,
        padding: 40,
        textAlign: 'center',
        background: drag ? '#F5F3FF' : '#FAFAFA',
        transition: '0.2s',
        cursor: 'pointer'
      }}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        id="fileInput"
        style={{ display: 'none' }}
        onChange={e => onFiles(Array.from(e.target.files))}
      />
      <label htmlFor="fileInput" style={{ cursor: 'pointer', color: '#111827', fontWeight: 600 }}>
        Arraste PDFs aqui ou <span style={{ color: '#7C3AED' }}>clique para selecionar</span>
      </label>
      <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8 }}>PDF até 50MB</p>
    </div>
  )
}