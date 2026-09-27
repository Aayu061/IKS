# Product Requirements Document (PRD)

## Project Title: Piṅgala's Chandaḥśāstra as Binary Encoding and Combinatorial Generation
**Course**: Indian Knowledge Systems (IKS) in Computational Systems  
**Domain**: Ancient Indian Mathematics, Discrete Mathematics & Computer Science Foundations  
**Document Version**: 1.0.0  
**Target Milestone**: Live Interactive Web Application, Formal Verification Suite, and Viva Presentation

---

## 1. Executive Summary & Problem Statement

### 1.1 Academic Context
In the 3rd–2nd century BCE, the Indian mathematician and grammarian **Ācārya Piṅgala** authored the *Chandaḥśāstra* (Treatise on Poetic Meters). In Chapter 8 of this work, Piṅgala formulated a series of aphorisms (*sūtras*) to solve combinatorial, classification, and indexing problems in Sanskrit poetics. In doing so, Piṅgala invented:
1. **The Binary Numeral System**: Encoding metrical syllables into two fundamental states—**Laghu** ($\breve{}$, Light, 1 mātrā) and **Guru** ($-$, Heavy, 2 mātrās).
2. **Combinatorial Generation (*Prastāra*)**: An algorithm to generate all $2^n$ metrical patterns for a meter of $n$ syllables in an orderly truth-table sequence.
3. **Bidirectional Index Conversion (*Naṣṭam* & *Uddiṣṭam*)**: Exact rank-to-pattern (decimal-to-binary) and pattern-to-rank (binary-to-decimal) algorithms.
4. **Fast Exponentiation (*Saṅkhyā*)**: A logarithmic-time algorithm ($O(\log n)$) to compute powers of two using repeated halving and squaring.
5. **The Binomial Triangle (*Meru-Prastāra*)**: The triangular array of combinatorial coefficients $\binom{n}{k}$, historically annotated by Halāyudha (10th century CE), preceding Blaise Pascal's work by over 1,800 years.

### 1.2 Formal Problem Statement ("IKS Concept as CS Concept")
> **"Formalize Piṅgala’s metrical combinatorial algorithms (*Chandaḥśāstra*, Chapter 8) as a deterministic binary encoding system, rank-indexed bijection engine, dynamic programming binomial generator, and Sanskrit phonological scansion parser; then implement this mathematical architecture as a modern, accessible, interactive web application featuring real-time visual-auditory verification and an automated 10-test-case validation suite."**

---

## 2. Conceptual Mapping Table

The following table establishes the 1-to-1 isomorphism between ancient Sanskrit prosody (*Chandaḥśāstra*) and modern Computer Science:

| S.No. | IKS Metrical Concept (*Chandaḥśāstra*) | Computer Science / Discrete Mathematics Concept | Mathematical Formalism | Computational Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Laghu (लघु)** (Short syllable, 1 mātrā) | Binary Digit `0` (or `1` depending on convention) | $b_i \in \{0, 1\}$, weight $= 1\text{ unit}$ | Bit flag `0` / audio pulse ($100\text{ms}$) |
| **2** | **Guru (गुरु)** (Long syllable, 2 mātrās) | Binary Digit `1` (or `0` depending on convention) | $b_i \in \{0, 1\}$, weight $= 2\text{ units}$ | Bit flag `1` / audio pulse ($200\text{ms}$) |
| **3** | **Akṣara-Gaṇa (गण)** (Triplet of syllables) | 3-bit Byte / Octal Triplet ($2^3 = 8$ states) | $g \in \{0, 1\}^3$, $\{Ya, Ma, Ta, Ra, Ja, Bh, Na, Sa\}$ | Octal lookup array, 8 standard gaṇas |
| **4** | **Prastāra (प्रस्तार)** (Combinatorial Expansion) | Exhaustive Permutation Generation / Truth Table | $S_n = \{0, 1\}^n$, $|S_n| = 2^n$ | Lexicographical matrix generation |
| **5** | **Naṣṭam (नष्टम्)** (Finding the lost meter given rank) | Rank-to-Permutation / Decimal-to-Binary Decoder | $f^{-1}: \mathbb{Z}_{\ge 1} \to \{0, 1\}^n$ via modulo arithmetic | Modulo-2 division & integer quotient loop |
| **6** | **Uddiṣṭam (उद्दिष्टम्)** (Finding the rank of a meter) | Permutation-to-Rank / Binary-to-Decimal Encoder | $f: \{0, 1\}^n \to \mathbb{Z}_{\ge 1}$, $f(B) = 1 + \sum_{i=1}^n b_i 2^{i-1}$ | Place-value accumulator / Horner's rule |
| **7** | **Saṅkhyā (संख्या)** (Total count calculation) | Divide-and-Conquer Fast Exponentiation | $2^n = (2^{n/2})^2$ or $2 \times (2^{(n-1)/2})^2$, $O(\log n)$ | Binary exponentiation recursive engine |
| **8** | **Meru-Prastāra (मेरुप्रस्तार)** (Mount Meru pyramid) | Binomial Coefficients & Dynamic Programming | $\binom{n}{k} = \binom{n-1}{k-1} + \binom{n-1}{k}$ | 2D DP memoization grid / Pascal's Triangle |
| **9** | **Laghvakṣara-kriyā (लघ्वक्षरक्रिया)** | Hamming Weight / Popcount Partitioning | $\{B \in \{0, 1\}^n \mid \text{popcount}(B) = k\}$ | Combinatorial grouping by bit sum |
| **10**| **Mātrā-Prastāra (मात्राप्रस्तार)** | Integer Compositions into 1s and 2s (Fibonacci) | $F(m) = F(m-1) + F(m-2)$ | Virahāṅka-Hemachandra DP sequence |

---

## 3. User Personas & Use Cases

### 3.1 Primary Personas
1. **Academic Evaluator / Course Instructor**:
   - *Goal*: Quickly assess algorithmic correctness, verify the 10 test cases, examine time/space complexity, and evaluate student understanding in viva.
   - *Key Needs*: One-click automated test runner, formal algorithm citations, mathematical proof views, interactive step-by-step traces.
2. **Computer Science Student / Pair Programmer**:
   - *Goal*: Learn how foundational CS concepts (binary representation, DP, recursive descent) originated in ancient Indian linguistics.
   - *Key Needs*: Visual interactive sandboxes, source code transparency, copyable pseudocode, clear variable naming.
3. **Sanskrit Enthusiast / Computational Linguist**:
   - *Goal*: Input classical Sanskrit shlokas and automatically determine their metrical pattern (Vṛtta), syllabic breakdown, and rank index.
   - *Key Needs*: Live Sanskrit transliteration input, conjunct consonant scansion, audio metronome playback.

---

## 4. Functional Requirements

### 4.1 Module 1: Combinatorial Prastāra Generator
- **FR 1.1**: User specifies syllable count $n$ (from $n = 1$ to $n = 8$, expandable up to $16$).
- **FR 1.2**: System generates the complete combinatorial table ($2^n$ rows) strictly adhering to Piṅgala's generation rule.
- **FR 1.3**: For each entry, display:
  - Ordinal Rank ($1$ to $2^n$).
  - Binary Representation ($0$ and $1$).
  - Traditional Sanskrit Notation ($\breve{}$ for Laghu, $-$ for Guru).
  - Triplet Gaṇa Decomposition (e.g., *Ma-gaṇa*, *Ta-gaṇa*, etc.).
  - Total Mātrā Count (light $= 1$, heavy $= 2$).
- **FR 1.4**: Provide filtering and search by weight (number of Laghus/Gurus) and export to CSV/JSON.

### 4.2 Module 2: Bidirectional Conversion (Naṣṭam & Uddiṣṭam)
- **FR 2.1 (Naṣṭam - Rank $\to$ Pattern)**:
  - Input: Syllable length $n$ and decimal Rank $R$ ($1 \le R \le 2^n$).
  - Execution: Step-by-step execution of Piṅgala's rule:
    * If $R$ is odd: write Laghu ($\breve{}$ / 0), replace $R \leftarrow \frac{R + 1}{2}$.
    * If $R$ is even: write Guru ($-$ / 1), replace $R \leftarrow \frac{R}{2}$.
  - Visual output: Step-by-step trace table showing quotient, remainder, and accumulated syllable vector.
- **FR 2.2 (Uddiṣṭam - Pattern $\to$ Rank)**:
  - Input: Syllabic sequence (interactive clicker or text input: e.g., `LGLG` or `0101`).
  - Execution: Compute rank using binary positional weighting:
    $$\text{Rank} = 1 + \sum_{i=1}^n b_i \cdot 2^{i-1}$$
  - Visual output: Place-value expansion cards ($1, 2, 4, 8, \dots, 2^{n-1}$) showing active bit multiplications and running sum.
- **FR 2.3 (Round-Trip Invariant)**:
  - Interactive validation button proving $\text{Uddiṣṭam}(\text{Naṣṭam}(R, n)) = R$.

### 4.3 Module 3: Meru-Prastāra & Combinatorial DP Pyramid
- **FR 3.1**: Dynamically render Halāyudha's triangular layout (*Meru-Prastāra*) up to $n = 12$ rows.
- **FR 3.2**: Implement Dynamic Programming relation:
  $$\text{Cell}(n, k) = \text{Cell}(n-1, k-1) + \text{Cell}(n-1, k), \quad \text{with } \text{Cell}(n, 0) = \text{Cell}(n, n) = 1$$
- **FR 3.3**: Interactive cell inspection: Hovering over any cell highlights its parent dependencies (Memoization visualization).
- **FR 3.4**: Display row properties:
  - Row sum $\sum_{k=0}^n \binom{n}{k} = 2^n$ (verifying Saṅkhyā).
  - Bell-curve / Binomial distribution histogram for the selected row.

### 4.4 Module 4: Sanskrit Shloka Scansion Engine (NLP Tokenizer)
- **FR 4.1**: Input box accepting Sanskrit text in Devanagari or IAST Roman transliteration.
- **FR 4.2**: Apply traditional Sanskrit phonological rules:
  - Short vowels ($a, i, u, \d{r}, \d{l}$) without conjuncts $\to$ Laghu ($\breve{}$, 1 mātrā).
  - Long vowels ($\bar{a}, \bar{\imath}, \bar{u}, \bar{r}, e, ai, o, au$) $\to$ Guru ($-$, 2 mātrās).
  - Short vowel followed by *Anusvāra* ($\dot{m}$), *Visarga* ($ḥ$), or conjunct consonant cluster (*Saṁyoga*) $\to$ Guru (positional weight).
  - Verse-ending syllable (*Padānta*) can optionally be treated as Guru by convention (*laghur vā*).
- **FR 4.3**: Output meter classification: Match known Vedic/Classical meters (Anuṣṭubh, Triṣṭubh, Jagatī, Indravajrā, Upendravajrā, etc.).

### 4.5 Module 5: Multimodal Audio-Visual Rhythm Synthesizer
- **FR 5.1**: Use Web Audio API (zero external audio files needed) to synthesize clean metronomic sound pulses:
  - Laghu pulse: $880\text{ Hz}$ sine tone for $100\text{ms}$.
  - Guru pulse: $440\text{ Hz}$ sine tone for $220\text{ms}$.
- **FR 5.2**: Visual playback cursor synchronizing pulse lights with the syllable cards in real time.

### 4.6 Module 6: Automated Test Verification Harness (Minimum 10 Test Cases)
- **FR 6.1**: A dedicated test dashboard with 10+ hardcoded, comprehensive test cases.
- **FR 6.2**: Live "Run All Tests" button with millisecond execution latency measurement.
- **FR 6.3**: Visual status badges (`PASS`/`FAIL`), input parameters, expected vs. actual outputs, and invariants validated.

---

## 5. Non-Functional Requirements (NFRs)

1. **Performance**:
   - Algorithm calculations up to $n = 12$ must resolve in $< 5\text{ms}$.
   - UI render updates at $60\text{fps}$ with zero thread jank.
2. **Aesthetics & UI/UX**:
   - Adhere to modern "Vedic Cybernetics" design: Deep cosmos background, warm gold and saffron accents, glassmorphic translucent panels, clear monospace arrays.
   - Fully responsive on mobile ($360\text{px}$ width) to high-resolution desktop ($4K$).
3. **Accessibility**:
   - Contrast ratio $\ge 4.5:1$ (WCAG AA).
   - High visual readability for mathematical notation and Sanskrit characters.
4. **Reliability & Portability**:
   - Self-contained web application requiring zero external server dependencies. Runs completely offline in any standard modern browser.

---

## 6. Official Test Cases Specification (Minimum 10 Tests)

| Test ID | Algorithm / Feature | Input Parameters | Expected Output | Invariant / Validation Criteria |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Prastāra Size Check | $n = 3$ syllables | Exactly $8$ rows generated ($2^3 = 8$) | $|S_n| = 2^n$ |
| **TC-02** | Prastāra Boundary Rows | $n = 4$ syllables | Row 1: `LLLL` (all Laghu); Row 16: `GGGG` (all Guru) | Row 1 is zero-vector, Row $2^n$ is all-ones vector |
| **TC-03** | Naṣṭam (First Rank) | $n = 4, R = 1$ | `[L, L, L, L]` | Canonical minimum rank produces all-light syllables |
| **TC-04** | Naṣṭam (Last Rank) | $n = 4, R = 16$ | `[G, G, G, G]` | Canonical maximum rank produces all-heavy syllables |
| **TC-05** | Naṣṭam (Arbitrary Rank) | $n = 4, R = 6$ | `[G, L, G, L]` | Arithmetic trace matches Piṅgala's halving rule |
| **TC-06** | Uddiṣṭam (Pattern Evaluation) | Pattern `[G, L, G, L]` ($n=4$) | $\text{Rank} = 6$ | Place values $1 + 1\cdot 1 + 0\cdot 2 + 1\cdot 4 + 0\cdot 8 = 6$ |
| **TC-07** | Bidirectional Bijection | $n = 6, R = 43$ | $\text{Uddiṣṭam}(\text{Naṣṭam}(43, 6)) = 43$ | Bijective round-trip identity $f(f^{-1}(R)) = R$ |
| **TC-08** | Fast Exponentiation (Saṅkhyā)| $n = 10$ | $2^{10} = 1024$, computed in $\le 4$ multiplications | $O(\log n)$ algorithmic steps matching *dvir ardhe* rule |
| **TC-09** | Meru-Prastāra Row Sum | $n = 6$ | Row: $[1, 6, 15, 20, 15, 6, 1]$; $\text{Sum} = 64$ | $\sum_{k=0}^n \binom{n}{k} = 2^n$ and symmetry $\binom{n}{k} = \binom{n}{n-k}$ |
| **TC-10** | Sanskrit Scansion Tokenizer | Text: `"Dharmakṣetre Kurukṣetre"` | `[- - - - - - - -]` (heavy conjunct scansion) | Conjunct vowels & conjunct consonants correctly trigger Guru |
| **TC-11** | Edge Case: Monosyllable | $n = 1, R = 1$ and $R = 2$ | $R=1 \to \text{L}$, $R=2 \to \text{G}$ | Minimal boundary $n=1$ executes without index out of bounds |
| **TC-12** | Fibonacci Mātrāvṛtta Count | Mātrā duration $M = 5$ | Exactly $8$ rhythmic compositions | Virahāṅka recurrence $F(M+1)$ where $F(6) = 8$ |

---

## 7. Complexity Analysis & Limitations

### 7.1 Algorithmic Complexity

| Algorithm | Time Complexity | Space Complexity | Theoretical Bound | Practical Web Limit |
| :--- | :--- | :--- | :--- | :--- |
| **Prastāra Generation** | $O(n \cdot 2^n)$ | $O(n \cdot 2^n)$ | Exponential (Combinatorial enumeration) | Capped at $n=12$ in UI to prevent DOM overflow |
| **Naṣṭam (Rank to Pattern)** | $O(n)$ | $O(n)$ | Linear in number of syllables | Capable of handling $n > 10,000$ with BigInt |
| **Uddiṣṭam (Pattern to Rank)**| $O(n)$ | $O(1)$ auxiliary | Linear in number of syllables | Capable of handling $n > 10,000$ with BigInt |
| **Saṅkhyā ($2^n$)** | $O(\log n)$ | $O(1)$ | Logarithmic via divide-and-conquer | Instantaneous for all practical integers |
| **Meru-Prastāra (Pascal DP)**| $O(n^2)$ | $O(n^2)$ | Polynomial Dynamic Programming | Rendered smoothly up to $n=16$ |
| **Phonetic Scansion** | $O(m)$ ($m$ chars) | $O(m)$ | Linear token scan | Instantaneous for arbitrary verse lengths |

### 7.2 System Limitations
1. **Combinatorial Explosion of Visual DOM**: While the mathematical generator easily handles $n = 64$, rendering $2^{64}$ visual table rows would crash browser memory. The UI paginates or truncates rendering for $n > 10$.
2. **Sanskrit Sandhi & Dialect Ambiguities**: Classical scansion permits poetic license (*pādānta-laghu-guru-vyavasthā*). The engine provides a toggle for whether the final syllable in a quarter-verse (*pāda*) is optionally elongated.

---

## 8. Conclusion & Viva Defense Strategy

Piṅgala's *Chandaḥśāstra* represents the earliest verified algorithmic treatment of binary numbers, combinatorial permutations, positional numbering, and dynamic programming in human history. 

This project bridges traditional Indian Knowledge Systems and contemporary Computer Science by delivering:
1. An unambiguous mathematical formalization of Chapter 8 of *Chandaḥśāstra*.
2. A live, modern, ultra-responsive interactive frontend demonstration tool.
3. An automated verification suite with 12 rigorous test cases executing live during the viva.
4. Comprehensive audiovisual and dynamic programming pedagogical visualizations that make ancient algorithmic ingenuity immediately tangible to modern software engineers.
