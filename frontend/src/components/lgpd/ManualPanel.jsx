
import { useEffect, useRef, useState } from 'react'
import { PURPLE } from '../../constants/filtros.js'

function PaginaPreview({ pdfjsDoc, pageNum, resultados, setResultados, tarjaColor, scale, onWordClick, criarModo, selectedId, setSelectedId, previewBg, showDashed, highContrast, reduceMotion, isDark }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const innerRef = useRef(null)
  const [tarjasPx, setTarjasPx] = useState([])
  const [pageObj, setPageObj] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [viewportSize, setViewportSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    if (!pdfjsDoc || !canvasRef.current) return
    let cancelled = false
    ;(async()=>{
      const page = await pdfjsDoc.getPage(pageNum)
      if(cancelled) return
      setPageObj(page)
      const viewport = page.getViewport({ scale })
      setViewportSize({ w: viewport.width, h: viewport.height })
      const canvas = canvasRef.current
      const dpr = window.devicePixelRatio || 1
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr
      canvas.style.width = viewport.width + 'px'
      canvas.style.height = viewport.height + 'px'
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      await page.render({ canvasContext: ctx, viewport }).promise
      if(cancelled) return
      
      const resPagina = resultados.filter(r=>r.page===pageNum)
      const pxList = resPagina.map(r=>{
        const h1 = Math.max(5, Math.min(9, r.fontSize * 0.70))
        const padX = 3
        const padY = 1
        const pxH = (h1 + padY*2) * scale
        const pxW = (r.width + padX*2) * scale
        const pxX = (r.x - padX) * scale
        const pxY = (r.y - h1 * 0.75 - padY) * scale
        return { ...r, pxX, pxY, pxW, pxH, h1 }
      })
      setTarjasPx(pxList)
    })()
    return ()=>{ cancelled=true }
  }, [pdfjsDoc, pageNum, scale, resultados])

  const handleCanvasClick = (e) => {
    if(!criarModo || !onWordClick) return
    if(dragging) return
    // FIX: usa o rect do canvas/inner, não do container externo com flex center
    const canvas = canvasRef.current
    if(!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    onWordClick(pageNum, x, y, pageObj, scale)
  }

  const handleTarjaMouseDown = (e, r) => {
    e.stopPropagation()
    setSelectedId(r.id)
    setDragging({
      id: r.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      origX: r.x,
      origY: r.y,
    })
  }

  useEffect(()=>{
    function onMouseMove(e){
      if(!dragging) return
      const dxClient = e.clientX - dragging.startClientX
      const dyClient = e.clientY - dragging.startClientY
      const dxScale1 = dxClient / scale
      const dyScale1 = dyClient / scale
      const newX = dragging.origX + dxScale1
      const newY = dragging.origY + dyScale1
      setResultados(prev=>prev.map(it=> it.id===dragging.id ? { ...it, x: newX, y: newY } : it))
    }
    function onMouseUp(){
      setDragging(null)
    }
    if(dragging){
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
      return ()=>{
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('mouseup', onMouseUp)
      }
    }
  }, [dragging, scale, setResultados])

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: 'white', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: isDark ? '#18181b' : '#f9fafb', padding: '6px 10px', fontSize: 11, fontWeight: 800, display: 'flex', justifyContent: 'space-between', flexShrink: 0, color: isDark ? '#e5e7eb' : '#111', borderBottom: isDark ? '1px solid #27272a' : '1px solid #e5e7eb' }}>
        <span>Pág {pageNum}</span>
        <span>{tarjasPx.length} tarjas • {Math.round(scale*100)}% • WYSIWYG</span>
      </div>
      <div ref={containerRef} style={{ 
        position: 'relative', 
        cursor: dragging ? 'grabbing' : criarModo?'crosshair':'default', 
        userSelect: 'none',
        overflow: 'auto',
        width: '100%',
        background: previewBg || '#f3f4f6',
        display: 'flex',
        justifyContent: 'center',
        padding: 8
      }}>
        <div ref={innerRef} onClick={handleCanvasClick} style={{ position: 'relative', width: viewportSize.w + 'px', height: viewportSize.h + 'px', flexShrink: 0, background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', cursor: criarModo?'crosshair':'default' }}>
          <canvas ref={canvasRef} style={{ display: 'block' }} />
          {tarjasPx.map(r=>{
            const isSel = selectedId===r.id
            if(!r.checked && !showDashed) return null
            return (
              <div 
                key={r.id} 
                onMouseDown={(e)=>handleTarjaMouseDown(e, r)}
                onClick={(e)=>{ e.stopPropagation(); setSelectedId(r.id) }} 
                style={{ 
                  position: 'absolute', 
                  left: r.pxX, 
                  top: r.pxY, 
                  width: r.pxW, 
                  height: r.pxH, 
                  background: r.checked ? tarjaColor : 'transparent', 
                  border: isSel ? (highContrast ? '3.5px solid #f59e0b' : '2.5px solid #f59e0b') : r.checked ? (highContrast ? `2px solid ${tarjaColor}` : `1px solid ${tarjaColor}`) : (highContrast ? `2px dashed ${r.color}` : `1.5px dashed ${r.color}`), 
                  opacity: r.checked ? (isSel ? 1 : 0.96) : 0.5, 
                  borderRadius: 1, 
                  cursor: dragging?.id===r.id ? 'grabbing' : 'grab',
                  boxShadow: isSel ? (highContrast ? '0 0 0 4px rgba(245,158,11,0.5)' : '0 0 0 3px rgba(245,158,11,0.3)') : 'none',
                  transition: reduceMotion || dragging?.id===r.id ? 'none' : 'box-shadow 0.15s, transform 0.15s',
                  boxSizing: 'border-box'
                }} 
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ManualPanel({ 
  pdfjsDoc, 
  currentPage, 
  setCurrentPage, 
  fileInfo, 
  resultados, 
  setResultados,
  tarjaColor, 
  setTarjaColor,
  scale, 
  setScale, 
  criarModo, 
  setCriarModo, 
  selectedId, 
  setSelectedId,
  pagesData,
  isDark,
  onOpenConfig,
  onBack,
  onAplicar,
  totalMarcados,
  isTarring,
  modo,
  previewBg,
  showDashed,
  confirmRemove,
  highContrast,
  reduceMotion,
  uiDensity
}) {
  const todasCores = [
    { id: 'preta', label: 'Preta', value: '#000000', bg: '#000000' },
    { id: 'branca', label: 'Branca', value: '#ffffff', bg: '#ffffff' },
    { id: 'roxa', label: 'Roxa', value: '#5B21B6', bg: '#5B21B6' },
  ]

  function handleWordClick(pageNum, x1, y1){
    const pageData = pagesData.find(p=>p.pageNum===pageNum)
    if(!pageData) return

    // Helper para medir texto proporcionalmente (mais preciso que charW fixo)
    const measureRatio = (fullStr, targetStr, fullWidth) => {
      try{
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        // usa fontSize aproximado para proporção
        ctx.font = `400 12px sans-serif`
        const fullM = ctx.measureText(fullStr).width || fullStr.length
        const targetM = ctx.measureText(targetStr).width || targetStr.length
        const ratio = targetM / Math.max(fullM, 1)
        return fullWidth * ratio
      }catch{
        return (targetStr.length / Math.max(fullStr.length, 1)) * fullWidth
      }
    }

    let bestInside = null
    let bestInsideDist = Infinity

    for(const it of pageData.items){
      if(!it.str.trim()) continue
      const left = it.x
      const right = it.x + it.width
      // bounding box mais justa, cobrindo ascendente e descendente
      const top = it.y - it.fontSize * 0.85
      const bottom = it.y + it.fontSize * 0.35
      const tol = 8
      const inside = x1 >= left - tol && x1 <= right + tol && y1 >= top - tol && y1 <= bottom + tol
      if(inside){
        const cx = left + it.width/2
        const cy = it.y - it.fontSize*0.25
        const dx = cx - x1
        const dy = cy - y1
        const dist = Math.sqrt(dx*dx + dy*dy)
        if(dist < bestInsideDist){
          bestInsideDist = dist
          bestInside = it
        }
      }
    }

    let best = bestInside
    let bestDist = bestInsideDist

    if(!best){
      for(const it of pageData.items){
        if(!it.str.trim()) continue
        const cx = it.x + it.width/2
        const cy = it.y - it.fontSize*0.25
        const dx = cx - x1
        const dy = cy - y1
        const dist = Math.sqrt(dx*dx + dy*dy)
        if(dist < bestDist){
          bestDist = dist
          best = it
        }
      }
    }

    if(best && bestDist < 180){
      let tarjaX = best.x
      let tarjaW = best.width
      let tarjaValor = best.str.trim()

      // Se tem várias palavras, isola a palavra exata clicada
      if(best.str.trim().includes(' ')){
        const fullTrim = best.str.trim()
        const words = fullTrim.split(/\s+/)
        let accX = best.x
        let closestWord = null
        let closestDist = Infinity
        let closestX = best.x
        let closestW = best.width

        for(let i=0;i<words.length;i++){
          const w = words[i]
          // largura proporcional medida
          const wW = measureRatio(fullTrim, w, best.width)
          const wCenter = accX + wW/2
          const d = Math.abs(wCenter - x1)
          // se clique está dentro da palavra, prioriza
          const isInsideWord = x1 >= accX - 2 && x1 <= accX + wW + 2
          const score = isInsideWord ? d*0.3 : d
          if(score < closestDist){
            closestDist = score
            closestWord = w
            closestX = accX
            closestW = wW
          }
          // espaço
          const spaceW = measureRatio(fullTrim, ' ', best.width)
          accX += wW + spaceW
        }
        if(closestWord){
          tarjaX = closestX
          tarjaW = closestW
          tarjaValor = closestWord
        }
      }

      const novo={
        id: `manual-${Date.now()}-${Math.random()}`,
        page: pageNum,
        label: 'Manual',
        valor: tarjaValor,
        color: '#5B21B6',
        checked: true,
        x: tarjaX,
        y: best.y,
        width: tarjaW,
        fontSize: best.fontSize
      }
      setResultados(prev=>[...prev, novo])
      setSelectedId(novo.id)
    }
  }

  function ajustarLargura(delta){
    if(!selectedId) return
    setResultados(prev=>prev.map(r=>{
      if(r.id!==selectedId) return r
      const novaLargura = Math.max(8, r.width + delta)
      const novoX = r.x - (delta/2)
      return { ...r, width: novaLargura, x: Math.max(0, novoX) }
    }))
  }

  useEffect(()=>{
    function onKey(e){
      if(!selectedId) return
      if(e.key === '+' || e.key === '=' || e.key === 'NumpadAdd'){
        e.preventDefault()
        ajustarLargura(6)
      }
      if(e.key === '-' || e.key === '_' || e.key === 'NumpadSubtract'){
        e.preventDefault()
        ajustarLargura(-6)
      }
      if(e.key === 'Delete' || e.key === 'Backspace'){
        if(document.activeElement?.tagName === 'INPUT') return
        setResultados(prev=>prev.filter(r=>r.id!==selectedId))
        setSelectedId(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=>window.removeEventListener('keydown', onKey)
  }, [selectedId])

  const paginasPreview = [currentPage, currentPage+1].filter(p=>p<= (fileInfo?.pages||0))
  const selecionada = resultados.find(r=>r.id===selectedId)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 10, background: isDark ? '#18181b' : 'white', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 10, padding: '8px' }}>
        <button disabled={currentPage<=1} onClick={()=>setCurrentPage(p=>Math.max(1,p-1))} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: currentPage<=1?'white':'#f3f4f6', fontWeight: 700 }}>◀ Anterior</button>
        <div style={{ padding: '6px 14px', fontSize: 13, fontWeight: 800, background: isDark ? '#27272a' : '#f9fafb', borderRadius: 8, color: isDark ? '#e5e7eb' : '#111' }}>Pág {currentPage} e {currentPage+1} de {fileInfo?.pages}</div>
        <button disabled={currentPage+1>=fileInfo.pages} onClick={()=>setCurrentPage(p=>p+1)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: currentPage+1>=fileInfo.pages?'white':'#f3f4f6', fontWeight: 700 }}>Próxima ▶</button>
      </div>

      <div style={{ background: isDark ? '#18181b' : '#fff', border: isDark ? '1.5px solid #27272a' : '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={()=>setCriarModo(!criarModo)} style={{ background: criarModo?PURPLE:'white', color: criarModo?'white':'#5B21B6', border: `1.5px solid ${criarModo?PURPLE:'#e9d5ff'}`, borderRadius: 20, padding: '6px 14px', fontWeight: 800, fontSize: 11, cursor: 'pointer' }}>➕ Criar Tarja</button>
        <span style={{ width: 1, height: 18, background: isDark ? '#3f3f46' : '#e5e7eb' }} />
        <button onClick={()=>setScale(s=>Math.max(0.8,s-0.2))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontWeight: 800, background: 'white' }}>-</button>
        <button onClick={()=>setScale(s=>Math.min(2.5,s+0.2))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontWeight: 800, background: 'white' }}>+</button>
        <span style={{ fontSize: 10, fontWeight: 800, marginLeft: 4 }}>Zoom {Math.round(scale*100)}%</span>

        <span style={{ width: 1, height: 18, background: isDark ? '#3f3f46' : '#e5e7eb', marginLeft: 6 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: selecionada ? '#fef3c7' : '#f9fafb', border: `1px solid ${selecionada ? '#f59e0b' : '#e5e7eb'}`, borderRadius: 8, padding: '3px 6px', marginLeft: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 800, opacity: selecionada ? 1 : 0.5, marginRight: 2 }}>↔ Tarja:</span>
          <button disabled={!selecionada} onClick={()=>ajustarLargura(-6)} title="Diminuir largura (- no teclado)" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontWeight: 900, background: selecionada ? 'white' : '#f3f4f6', cursor: selecionada ? 'pointer' : 'not-allowed', opacity: selecionada ? 1 : 0.4 }}>−</button>
          <button disabled={!selecionada} onClick={()=>ajustarLargura(6)} title="Aumentar largura (+ no teclado)" style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', fontWeight: 900, background: selecionada ? 'white' : '#f3f4f6', cursor: selecionada ? 'pointer' : 'not-allowed', opacity: selecionada ? 1 : 0.4 }}>+</button>
          {selecionada && <span style={{ fontSize: 9, marginLeft: 4, fontWeight: 700, color: '#92400e' }}>{Math.round(selecionada.width)}px</span>}
        </div>

        <div style={{ display: 'flex', gap: 4, marginLeft: 6, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '4px 6px' }}>
          {todasCores.map(c=><button key={c.id} onClick={()=>setTarjaColor(c.value)} title={c.label} style={{ width: 24, height: 24, borderRadius: 6, background: c.bg, border: tarjaColor===c.value?`2px solid ${PURPLE}`:'1px solid #ddd' }} />)}
        </div>
        <button onClick={onOpenConfig} style={{ marginLeft: 'auto', background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>⚙ Config</button>
        <button onClick={onBack} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 20, padding: '6px 12px', fontSize: 11, fontWeight: 700 }}>← Voltar</button>
      </div>

      {/* VISOR FIXO - espaço sempre reservado, não empurra preview */}
      <div style={{ height: 38, minHeight: 38, maxHeight: 38, marginBottom: 10, position: 'relative' }}>
        <div style={{ 
          position: 'absolute', inset: 0,
          background: selecionada ? '#fffbeb' : '#f9fafb', 
          border: selecionada ? '1px solid #fcd34d' : '1px dashed #e5e7eb', 
          borderRadius: 8, 
          padding: '6px 10px', 
          fontSize: 11, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          transition: 'all 0.15s'
        }}>
          {selecionada ? (
            <>
              <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}><b>Tarja selecionada:</b> {selecionada.valor} • {selecionada.label} • Pág {selecionada.page} • Arraste para mover • Use <b>+ / -</b> ou botões ↔</div>
              <button onClick={()=>{ 
                if(confirmRemove){
                  if(!window.confirm(`Remover tarja "${selecionada?.valor}"?`)) return
                }
                setResultados(prev=>prev.filter(r=>r.id!==selectedId)); setSelectedId(null) 
              }} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 10, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>🗑 Remover</button>
            </>
          ) : (
            <div style={{ opacity: 0.55, fontSize: 11 }}>💡 Clique em uma tarja no preview para selecionar • Arraste para mover • +/- ou ↔ ajusta largura</div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: uiDensity==='compacta' ? 8 : uiDensity==='confortavel' ? 16 : 12, marginBottom: 12 }}>
        {paginasPreview.map(pNum=>(
          <PaginaPreview key={pNum} pdfjsDoc={pdfjsDoc} pageNum={pNum} resultados={resultados} setResultados={setResultados} tarjaColor={tarjaColor} scale={scale} onWordClick={handleWordClick} criarModo={criarModo} selectedId={selectedId} setSelectedId={setSelectedId} previewBg={previewBg} showDashed={showDashed} highContrast={highContrast} reduceMotion={reduceMotion} isDark={isDark} />
        ))}
      </div>

      {/* VISOR FIXO Criar Tarja - não empurra o botão de baixo */}
      <div style={{ height: criarModo ? 34 : 0, minHeight: criarModo ? 34 : 0, maxHeight: criarModo ? 34 : 0, marginBottom: criarModo ? 10 : 0, overflow: 'hidden', transition: 'all 0.2s', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', inset: 0,
          background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: 8, 
          padding: '7px 12px', fontSize: 11, display: 'flex', alignItems: 'center',
          opacity: criarModo ? 1 : 0
        }}>🖱 <b>Criar Tarja WYSIWYG:</b> clique na palavra e a tarja aparece no tamanho exato.</div>
      </div>

      <div style={{ background: isDark ? '#18181b' : '#f9fafb', border: isDark ? '1px solid #27272a' : '1px solid #e5e7eb', borderRadius: 10, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 800 }}>{totalMarcados} tarjas marcadas • {resultados.length} total</div>
        <button onClick={()=>onAplicar()} disabled={isTarring || totalMarcados===0} style={{ background: totalMarcados===0?'#9ca3af':PURPLE, color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 900, fontSize: 12, cursor: totalMarcados===0?'not-allowed':'pointer' }}>{isTarring?'Gerando PDF...':`⬛ Aplicar ${totalMarcados} Tarjas e Baixar PDF`}</button>
      </div>
    </div>
  )
}
