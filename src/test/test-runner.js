/**
 * Automated Test Runner & Verification Suite
 * Implements and verifies all 12 formal test cases specified in the PRD.
 * Designed for one-click live demonstration and evaluation during the viva.
 */

import { generatePrastara, pingalaNastam, pingalaUddistam, pingalaSankhya } from '../core/pingala-engine.js';
import { generateMeruPrastara } from '../core/meru-engine.js';
import { generateMatraCompositions } from '../core/matra-fibonacci.js';
import { scanSanskritVerse } from '../core/scansion-engine.js';

export const TEST_SUITE = [
  {
    id: 'TC-01',
    name: 'Prastāra Combinatorial Size (n = 3)',
    category: 'Prastāra',
    description: 'Verify that a 3-syllable meter yields exactly 2^3 = 8 permutations.',
    run: () => {
      const rows = generatePrastara(3);
      const passed = rows.length === 8;
      return {
        passed,
        input: 'n = 3 syllables',
        expected: '8 rows (|S_n| = 2^3)',
        actual: `${rows.length} rows`,
        invariant: '|S_n| == 2^n'
      };
    }
  },
  {
    id: 'TC-02',
    name: 'Prastāra Canonical Boundaries (n = 4)',
    category: 'Prastāra',
    description: 'Verify that the first row is all Laghus (0000) and last row is all Gurus (1111).',
    run: () => {
      const rows = generatePrastara(4);
      const firstRowPattern = rows[0].pattern.join('');
      const lastRowPattern = rows[15].pattern.join('');
      const passed = firstRowPattern === 'LLLL' && lastRowPattern === 'GGGG';
      return {
        passed,
        input: 'n = 4 syllables',
        expected: 'Row 1: LLLL, Row 16: GGGG',
        actual: `Row 1: ${firstRowPattern}, Row 16: ${lastRowPattern}`,
        invariant: 'First row is zero-vector, last row is all-ones vector'
      };
    }
  },
  {
    id: 'TC-03',
    name: 'Naṣṭam Minimum Boundary Rank (R = 1, n = 4)',
    category: 'Naṣṭam',
    description: 'Verify that Rank 1 reconstructs the all-light pattern [L, L, L, L].',
    run: () => {
      const { pattern } = pingalaNastam(1, 4);
      const resultStr = pattern.join('');
      const passed = resultStr === 'LLLL';
      return {
        passed,
        input: 'Rank R = 1, n = 4',
        expected: 'LLLL',
        actual: resultStr,
        invariant: 'Nastam(1, n) == [L]^n'
      };
    }
  },
  {
    id: 'TC-04',
    name: 'Naṣṭam Maximum Boundary Rank (R = 16, n = 4)',
    category: 'Naṣṭam',
    description: 'Verify that Rank 2^n reconstructs the all-heavy pattern [G, G, G, G].',
    run: () => {
      const { pattern } = pingalaNastam(16, 4);
      const resultStr = pattern.join('');
      const passed = resultStr === 'GGGG';
      return {
        passed,
        input: 'Rank R = 16, n = 4',
        expected: 'GGGG',
        actual: resultStr,
        invariant: 'Nastam(2^n, n) == [G]^n'
      };
    }
  },
  {
    id: 'TC-05',
    name: 'Naṣṭam Arbitrary Rank Evaluation (R = 6, n = 4)',
    category: 'Naṣṭam',
    description: 'Verify that Rank 6 produces [G, L, G, L] according to Piṅgala\'s halving rule.',
    run: () => {
      const { pattern } = pingalaNastam(6, 4);
      const resultStr = pattern.join('');
      const passed = resultStr === 'GLGL';
      return {
        passed,
        input: 'Rank R = 6, n = 4',
        expected: 'GLGL',
        actual: resultStr,
        invariant: 'Step arithmetic satisfies Piṅgala\'s dvir ardhe rule'
      };
    }
  },
  {
    id: 'TC-06',
    name: 'Uddiṣṭam Place-Value Evaluation (Pattern [G, L, G, L])',
    category: 'Uddiṣṭam',
    description: 'Verify that pattern GLGL evaluates to decimal rank 6 via Horner\'s positional rule.',
    run: () => {
      const { rank } = pingalaUddistam(['G', 'L', 'G', 'L']);
      const passed = rank === 6;
      return {
        passed,
        input: 'Pattern: [G, L, G, L]',
        expected: 'Rank = 6 (1 + 1*1 + 0*2 + 1*4 + 0*8)',
        actual: `Rank = ${rank}`,
        invariant: 'Uddistam(B) == 1 + sum(b_i * 2^i)'
      };
    }
  },
  {
    id: 'TC-07',
    name: 'Bidirectional Bijection Invariant (Round-Trip Test)',
    category: 'Bijection',
    description: 'Verify that Uddiṣṭam(Naṣṭam(R, n)) === R for arbitrary rank R = 43, n = 6.',
    run: () => {
      const testRank = 43;
      const n = 6;
      const { pattern } = pingalaNastam(testRank, n);
      const { rank: recoveredRank } = pingalaUddistam(pattern);
      const passed = testRank === recoveredRank;
      return {
        passed,
        input: `n = ${n}, Initial Rank R = ${testRank}`,
        expected: `Recovered Rank = ${testRank}`,
        actual: `Recovered Rank = ${recoveredRank} (Pattern: ${pattern.join('')})`,
        invariant: 'Uddistam(Nastam(R, n)) === R (Bijective Isomorphism)'
      };
    }
  },
  {
    id: 'TC-08',
    name: 'Fast Exponentiation Saṅkhyā (2^10 = 1024 in O(log n))',
    category: 'Saṅkhyā',
    description: 'Verify that 2^10 computes to 1024 with logarithmic multiplications.',
    run: () => {
      const { result, multiplications } = pingalaSankhya(10);
      const passed = result === 1024 && multiplications <= 5;
      return {
        passed,
        input: 'Exponent n = 10',
        expected: 'Result = 1024, Multiplications <= 5',
        actual: `Result = ${result}, Multiplications = ${multiplications}`,
        invariant: 'Time complexity is strictly logarithmic O(log n)'
      };
    }
  },
  {
    id: 'TC-09',
    name: 'Meru-Prastāra Binomial Row Sum & Symmetry (n = 6)',
    category: 'Meru-Prastāra',
    description: 'Verify that row n=6 has sum 2^6 = 64 and satisfies C(n, k) = C(n, n-k).',
    run: () => {
      const pyramid = generateMeruPrastara(6);
      const row6 = pyramid[6];
      const values = row6.cells.map(c => c.value);
      const sum = row6.sum;
      const isSymmetric = values[1] === values[5] && values[2] === values[4];
      const passed = sum === 64 && isSymmetric && values.join(',') === '1,6,15,20,15,6,1';
      return {
        passed,
        input: 'Row n = 6',
        expected: 'Coefficients: [1, 6, 15, 20, 15, 6, 1], Sum = 64',
        actual: `Coefficients: [${values.join(', ')}], Sum = ${sum}`,
        invariant: 'sum(C(n, k)) == 2^n AND C(n, k) == C(n, n-k)'
      };
    }
  },
  {
    id: 'TC-10',
    name: 'Sanskrit Scansion Phonetics ("Dharmakṣetre")',
    category: 'Scansion',
    description: 'Verify that "Dharmakṣetre" correctly scans syllables with heavy conjunct weight.',
    run: () => {
      const result = scanSanskritVerse('dharmakṣetre kurukṣetre');
      // dhar-ma-kṣe-tre: dhar has short 'a' followed by 'rm' conjunct -> Guru
      // kṣe has long 'e' -> Guru
      const firstSyllable = result.syllables[0];
      const passed = firstSyllable.code === 'G' && result.syllables.length >= 8;
      return {
        passed,
        input: 'Text: "dharmakṣetre kurukṣetre"',
        expected: '1st syllable (dhar) marked Guru due to conjunct "rm", total >= 8 syllables',
        actual: `1st syllable weight: ${firstSyllable.weight} (${firstSyllable.reason}), Total Syllables: ${result.syllables.length}`,
        invariant: 'Phonological conjunct promotion rule (guru saṁyoge)'
      };
    }
  },
  {
    id: 'TC-11',
    name: 'Minimal Monosyllable Boundary (n = 1)',
    category: 'Edge Case',
    description: 'Verify boundary behavior for n = 1 syllable (R=1 -> L, R=2 -> G).',
    run: () => {
      const { pattern: p1 } = pingalaNastam(1, 1);
      const { pattern: p2 } = pingalaNastam(2, 1);
      const passed = p1.join('') === 'L' && p2.join('') === 'G';
      return {
        passed,
        input: 'n = 1, R = 1 and R = 2',
        expected: 'R=1 -> [L], R=2 -> [G]',
        actual: `R=1 -> [${p1.join('')}], R=2 -> [${p2.join('')}]`,
        invariant: 'Boundary condition n=1 handles zero-overflow'
      };
    }
  },
  {
    id: 'TC-12',
    name: 'Mātrā-Prastāra Fibonacci Compositions (Duration M = 5)',
    category: 'Fibonacci',
    description: 'Verify that duration M = 5 mātrās yields exactly 8 rhythmic compositions (Fib(6) = 8).',
    run: () => {
      const { compositions, count } = generateMatraCompositions(5);
      const passed = count === 8;
      return {
        passed,
        input: 'Duration M = 5 mātrās',
        expected: '8 compositions (Virahāṅka sequence: 1, 2, 3, 5, 8)',
        actual: `${count} compositions generated`,
        invariant: 'Count(M) == F(M + 1) (Fibonacci integer composition)'
      };
    }
  }
];

/**
 * Execute all test cases and return benchmark results
 * @returns {{ results: Array<Object>, total: number, passed: number, failed: number, totalTimeMs: number }}
 */
export function executeTestSuite() {
  const startTime = performance.now();
  const results = [];
  let passedCount = 0;

  for (const test of TEST_SUITE) {
    const testStart = performance.now();
    let outcome;
    try {
      outcome = test.run();
    } catch (err) {
      outcome = {
        passed: false,
        input: 'Exception occurred',
        expected: 'Execution without exception',
        actual: err.message,
        invariant: 'Error-free evaluation'
      };
    }
    const testDuration = performance.now() - testStart;

    if (outcome.passed) passedCount++;

    results.push({
      id: test.id,
      name: test.name,
      category: test.category,
      description: test.description,
      passed: outcome.passed,
      input: outcome.input,
      expected: outcome.expected,
      actual: outcome.actual,
      invariant: outcome.invariant,
      durationMs: Number(testDuration.toFixed(3))
    });
  }

  const totalTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    results,
    total: TEST_SUITE.length,
    passed: passedCount,
    failed: TEST_SUITE.length - passedCount,
    totalTimeMs
  };
}
