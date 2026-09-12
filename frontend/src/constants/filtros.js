export const PURPLE = '#5B21B6'
export const LIMITE_MB = 6
export const LIMITE_PAGINAS = 12

export const FILTROS_DEFAULT = [
  { id: 'cpf', label: 'CPF', regex: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, active: true, color: '#ef4444' },
  { id: 'cnpj', label: 'CNPJ', regex: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, active: true, color: '#f59e0b' },
  { id: 'rg', label: 'RG', regex: /\b\d{1,2}\.?\d{3}\.?\d{3}-?[\dXx]\b/g, active: true, color: '#8b5cf6' },
  { id: 'email', label: 'E-mail', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, active: true, color: '#3b82f6' },
  { id: 'banco', label: 'Banco', desc: 'Banco/Ag/Conta', regex: /\bBanco:\s*\d{3}\b|\bAg:\s*\d{3,5}-?\d?\b|\bConta:\s*\d{3,8}-?\d?\b/g, active: true, color: '#06b6d4' },
  { id: 'telefone', label: 'Telefone', desc: '(11) 98765-4321', regex: /(?:\+55\s?)?\(?\d{2}\)?\s?(?:9\d{4}|\d{4})[-.\s]?\d{4}/g, active: true, color: '#10b981' },
]

export const FILTROS_AVANCADOS = [
  { id: 'cep', label: 'CEP', desc: '00000-000', regex: /\b\d{5}-?\d{3}\b/g, active: false, color: '#ec4899' },
  { id: 'endereco', label: 'Endereço', desc: 'Rua/Av + nº', regex: /\b(?:Rua|R\.|Avenida|Av\.|Alameda|Travessa|Rodovia)\s+[A-Za-zÀ-ú0-9\s]{2,},?\s*\d{1,5}/gi, active: false, color: '#a855f7' },
  { id: 'cnh', label: 'CNH', desc: '11 dígitos', regex: /\b\d{11}\b/g, active: false, color: '#f97316' },
  { id: 'pis', label: 'PIS/NIS', desc: '000.00000.00-0', regex: /\b\d{3}\.\d{5}\.\d{2}-\d\b/g, active: false, color: '#06b6d4' },
  { id: 'titulo', label: 'Título Eleitor', desc: '12 dígitos', regex: /\b\d{12}\b/g, active: false, color: '#6366f1' },
  { id: 'cartao', label: 'Cartão Crédito', desc: '16 dígitos', regex: /\b(?:\d[ -]*?){13,19}\b/g, active: false, color: '#e11d48' },
  { id: 'placa', label: 'Placa Veículo', desc: 'AAA-1234 / AAA1A23', regex: /\b[A-Z]{3}-?\d{4}\b|\b[A-Z]{3}\d[A-Z]\d{2}\b/g, active: false, color: '#84cc16' },
  { id: 'processo', label: 'Processo CNJ', desc: 'NNNNNNN-DD.AAAA', regex: /\b\d{7}-\d{2}\.\d{4}\.\d{2}\.\d{4}\b/g, active: false, color: '#0ea5e9' },
  { id: 'pix', label: 'PIX Aleatória', desc: 'UUID', regex: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, active: false, color: '#14b8a6' },
  { id: 'cns', label: 'CNS (SUS)', desc: '15 dígitos', regex: /\b[1-3]\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, active: false, color: '#f59e0b' },
  { id: 'chassi', label: 'Chassi/VIN', desc: '17 caracteres', regex: /\b[A-HJ-NPR-Z0-9]{17}\b/g, active: false, color: '#78716c' },
  { id: 'datanasc', label: 'Data Nasc.', desc: 'com contexto Nasc:', regex: /\b(?:Data\s*Nasc|Nascimento|Nasc\.?)\s*[:.]?\s*\d{2}[\/-]\d{2}[\/-]\d{4}/gi, active: false, color: '#db2777' },
]

export const FILTROS_COMPLETOS = [...FILTROS_DEFAULT, ...FILTROS_AVANCADOS]

export const CORES_BASE = [
  { id: 'preta', label: 'Preta', value: '#000000', bg: '#000000' },
  { id: 'branca', label: 'Branca', value: '#ffffff', bg: '#ffffff' },
  { id: 'fundo', label: 'Fundo claro', value: '#ede9fe', bg: '#ede9fe' },
  { id: 'roxa', label: 'Roxa YouConverter', value: '#5B21B6', bg: '#5B21B6' },
]
export const CORES_EXTRAS = [
  { id: 'vermelha', label: 'Vermelha', value: '#ef4444', bg: '#ef4444' },
  { id: 'amarela', label: 'Amarela', value: '#f59e0b', bg: '#f59e0b' },
  { id: 'verde', label: 'Verde', value: '#10b981', bg: '#10b981' },
  { id: 'azul', label: 'Azul', value: '#3b82f6', bg: '#3b82f6' },
  { id: 'rosa', label: 'Rosa', value: '#ec4899', bg: '#ec4899' },
  { id: 'laranja', label: 'Laranja', value: '#f97316', bg: '#f97316' },
]

export const FONTES = [
  { label: 'Inter (padrão)', value: 'Inter, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
]

export const TAMANHOS = [
  { label: '11px - Pequena', value: 11 },
  { label: '12px - Padrão', value: 12 },
  { label: '13px - Média', value: 13 },
  { label: '14px - Grande', value: 14 },
  { label: '15px - Extra', value: 15 },
]
