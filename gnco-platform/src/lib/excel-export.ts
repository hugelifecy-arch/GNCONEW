import type { ArchitectBrief, FundStructureRecommendation } from '@/lib/types'

type CellValue = string | number

type Row = CellValue[]

interface ZipEntry {
  name: string
  data: Uint8Array
  crc32: number
  offset: number
}

function xmlEscape(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function toColumnName(index: number): string {
  let value = index
  let column = ''
  while (value > 0) {
    const remainder = (value - 1) % 26
    column = String.fromCharCode(65 + remainder) + column
    value = Math.floor((value - 1) / 26)
  }
  return column
}

function buildSheetXml(rows: Row[]): string {
  const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0)
  const sheetRows = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((cell, colIndex) => {
          const ref = `${toColumnName(colIndex + 1)}${rowIndex + 1}`
          if (typeof cell === 'number') {
            return `<c r="${ref}"><v>${cell}</v></c>`
          }
          return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(String(cell))}</t></is></c>`
        })
        .join('')
      return `<row r="${rowIndex + 1}">${cells}</row>`
    })
    .join('')

  const dimension = `${toColumnName(1)}1:${toColumnName(Math.max(1, maxCols))}${Math.max(1, rows.length)}`

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <dimension ref="${dimension}"/>
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <sheetData>${sheetRows}</sheetData>
</worksheet>`
}

function buildWorkbookXml(sheetNames: string[]): string {
  const sheets = sheetNames
    .map((name, index) => `<sheet name="${xmlEscape(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>${sheets}</sheets>
</workbook>`
}

function buildWorkbookRelsXml(sheetCount: number): string {
  const sheetRels = Array.from({ length: sheetCount }, (_, index) => {
    return `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${sheetRels}
  <Relationship Id="rId${sheetCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
}

const ROOT_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`

const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet3.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet4.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/worksheets/sheet5.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border/></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i += 1) crc = CRC_TABLE[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function uint16(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff])
}

function uint32(value: number): Uint8Array {
  return new Uint8Array([value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff])
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  parts.forEach((part) => {
    output.set(part, offset)
    offset += part.length
  })
  return output
}

function createZip(files: { name: string; content: string }[]): Blob {
  const encoder = new TextEncoder()
  const entries: ZipEntry[] = []
  const localParts: Uint8Array[] = []
  let offset = 0

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name)
    const data = encoder.encode(file.content)
    const crc = crc32(data)

    const localHeader = concatBytes([
      uint32(0x04034b50),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(crc),
      uint32(data.length),
      uint32(data.length),
      uint16(nameBytes.length),
      uint16(0),
      nameBytes,
      data,
    ])

    entries.push({ name: file.name, data, crc32: crc, offset })
    localParts.push(localHeader)
    offset += localHeader.length
  })

  const centralParts: Uint8Array[] = []
  let centralSize = 0
  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name)
    const header = concatBytes([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(entry.crc32),
      uint32(entry.data.length),
      uint32(entry.data.length),
      uint16(nameBytes.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(entry.offset),
      nameBytes,
    ])
    centralParts.push(header)
    centralSize += header.length
  })

  const endRecord = concatBytes([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(entries.length),
    uint16(entries.length),
    uint32(centralSize),
    uint32(offset),
    uint16(0),
  ])

  const archive = concatBytes([...localParts, ...centralParts, endRecord])
  const buffer = new ArrayBuffer(archive.byteLength)
  new Uint8Array(buffer).set(archive)

  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function exportArchitectResults(recommendations: FundStructureRecommendation[], briefData: ArchitectBrief): void {
  const summaryData: Row[] = [
    ['GNCO — FUND STRUCTURE ANALYSIS'],
    ['Generated:', new Date().toLocaleDateString()],
    [''],
    ['INPUT PARAMETERS'],
    ['Fund Strategy:', briefData.strategy?.replace('-', ' ').toUpperCase()],
    ['Target Fund Size:', briefData.fundSize],
    ['GP Domicile:', briefData.gpDomicile],
    ['LP Profile:', briefData.lpProfile?.join(', ')],
    ['Asset Geography:', briefData.assetGeography?.join(', ')],
    ['Top Priority:', briefData.priorities?.[0]?.replace('-', ' ')],
    [''],
    ['TOP RECOMMENDATION'],
    ['Jurisdiction:', recommendations[0]?.jurisdiction ?? 'N/A'],
    ['Vehicle Type:', recommendations[0]?.vehicleType ?? 'N/A'],
    ['Overall Score:', `${recommendations[0]?.scores.overallScore ?? 0}/100`],
    [
      'Formation Cost:',
      `€${(recommendations[0]?.estimatedFormationCost.min ?? 0).toLocaleString()} - €${(recommendations[0]?.estimatedFormationCost.max ?? 0).toLocaleString()}`,
    ],
    ['Timeline:', `${recommendations[0]?.estimatedTimelineWeeks.min ?? 0}-${recommendations[0]?.estimatedTimelineWeeks.max ?? 0} weeks`],
  ]

  const comparisonData: Row[] = [
    ['Rank', 'Jurisdiction', 'Vehicle Type', 'Overall Score', 'Tax Efficiency', 'LP Familiarity', 'Formation Cost (Min)', 'Formation Cost (Max)', 'Timeline (Weeks)', 'Best For'],
  ]

  recommendations.forEach((rec, index) => {
    comparisonData.push([
      index + 1,
      rec.jurisdiction,
      rec.vehicleType,
      rec.scores.overallScore,
      rec.scores.taxEfficiency,
      rec.scores.lpFamiliarity,
      rec.estimatedFormationCost.min,
      rec.estimatedFormationCost.max,
      `${rec.estimatedTimelineWeeks.min}-${rec.estimatedTimelineWeeks.max}`,
      rec.bestFor[0] || '',
    ])
  })

  const scoringData: Row[] = [
    ['Jurisdiction', 'Tax Efficiency', 'LP Familiarity', 'Regulatory Simplicity', 'Speed to Close', 'Cost Score', 'Privacy Score', 'Overall Score'],
  ]

  recommendations.forEach((rec) => {
    scoringData.push([
      rec.jurisdiction,
      rec.scores.taxEfficiency,
      rec.scores.lpFamiliarity,
      rec.scores.regulatorySimplicity,
      rec.scores.speedToClose,
      rec.scores.costScore,
      rec.scores.privacyScore,
      rec.scores.overallScore,
    ])
  })

  const considerationsData: Row[] = [['Jurisdiction', 'Key Considerations']]
  recommendations.forEach((rec) => {
    rec.keyConsiderations.forEach((consideration, index) => {
      considerationsData.push([index === 0 ? rec.jurisdiction : '', consideration])
    })
    considerationsData.push(['', ''])
  })

  const nextStepsData: Row[] = [
    ['RECOMMENDED NEXT STEPS'],
    [''],
    ['1. LEGAL REVIEW'],
    ['   Engage qualified legal counsel in your selected jurisdiction'],
    ['   Recommended firms available in GNCO platform'],
    [''],
    ['2. STRUCTURE FINALIZATION'],
    ['   Review jurisdiction-specific requirements'],
    ['   Confirm LP domicile mix and tax implications'],
    ['   Determine final fund vehicle and share class structure'],
    [''],
    ['3. FORMATION DOCUMENTS'],
    ['   Limited Partnership Agreement (LPA)'],
    ['   Private Placement Memorandum (PPM)'],
    ['   Subscription Agreements'],
    ['   Side Letters (if applicable)'],
    [''],
    ['4. REGULATORY FILINGS'],
    ['   Form D filing (if US LPs)'],
    ['   State blue sky notices'],
    ['   Jurisdiction-specific registrations'],
    [''],
    ['5. OPERATIONAL SETUP'],
    ['   Bank account opening'],
    ['   Fund administrator engagement'],
    ['   Audit firm selection'],
    ['   Investor reporting systems'],
    [''],
    ['Generated by GNCO — Global Fund Architect'],
    [process.env.NEXT_PUBLIC_BASE_URL || 'https://gnconew.vercel.app'],
    [''],
    ['DISCLAIMER: This analysis is for informational purposes only.'],
    ['Not legal, tax, or investment advice. Consult qualified professionals.'],
  ]

  const files = [
    { name: '[Content_Types].xml', content: CONTENT_TYPES_XML },
    { name: '_rels/.rels', content: ROOT_RELS_XML },
    { name: 'xl/workbook.xml', content: buildWorkbookXml(['Executive Summary', 'Jurisdiction Comparison', 'Detailed Scores', 'Key Considerations', 'Next Steps']) },
    { name: 'xl/_rels/workbook.xml.rels', content: buildWorkbookRelsXml(5) },
    { name: 'xl/styles.xml', content: STYLES_XML },
    { name: 'xl/worksheets/sheet1.xml', content: buildSheetXml(summaryData) },
    { name: 'xl/worksheets/sheet2.xml', content: buildSheetXml(comparisonData) },
    { name: 'xl/worksheets/sheet3.xml', content: buildSheetXml(scoringData) },
    { name: 'xl/worksheets/sheet4.xml', content: buildSheetXml(considerationsData) },
    { name: 'xl/worksheets/sheet5.xml', content: buildSheetXml(nextStepsData) },
  ]

  const fileName = `GNCO_Fund_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`
  triggerDownload(createZip(files), fileName)
}
