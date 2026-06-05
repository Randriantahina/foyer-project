export const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export function monthId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function monthName(year: number, month: number): string {
  return `${MONTH_NAMES[month - 1] ?? 'Mois'} ${year}`
}

export function isPastMonth(month: number, year: number): boolean {
  const now = new Date()
  return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)
}
