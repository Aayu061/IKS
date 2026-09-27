/**
 * Meru-Prastāra Engine (The Mount Meru Pyramid / Binomial Dynamic Programming)
 * Historically described by Halāyudha (10th century CE) in commentary on Piṅgala.
 * Precedes Blaise Pascal (1654 CE) by over 700 years (and Piṅgala by ~1800 years).
 * 
 * Computes:
 * - C(n, k) = C(n-1, k-1) + C(n-1, k)
 * - Row sum = 2^n
 * - Laghvakṣara-kriyā (Combinations of meters with exactly k Laghus/Gurus)
 */

/**
 * Generate Meru-Prastāra pyramid up to maxRows using Dynamic Programming
 * @param {number} maxRows - Maximum row index (0 to 12)
 * @returns {Array<{ row: number, cells: Array<{ n: number, k: number, value: number, parents: Array<[number, number]> }>, sum: number }>}
 */
export function generateMeruPrastara(maxRows = 8) {
  const pyramid = [];

  for (let n = 0; n <= maxRows; n++) {
    const cells = [];
    let rowSum = 0;

    for (let k = 0; k <= n; k++) {
      let value = 1;
      const parents = [];

      if (k === 0 || k === n) {
        value = 1;
      } else {
        const valLeft = pyramid[n - 1].cells[k - 1].value;
        const valRight = pyramid[n - 1].cells[k].value;
        value = valLeft + valRight;
        parents.push([n - 1, k - 1], [n - 1, k]);
      }

      rowSum += value;
      cells.push({ n, k, value, parents });
    }

    pyramid.push({
      row: n,
      cells,
      sum: rowSum,
      powerOfTwoCheck: Math.pow(2, n) === rowSum
    });
  }

  return pyramid;
}

/**
 * Compute single binomial coefficient C(n, k) via dynamic memoization
 * @param {number} n 
 * @param {number} k 
 * @returns {number}
 */
export function binomialCoefficient(n, k) {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k; // Symmetry optimization

  let c = 1;
  for (let i = 1; i <= k; i++) {
    c = (c * (n - i + 1)) / i;
  }
  return Math.round(c);
}

/**
 * Get Laghvakṣara-kriyā: Distribution of meters of length n by Guru count
 * @param {number} n - Syllable count
 * @returns {Array<{ gurus: number, laghus: number, count: number, percentage: number }>}
 */
export function getLaghvaksharaDistribution(n) {
  const total = Math.pow(2, n);
  const distribution = [];

  for (let k = 0; k <= n; k++) {
    const count = binomialCoefficient(n, k);
    distribution.push({
      gurus: k,
      laghus: n - k,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    });
  }

  return distribution;
}
