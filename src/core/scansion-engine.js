/**
 * Sanskrit Scansion & NLP Engine
 * Tokenizes Sanskrit verses (IAST or Devanagari) into metrical syllables,
 * computes Laghu/Guru weights according to Paninian and Pingalan phonetic rules,
 * and classifies known Vedic/Classical Sanskrit meters (Vṛtta).
 */

// Known Classical Sanskrit Meters
export const KNOWN_METERS = [
  {
    name: 'Anuṣṭubh / Śloka (अनुष्टुब्)',
    syllablesPerPada: 8,
    totalSyllables: 32,
    description: 'The standard 8-syllable quarter-verse meter of the Ramayana, Mahabharata, and Gita. 5th syllable is L, 6th is G.',
    test: (patt) => patt.length === 8 && patt[4] === 'L' && patt[5] === 'G'
  },
  {
    name: 'Gāyatrī (गायत्री)',
    syllablesPerPada: 8,
    totalSyllables: 24,
    description: 'Vedic meter consisting of 3 triplets of 8 syllables (24 total syllables).',
    test: (patt) => patt.length === 8
  },
  {
    name: 'Indravajrā (इन्द्रवज्रा)',
    syllablesPerPada: 11,
    pattern: ['G', 'G', 'L', 'G', 'G', 'L', 'L', 'G', 'L', 'G', 'G'], // Ta, Ta, Ja, Ga, Ga
    description: '11 syllables: Ta-gaṇa, Ta-gaṇa, Ja-gaṇa, Guru, Guru (— — ∪ — — ∪ ∪ — ∪ — —)',
    test: (patt) => patt.join('') === 'GGLGGLLGLGG'
  },
  {
    name: 'Upendravajrā (उपेन्द्रवज्रा)',
    syllablesPerPada: 11,
    pattern: ['L', 'G', 'L', 'G', 'G', 'L', 'L', 'G', 'L', 'G', 'G'], // Ja, Ta, Ja, Ga, Ga
    description: '11 syllables: Ja-gaṇa, Ta-gaṇa, Ja-gaṇa, Guru, Guru (∪ — ∪ — — ∪ ∪ — ∪ — —)',
    test: (patt) => patt.join('') === 'LGLGGLLGLGG'
  },
  {
    name: 'Upajāti (उपजाति)',
    syllablesPerPada: 11,
    description: '11 syllables: Any mixture of Indravajrā and Upendravajrā lines.',
    test: (patt) => patt.length === 11 && patt.slice(3).join('') === 'GGLLGLGG'
  },
  {
    name: 'Vasantatilakā (वसन्ततिलका)',
    syllablesPerPada: 14,
    pattern: ['G', 'G', 'L', 'G', 'L', 'L', 'L', 'G', 'L', 'L', 'G', 'L', 'G', 'G'], // Ta, Bha, Ja, Ja, Ga, Ga
    description: '14 syllables: Ta, Bha, Ja, Ja, Ga, Ga',
    test: (patt) => patt.join('') === 'GGLGLLLGLLGLGG'
  },
  {
    name: 'Mālinī (मालिनी)',
    syllablesPerPada: 15,
    pattern: ['L', 'L', 'L', 'L', 'L', 'L', 'G', 'G', 'L', 'G', 'G', 'L', 'G', 'G', 'G'], // Na, Na, Ma, Ya, Ya
    description: '15 syllables: Na, Na, Ma, Ya, Ya with caesura at 8 and 7',
    test: (patt) => patt.length === 15
  },
  {
    name: 'Mandākrāntā (मन्दाक्रान्ता)',
    syllablesPerPada: 17,
    pattern: ['G', 'G', 'G', 'G', 'L', 'L', 'L', 'L', 'L', 'G', 'G', 'L', 'G', 'G', 'L', 'G', 'G'], // Ma, Bha, Na, Ta, Ta, Ga, Ga
    description: '17 syllables of Kalidasa\'s Meghadūta: Ma, Bha, Na, Ta, Ta, Ga, Ga',
    test: (patt) => patt.length === 17
  },
  {
    name: 'Śārdūlavikrīḍita (शार्दूलविक्रीडित)',
    syllablesPerPada: 19,
    pattern: ['G', 'G', 'G', 'L', 'L', 'G', 'L', 'G', 'L', 'L', 'L', 'G', 'G', 'L', 'G', 'G', 'L', 'G', 'G'],
    description: '19 syllables: Ma, Sa, Ja, Sa, Ta, Ta, Ga',
    test: (patt) => patt.length === 19
  }
];

// Devanagari to IAST Transliteration Map
const DEVA_VOWELS = {
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū',
  'ऋ': 'ṛ', 'ॠ': 'ṝ', 'ऌ': 'ḷ', 'ॡ': 'ḹ', 'ए': 'e', 'ऐ': 'ai',
  'ओ': 'o', 'औ': 'au'
};

const DEVA_MATRAS = {
  'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū',
  'ृ': 'ṛ', 'ॄ': 'ṝ', 'ॢ': 'ḷ', 'ॣ': 'ḹ', 'े': 'e', 'ै': 'ai',
  'ो': 'o', 'ौ': 'au'
};

const DEVA_CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
  'ट': 'ṭ', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v',
  'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h'
};

/**
 * Transliterate Devanagari to IAST if needed
 * @param {string} text
 * @returns {string} IAST text
 */
export function normalizeSanskritInput(text) {
  let result = '';
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const ch = text[i];
    
    // Check Independent Vowel
    if (DEVA_VOWELS[ch]) {
      result += DEVA_VOWELS[ch];
      continue;
    }

    // Check Consonant
    if (DEVA_CONSONANTS[ch]) {
      const cons = DEVA_CONSONANTS[ch];
      const nextCh = text[i + 1];

      if (nextCh === '्') { // Virama (Halanta)
        result += cons;
        i++; // skip virama
      } else if (DEVA_MATRAS[nextCh]) {
        result += cons + DEVA_MATRAS[nextCh];
        i++; // skip matra
      } else {
        // Inherent 'a'
        result += cons + 'a';
      }
      continue;
    }

    // Anusvara
    if (ch === 'ं') {
      result += 'ṁ';
      continue;
    }
    // Visarga
    if (ch === 'ः') {
      result += 'ḥ';
      continue;
    }
    // Avagraha
    if (ch === 'ऽ') {
      result += '\'';
      continue;
    }

    // Pass through ascii/space
    result += ch;
  }

  return result.toLowerCase();
}

/**
 * Scan Sanskrit text into syllables with Laghu/Guru classification
 * Rules:
 * 1. Base short vowels: a, i, u, ṛ, ḷ -> Laghu (L)
 * 2. Base long vowels: ā, ī, ū, ṝ, e, ai, o, au -> Guru (G)
 * 3. Short vowel followed by Anusvāra (ṁ) or Visarga (ḥ) -> Guru (G)
 * 4. Short vowel followed by conjunct consonants (2+ consonants) -> Guru (G)
 * 5. Optional: final syllable in a verse (padānta) can be treated as Guru
 * 
 * @param {string} rawText 
 * @param {boolean} allowPadantaGuru - Whether last syllable can be Guru
 * @returns {{ syllables: Array<Object>, pattern: Array<'L'|'G'>, binary: string, detectedMeter: Object|null }}
 */
export function scanSanskritVerse(rawText, allowPadantaGuru = true) {
  const normalized = normalizeSanskritInput(rawText.trim());
  
  // Regex to split into syllable tokens with their vowels
  // Vowels in IAST: ā, ī, ū, ṝ, ai, au, a, i, u, ṛ, ḷ, e, o
  const vowelRegex = /(ā|ī|ū|ṝ|ai|au|e|o|a|i|u|ṛ|ḷ)/gi;
  const longVowels = new Set(['ā', 'ī', 'ū', 'ṝ', 'ai', 'au', 'e', 'o']);

  const cleanText = normalized.replace(/[^a-zāīūṛṝḷṁḥ\s]/gi, '');
  const words = cleanText.split(/\s+/).filter(Boolean);

  const scannedSyllables = [];

  for (const word of words) {
    // Find all vowel indices in word
    const matches = [];
    let m;
    while ((m = vowelRegex.exec(word)) !== null) {
      matches.push({ vowel: m[0], index: m.index });
    }

    for (let k = 0; k < matches.length; k++) {
      const current = matches[k];
      const next = matches[k + 1];

      // Syllable text slice
      const startIdx = k === 0 ? 0 : current.index;
      const endIdx = next ? next.index : word.length;
      const syllableSlice = word.slice(startIdx, endIdx);

      const isLongVowel = longVowels.has(current.vowel);
      let isGuru = isLongVowel;
      let reason = isLongVowel ? `Long vowel '${current.vowel}'` : `Short vowel '${current.vowel}'`;

      // Check following characters for conjuncts, anusvara, visarga
      const afterVowel = word.slice(current.index + current.vowel.length, next ? next.index : word.length);

      if (!isGuru) {
        if (afterVowel.includes('ṁ')) {
          isGuru = true;
          reason = `Short vowel with Anusvāra (ṁ)`;
        } else if (afterVowel.includes('ḥ')) {
          isGuru = true;
          reason = `Short vowel with Visarga (ḥ)`;
        } else {
          // Count consonants following vowel
          const consonantsAfter = afterVowel.replace(/[^b-df-hj-np-tv-zñṅṇṭḍṣś]/g, '').length;
          if (consonantsAfter >= 2) {
            isGuru = true;
            reason = `Short vowel followed by conjunct consonants (${consonantsAfter} consonants)`;
          }
        }
      }

      scannedSyllables.push({
        text: syllableSlice,
        vowel: current.vowel,
        weight: isGuru ? 'Guru' : 'Laghu',
        symbol: isGuru ? '—' : '∪',
        code: isGuru ? 'G' : 'L',
        bit: isGuru ? 1 : 0,
        matras: isGuru ? 2 : 1,
        reason
      });
    }
  }

  // Padanta rule: final syllable can optionally be treated as Guru
  if (allowPadantaGuru && scannedSyllables.length > 0) {
    const last = scannedSyllables[scannedSyllables.length - 1];
    if (last.code === 'L') {
      last.weight = 'Guru (Padānta)';
      last.symbol = '—';
      last.code = 'G';
      last.bit = 1;
      last.matras = 2;
      last.reason += ' (Promoted to Guru at verse end / Padānta)';
    }
  }

  const pattern = scannedSyllables.map(s => s.code);
  const binary = pattern.map(s => s === 'G' ? '1' : '0').join('');

  // Meter classification check
  let detectedMeter = null;
  for (const meter of KNOWN_METERS) {
    if (meter.test && meter.test(pattern)) {
      detectedMeter = meter;
      break;
    }
  }

  return {
    syllables: scannedSyllables,
    pattern,
    binary,
    totalMatras: scannedSyllables.reduce((acc, s) => acc + s.matras, 0),
    detectedMeter
  };
}
