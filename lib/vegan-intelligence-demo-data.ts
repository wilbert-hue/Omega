import { GEOGRAPHY_REGION_ORDER, REGION_TO_COUNTRIES } from './geography-hierarchy'

export const VEGAN_CUSTOMER_DEMO_COUNT = 350
export const VEGAN_DISTRIBUTOR_DEMO_COUNT = 300

export interface VeganCustomerRow {
  sNo: number
  companyName: string
  yearEstablished: string
  headquarters: string
  employees: string
  revenue: string
  companyType: string
  keyContact: string
  designation: string
  email: string
  phone: string
  linkedin: string
  website: string
  veganOmegaTypes: string
  omegaConcentration: string
  purchaseFrequency: string
  orderVolume: string
  productLifecycle: string
}

export interface VeganDistributorRow {
  sNo: number
  companyName: string
  yearEstablished: string
  headquarters: string
  employees: string
  revenue: string
  distributionScale: string
  keyContact: string
  designation: string
  email: string
  phone: string
  linkedin: string
  website: string
  veganOmegaTypes: string
  endUseApplications: string
  omegaConcentration: string
  salesChannelStrength: string
  keyRetailNetwork: string
  importCapability: string
}

const PRODUCT_TYPES = [
  'Algal DHA Oil',
  'Algal EPA Oil',
  'Blended Omega Oils',
  'Flaxseed Oil',
  'Chia Seed Oil',
  'Hemp Seed Oil',
  'Perilla Oil',
  'Ahiflower Oil',
] as const

const CUSTOMER_COMPANY_TYPES = [
  'Supplement manufacturer',
  'Food & beverages manufacturer',
  'Pharmaceuticals & clinical nutrition',
  'Personal care & cosmetics',
  'Functional food & beverages',
  'Others (Aquafeed, etc.)',
] as const

const END_USE = [
  'Dietary supplements',
  'Functional food & beverages',
  'Pharma & clinical nutrition',
  'Personal care & cosmetics',
  'Sports nutrition',
  'Infant & clinical nutrition',
  'Aquafeed',
  'Private label / co-man',
] as const

const CONCENTRATIONS = ['Low', 'Medium', 'High'] as const
const PURCHASE_FREQ = ['Monthly', 'Bi-monthly', 'Quarterly', 'Semi-annual', 'Annual'] as const
const ORDER_VOL = ['Low', 'Medium', 'High', 'Very high'] as const
const LIFECYCLE = [
  'New product development',
  'R&D',
  'Pilot',
  'Scale-up',
  'Reformulation',
  'Regulatory filing',
] as const

const DIST_SCALE = ['Local', 'Regional', 'National', 'International'] as const

const SALES_STRENGTH = ['Strong — modern trade', 'Moderate — mixed channels', 'Growing — e-commerce led', 'Niche — specialty retail'] as const
const RETAIL_NET = ['National pharmacy', 'Club & mass', 'Health stores', 'Foodservice & HORECA', 'Cross-border e-com'] as const
const IMPORT_CAP = ['Direct import — bonded', 'Local blending partner', 'Authorized importer', 'Regional hub stocking'] as const

const FIRST = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Quinn', 'Avery', 'Parker', 'Reese', 'Skyler', 'Jamie', 'Drew', 'Blake', 'Cameron', 'Logan', 'Hayden', 'Emery', 'Rowan']
const LAST = ['Chen', 'Patel', 'García', 'Müller', 'Silva', 'Nakamura', 'Kowalski', 'Rossi', 'Dubois', 'Jensen', 'Okonkwo', 'Fernández', 'Katz', 'Lindqvist', 'Tanaka', 'Novak', 'Haddad', 'Olsen', 'Santos', 'Khan']

const CITY_BY_COUNTRY: Record<string, string[]> = {
  'U.S.': ['California', 'Texas', 'New York', 'Illinois', 'Florida', 'Ohio', 'Georgia'],
  Canada: ['Ontario', 'British Columbia', 'Quebec', 'Alberta'],
  'U.K.': ['London', 'Manchester', 'Scotland', 'Wales'],
  Germany: ['Hamburg', 'Munich', 'Frankfurt', 'Berlin'],
  Italy: ['Milan', 'Rome', 'Turin', 'Bologna'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
  Netherland: ['Amsterdam', 'Rotterdam', 'Utrecht'],
  Spain: ['Madrid', 'Barcelona', 'Valencia'],
  Belgium: ['Brussels', 'Antwerp'],
  Russia: ['Moscow', 'St. Petersburg'],
  'Rest of Europe': ['Vienna', 'Warsaw', 'Prague', 'Dublin'],
  China: ['Shanghai', 'Guangzhou', 'Shenzhen', 'Beijing', 'Chengdu'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'],
  Japan: ['Tokyo', 'Osaka', 'Nagoya', 'Fukuoka'],
  'South Korea': ['Seoul', 'Busan', 'Incheon'],
  Singapore: ['Singapore'],
  Thailand: ['Bangkok', 'Chiang Mai'],
  Indonesia: ['Jakarta', 'Surabaya'],
  Australia: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'Rest of Asia Pacific': ['Auckland', 'Manila', 'Ho Chi Minh City'],
  Brazil: ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Minas Gerais'],
  Argentina: ['Buenos Aires', 'Córdoba', 'Rosario'],
  Mexico: ['Mexico City', 'Monterrey', 'Guadalajara'],
  'Rest of Latin America': ['Santiago', 'Lima', 'Bogotá', 'Central America'],
}

const FLAT_COUNTRIES = GEOGRAPHY_REGION_ORDER.flatMap((r) => [...(REGION_TO_COUNTRIES[r] || [])])

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(arr: readonly T[], rnd: () => number): T {
  return arr[Math.floor(rnd() * arr.length)]!
}

function pickProductCombo(rnd: () => number): string {
  const a = pick(PRODUCT_TYPES, rnd)
  if (rnd() > 0.55) return a
  let b = pick(PRODUCT_TYPES, rnd)
  let guard = 0
  while (b === a && guard++ < 8) b = pick(PRODUCT_TYPES, rnd)
  return `${a}, ${b}`
}

function formatEmployees(rnd: () => number): string {
  if (rnd() < 0.12) return 'xx'
  const bands = ['12–48', '50–120', '130–400', '420–900', '1.1k–2.5k', '3k–8k']
  return pick(bands, rnd)
}

function formatRevenue(rnd: () => number, currency: string): string {
  if (rnd() < 0.1) return 'xx'
  const m = 1 + Math.floor(rnd() * 120)
  if (currency === '€') return `€${m}.${Math.floor(rnd() * 9)}M (est.)`
  if (currency === '£') return `£${m}.${Math.floor(rnd() * 9)}M (est.)`
  if (currency === '¥' || currency === 'CNY') return `¥${m * 8}–${m * 12}M RMB (est.)`
  return `$${m}.${Math.floor(rnd() * 9)}M USD (est.)`
}

function currencyForCountry(country: string): string {
  if (['Germany', 'France', 'Italy', 'Spain', 'Netherland', 'Belgium', 'Rest of Europe'].includes(country)) return '€'
  if (country === 'U.K.') return '£'
  if (country === 'China') return 'CNY'
  return '$'
}

function headquartersLine(country: string, rnd: () => number): string {
  if (country === 'Singapore') return 'Singapore'
  const cities = CITY_BY_COUNTRY[country] || ['Metro']
  const city = pick(cities, rnd)
  return `${country} — ${city}`
}

function slugify(s: string, n: number): string {
  return `${s.toLowerCase().replace(/[^a-z0-9]+/g, '')}${n}`
}

function buildContact(i: number, rnd: () => number) {
  if (rnd() < 0.08) {
    return {
      keyContact: 'xx',
      designation: 'xx',
      email: 'xx',
      phone: 'xx',
      linkedin: 'xx',
      website: 'xx',
    }
  }
  const fn = pick(FIRST, rnd)
  const ln = pick(LAST, rnd)
  const slug = slugify(`${fn}${ln}`, i)
  return {
    keyContact: `${fn} ${ln}`,
    designation: pick(
      [
        'Head of Procurement',
        'R&D Director',
        'Supply Chain Manager',
        'VP Operations',
        'Category Manager',
        'Technical Buyer',
      ],
      rnd
    ),
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@demo-${i}.co`,
    phone: `+${10 + Math.floor(rnd() * 80)} ${100 + Math.floor(rnd() * 899)} ${1000 + Math.floor(rnd() * 8999)}`,
    linkedin: `linkedin.com/in/${slug}`,
    website: `www.demo-${slug}.com`,
  }
}

export function generateVeganCustomerDemoRows(count: number = VEGAN_CUSTOMER_DEMO_COUNT): VeganCustomerRow[] {
  const rnd = mulberry32(42_001)
  const rows: VeganCustomerRow[] = []
  for (let i = 1; i <= count; i++) {
    const country = pick(FLAT_COUNTRIES, rnd)
    const hq = headquartersLine(country, rnd)
    const cur = currencyForCountry(country.split(' — ')[0] || country)
    const yr = rnd() < 0.15 ? 'xx' : String(1988 + Math.floor(rnd() * 35))
    const c = buildContact(i, rnd)
    rows.push({
      sNo: i,
      companyName: `Customer ${i}`,
      yearEstablished: yr,
      headquarters: hq,
      employees: formatEmployees(rnd),
      revenue: formatRevenue(rnd, cur),
      companyType: pick(CUSTOMER_COMPANY_TYPES, rnd),
      keyContact: c.keyContact,
      designation: c.designation,
      email: c.email,
      phone: c.phone,
      linkedin: c.linkedin,
      website: c.website,
      veganOmegaTypes: pickProductCombo(rnd),
      omegaConcentration: pick(CONCENTRATIONS, rnd),
      purchaseFrequency: pick(PURCHASE_FREQ, rnd),
      orderVolume: pick(ORDER_VOL, rnd),
      productLifecycle: pick(LIFECYCLE, rnd),
    })
  }
  return rows
}

export function generateVeganDistributorDemoRows(count: number = VEGAN_DISTRIBUTOR_DEMO_COUNT): VeganDistributorRow[] {
  const rnd = mulberry32(77_707)
  const rows: VeganDistributorRow[] = []
  for (let i = 1; i <= count; i++) {
    const country = pick(FLAT_COUNTRIES, rnd)
    const hq = headquartersLine(country, rnd)
    const cur = currencyForCountry(country.split(' — ')[0] || country)
    const yr = rnd() < 0.12 ? 'xx' : String(1975 + Math.floor(rnd() * 45))
    const c = buildContact(i + 10_000, rnd)
    rows.push({
      sNo: i,
      companyName: `Distributor ${i}`,
      yearEstablished: yr,
      headquarters: hq,
      employees: formatEmployees(rnd),
      revenue: formatRevenue(rnd, cur),
      distributionScale: pick(DIST_SCALE, rnd),
      keyContact: c.keyContact,
      designation: c.designation,
      email: c.email,
      phone: c.phone,
      linkedin: c.linkedin,
      website: c.website,
      veganOmegaTypes: pickProductCombo(rnd),
      endUseApplications: pick(END_USE, rnd),
      omegaConcentration: pick(CONCENTRATIONS, rnd),
      salesChannelStrength: pick(SALES_STRENGTH, rnd),
      keyRetailNetwork: pick(RETAIL_NET, rnd),
      importCapability: pick(IMPORT_CAP, rnd),
    })
  }
  return rows
}

/** Static demo overrides for sample rows (reference UI). */
const CUSTOMER_STATIC_OVERRIDES: Record<number, Partial<VeganCustomerRow>> = {
  11: {
    yearEstablished: '1990',
    headquarters: 'Spain — Valencia',
    employees: '1.1k–2.5k',
    revenue: '€63.7M (est.)',
    companyType: 'Others (Aquafeed, etc.)',
    keyContact: 'Hayden Jensen',
    designation: 'Supply Chain Manager',
    email: 'hayden.jensen@11.co',
  },
  12: {
    yearEstablished: '2005',
    headquarters: 'Italy — Bologna',
    employees: 'xx',
    revenue: '€114.7M (est.)',
    companyType: 'Food & beverages manufacturer',
    keyContact: 'Quinn Garcia',
    designation: 'Head of Procurement',
    email: 'quinn.garcia@12.co',
  },
  13: {
    yearEstablished: '2018',
    headquarters: 'France — Paris',
    employees: '1.1k–2.5k',
    revenue: '€80.0M (est.)',
    companyType: 'Functional food & beverages',
    keyContact: 'Parker Müller',
    designation: 'Head of Procurement',
    email: 'parker.müller@c13.co',
  },
  14: {
    yearEstablished: '1997',
    headquarters: 'Canada — Quebec',
    employees: '130–400',
    revenue: '$17.4M USD (est.)',
    companyType: 'Functional food & beverages',
    keyContact: 'xx',
    designation: 'xx',
    email: 'xx',
  },
  15: {
    yearEstablished: '1989',
    headquarters: 'Russia — Moscow',
    employees: 'xx',
    revenue: '$110.8M USD (est.)',
    companyType: 'Food & beverages manufacturer',
    keyContact: 'Morgan Haddad',
    designation: 'Technical Buyer',
    email: 'morgan.haddad@15.co',
  },
  16: {
    yearEstablished: '2002',
    headquarters: 'Australia — Sydney',
    employees: '1.1k–2.5k',
    revenue: '$119.7M USD (est.)',
    companyType: 'Personal care & cosmetics',
    keyContact: 'xx',
    designation: 'xx',
    email: 'xx',
  },
}

function applyCustomerStaticOverrides(rows: VeganCustomerRow[]): VeganCustomerRow[] {
  return rows.map((r) => {
    const o = CUSTOMER_STATIC_OVERRIDES[r.sNo]
    return o ? { ...r, ...o } : r
  })
}

export const VEGAN_CUSTOMER_DEMO_ROWS = applyCustomerStaticOverrides(generateVeganCustomerDemoRows())
export const VEGAN_DISTRIBUTOR_DEMO_ROWS = generateVeganDistributorDemoRows()
