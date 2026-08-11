// Utilidad de exportación a CSV.
// Convierte un array de objetos en un fichero CSV y dispara su descarga en el
// navegador. Se usa desde el panel de admin para exportar datos anonimizados.

// Escapa un valor para CSV: envuelve entre comillas si contiene coma, comillas o
// salto de línea, y duplica las comillas internas (según RFC 4180).
function escapeCell(value) {
  if (value == null) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// Construye el texto CSV a partir de las columnas y las filas.
// `columns` es un array de { key, label }. Cada fila es un objeto.
export function buildCsv(columns, rows) {
  const header = columns.map((col) => escapeCell(col.label)).join(',')
  const body = rows
    .map((row) => columns.map((col) => escapeCell(row[col.key])).join(','))
    .join('\r\n')
  return body ? `${header}\r\n${body}` : header
}

// Genera el CSV y lo descarga con el nombre indicado. Añade un BOM UTF-8 para
// que Excel abra bien los acentos.
export function downloadCsv(filename, columns, rows) {
  const csv = buildCsv(columns, rows)
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
