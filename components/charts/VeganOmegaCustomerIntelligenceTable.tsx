'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  VEGAN_CUSTOMER_DEMO_ROWS,
  VEGAN_CUSTOMER_DEMO_COUNT,
  type VeganCustomerRow,
} from '@/lib/vegan-intelligence-demo-data'

export type { VeganCustomerRow }

const b = 'border border-[#C5D3DD]'
const thGroup = `${b} px-2 py-2.5 text-center font-bold text-gray-900 uppercase tracking-wide text-[11px]`
const thSub = `${b} px-2 py-2 text-left font-semibold text-gray-800 whitespace-nowrap text-[11px] bg-[#D8E3EB]`
const td = `${b} border-[#D8E3EB] px-2 py-2 text-black text-xs align-middle bg-white`

function CustomerIntelligenceThead() {
  return (
    <thead className="bg-white">
      <tr>
        <th rowSpan={2} className={`${thGroup} bg-[#E8EAEC] text-left pl-3 align-middle`}>
          S.No.
        </th>
        <th colSpan={6} className={`${thGroup} bg-[#FCE5D6]`}>
          Company information
        </th>
        <th colSpan={6} className={`${thGroup} bg-[#F5DCC8]`}>
          Contact details
        </th>
        <th colSpan={2} className={`${thGroup} bg-[#F0D4BC]`}>
          Product required
        </th>
        <th colSpan={3} className={`${thGroup} bg-[#EBD0B8]`}>
          Customer behavior &amp; buying patterns
        </th>
      </tr>
      <tr>
        <th className={thSub}>Company Name</th>
        <th className={thSub}>Year Established</th>
        <th className={thSub}>Headquarters</th>
        <th className={thSub}>No. of Employees (est.)</th>
        <th className={thSub}>Revenue / Turnover</th>
        <th className={thSub}>Company Type</th>
        <th className={thSub}>Key Contact Person</th>
        <th className={thSub}>Designation / Role</th>
        <th className={thSub}>Email Address</th>
        <th className={thSub}>Phone / WhatsApp</th>
        <th className={thSub}>LinkedIn Profile</th>
        <th className={thSub}>Website URL</th>
        <th className={thSub}>Vegan Omega Oil Types</th>
        <th className={thSub}>Omega Concentrations</th>
        <th className={thSub}>Purchase Frequency</th>
        <th className={thSub}>Order Volume</th>
        <th className={thSub}>Product Lifecycle</th>
      </tr>
    </thead>
  )
}

function CustomerIntelligenceDataRow({ r }: { r: VeganCustomerRow }) {
  return (
    <tr className="odd:bg-white even:bg-[#FAFCFE] hover:bg-[#F0F7FA]">
      <td className={td}>{r.sNo}</td>
      <td className={td}>{r.companyName}</td>
      <td className={td}>{r.yearEstablished}</td>
      <td className={td}>{r.headquarters}</td>
      <td className={td}>{r.employees}</td>
      <td className={td}>{r.revenue}</td>
      <td className={td}>{r.companyType}</td>
      <td className={td}>{r.keyContact}</td>
      <td className={td}>{r.designation}</td>
      <td className={td}>{r.email}</td>
      <td className={td}>{r.phone}</td>
      <td className={td}>{r.linkedin}</td>
      <td className={td}>{r.website}</td>
      <td className={td}>{r.veganOmegaTypes}</td>
      <td className={td}>{r.omegaConcentration}</td>
      <td className={td}>{r.purchaseFrequency}</td>
      <td className={td}>{r.orderVolume}</td>
      <td className={td}>{r.productLifecycle}</td>
    </tr>
  )
}

interface Props {
  title?: string
  height?: number
}

export function VeganOmegaCustomerIntelligenceTable({ title, height = 600 }: Props) {
  const rows = VEGAN_CUSTOMER_DEMO_ROWS
  const [tableOpen, setTableOpen] = useState(true)

  return (
    <div className="rounded-lg border border-sky-200/90 shadow-sm overflow-hidden bg-white relative z-0">
      <div className="bg-[#E8F4FA] px-5 py-4 border-b border-sky-200/60">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">
          {title ||
            `Vegan Omega Oil Ingredient Customer Intelligence Database (${VEGAN_CUSTOMER_DEMO_COUNT} Customer across the all Country)`}
        </h2>
        <p className="text-sm text-[#168AAD] mt-1.5 font-medium">
          Verified directory and insight on Vegan Omega Oil Ingredient Customer across the Country.
        </p>
        <p className="mt-3 text-xs text-gray-600">
          Showing <span className="font-semibold text-gray-800">{rows.length}</span> of {VEGAN_CUSTOMER_DEMO_COUNT}{' '}
          records. Static list — not filtered by geography or segments.
        </p>
      </div>

      <div className="rounded-b-md overflow-hidden border-t border-[#C5D3DD]">
        <button
          type="button"
          onClick={() => setTableOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left bg-[#1A7B7E] hover:bg-[#166f72] transition-colors"
          aria-expanded={tableOpen}
        >
          <ChevronDown
            className={`w-5 h-5 text-white shrink-0 transition-transform duration-200 ${tableOpen ? '' : '-rotate-90'}`}
            strokeWidth={2.5}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="font-bold text-white text-sm">Customer directory table</div>
            <p className="text-xs text-white/90 mt-0.5">
              {rows.length} rows · expand to scroll the full spreadsheet (horizontal scroll for all columns)
            </p>
          </div>
        </button>

        {tableOpen && (
          <div className="p-3 bg-[#F4F7FA] border-t border-[#C5D3DD]">
            <div
              className="rounded border border-[#C5D3DD] bg-white shadow-sm overflow-auto overscroll-contain"
              style={{ maxHeight: height }}
            >
              <table className="min-w-[2200px] w-full text-xs border-collapse">
                <CustomerIntelligenceThead />
                <tbody>
                  {rows.map((r) => (
                    <CustomerIntelligenceDataRow key={r.sNo} r={r} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
