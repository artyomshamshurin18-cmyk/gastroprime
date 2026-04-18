import * as fs from 'fs'
import * as path from 'path'

const PDFDocument = require('pdfkit')

const pickFontPath = () => {
  const candidates = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    '/usr/share/fonts/dejavu/DejaVuSans.ttf',
    '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  ]

  return candidates.find(candidate => fs.existsSync(candidate)) || ''
}

const formatMoney = (value: number) => `${Number(value || 0).toLocaleString('ru-RU')} ₸`
const formatDate = (value?: Date | string | null) => value ? new Date(value).toLocaleDateString('ru-RU') : ''

export const renderInvoicePdf = async (invoice: any) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' })
  const fontPath = pickFontPath()
  if (fontPath) {
    doc.font(fontPath)
  }

  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
  })

  doc.fontSize(18).text(`Счет ${invoice.number}`, { align: 'left' })
  doc.moveDown(0.3)
  doc.fontSize(10).text(`Тип: ${invoice.type === 'PREPAYMENT' ? 'Предоплата' : 'За период'}`)
  doc.text(`Дата выставления: ${formatDate(invoice.issueDate)}`)
  if (invoice.periodStart && invoice.periodEnd) {
    doc.text(`Период: ${formatDate(invoice.periodStart)} - ${formatDate(invoice.periodEnd)}`)
  }
  if (invoice.dueDate) {
    doc.text(`Оплатить до: ${formatDate(invoice.dueDate)}`)
  }

  doc.moveDown()
  doc.fontSize(12).text('Поставщик', { underline: true })
  doc.fontSize(10).text(invoice.sellerSnapshotName || '')
  if (invoice.sellerSnapshotAddress) doc.text(invoice.sellerSnapshotAddress)
  if (invoice.sellerSnapshotDetails) doc.text(invoice.sellerSnapshotDetails)

  doc.moveDown()
  doc.fontSize(12).text('Покупатель', { underline: true })
  doc.fontSize(10).text(invoice.buyerSnapshotName || '')
  if (invoice.buyerSnapshotAddress) doc.text(invoice.buyerSnapshotAddress)
  if (invoice.buyerSnapshotDetails) doc.text(invoice.buyerSnapshotDetails)

  doc.moveDown()
  doc.fontSize(12).text('Позиции счета', { underline: true })
  doc.moveDown(0.4)

  const startX = 40
  const cols = [startX, 100, 320, 390, 470]
  let y = doc.y
  const drawRow = (values: string[], header = false) => {
    const height = 18
    if (header) {
      doc.fontSize(10).fillColor('#000').text(values[0], cols[0], y)
      doc.text(values[1], cols[1], y)
      doc.text(values[2], cols[2], y)
      doc.text(values[3], cols[3], y)
      doc.text(values[4], cols[4], y)
    } else {
      doc.fontSize(9).fillColor('#000').text(values[0], cols[0], y)
      doc.text(values[1], cols[1], y)
      doc.text(values[2], cols[2], y)
      doc.text(values[3], cols[3], y)
      doc.text(values[4], cols[4], y)
    }
    y += height
    doc.moveTo(startX, y - 3).lineTo(555, y - 3).strokeColor('#e5e5e5').stroke()
  }

  drawRow(['Дата', 'Описание', 'Сумма', 'Отклонение', 'Итого'], true)
  ;(invoice.lines || []).forEach((line: any) => {
    if (y > 760) {
      doc.addPage()
      if (fontPath) doc.font(fontPath)
      y = 40
      drawRow(['Дата', 'Описание', 'Сумма', 'Отклонение', 'Итого'], true)
    }
    drawRow([
      formatDate(line.date),
      String(line.description || ''),
      formatMoney(line.amount),
      formatMoney(line.deviationAmount),
      formatMoney(line.total),
    ])
  })

  y += 8
  doc.fontSize(11).text(`Подытог: ${formatMoney(invoice.subtotal)}`, 360, y)
  y += 18
  doc.text(`Отклонения: ${formatMoney(invoice.deviationTotal)}`, 360, y)
  y += 18
  doc.fontSize(13).text(`Итого к оплате: ${formatMoney(invoice.total)}`, 320, y)

  if (invoice.comment) {
    y += 28
    doc.fontSize(10).text(`Комментарий: ${invoice.comment}`, startX, y, { width: 500 })
  }

  doc.end()
  return done
}
