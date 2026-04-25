export function exportToCSV(data: any[], filename: string) {
  if (!data?.length) return

  const headers = Object.keys(data[0])

  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header] ?? ''

        if (typeof value === 'string' && /[,"\n]/.test(value)) {
          return `"${value.replace(/"/g, '""')}"`
        }

        return value
      }).join(',')
    ),
  ].join('\n')

  downloadFile(csv, filename, 'text/csv')
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\ufeff', content], {
    type: `${mimeType};charset=utf-8`
  })

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)

  if (isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

type Status = 'learning' | 'active' | 'rejected' | 'pending'

const STATUS_COLORS: Record<Status, string> = {
  learning: '#9ef01a',
  active: '#22c55e',
  rejected: '#ef4444',
  pending: '#eab308'
}

export function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase() as Status] || '#64748b'
}
