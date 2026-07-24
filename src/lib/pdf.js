// Prints "Label: value" with the value sitting on a drawn underline, like a
// fill-in-the-blank line on a printed form (blank if there's no value yet).
export function underlinedField(doc, label, value, x, y, lineEndX) {
  doc.setFont('helvetica', 'bold')
  doc.text(label, x, y)
  const valueX = x + doc.getTextWidth(label) + 4
  doc.setFont('helvetica', 'normal')
  if (value) doc.text(String(value), valueX, y - 1)
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.75)
  doc.line(valueX - 2, y + 3, lineEndX, y + 3)
}

// Brand palette (matches src/index.css --color-brand-*), as jsPDF RGB triples.
const BRAND_TEXT = [27, 69, 39] // brand-900
const INK_BODY = [51, 61, 56] // ink-700-ish, near-black but not pure black
const INK_MUTED = [140, 152, 145]
const RULE = [223, 232, 226]

const PAGE_MARGIN_X = 54
const FOOTER_Y_OFFSET = 46

// The same plain, centered letterhead used by every exported document in
// the app (Case Log Census, Selected Case Reflection): bold title, then
// "USM College of Medicine" and the rotation school year, in black — no
// color banner. Drawn once, on page 1 only (matching those other exports).
function drawLetterhead(doc, pageWidth, title) {
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.text(title, pageWidth / 2, 56, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('USM College of Medicine', pageWidth / 2, 72, { align: 'center' })
  doc.text('Clinical Rotation – SY 2026–2027', pageWidth / 2, 86, { align: 'center' })
}

/** A portrait PDF with the app's standard plain letterhead followed by a
 * list of {label, value} question/answer pairs with numbered labels and
 * hairline dividers, and a page-numbered footer. Used by every
 * single-record reflection page (Rotation Overview, Case Presentation,
 * Clinical Skills, Feedback & Action Plan, Group Reflections, Individual
 * Contribution). */
export async function exportPromptsPdf({ title, prompts, filename }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const maxWidth = pageWidth - PAGE_MARGIN_X * 2
  const contentIndent = 24
  let y = 128

  function drawFooter(pageNum, pageCount) {
    doc.setDrawColor(...RULE)
    doc.setLineWidth(0.75)
    doc.line(PAGE_MARGIN_X, pageHeight - FOOTER_Y_OFFSET, pageWidth - PAGE_MARGIN_X, pageHeight - FOOTER_Y_OFFSET)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...INK_MUTED)
    doc.text('Clinical Rotation Portfolio', PAGE_MARGIN_X, pageHeight - FOOTER_Y_OFFSET + 14)
    doc.text(`Page ${pageNum} of ${pageCount}`, pageWidth - PAGE_MARGIN_X, pageHeight - FOOTER_Y_OFFSET + 14, { align: 'right' })
  }

  function ensureRoom(nextLineCount) {
    if (y + nextLineCount * 13.5 > pageHeight - FOOTER_Y_OFFSET - 12) {
      doc.addPage()
      y = 56
    }
  }

  drawLetterhead(doc, pageWidth, title)

  prompts.forEach(({ label, value }, i) => {
    ensureRoom(2)

    // Font must be set before splitTextToSize (it measures with the active
    // font), and ensureRoom must run before anything is drawn — otherwise a
    // page break lands between two doc.text calls and strands the number
    // from its label.
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    const numLines = doc.splitTextToSize(`${i + 1}.`, contentIndent)
    const labelLines = doc.splitTextToSize(label, maxWidth - contentIndent)
    ensureRoom(labelLines.length)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(...BRAND_TEXT)
    doc.text(numLines, PAGE_MARGIN_X, y)
    doc.text(labelLines, PAGE_MARGIN_X + contentIndent, y)
    y += labelLines.length * 13.5 + 6

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const aLines = doc.splitTextToSize(value || '—', maxWidth - contentIndent)
    ensureRoom(aLines.length)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...INK_BODY)
    doc.text(aLines, PAGE_MARGIN_X + contentIndent, y)
    y += aLines.length * 13.5 + 10

    if (i < prompts.length - 1) {
      doc.setDrawColor(...RULE)
      doc.setLineWidth(0.5)
      doc.line(PAGE_MARGIN_X, y, pageWidth - PAGE_MARGIN_X, y)
      y += 18
    }
  })

  const pageCount = doc.internal.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    drawFooter(p, pageCount)
  }

  doc.save(filename)
}
