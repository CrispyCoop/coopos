import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: 2, borderColor: '#f97316', paddingBottom: 12 },
  brandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  brand: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#f97316' },
  brandSub: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  reportTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 12 },
  reportMeta: { fontSize: 8, color: '#6b7280', marginTop: 2 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#111827', marginBottom: 6, backgroundColor: '#f9fafb', padding: 4 },
  table: { marginTop: 4 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4 },
  tableRow: { flexDirection: 'row', padding: 4, borderBottom: 0.5, borderColor: '#e5e7eb' },
  tableRowAlt: { flexDirection: 'row', padding: 4, borderBottom: 0.5, borderColor: '#e5e7eb', backgroundColor: '#fafafa' },
  col1: { flex: 2, fontSize: 8 },
  col2: { flex: 1, fontSize: 8, textAlign: 'right' },
  col3: { flex: 1, fontSize: 8, textAlign: 'right' },
  colHeader: { fontFamily: 'Helvetica-Bold', fontSize: 8 },
  stat: { flex: 1, padding: 8, backgroundColor: '#f9fafb', marginRight: 6, borderLeft: 2, borderColor: '#f97316' },
  statLabel: { fontSize: 7, color: '#6b7280' },
  statValue: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#111827', marginTop: 2 },
  statsRow: { flexDirection: 'row', marginTop: 8, marginBottom: 4 },
  bodyText: { fontSize: 8, color: '#374151', lineHeight: 1.6 },
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 7, color: '#9ca3af' },
})

interface ReportRow {
  label: string
  value: string
  value2?: string
}

interface ReportSection {
  title: string
  stats?: { label: string; value: string }[]
  rows?: ReportRow[]
  text?: string
}

export interface ReportData {
  type: string
  title: string
  dateRange: string
  generatedAt: string
  sections: ReportSection[]
}

export function ReportPDF({ report }: { report: ReportData }) {
  return (
    <Document title={report.title}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brand}>Crispy Coop</Text>
              <Text style={styles.brandSub}>Hertford, UK · CoopOS</Text>
            </View>
            <View>
              <Text style={[styles.brandSub, { textAlign: 'right' }]}>Generated: {report.generatedAt}</Text>
              <Text style={[styles.brandSub, { textAlign: 'right' }]}>Confidential</Text>
            </View>
          </View>
          <Text style={styles.reportTitle}>{report.title}</Text>
          <Text style={styles.reportMeta}>Period: {report.dateRange}</Text>
        </View>

        {/* Sections */}
        {report.sections.map((sec, si) => (
          <View key={si} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>

            {sec.stats && (
              <View style={styles.statsRow}>
                {sec.stats.map((s, i) => (
                  <View key={i} style={styles.stat}>
                    <Text style={styles.statLabel}>{s.label}</Text>
                    <Text style={styles.statValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {sec.rows && (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.col1, styles.colHeader]}>Item</Text>
                  <Text style={[styles.col2, styles.colHeader]}>Value</Text>
                  {sec.rows[0]?.value2 !== undefined && (
                    <Text style={[styles.col3, styles.colHeader]}>Details</Text>
                  )}
                </View>
                {sec.rows.map((row, ri) => (
                  <View key={ri} style={ri % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                    <Text style={styles.col1}>{row.label}</Text>
                    <Text style={styles.col2}>{row.value}</Text>
                    {row.value2 !== undefined && <Text style={styles.col3}>{row.value2}</Text>}
                  </View>
                ))}
              </View>
            )}

            {sec.text && (
              <Text style={styles.bodyText}>{sec.text}</Text>
            )}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>CoopOS · Crispy Coop Hertford</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
