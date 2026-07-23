import { Button, IconPlus, IconTrash } from './ui'

/**
 * Editable table bound to an array-of-objects value.
 * columns: [{ key, label, width, type: 'text' | 'select', options?, placeholder? }]
 */
export function DataTable({ columns, rows, onChange, addLabel = 'Add row', emptyRow }) {
  function updateCell(rowIndex, key, val) {
    const next = rows.map((r, i) => (i === rowIndex ? { ...r, [key]: val } : r))
    onChange(next)
  }
  function removeRow(rowIndex) {
    onChange(rows.filter((_, i) => i !== rowIndex))
  }
  function addRow() {
    onChange([...rows, { ...emptyRow, id: crypto.randomUUID() }])
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-5 sm:-mx-7 px-5 sm:px-7">
        <table className="w-full table-fixed border-collapse min-w-[1120px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className="text-left text-xs font-semibold uppercase tracking-wide text-ink-500 border-b border-ink-200 pb-2 pr-3 whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
              <th className="w-10 border-b border-ink-200 pb-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i} className="group">
                {columns.map((col) => (
                  <td key={col.key} className="py-2 pr-3 align-top">
                    {col.type === 'select' ? (
                      <select
                        className="field-select py-1.5"
                        value={row[col.key] ?? ''}
                        onChange={(e) => updateCell(i, col.key, e.target.value)}
                      >
                        <option value="" disabled>
                          {col.placeholder ?? 'Select'}
                        </option>
                        {col.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="field-input py-1.5"
                        value={row[col.key] ?? ''}
                        placeholder={col.placeholder}
                        onChange={(e) => updateCell(i, col.key, e.target.value)}
                      />
                    )}
                  </td>
                ))}
                <td className="py-2 align-top">
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label="Remove row"
                    className="w-8 h-8 grid place-items-center rounded-lg text-ink-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <IconTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="text-sm text-ink-400 italic py-4">No entries yet — add the group's first row below.</p>
      )}
      <Button variant="ghost" className="mt-3 -ml-1" onClick={addRow}>
        <IconPlus /> {addLabel}
      </Button>
    </div>
  )
}
