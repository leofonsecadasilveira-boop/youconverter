export default function PrimaryButton({ children, disabled, loading, onClick, hasFile=true }){
  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading || !hasFile}
      style={{
        marginTop: 16,
        background: '#7C3AED',
        color: '#fff',
        border: 0,
        padding: '14px 24px',
        borderRadius: 12,
        fontWeight: 800,
        fontSize: '15px',
        cursor: (disabled || loading || !hasFile) ? 'not-allowed' : 'pointer',
        width: '100%',
        boxShadow: (disabled || loading || !hasFile) ? 'none' : '0 4px 14px rgba(124,58,237,0.35)',
        opacity: (disabled || loading || !hasFile) ? 0.45 : 1,
        transition: 'all 0.2s'
      }}
    >
      {loading ? 'Processando...' : children}
    </button>
  )
}
