import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGBP(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPct(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'dd MMM yyyy')
}

export function formatTime(dateStr: string): string {
  return format(parseISO(dateStr), 'HH:mm')
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy, HH:mm')
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function calcMarginPct(cost: number, price: number): number {
  if (price === 0) return 0
  return ((price - cost) / price) * 100
}

export function calcDeliveryPrice(instorePrice: number, upliftPct: number): number {
  return instorePrice * (1 + upliftPct / 100)
}

export function getMarginColour(marginPct: number): 'green' | 'amber' | 'red' {
  if (marginPct >= 35) return 'green'
  if (marginPct >= 25) return 'amber'
  return 'red'
}

export function getHealthScoreColour(score: number): 'green' | 'amber' | 'red' {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength)}…`
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? `${singular}s`)
}
