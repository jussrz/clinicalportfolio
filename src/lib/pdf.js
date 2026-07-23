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
