import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, rgb } from 'pdf-lib'
import Logo from '../components/Logo'
import { Stepper } from '../components/lgpd/Stepper.jsx'
import { PainelFiltros } from '../components/lgpd/PainelFiltros.jsx'
import { ManualPanel } from '../components/lgpd/ManualPanel.jsx'
import { FILTROS_COMPLETOS, FILTROS_DEFAULT, FILTROS_AVANCADOS } from '../constants/filtros.js'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@6.3.289/build/pdf.worker.min.mjs`
const PURPLE = '#5B21B6'
const LIMITE_MB = 6
const LIMITE_PAGINAS = 12

export default function ScannerLgpdPage() {
  const [themeMode, setThemeMode] = useState(()=>localStorage.getItem('lgpd_theme_mode')||'auto')
  const [isDark, setIsDark] = useState(()=>{
    const tm = localStorage.getItem('lgpd_theme_mode')||'auto'
    if(tm==='claro') return false
    if(tm==='escuro') return true
    if(typeof window!=='undefined' && window.matchMedia){
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return localStorage.getItem('youconverter_theme')==='dark'
  })
  const [step, setStep] = useState(1)
  const [modo, setModo] = useState('auto_ajuste')
  const [fileInfo, setFileInfo] = useState(null)
  const [arrayBuffer, setArrayBuffer] = useState(null)
  const [pdfjsDoc, setPdfjsDoc] = useState(null)
  const [filtros, setFiltros] = useState(FILTROS_DEFAULT.map(f=>({...f, active:true})))
  const [advancedEnabled, setAdvancedEnabled] = useState(()=>{ const o={}; FILTROS_AVANCADOS.forEach(f=>o[f.id]=false); return o })
  const [uiFont, setUiFont] = useState(()=>localStorage.getItem('lgpd_ui_font')||'Inter, sans-serif')
  const [uiSize, setUiSize] = useState(()=>parseInt(localStorage.getItem('lgpd_ui_size')||'12'))
  const [customColors, setCustomColors] = useState(()=>{ try{ return JSON.parse(localStorage.getItem('lgpd_custom_colors')||'[]') }catch{ return [] } })
  const [tarjaColor, setTarjaColor] = useState(()=>localStorage.getItem('lgpd_tarja_color')||'#000000')
  const [uiDensity, setUiDensity] = useState(()=>localStorage.getItem('lgpd_ui_density')||'padrao')
  const [zoomDefault, setZoomDefault] = useState(()=>parseFloat(localStorage.getItem('lgpd_zoom_default')||'1.2'))
  const [previewBg, setPreviewBg] = useState(()=>localStorage.getItem('lgpd_preview_bg')||'#f3f4f6')
  const [showDashed, setShowDashed] = useState(()=>{ const v=localStorage.getItem('lgpd_show_dashed'); return v===null ? true : v==='true' })
  const [confirmRemove, setConfirmRemove] = useState(()=>{ const v=localStorage.getItem('lgpd_confirm_remove'); return v===null ? true : v==='true' })
  const [highContrast, setHighContrast] = useState(()=>localStorage.getItem('lgpd_high_contrast')==='true')
  const [reduceMotion, setReduceMotion] = useState(()=>localStorage.getItem('lgpd_reduce_motion')==='true')
  const [resultados, setResultados] = useState([])
  const [pagesData, setPagesData] = useState([])
  const [pageHeights, setPageHeights] = useState({})
  const [isScanning, setIsScanning] = useState(false)
  const [isTarring, setIsTarring] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [scale, setScale] = useState(()=>parseFloat(localStorage.getItem('lgpd_zoom_default')||'1.2'))
  const [selectedId, setSelectedId] = useState(null)
  const [criarModo, setCriarModo] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(()=>{
    localStorage.setItem('lgpd_theme_mode', themeMode)
    if(themeMode==='claro') setIsDark(false)
    else if(themeMode==='escuro') setIsDark(true)
    else {
      if(typeof window!=='undefined' && window.matchMedia){
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
      }
    }
  },[themeMode])

  useEffect(()=>{
    if(themeMode!=='auto') return
    if(typeof window==='undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e)=>setIsDark(e.matches)
    mq.addEventListener('change', handler)
    return ()=>mq.removeEventListener('change', handler)
  },[themeMode])

  useEffect(()=>{ localStorage.setItem('lgpd_ui_density', uiDensity) },[uiDensity])
  useEffect(()=>{ localStorage.setItem('lgpd_zoom_default', String(zoomDefault)) },[zoomDefault])
  useEffect(()=>{ localStorage.setItem('lgpd_preview_bg', previewBg) },[previewBg])
  useEffect(()=>{ localStorage.setItem('lgpd_show_dashed', String(showDashed)) },[showDashed])
  useEffect(()=>{ localStorage.setItem('lgpd_confirm_remove', String(confirmRemove)) },[confirmRemove])
  useEffect(()=>{ localStorage.setItem('lgpd_high_contrast', String(highContrast)) },[highContrast])
  useEffect(()=>{ localStorage.setItem('lgpd_reduce_motion', String(reduceMotion)) },[reduceMotion])

  const toggleTheme=()=>{ 
    const next = themeMode==='claro' ? 'escuro' : themeMode==='escuro' ? 'auto' : 'claro'
    setThemeMode(next)
  }

  async function onFileSelected(input){
    try{
      const file = input?.target?.files?.[0] || input
      if(!file) return
      if(file.size > LIMITE_MB*1024*1024){ alert(`Limite ${LIMITE_MB}MB`); return }
      setResultados([]); setPdfjsDoc(null)
      const buf = await file.arrayBuffer()
      setArrayBuffer(buf.slice(0))
      const pdf = await pdfjsLib.getDocument({ data: buf.slice(0) }).promise
      if(pdf.numPages > LIMITE_PAGINAS){ alert(`Limite ${LIMITE_PAGINAS} págs`); return }
      setPdfjsDoc(pdf)
      setFileInfo({ name: file.name, pages: pdf.numPages })
      const pData=[]
      const heights={}
      for(let i=1;i<=pdf.numPages;i++){
        const page = await pdf.getPage(i)
        const viewport1 = page.getViewport({ scale: 1 })
        heights[i] = viewport1.height
        const txt = await page.getTextContent()
        const items = txt.items.map(it=>{
          const [vx, vy] = viewport1.convertToViewportPoint(it.transform[4], it.transform[5])
          return { str: it.str, x: vx, y: vy, fontSize: Math.hypot(it.transform[0], it.transform[1])||10, width: it.width }
        })
        pData.push({ pageNum: i, items })
      }
      setPageHeights(heights)
      setPagesData(pData)
      setCurrentPage(1)
      setScale(zoomDefault)
      setStep(2)
    }catch(err){ alert(err.message) }
  }

  function onToggleAdvanced(id){
    setAdvancedEnabled(prev=>{
      const novoValor = !prev[id]
      const novoObj = { ...prev, [id]: novoValor }
      setFiltros(prevFiltros=>{
        const existe = prevFiltros.find(f=>f.id===id)
        if(novoValor){
          if(!existe){
            const filtroObj = FILTROS_AVANCADOS.find(f=>f.id===id) || FILTROS_COMPLETOS.find(f=>f.id===id)
            if(filtroObj) return [...prevFiltros, { ...filtroObj, active: true }]
          } else {
            return prevFiltros.map(f=>f.id===id?{...f, active:true}:f)
          }
        } else {
          if(existe) return prevFiltros.map(f=>f.id===id?{...f, active:false}:f)
        }
        return prevFiltros
      })
      return novoObj
    })
  }

  function onApplyAdvanced(){
    setFiltros(prev=>{
      let novos = [...prev]
      Object.entries(advancedEnabled).forEach(([id, enabled])=>{
        if(enabled && !novos.some(f=>f.id===id)){
          const f = FILTROS_AVANCADOS.find(x=>x.id===id)
          if(f) novos.push({ ...f, active: true })
        }
      })
      return novos
    })
  }

  function getAtivos(){ return filtros.filter(f=>f.active) }

  async function executarScan(){
    const ativos = getAtivos()
    if(!ativos.length){ alert('Selecione filtro'); return [] }
    setIsScanning(true)
    const res=[]
    for(const pageData of pagesData){
      for(const item of pageData.items){
        if(!item.str||item.str.trim().length<3) continue
        for(const filtro of ativos){
          try{
            const regex = new RegExp(filtro.regex.source, filtro.regex.flags)
            let m
            while((m=regex.exec(item.str))!==null){
              const ratio = m.index / Math.max(item.str.length,1)
              const matchW = (m[0].length / Math.max(item.str.length,1)) * item.width
              const x = item.x + ratio*item.width
              res.push({ id: `${pageData.pageNum}-${filtro.id}-${x}-${item.y}-${Math.random()}`, page: pageData.pageNum, label: filtro.label, valor: m[0], color: filtro.color, checked: true, x, y: item.y, width: matchW, fontSize: item.fontSize })
            }
          }catch(e){}
        }
      }
    }
    setIsScanning(false)
    return res
  }

  async function iniciarModo(){
    if(modo==='manual'){ 
      setResultados([]); 
      setStep(3); 
      setCurrentPage(1); 
      return 
    }
    if(modo==='auto'){
      const achados = await executarScan()
      setResultados(achados)
      if(achados.length>0){
        await aplicarTarjas(achados)
        setStep(3)
      } else {
        alert('Nenhum dado sensível encontrado com os filtros selecionados.')
      }
      return
    }
    const achados = await executarScan()
    setResultados(achados)
    setStep(3)
    setCurrentPage(1)
  }

  async function aplicarTarjas(lista=null){
    const marcados = (lista||resultados).filter(r=>r.checked)
    if(!marcados.length){ alert('Nenhuma tarja'); return }
    try{
      setIsTarring(true)
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const hexToRgb=(hex)=>{ const h=hex.replace('#',''); const b=parseInt(h,16); return { r:((b>>16)&255)/255, g:((b>>8)&255)/255, b:(b&255)/255 } }
      const c = hexToRgb(tarjaColor)
      const grouped={}
      marcados.forEach(r=>{ if(!grouped[r.page]) grouped[r.page]=[]; grouped[r.page].push(r) })
      for(const [pageStr, items] of Object.entries(grouped)){
        const page = pages[parseInt(pageStr)-1]
        const H = pageHeights[parseInt(pageStr)] || page.getSize().height
        items.forEach(it=>{
          const h = Math.max(5, Math.min(9, it.fontSize*0.70))
          const padX = 3
          const padY = 1
          const H = pageHeights[parseInt(pageStr)] || page.getSize().height
          page.drawRectangle({ x: it.x - padX, y: H - it.y - h*0.25 - padY, width: it.width + padX*2, height: h + padY*2, color: rgb(c.r,c.g,c.b), opacity: 1 })
        })
      }
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a=document.createElement('a'); a.href=url; a.download=`tarjado_${fileInfo.name}`; a.click(); URL.revokeObjectURL(url)
      setIsTarring(false)
    }catch(e){ alert(e.message); setIsTarring(false) }
  }

  const densityPad = uiDensity==='compacta' ? '10px 12px' : uiDensity==='confortavel' ? '22px 18px' : '16px 14px'

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: isDark?'#09090b':'#ffffff', 
      color: isDark?'#e5e7eb':'#111827', 
      fontFamily: uiFont, 
      fontSize: uiSize,
      filter: highContrast ? 'contrast(1.15)' : 'none',
      transition: reduceMotion ? 'none' : 'all 0.2s'
    }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: isDark?'#09090b':'#ffffff', borderBottom: isDark? '1px solid #1f1f23' : '1px solid #e5e7eb', padding: '14px 20px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}><Logo isDark={isDark} onToggle={toggleTheme} /><div style={{ marginTop: 12 }}><Link to="/" style={{ fontSize: 12, fontWeight: 800, color: isDark ? '#a78bfa' : '#5B21B6', background: isDark ? '#1f1f23' : '#f5f3ff', padding: '7px 12px', borderRadius: 99, textDecoration: 'none', border: isDark ? '1px solid #27272a' : 'none' }}>← Voltar</Link></div></div>
      </header>
      <section style={{ maxWidth: uiDensity==='compacta' ? 1400 : 1320, margin: '0 auto', padding: densityPad }}>
        <Stepper step={step} isDark={isDark} isScanning={isScanning} isTarring={isTarring} />
        <div style={{ background: isDark ? '#18181b' : '#ffffff', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 16, padding: 14 }}>
          {step===1 && (
            <div onDragOver={e=>e.preventDefault()} onDrop={e=>{ e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) onFileSelected(f) }} style={{ border: `2px dashed ${isDark ? '#7c3aed' : PURPLE}`, background: isDark ? '#1f1f23' : '#faf5ff', borderRadius: 14, padding: 28, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} onClick={()=>fileInputRef.current?.click()}>
              <div style={{ fontSize: 32, filter: isDark ? 'brightness(1.2)' : 'none' }}>📄</div>
              <div style={{ fontWeight: 900, fontSize: 15, color: isDark ? '#f3f4f6' : '#111827', marginTop: 6 }}>Clique aqui ou Arraste um arquivo PDF</div>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 6, color: isDark ? '#a1a1aa' : '#6b7280' }}>Até {LIMITE_MB}MB • Máx {LIMITE_PAGINAS} páginas • Seguro e local</div>
              <input ref={fileInputRef} type="file" accept=".pdf" hidden onChange={onFileSelected} />
            </div>
          )}
          {step===2 && fileInfo && (
            <div>
              <div style={{ background: isDark ? '#1f1f23' : '#f9fafb', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 800, fontSize: 13, color: isDark ? '#f3f4f6' : '#111827' }}>📎 {fileInfo.name}</div><div style={{ fontSize: 11, opacity: 0.7, color: isDark ? '#a1a1aa' : '#6b7280' }}>{fileInfo.pages} pág • {getAtivos().length} filtros ativos</div></div>
                <button onClick={()=>{ setFileInfo(null); setStep(1) }} style={{ border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb', background: isDark ? '#27272a' : 'white', color: isDark ? '#e5e7eb' : '#111', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}>Trocar PDF</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                <button onClick={()=>setModo('auto')} style={{ textAlign: 'left', padding: '12px', borderRadius: 12, border: modo==='auto'?`2px solid ${PURPLE}`: isDark?`1px solid #27272a`:`1px solid #e5e7eb`, background: modo==='auto'?(isDark?'#2a1f3d':'#f5f3ff'):(isDark?'#1f1f23':'white'), cursor: 'pointer', color: isDark?'#e5e7eb':'#111827', transition: 'all 0.15s' }}><div style={{ fontWeight: 900, fontSize: 12 }}>⚡ Automático</div><div style={{ fontSize: 10, opacity: 0.6 }}>Aplica e baixa direto</div></button>
                <button onClick={()=>setModo('manual')} style={{ textAlign: 'left', padding: '12px', borderRadius: 12, border: modo==='manual'?`2px solid ${PURPLE}`: isDark?`1px solid #27272a`:`1px solid #e5e7eb`, background: modo==='manual'?(isDark?'#2a1f3d':'#f5f3ff'):(isDark?'#1f1f23':'white'), cursor: 'pointer', color: isDark?'#e5e7eb':'#111827', transition: 'all 0.15s' }}><div style={{ fontWeight: 900, fontSize: 12 }}>✏ Manual</div><div style={{ fontSize: 10, opacity: 0.6 }}>Você cria tarjas clicando</div></button>
                <button onClick={()=>setModo('auto_ajuste')} style={{ textAlign: 'left', padding: '12px', borderRadius: 12, border: modo==='auto_ajuste'?`2px solid ${PURPLE}`: isDark?`1px solid #27272a`:`1px solid #e5e7eb`, background: modo==='auto_ajuste'?(isDark?'#2a1f3d':'#f5f3ff'):(isDark?'#1f1f23':'white'), cursor: 'pointer', color: isDark?'#e5e7eb':'#111827', transition: 'all 0.15s' }}><div style={{ fontWeight: 900, fontSize: 12 }}>🔧 Auto + Ajuste</div><div style={{ fontSize: 10, opacity: 0.6 }}>Auto + você ajusta antes</div></button>
              </div>
              <PainelFiltros 
                filtros={filtros} 
                isDark={isDark} 
                onToggleFiltro={id=>setFiltros(p=>p.map(f=>f.id===id?{...f, active:!f.active}:f))} 
                onSelecionarTodos={()=>setFiltros(p=>p.map(f=>({...f, active:true})))} 
                onLimparTodos={()=>setFiltros(p=>p.map(f=>({...f, active:false})))} 
                onTrocarModo={()=>setModo(m=>m==='auto'?'manual':m==='manual'?'auto_ajuste':'auto')} 
                advancedEnabled={advancedEnabled} 
                onToggleAdvanced={onToggleAdvanced} 
                onApplyAdvanced={onApplyAdvanced} 
                uiFont={uiFont} setUiFont={setUiFont} 
                uiSize={uiSize} setUiSize={setUiSize} 
                customColors={customColors} setCustomColors={setCustomColors} 
                tarjaColor={tarjaColor} setTarjaColor={setTarjaColor}
                themeMode={themeMode} setThemeMode={setThemeMode}
                uiDensity={uiDensity} setUiDensity={setUiDensity}
                zoomDefault={zoomDefault} setZoomDefault={setZoomDefault}
                previewBg={previewBg} setPreviewBg={setPreviewBg}
                showDashed={showDashed} setShowDashed={setShowDashed}
                confirmRemove={confirmRemove} setConfirmRemove={setConfirmRemove}
                highContrast={highContrast} setHighContrast={setHighContrast}
                reduceMotion={reduceMotion} setReduceMotion={setReduceMotion}
              />
              <button onClick={iniciarModo} disabled={isScanning} style={{ width: '100%', background: PURPLE, color: 'white', border: 'none', borderRadius: 10, padding: 12, fontWeight: 900, marginTop: 12, cursor: 'pointer' }}>{isScanning?`Escaneando...`:`🔧 Iniciar ${modo} com ${getAtivos().length} filtros`}</button>
            </div>
          )}
          {step===3 && (
            <>
              {modo==='auto' ? (
                <div style={{ background: isDark ? '#052e1f' : '#f0fdf4', border: isDark ? '1.5px solid #065f46' : '1.5px solid #10b981', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 99, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, margin: '0 auto 12px', boxShadow: '0 8px 20px rgba(16,185,129,0.3)' }}>✓</div>
                  <div style={{ fontWeight: 900, fontSize: 16, color: isDark ? '#6ee7b7' : '#065f46' }}>PDF tarjado baixado com sucesso!</div>
                  <div style={{ fontSize: 12, opacity: 0.8, marginTop: 6, lineHeight: 1.4, color: isDark ? '#a7f3d0' : undefined }}>
                    {resultados.length} ocorrências encontradas • {resultados.filter(r=>r.checked).length} tarjas aplicadas<br/>
                    Arquivo <b>{fileInfo?.name}</b> salvo como <b>tarjado_{fileInfo?.name}</b>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                    <button onClick={()=>{ setStep(1); setFileInfo(null); setResultados([]); setPdfjsDoc(null) }} style={{ background: isDark ? '#1f1f23' : 'white', border: isDark ? '1px solid #065f46' : '1px solid #d1fae5', color: isDark ? '#e5e7eb' : '#111', borderRadius: 10, padding: '10px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>📄 Novo PDF</button>
                    <button onClick={()=>setStep(2)} style={{ background: PURPLE, color: 'white', border: 'none', borderRadius: 10, padding: '10px 16px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>← Voltar para filtros</button>
                  </div>
                </div>
              ) : (
                <ManualPanel 
                  pdfjsDoc={pdfjsDoc}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  fileInfo={fileInfo}
                  resultados={resultados}
                  setResultados={setResultados}
                  tarjaColor={tarjaColor}
                  setTarjaColor={setTarjaColor}
                  scale={scale}
                  setScale={setScale}
                  criarModo={criarModo}
                  setCriarModo={setCriarModo}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  pagesData={pagesData}
                  isDark={isDark}
                  onOpenConfig={()=>{}}
                  onBack={()=>setStep(2)}
                  onAplicar={aplicarTarjas}
                  totalMarcados={resultados.filter(r=>r.checked).length}
                  isTarring={isTarring}
                  modo={modo}
                  previewBg={previewBg}
                  showDashed={showDashed}
                  confirmRemove={confirmRemove}
                  highContrast={highContrast}
                  reduceMotion={reduceMotion}
                  uiDensity={uiDensity}
                />
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
