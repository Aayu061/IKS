/**
 * Mātrā-Prastāra & Virahāṅka-Gopāla-Hemachandra Engine
 * 
 * Historical Discovery:
 * Indian prosodists (Virahāṅka c. 600-800 CE, Gopāla c. 1135 CE, Hemachandra c. 1150 CE)
 * investigated meters defined by fixed total morae/duration (Mātrā), rather than fixed syllable count.
 * A Laghu has duration 1; a Guru has duration 2.
 * 
 * The number of rhythmic patterns summing to M mātrās is given by:
 * F(M) = F(M-1) + F(M-2)
 * which generates the Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21, 34, ...
 * over 500 years before Fibonacci's Liber Abaci (1202 CE)!
 */

/**
 * Generate all rhythmic compositions of total duration M mātrās
 * using Laghu (1) and Guru (2).
 * 
 * @param {number} totalMatras - Total duration (1 to 10 recommended)
 * @returns {{ compositions: Array<Array<'L'|'G'>>, count: number, fibonacciValue: number }}
 */
export function generateMatraCompositions(totalMatras) {
  const compositions = [];

  function backtrack(currentSum, currentPattern) {
    if (currentSum === totalMatras) {
      compositions.push([...currentPattern]);
      return;
    }
    if (currentSum > totalMatras) return;

    // Option 1: Append Laghu (duration 1)
    currentPattern.push('L');
    backtrack(currentSum + 1, currentPattern);
    currentPattern.pop();

    // Option 2: Append Guru (duration 2)
    currentPattern.push('G');
    backtrack(currentSum + 2, currentPattern);
    currentPattern.pop();
  }

  backtrack(0, []);

  // In Indian prosody, for M matras, the count is Fib(M + 1) where Fib(1)=1, Fib(2)=2, Fib(3)=3, Fib(4)=5, Fib(5)=8
  return {
    compositions,
    count: compositions.length,
    fibonacciIndex: totalMatras
  };
}

/**
 * Get first N terms of Virahāṅka-Hemachandra sequence
 * @param {number} n
 * @returns {Array<{ matras: number, count: number, formula: string }>}
 */
export function getVirahankaSequence(n = 8) {
  const sequence = [
    { matras: 1, count: 1, formula: 'F(1) = 1 (L)' },
    { matras: 2, count: 2, formula: 'F(2) = 2 (LL, G)' }
  ];

  for (let i = 2; i < n; i++) {
    const prev1 = sequence[i - 1].count;
    const prev2 = sequence[i - 2].count;
    const current = prev1 + prev2;
    sequence.push({
      matras: i + 1,
      count: current,
      formula: `F(${i + 1}) = F(${i}) + F(${i - 1}) = ${prev1} + ${prev2} = ${current}`
    });
  }

  return sequence;
}
