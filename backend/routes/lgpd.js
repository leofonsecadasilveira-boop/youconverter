import express from 'express'
import multer from 'multer'
import fs from 'fs'
import { createWorker } from 'tesseract.js'

const router = express.Router()
const upload = multer({ dest: 'tmp/', limits: { fileSize: 50 * 1024 * 1024 } })

router.post('/lgpd-scan', upload.single('pdf'), async (req, res) => {
  const path = req.file.path
  try {
    // Aqui fica sua regex SECRETA - nunca vai pro frontend
    const REGEX_PESADA = {
      cpf: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
      cnpj: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
      rg: /\b\d{2}\.\d{3}\.\d{3}-\d{1}\b/g
    }

    const worker = await createWorker('por')
    const { data: { text } } = await worker.recognize(path) // Tesseract no Node lê PDF direto
    await worker.terminate()

    let achados = []
    for (const [tipo, regex] of Object.entries(REGEX_PESADA)) {
      const m = text.match(regex)
      if (m) achados.push(`${tipo.toUpperCase()}: ${m.join(', ')}`)
    }

    res.json({ achados: achados.length? achados : ['Nenhum dado encontrado'] })
  } catch (e) {
    res.status(500).json({ erro: 'Falha OCR' })
  } finally {
    // APAGA EM 30 SEGUNDOS - LGPD compliant
    setTimeout(() => fs.existsSync(path) && fs.unlinkSync(path), 30000)
  }
})

export default router