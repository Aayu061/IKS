/**
 * Algorithms & Method Data Specification
 * Contains formal pseudocode, worked steps, complexity matrices,
 * and invariants for all 6 core Piṅgala algorithms.
 */

export const ALGORITHM_SPECS = {
  'prastara': {
    id: 'prastara',
    title: 'Combinatorial Prastāra (प्रस्तार)',
    subtitle: 'Systematic Permutation Matrix & Truth Table Generation',
    sutra: 'prastāro dvy-aṅgulena (प्रस्तारो द्व्यङ्गुलेन)',
    description: 'Generates all 2^n metrical patterns for an n-syllable meter in Piṅgala\'s canonical lexicographical sequence.',
    pseudocode: `// Algorithm 1: Combinatorial Prastāra Generation
// Complexity: Time O(n · 2^n), Space O(n · 2^n)

ALGORITHM PingalaPrastara(n: Integer) -> Matrix of Syllables
INPUT:  Syllable length n >= 1
OUTPUT: List P containing 2^n patterns, each of length n

1. total ← 2^n
2. P ← empty list of rows
3. FOR rank r ← 1 TO total DO
4.     pattern ← PingalaNastam(r, n)
5.     APPEND pattern TO P
6. END FOR
7. RETURN P`,
    workedStep: {
      heading: 'Permutation Ordering for n = 3 Syllables (2³ = 8 Meters)',
      illustration: [
        { rank: 1, pattern: 'L L L', binary: '000', gana: 'Na-gaṇa (All Light)', matras: 3 },
        { rank: 2, pattern: 'G L L', binary: '100', gana: 'Bha-gaṇa (Initial Heavy)', matras: 4 },
        { rank: 3, pattern: 'L G L', binary: '010', gana: 'Ja-gaṇa (Middle Heavy)', matras: 4 },
        { rank: 4, pattern: 'G G L', binary: '110', gana: 'Ta-gaṇa (Initial 2 Heavy)', matras: 5 },
        { rank: 5, pattern: 'L L G', binary: '001', gana: 'Sa-gaṇa (Final Heavy)', matras: 4 },
        { rank: 6, pattern: 'G L G', binary: '101', gana: 'Ra-gaṇa (Middle Light)', matras: 5 },
        { rank: 7, pattern: 'L G G', binary: '011', gana: 'Ya-gaṇa (Initial Light)', matras: 5 },
        { rank: 8, pattern: 'G G G', binary: '111', gana: 'Ma-gaṇa (All Heavy)', matras: 6 }
      ],
      note: 'Notice the alternation: Column 1 alternates every 1 row, Column 2 every 2 rows, Column 3 every 4 rows—matching binary place values exactly.'
    },
    complexity: {
      time: 'O(n · 2ⁿ)',
      space: 'O(n · 2ⁿ)',
      auxiliary: 'O(n)',
      bits: 'n bits per meter'
    },
    invariant: '|S_n| = 2^n (Canonical bijection with n-dimensional hypercube)'
  },

  'nastam': {
    id: 'nastam',
    title: 'Naṣṭam (नष्टम्): Rank-to-Binary Decoder',
    subtitle: 'Reconstructing the "Lost" Meter from its Ordinal Index via Halving',
    sutra: 'lagheveti samānam, viṣame rūpaṁ prakṣipya (लघेवेति समानम्, विषमे रूपं प्रक्षिप्य)',
    description: 'Given any decimal rank R in [1, 2^n], recovers the exact sequence of Laghus and Gurus using integer division and modulo parity.',
    pseudocode: `// Algorithm 2: Naṣṭam (Decimal Rank to Syllable Pattern)
// Complexity: Time O(n), Auxiliary Space O(1)

ALGORITHM PingalaNastam(R: Integer, n: Integer) -> Array of Syllables
INPUT:  Decimal Rank R in [1, 2^n], Syllable count n >= 1
OUTPUT: Syllable array B = [b_1, b_2, ..., b_n] where b_i in {'L', 'G'}

1. current_R ← R
2. B ← array of size n
3. FOR i ← 1 TO n DO
4.     IF current_R is ODD THEN
5.         B[i] ← 'L'              // Laghu (0)
6.         current_R ← (current_R + 1) / 2
7.     ELSE
8.         B[i] ← 'G'              // Guru (1)
9.         current_R ← current_R / 2
10.    END IF
11. END FOR
12. RETURN B`,
    workedStep: {
      heading: 'Worked Trace for Rank R = 43, Syllables n = 6',
      steps: [
        'Step 1: R = 43 (Odd)  → Assign Laghu (L),  R\' = (43 + 1) / 2 = 22',
        'Step 2: R = 22 (Even) → Assign Guru (G),   R\' = 22 / 2 = 11',
        'Step 3: R = 11 (Odd)  → Assign Laghu (L),  R\' = (11 + 1) / 2 = 6',
        'Step 4: R = 6  (Even) → Assign Guru (G),   R\' = 6 / 2 = 3',
        'Step 5: R = 3  (Odd)  → Assign Laghu (L),  R\' = (3 + 1) / 2 = 2',
        'Step 6: R = 2  (Even) → Assign Guru (G),   R\' = 2 / 2 = 1',
        'Result: Pattern = [L, G, L, G, L, G] (Binary: 010101)'
      ],
      note: 'Piṅgala\'s addition of 1 before halving odd numbers mathematically shifts the 1-based rank to 0-based bit extraction.'
    },
    complexity: {
      time: 'O(n)',
      space: 'O(n)',
      auxiliary: 'O(1)',
      bits: 'Requires ⌈log₂ R⌉ bits of integer precision'
    },
    invariant: 'Reconstructs canonical representation without full table generation'
  },

  'uddistam': {
    id: 'uddistam',
    title: 'Uddiṣṭam (उद्दिष्टम्): Binary-to-Rank Encoder',
    subtitle: 'Evaluating the Ordinal Rank from a Pattern via Positional Weights',
    sutra: 'varṇānupūrvyā rūpe saṅkhyānam (वर्णानुपूर्व्या रूपे सङ्ख्यानम्)',
    description: 'Determines the decimal rank R of a given meter pattern by accumulating binary powers of two across positions.',
    pseudocode: `// Algorithm 3: Uddiṣṭam (Syllable Pattern to Decimal Rank)
// Complexity: Time O(n), Auxiliary Space O(1)

ALGORITHM PingalaUddistam(B: Array of Syllables) -> Integer
INPUT:  Syllable array B = [b_1, b_2, ..., b_n] where b_i in {'L', 'G'}
OUTPUT: Decimal Rank R in [1, 2^n]

1. R ← 1
2. place_value ← 1
3. FOR i ← 1 TO LENGTH(B) DO
4.     IF B[i] == 'G' THEN
5.         R ← R + place_value
6.     END IF
7.     place_value ← place_value * 2
8. END FOR
9. RETURN R`,
    workedStep: {
      heading: 'Worked Calculation for Pattern [L, G, L, G, L, G]',
      steps: [
        'Position 1: Laghu (0) → Contribution: 0 × 2⁰ = 0',
        'Position 2: Guru  (1) → Contribution: 1 × 2¹ = 2',
        'Position 3: Laghu (0) → Contribution: 0 × 2² = 0',
        'Position 4: Guru  (1) → Contribution: 1 × 2³ = 8',
        'Position 5: Laghu (0) → Contribution: 0 × 2⁴ = 0',
        'Position 6: Guru  (1) → Contribution: 1 × 2⁵ = 32',
        'Rank = 1 + (0 + 2 + 0 + 8 + 0 + 32) = 1 + 42 = 43'
      ],
      note: 'Notice the perfect inverse: Uddiṣṭam([L,G,L,G,L,G]) recovers Rank 43 exactly.'
    },
    complexity: {
      time: 'O(n)',
      space: 'O(1)',
      auxiliary: 'O(1)',
      bits: 'Little-endian bit summation'
    },
    invariant: 'Uddiṣṭam(Naṣṭam(R, n)) ≡ R (Bijective Isomorphism)'
  },

  'sankhya': {
    id: 'sankhya',
    title: 'Saṅkhyā (संख्या): Fast Exponentiation',
    subtitle: 'Computing 2ⁿ in O(log n) Time via Repeated Squaring',
    sutra: 'dvir ardhe, rūpe śūnyam (द्विरर्धे, रूपे शून्यम्)',
    description: 'Computes total combinations 2^n using divide-and-conquer halving and squaring centuries before modern binary exponentiation.',
    pseudocode: `// Algorithm 4: Saṅkhyā (Fast Exponentiation)
// Complexity: Time O(log n), Space O(log n) call stack

ALGORITHM PingalaSankhya(n: Integer) -> Integer
INPUT:  Exponent n >= 0
OUTPUT: Value of 2^n

1. IF n == 0 THEN RETURN 1
2. IF n is EVEN THEN
3.     half ← PingalaSankhya(n / 2)
4.     RETURN half * half          // "dvir ardhe" (square when halved)
5. ELSE
6.     RETURN 2 * PingalaSankhya(n - 1)  // "rūpe śūnyam" (multiply by 2)
7. END IF`,
    workedStep: {
      heading: 'Evaluation of 2¹⁰ = 1024 in 4 Multiplications',
      steps: [
        'Step 1: n=10 (Even) → Halve to 5, compute (2⁵)²',
        'Step 2: n=5  (Odd)  → Compute 2 × 2⁴',
        'Step 3: n=4  (Even) → Halve to 2, compute (2²)²',
        'Step 4: n=2  (Even) → Halve to 1, compute (2¹)² = (2 × 2⁰)² = 4',
        'Ascent: 2² = 4 → 2⁴ = 16 → 2⁵ = 32 → 2¹⁰ = (32)² = 1024'
      ],
      note: 'Total multiplications required: 4, compared to 9 in naive linear multiplication.'
    },
    complexity: {
      time: 'O(log n)',
      space: 'O(1) iterative / O(log n) recursive',
      auxiliary: 'O(1)',
      bits: 'Optimal arithmetic operations'
    },
    invariant: '2ⁿ = (2ⁿ/²)² for even n; 2ⁿ = 2 · 2ⁿ⁻¹ for odd n'
  },

  'meru': {
    id: 'meru',
    title: 'Meru-Prastāra (मेरुप्रस्तार): Binomial DP Triangle',
    subtitle: 'Dynamic Programming Memoization & Combinatorial Pyramids',
    sutra: 'pareṇa pūrvaṁ saṅkalanāt (परेण पूर्वं सङ्कलनात्)',
    description: 'Constructs the pyramid of binomial coefficients where each inner cell is the dynamic programming sum of the two cells directly above it.',
    pseudocode: `// Algorithm 5: Meru-Prastāra Dynamic Programming Table
// Complexity: Time O(N²), Space O(N²)

ALGORITHM BuildMeruPrastara(N: Integer) -> 2D Matrix
INPUT:  Max row height N >= 0
OUTPUT: Triangular matrix M where M[n][k] = Binomial(n, k)

1. M ← array of size N + 1
2. FOR r ← 0 TO N DO
3.     current ← array of size r + 1
4.     current[0] ← 1              // Left edge base case
5.     current[r] ← 1              // Right edge base case
6.     FOR k ← 1 TO r - 1 DO
7.         current[k] ← M[r - 1][k - 1] + M[r - 1][k]  // DP recurrence
8.     END FOR
9.     M[r] ← current
10. END FOR
11. RETURN M`,
    workedStep: {
      heading: 'Dynamic Step: Constructing Row n = 5 from Row n = 4',
      steps: [
        'Row n=4: [ 1,   4,   6,   4,   1 ]',
        '            \\ /  \\ /  \\ /  \\ /',
        'Add pairs:  1+4  4+6  6+4  4+1',
        'Row n=5: [ 1,   5,  10,  10,   5,   1 ]',
        'Verification: 1 + 5 + 10 + 10 + 5 + 1 = 32 = 2⁵'
      ],
      note: 'Cell (5, 2) = 10 represents the 10 distinct meters of 5 syllables containing exactly 2 Gurus.'
    },
    complexity: {
      time: 'O(N²)',
      space: 'O(N²)',
      auxiliary: 'O(1) to evaluate C(n, k) with multiplicative formula',
      bits: 'Precedes Blaise Pascal (1654 CE) by over 700 years'
    },
    invariant: '∑ C(n, k) = 2ⁿ AND C(n, k) = C(n, n - k)'
  },

  'scansion': {
    id: 'scansion',
    title: 'Sanskrit Scansion (वर्णलघुगुरुविवेक)',
    subtitle: 'Phonological Syllabification & Classical Meter Classifier',
    sutra: 'sānusvāro visargastho gurur dīrghaś ca saṁyoge (सानुस्वारो विसर्गस्थो गुरुर्दीर्घश्च संयोगे)',
    description: 'Parses Sanskrit natural language text into metrical syllables, determines syllable weights, and identifies Vedic and classical meters.',
    pseudocode: `// Algorithm 6: Sanskrit Phonological Scansion
// Complexity: Time O(m) for m characters, Space O(m)

ALGORITHM ScanSanskritVerse(text: String, padantaGuru: Boolean) -> MetricalAnalysis
INPUT:  Sanskrit text (IAST or Devanagari), padantaGuru flag
OUTPUT: Syllables, weights, total mātrās, detected classical meter

1. normalized ← TransliterateToIAST(text)
2. vowels ← ExtractVocalicNuclei(normalized)
3. FOR EACH vowel v IN vowels DO
4.     weight ← IsLongVowel(v) ? 'Guru' : 'Laghu'
5.     IF weight == 'Laghu' THEN
6.         IF FollowedByAnusvaraOrVisarga(v) THEN weight ← 'Guru'
7.         ELSE IF FollowedByConjunctConsonants(v) THEN weight ← 'Guru'
8.     END IF
9.     RecordSyllable(v, weight)
10. END FOR
11. IF padantaGuru THEN PromoteLastSyllableToGuru()
12. detectedMeter ← ClassifyMeter(syllables)
13. RETURN { syllables, detectedMeter }`,
    workedStep: {
      heading: 'Scansion of "yadā yadā hi dharmasya"',
      steps: [
        'ya: short "a" + single "d" → Laghu (∪, 1m)',
        'dā: long "ā"               → Guru  (—, 2m)',
        'ya: short "a" + single "d" → Laghu (∪, 1m)',
        'dā: long "ā"               → Guru  (—, 2m)',
        'hi: short "i" + single "dh"→ Laghu (∪, 1m)',
        'dhar: short "a" + conjunct "rm" → Guru (—, 2m) [Positionally heavy]',
        'ma: short "a" + single "sy"→ Laghu (∪, 1m) or Guru before "sy"',
        'sya: short "a" at verse boundary → Guru by Padānta convention'
      ],
      note: 'Matches the 8-syllable Anuṣṭubh / Śloka cadence of the Mahabharata and Gita.'
    },
    complexity: {
      time: 'O(m) where m is string length',
      space: 'O(m)',
      auxiliary: 'O(1)',
      bits: 'Context-sensitive phonological automaton'
    },
    invariant: 'Phonetic conjunct promotion rule (guru saṁyoge)'
  }
};
