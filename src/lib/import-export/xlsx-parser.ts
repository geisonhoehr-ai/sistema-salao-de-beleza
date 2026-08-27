import readXlsxFile from 'read-excel-file'
import writeXlsxFile, { type Row as ExcelRow } from 'write-excel-file'
import type { ParsedData, ImportEntityType } from '@/types/import'

interface ParseOptions {
  skipRows?: number
  sheetName?: string
}

/**
 * Parse XLSX com suporte ao formato Trinks
 */
export async function parseXLSX(
  file: File,
  type: ImportEntityType,
  options?: ParseOptions
): Promise<ParsedData> {
  try {
    const jsonData = await readXlsxFile(file, {
      sheet: options?.sheetName,
      trim: true
    })

    if (jsonData.length === 0) {
      throw new Error('Planilha vazia')
    }

    // Detectar número de linhas a pular
    const skipRows = options?.skipRows ?? (type === 'clientes' ? 6 : 0)
    const headerRow = jsonData[skipRows]

    if (!headerRow) {
      throw new Error('Cabeçalho da planilha não encontrado')
    }

    // Primeira linha após skip é o header
    const headers = headerRow.map((h) => String(h ?? '').trim())

    // Linhas de dados
    const rows = jsonData.slice(skipRows + 1).map((row) => {
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined && row[index] !== null ? String(row[index]).trim() : ''
      })
      return obj
    })

    return {
      headers,
      rows
    }
  } catch (error) {
    throw new Error(`Erro ao fazer parse do XLSX: ${(error as Error).message}`)
  }
}

/**
 * Exporta dados para XLSX
 */
export async function exportToXLSX(data: any[], headers: string[], filename: string): Promise<void> {
  const rows: ExcelRow[] = [
    headers.map((header) => ({ value: header, fontWeight: 'bold' })),
    ...data.map((item) =>
      headers.map((header) => {
        const value = item[header]

        if (
          value === null ||
          value === undefined ||
          typeof value === 'string' ||
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          value instanceof Date
        ) {
          return { value: value ?? '' }
        }

        return { value: String(value) }
      })
    )
  ]

  await writeXlsxFile(rows, {
    fileName: filename,
    sheet: 'Dados'
  })
}
