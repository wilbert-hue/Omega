const fs = require('fs');
const path = require('path');

const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

/**
 * Region weights (sum = 1) and per-country weights within each region (normalized in code).
 * Matches lib/geography-hierarchy.ts country names.
 */
const REGION_MARKET_SHARE = {
  'North America': 0.24,
  Europe: 0.3,
  'Asia Pacific': 0.34,
  'Latin America': 0.12,
};

const COUNTRIES_BY_REGION = {
  'North America': {
    'U.S.': { w: 0.62, g: 0.126 },
    Canada: { w: 0.38, g: 0.114 },
  },
  Europe: {
    'U.K.': { w: 0.12, g: 0.116 },
    Germany: { w: 0.16, g: 0.115 },
    Italy: { w: 0.09, g: 0.108 },
    France: { w: 0.13, g: 0.112 },
    Netherland: { w: 0.07, g: 0.118 },
    Spain: { w: 0.09, g: 0.111 },
    Belgium: { w: 0.05, g: 0.11 },
    Russia: { w: 0.06, g: 0.095 },
    'Rest of Europe': { w: 0.23, g: 0.104 },
  },
  'Asia Pacific': {
    China: { w: 0.24, g: 0.132 },
    India: { w: 0.14, g: 0.138 },
    Japan: { w: 0.18, g: 0.108 },
    'South Korea': { w: 0.1, g: 0.118 },
    Singapore: { w: 0.06, g: 0.12 },
    Thailand: { w: 0.07, g: 0.125 },
    Indonesia: { w: 0.09, g: 0.133 },
    Australia: { w: 0.1, g: 0.115 },
    'Rest of Asia Pacific': { w: 0.02, g: 0.128 },
  },
  'Latin America': {
    Brazil: { w: 0.42, g: 0.138 },
    Argentina: { w: 0.14, g: 0.118 },
    Mexico: { w: 0.28, g: 0.128 },
    'Rest of Latin America': { w: 0.16, g: 0.125 },
  },
};

/** Global market (USD million), anchored at 2021 — split across all countries */
const globalTotalBase2021 = 520;

const volumePerMillionUSD = 520;

const GEOGRAPHIES = [];
const countryShares = {};
const regionGrowthRates = {};

for (const region of Object.keys(REGION_MARKET_SHARE)) {
  const block = COUNTRIES_BY_REGION[region];
  const wSum = Object.values(block).reduce((s, x) => s + x.w, 0);
  const regionWeight = REGION_MARKET_SHARE[region];
  for (const [country, spec] of Object.entries(block)) {
    GEOGRAPHIES.push(country);
    const within = spec.w / wSum;
    countryShares[country] = regionWeight * within;
    regionGrowthRates[country] = spec.g;
  }
}

/* --- Omega-3 ingredients segment trees: share = fraction of parent; leaves also have growthMul --- */

const byProductTypeRoot = {
  'Algal DHA Oil': { share: 0.18, growthMul: 1.06 },
  'Algal EPA Oil': { share: 0.14, growthMul: 1.05 },
  'Blended Omega Oils': { share: 0.16, growthMul: 1.07 },
  'Flaxseed Oil': { share: 0.11, growthMul: 1.03 },
  'Chia Seed Oil': { share: 0.09, growthMul: 1.08 },
  'Hemp Seed Oil': { share: 0.1, growthMul: 1.04 },
  'Perilla Oil': { share: 0.08, growthMul: 1.02 },
  'Ahiflower Oil': { share: 0.14, growthMul: 1.09 },
};

const byOmegaTypeRoot = {
  'Omega-3': {
    share: 0.46,
    children: {
      ALA: { share: 0.18, growthMul: 1.02 },
      DHA: { share: 0.32, growthMul: 1.06 },
      EPA: { share: 0.28, growthMul: 1.05 },
      'DHA + EPA': { share: 0.22, growthMul: 1.07 },
    },
  },
  'Omega-6': { share: 0.22, growthMul: 1.04 },
  'Omega-9': { share: 0.17, growthMul: 1.03 },
  'Omega 3-6-9 Blends': { share: 0.15, growthMul: 1.08 },
};

const byFormRoot = {
  'Crude Oil': { share: 0.12, growthMul: 0.99 },
  'Refined Oil': { share: 0.24, growthMul: 1.02 },
  'Concentrated Oil': { share: 0.22, growthMul: 1.06 },
  'Powdered Omega Ingredient': { share: 0.18, growthMul: 1.09 },
  'Encapsulated Oil': { share: 0.14, growthMul: 1.05 },
  'Emulsified Omega Ingredient': { share: 0.1, growthMul: 1.11 },
};

const byApplicationIndustryRoot = {
  'Dietary Supplements & Nutraceuticals': { share: 0.34, growthMul: 1.05 },
  'Functional Food & Beverages': { share: 0.26, growthMul: 1.07 },
  'Pharmaceuticals & Clinical Nutrition': { share: 0.19, growthMul: 1.04 },
  'Personal Care & Cosmetics': { share: 0.12, growthMul: 1.08 },
  'Others (Aquafeed, etc.)': { share: 0.09, growthMul: 1.06 },
};

const byDistributionChannelRoot = {
  Direct: { share: 0.43, growthMul: 1.05 },
  'Indirect (via. Distributors)': { share: 0.57, growthMul: 1.04 },
};

let seed = 42;
function seededRandom() {
  seed = (seed * 16807 + 0) % 2147483647;
  return (seed - 1) / 2147483646;
}

function addNoise(value, noiseLevel = 0.03) {
  return value * (1 + (seededRandom() - 0.5) * 2 * noiseLevel);
}

function roundTo1(val) {
  return Math.round(val * 10) / 10;
}

function roundToInt(val) {
  return Math.round(val);
}

function generateTimeSeries(baseValue, growthRate, roundFn) {
  const series = {};
  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    // i=0 is 2020: one step before the 2021 anchor (baseValue)
    const rawValue = baseValue * Math.pow(1 + growthRate, i - 1);
    series[year] = roundFn(addNoise(rawValue));
  }
  return series;
}

function materializeTree(spec, allocatedBase, countryGrowth, roundFn) {
  if (!spec.children) {
    const mul = spec.growthMul ?? 1;
    return generateTimeSeries(allocatedBase, countryGrowth * mul, roundFn);
  }
  const out = {};
  for (const [name, child] of Object.entries(spec.children)) {
    const childBase = allocatedBase * child.share;
    out[name] = materializeTree(child, childBase, countryGrowth, roundFn);
  }
  return out;
}

function buildTopLevelTree(rootSpec, countryBase, countryGrowth, roundFn) {
  if (rootSpec.share === 1 && rootSpec.children) {
    return materializeTree(rootSpec, countryBase, countryGrowth, roundFn);
  }
  const out = {};
  for (const [name, node] of Object.entries(rootSpec)) {
    const base = countryBase * node.share;
    out[name] = materializeTree(node, base, countryGrowth, roundFn);
  }
  return out;
}

function generateCountryData(isVolume) {
  const roundFn = isVolume ? roundToInt : roundTo1;
  const mult = isVolume ? volumePerMillionUSD : 1;
  const data = {};

  for (const geo of GEOGRAPHIES) {
    const countryBase = globalTotalBase2021 * countryShares[geo] * mult;
    const countryGrowth = regionGrowthRates[geo];

    data[geo] = {
      'By Product Type': buildTopLevelTree(byProductTypeRoot, countryBase, countryGrowth, roundFn),
      'By Omega Type': buildTopLevelTree(byOmegaTypeRoot, countryBase, countryGrowth, roundFn),
      'By Form': buildTopLevelTree(byFormRoot, countryBase, countryGrowth, roundFn),
      'By Application Industry': buildTopLevelTree(
        byApplicationIndustryRoot,
        countryBase,
        countryGrowth,
        roundFn
      ),
      'By Distribution Channel': buildTopLevelTree(
        byDistributionChannelRoot,
        countryBase,
        countryGrowth,
        roundFn
      ),
    };
  }

  return data;
}

function toStructureOnly(node) {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) {
    return {};
  }
  const yKeys = Object.keys(node).filter((k) => /^\d{4}$/.test(k));
  if (yKeys.length > 0) {
    return {};
  }
  const out = {};
  for (const [k, v] of Object.entries(node)) {
    out[k] = toStructureOnly(v);
  }
  return out;
}

seed = 42;
const valueData = generateCountryData(false);
seed = 7777;
const volumeData = generateCountryData(true);

const outDir = path.join(__dirname, 'public', 'data');
fs.writeFileSync(path.join(outDir, 'value.json'), JSON.stringify(valueData, null, 2));
fs.writeFileSync(path.join(outDir, 'volume.json'), JSON.stringify(volumeData, null, 2));

const segmentationSkeleton = {};
for (const geo of GEOGRAPHIES) {
  segmentationSkeleton[geo] = toStructureOnly(valueData[geo]);
}
fs.writeFileSync(
  path.join(outDir, 'segmentation_analysis.json'),
  JSON.stringify(segmentationSkeleton, null, 2)
);

console.log('Generated value.json, volume.json, segmentation_analysis.json');
console.log('Country count:', GEOGRAPHIES.length);
console.log(
  'Segment types:',
  Object.keys(valueData['U.S.']).join(', ')
);
