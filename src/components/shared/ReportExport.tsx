import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface ReportExportProps {
  reportType: string
  dateRange?: { start: string; end: string }
  data?: Record<string, unknown>[]
  filename?: string
}

export function ReportExport({ reportType, data, filename }: ReportExportProps) {
  const [exporting, setExporting] = useState(false)

  function exportCSV() {
    if (!data || data.length === 0) {
      toast.error('No data to export')
      return
    }
    setExporting(true)

    const headers = Object.keys(data[0])
    const rows = data.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))
    const csv = [headers.join(','), ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `${reportType}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setExporting(false)
    toast.success('CSV exported')
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" loading={exporting} onClick={exportCSV}>
        ↓ CSV
      </Button>
    </div>
  )
}
