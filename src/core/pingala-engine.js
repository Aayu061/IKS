/**
 * Pingala Engine: Mathematical Core for Chandaḥśāstra Combinatorics
 * Implements Chapter 8 Sūtras of Ācārya Piṅgala (c. 300-200 BCE):
 * 1. Prastāra (Combinatorial Permutations / Truth Table)
 * 2. Naṣṭam (Rank-to-Binary Decoder via Halving)
 * 3. Uddiṣṭam (Binary-to-Rank Encoder via Positional Notation)
 * 4. Saṅkhyā (Fast Exponentiation in O(log n))
 * 5. Traditional Akṣara-Gaṇas (3-bit octal triplets)
 */

// The 8 Classical Sanskrit Metrical Gaṇas (Triplets of syllables)
// Derived from the famous mnemonic verse: 'ya-mā-tā-rā-ja-bhā-na-sa-la-gāḥ'
export const GANAS = {
  'Ya': { name: 'Ya-gaṇa (यगण)', pattern: ['L', 'G', 'G'], binary: '011', meaning: 'Adilaghu (Light initial)' },
  'Ma': { name: 'Ma-gaṇa (मगण)', pattern: ['G', 'G', 'G'], binary: '111', meaning: 'Sarvaguru (All heavy)' },
  'Ta': { name: 'Ta-gaṇa (तगण)', pattern: ['G', 'G', 'L'], binary: '110', meaning: 'Antyalaghu (Light final)' },
  'Ra': { name: 'Ra-gaṇa (रगण)', pattern: ['G', 'L', 'G'], binary: '101', meaning: 'Madhyalaghu (Light middle)' },
  'Ja': { name: 'Ja-gaṇa (जगण)', pattern: ['L', 'G', 'L'], binary: '010', meaning: 'Madhyaguru (Heavy middle)' },
  'Bha': { name: 'Bha-gaṇa (भगण)', pattern: ['G', 'L', 'L'], binary: '100', meaning: 'Adiguru (Heavy initial)' },
  'Na': { name: 'Na-gaṇa (नगण)', pattern: ['L', 'L', 'L'], binary: '000', meaning: 'Sarvalaghu (All light)' },
  'Sa': { name: 'Sa-gaṇa (सगण)', pattern: ['L', 'L', 'G'], binary: '001', meaning: 'Antyaguru (Heavy final)' },
};

/**
 * Identify the Gaṇa of a 3-syllable slice
 * @param {Array<'L'|'G'>} triplet 
 * @returns {string} Gaṇa name or custom
 */
export function identifyGana(triplet) {
  if (!triplet || triplet.length !== 3) return '-';
  const key = triplet.join('');
  for (const [code, info] of Object.entries(GANAS)) {
    if (info.pattern.join('') === key) {
      return code;
    }
  }
  return '-';
}

/**
 * Naṣṭam Algorithm:
 * "Given the ordinal rank R in [1, 2^n], reconstruct the exact meter pattern."
 * 
 * Piṅgala's Rule:
 * 1. If R is odd, the syllable is Laghu (L), and we replace R with (R + 1) / 2.
 * 2. If R is even, the syllable is Guru (G), and we replace R with R / 2.
 * 
 * @param {number} rank - 1-based decimal rank (1 to 2^n)
 * @param {number} n - Number of syllables
 * @returns {{ pattern: Array<'L'|'G'>, binary: string, trace: Array<Object> }}
 */
export function pingalaNastam(rank, n) {
  if (rank < 1 || rank > Math.pow(2, n)) {
    throw new Error(`Rank ${rank} is out of bounds for n = ${n} syllables (Valid: 1 to ${Math.pow(2, n)})`);
  }

  const pattern = [];
  const trace = [];
  let currentR = rank;

  for (let i = 1; i <= n; i++) {
    const isOdd = currentR % 2 !== 0;
    const syllable = isOdd ? 'L' : 'G';
    const bit = isOdd ? '0' : '1';
    const prevR = currentR;
    const nextR = isOdd ? Math.floor((currentR + 1) / 2) : Math.floor(currentR / 2);

    trace.push({
      step: i,
      inputRank: prevR,
      isOdd,
      syllable,
      bit,
      action: isOdd ? `Odd: assign Laghu (L/0), R' = (${prevR} + 1)/2 = ${nextR}` : `Even: assign Guru (G/1), R' = ${prevR}/2 = ${nextR}`,
      nextRank: nextR
    });

    pattern.push(syllable);
    currentR = nextR;
  }

  const binary = pattern.map(s => s === 'G' ? '1' : '0').join('');
  return { pattern, binary, trace };
}

/**
 * Uddiṣṭam Algorithm:
 * "Given a metric pattern of Laghus and Gurus, determine its exact ordinal rank."
 * 
 * Piṅgala's Positional Rule:
 * Rank = 1 + sum_{i=0}^{n-1} (b_i * 2^i)
 * where b_i = 1 if syllable is Guru, 0 if Laghu.
 * 
 * @param {Array<'L'|'G'> | string} inputPattern - Array of 'L'/'G' or binary string '0101'
 * @returns {{ rank: number, trace: Array<Object>, placeValues: Array<number> }}
 */
export function pingalaUddistam(inputPattern) {
  const pattern = Array.isArray(inputPattern) 
    ? inputPattern 
    : inputPattern.toUpperCase().split('').map(c => c === '1' || c === 'G' ? 'G' : 'L');

  let rank = 1;
  let placeValue = 1;
  const trace = [];
  const placeValues = [];

  for (let i = 0; i < pattern.length; i++) {
    const syl = pattern[i];
    const isGuru = syl === 'G';
    const contribution = isGuru ? placeValue : 0;
    
    trace.push({
      position: i + 1,
      syllable: syl,
      bit: isGuru ? 1 : 0,
      placeValue,
      contribution,
      runningSum: rank + (isGuru ? placeValue : 0)
    });

    if (isGuru) {
      rank += placeValue;
    }
    placeValues.push(placeValue);
    placeValue *= 2;
  }

  return { rank, trace, placeValues };
}

/**
 * Prastāra Algorithm:
 * Generate the complete combinatorial permutation table for a meter of length n.
 * Returns exactly 2^n rows ordered canonically.
 * 
 * @param {number} n - Syllable count (1 to 12 recommended for UI rendering)
 * @returns {Array<Object>} List of row records
 */
export function generatePrastara(n) {
  const total = Math.pow(2, n);
  const rows = [];

  for (let r = 1; r <= total; r++) {
    const { pattern, binary } = pingalaNastam(r, n);
    
    // Calculate total Mātrā weight: Laghu = 1, Guru = 2
    const matras = pattern.reduce((sum, syl) => sum + (syl === 'G' ? 2 : 1), 0);
    const laghuCount = pattern.filter(s => s === 'L').length;
    const guruCount = pattern.filter(s => s === 'G').length;

    // Split into 3-syllable Gaṇas
    const ganas = [];
    for (let i = 0; i < pattern.length; i += 3) {
      const slice = pattern.slice(i, i + 3);
      if (slice.length === 3) {
        ganas.push(identifyGana(slice));
      } else {
        // Remaining syllables (1 or 2) are termed Laghu/Guru
        ganas.push(slice.map(s => s === 'G' ? 'Ga' : 'La').join('-'));
      }
    }

    rows.push({
      rank: r,
      pattern,
      patternStr: pattern.join(' '),
      binary,
      matras,
      laghuCount,
      guruCount,
      ganas: ganas.join(' ')
    });
  }

  return rows;
}

/**
 * Saṅkhyā Algorithm: Fast Exponentiation
 * Calculates 2^n in O(log n) operations using Piṅgala's recursive halving rule.
 * 
 * Aphorisms:
 * - "dvir ardhe": If exponent is even, divide by 2 and square.
 * - "rūpe śūnyam": If exponent is odd, subtract 1 and multiply by 2.
 * 
 * @param {number} n - Non-negative integer exponent
 * @returns {{ result: number, multiplications: number, steps: Array<string> }}
 */
export function pingalaSankhya(n) {
  let steps = [];
  let multiplications = 0;

  function recurse(exponent) {
    if (exponent === 0) {
      steps.push(`Base case: 2^0 = 1`);
      return 1;
    }
    if (exponent % 2 === 0) {
      steps.push(`Even exponent ${exponent}: Halve to ${exponent / 2}, then square (dvir ardhe)`);
      const half = recurse(exponent / 2);
      multiplications++;
      return half * half;
    } else {
      steps.push(`Odd exponent ${exponent}: Subtract 1 to ${exponent - 1}, multiply by 2 (rūpe śūnyam)`);
      const prev = recurse(exponent - 1);
      multiplications++;
      return 2 * prev;
    }
  }

  const result = recurse(n);
  return { result, multiplications, steps };
}
