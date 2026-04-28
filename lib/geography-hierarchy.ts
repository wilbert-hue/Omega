import type { GeographyDimension } from './types'

/**
 * Standard region → country tree (image 2 spec). Country names match JSON data keys.
 */
export const GEOGRAPHY_REGION_ORDER = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
] as const

export const REGION_TO_COUNTRIES: Record<string, readonly string[]> = {
  'North America': ['U.S.', 'Canada'],
  Europe: [
    'U.K.',
    'Germany',
    'Italy',
    'France',
    'Netherland',
    'Spain',
    'Belgium',
    'Russia',
    'Rest of Europe',
  ],
  'Asia Pacific': [
    'China',
    'India',
    'Japan',
    'South Korea',
    'Singapore',
    'Thailand',
    'Indonesia',
    'Australia',
    'Rest of Asia Pacific',
  ],
  'Latin America': ['Brazil', 'Argentina', 'Mexico', 'Rest of Latin America'],
}

export function buildGeographyDimensionForCountries(countryKeys: string[]): GeographyDimension {
  const present = new Set(countryKeys)
  const regions: string[] = []
  const countries: Record<string, string[]> = {}
  const orderedCountries: string[] = []

  for (const region of GEOGRAPHY_REGION_ORDER) {
    const defs = REGION_TO_COUNTRIES[region] || []
    const list = defs.filter((c) => present.has(c))
    if (list.length > 0) {
      regions.push(region)
      countries[region] = list
      orderedCountries.push(...list)
    }
  }

  const inHierarchy = new Set(orderedCountries)
  const global = countryKeys.filter((k) => !inHierarchy.has(k)).sort()

  return {
    global,
    regions,
    countries,
    all_geographies: [...global, ...orderedCountries],
  }
}
