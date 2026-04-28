const fs = require('fs');
const path = require('path');

const years = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

/** Latin America markets only (per dashboard geography spec) */
const GEOGRAPHIES = ['Brazil', 'Argentina', 'Mexico', 'Rest of Latin America'];

const countryShares = {
  Brazil: 0.45,
  Argentina: 0.15,
  Mexico: 0.25,
  'Rest of Latin America': 0.15,
};

/** Total regional market (USD million), 2021 — split across the four countries */
const laTotalBase2021 = 32;

const regionGrowthRates = {
  Brazil: 0.138,
  Argentina: 0.118,
  Mexico: 0.128,
  'Rest of Latin America': 0.125,
};

const volumePerMillionUSD = 520;

/* --- Segment tree specs: share = fraction of parent; leaves also have growthMul --- */

const byBciModalityRoot = {
  'Non-Invasive BCI': {
    share: 0.68,
    children: {
      'EEG-based BCI': {
        share: 0.58,
        children: {
          'Motor imagery (MI)': { share: 0.34, growthMul: 1.02 },
          'P300-based systems': { share: 0.33, growthMul: 1.05 },
          'SSVEP (Steady-State Visual Evoked Potential)': { share: 0.33, growthMul: 1.03 },
        },
      },
      'Hybrid BCI systems (EEG + eye tracking / EMG)': { share: 0.22, growthMul: 1.12 },
      'fNIRS-based BCI (emerging, low penetration)': { share: 0.2, growthMul: 1.18 },
    },
  },
  'Minimally Invasive BCI': { share: 0.07, growthMul: 1.15 },
  'Fully Invasive BCI': {
    share: 0.25,
    children: {
      'Implanted cortical electrodes': { share: 0.35, growthMul: 1.08 },
      'Intracortical arrays': { share: 0.4, growthMul: 1.1 },
      'ECoG-based systems': { share: 0.25, growthMul: 1.06 },
    },
  },
};

const byApplicationRoot = {
  'Communication Restoration': { share: 0.28, growthMul: 1.04 },
  'Environmental & Device Control': { share: 0.26, growthMul: 1.06 },
  'Mobility & Motor Assistance': { share: 0.26, growthMul: 1.08 },
  'Rehabilitation & Neuro-recovery': { share: 0.2, growthMul: 1.1 },
};

const byEndUserRoot = {
  share: 1,
  children: {
    'Clinical Condition': {
      share: 0.55,
      children: {
        'Neurodegenerative Disorders': {
          share: 0.22,
          children: {
            'ALS (primary target segment)': { share: 0.62, growthMul: 1.08 },
            'Multiple sclerosis (advanced stage)': { share: 0.38, growthMul: 1.04 },
          },
        },
        'Stroke Survivors': {
          share: 0.2,
          children: {
            'Ischemic stroke (severe disability)': { share: 0.55, growthMul: 1.03 },
            'Hemorrhagic stroke': { share: 0.45, growthMul: 1.02 },
          },
        },
        'Spinal Cord Injury (SCI)': {
          share: 0.18,
          children: {
            'Tetraplegia (high priority)': { share: 0.55, growthMul: 1.1 },
            Paraplegia: { share: 0.45, growthMul: 1.05 },
          },
        },
        'Cerebral Palsy (Severe Motor Impairment)': {
          share: 0.12,
          children: {
            'Non-verbal CP patients': { share: 1, growthMul: 1.06 },
          },
        },
        'Other Severe Motor Impairments': {
          share: 0.28,
          children: {
            'Locked-in syndrome': { share: 0.35, growthMul: 1.12 },
            'Traumatic brain injury (TBI)': { share: 0.65, growthMul: 1.04 },
          },
        },
      },
    },
    'End-User Setting': {
      share: 0.45,
      children: {
        'Institutional Healthcare': {
          share: 0.42,
          children: {
            'Rehabilitation hospitals': { share: 0.4, growthMul: 1.0 },
            'Neurology clinics': { share: 0.35, growthMul: 1.02 },
            'Long-term care centers': { share: 0.25, growthMul: 1.01 },
          },
        },
        'Home Care Settings': {
          share: 0.32,
          children: {
            'Direct-to-patient deployment': { share: 0.5, growthMul: 1.14 },
            'Caregiver-assisted usage': { share: 0.5, growthMul: 1.1 },
          },
        },
        'Research & Clinical Trials': {
          share: 0.26,
          children: {
            Universities: { share: 0.55, growthMul: 1.07 },
            'Neuroscience labs': { share: 0.45, growthMul: 1.09 },
          },
        },
      },
    },
  },
};

const byDistributionRoot = {
  'Public Healthcare Systems': {
    share: 0.22,
    children: {
      'Government procurement': { share: 1, growthMul: 0.98 },
    },
  },
  'Private Healthcare Providers': {
    share: 0.35,
    children: {
      'Private hospitals': { share: 0.55, growthMul: 1.05 },
      'Specialty rehab centers': { share: 0.45, growthMul: 1.08 },
    },
  },
  'Direct-to-Consumer (D2C)': {
    share: 0.18,
    children: {
      'At-home devices (non-invasive BCI)': { share: 1, growthMul: 1.15 },
    },
  },
  'Research Grants / Institutional Funding': {
    share: 0.25,
    children: {
      'Public funding bodies': { share: 0.55, growthMul: 1.04 },
      'Innovation programs': { share: 0.45, growthMul: 1.12 },
    },
  },
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
    const rawValue = baseValue * Math.pow(1 + growthRate, i);
    series[year] = roundFn(addNoise(rawValue));
  }
  return series;
}

/**
 * Build nested JSON: inner nodes are objects; leaves get year maps.
 */
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
    const countryBase = laTotalBase2021 * countryShares[geo] * mult;
    const countryGrowth = regionGrowthRates[geo];

    data[geo] = {
      'By BCI Modality': buildTopLevelTree(byBciModalityRoot, countryBase, countryGrowth, roundFn),
      'By Application': buildTopLevelTree(byApplicationRoot, countryBase, countryGrowth, roundFn),
      'By End User': materializeTree(byEndUserRoot, countryBase, countryGrowth, roundFn),
      'By Distribution / Procurement Channel': buildTopLevelTree(
        byDistributionRoot,
        countryBase,
        countryGrowth,
        roundFn
      ),
    };
  }

  return data;
}

/** Strip numeric leaves to {} for segmentation_analysis.json */
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
console.log('Geographies:', GEOGRAPHIES.join(', '));
console.log(
  'Segment types:',
  Object.keys(valueData.Brazil).join(', ')
);
