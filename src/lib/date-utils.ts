/**
 * Utilitários para trabalhar com datas/horários sem problemas de timezone
 *
 * O sistema usa horário local do tenant (Brasil, GMT-3) sem conversões para UTC.
 * Todas as datas são tratadas como "timezone-naive" para evitar confusões.
 */

/**
 * Converte Date para string no formato ISO sem timezone (YYYY-MM-DD HH:MM:SS)
 * Usa horário LOCAL do navegador
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * Cria Date a partir de string do banco (ignorando timezone)
 * Trata como horário local mesmo se tiver +00 no final
 */
export function fromDatabaseString(dateString: string): Date {
  // Remove timezone se existir (+00, Z, etc)
  const cleaned = dateString.replace(/[+-]\d{2}:?\d{2}$/, '').replace('Z', '').trim()

  // Substitui espaço por T para ser compatível com Date constructor
  const isoFormat = cleaned.includes('T') ? cleaned : cleaned.replace(' ', 'T')

  // Cria date interpretando como horário local (não UTC)
  return new Date(isoFormat)
}

/**
 * Formata Date para exibição em horário (HH:MM)
 */
export function formatTimeLocal(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Cria Date a partir de data e hora separados (ambos locais)
 */
export function createLocalDate(dateStr: string, timeStr: string): Date {
  // dateStr formato: YYYY-MM-DD
  // timeStr formato: HH:MM
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)

  return new Date(year, month - 1, day, hours, minutes, 0, 0)
}
