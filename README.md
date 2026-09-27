# Piṅgala's Chandaḥśāstra as Binary Encoding & Combinatorial Generation
> **Course**: Indian Knowledge Systems (IKS) in Computational Systems  
> **Topic Selected**: 1. *Piṅgala's Chandaḥśāstra as Binary Encoding and Combinatorial Generation*  
> **Status**: Full Working Frontend Application, Formal Specifications & 12 Automated Test Cases

---

## 🌟 Overview

This project implements an interactive computational studio and formal academic submission for **Topic 1: Piṅgala's Chandaḥśāstra as Binary Encoding and Combinatorial Generation**.

In the 3rd–2nd century BCE, the Indian mathematician **Ācārya Piṅgala** authored the *Chandaḥśāstra*. In Chapter 8, Piṅgala invented:
1. **The Binary Numeral System**: Light syllable (*Laghu*, $\breve{}$, 1 mātrā) $\leftrightarrow$ `0`, and Heavy syllable (*Guru*, $-$, 2 mātrās) $\leftrightarrow$ `1`.
2. **Combinatorial Generation (*Prastāra*)**: Generating all $2^n$ metric permutations in canonical truth-table order.
3. **Rank-to-Binary Decoding (*Naṣṭam*)**: Converting an ordinal decimal rank $R$ to its exact binary/syllable sequence using repeated halving ($R \pmod 2$).
4. **Binary-to-Rank Encoding (*Uddiṣṭam*)**: Evaluating a syllable pattern into its decimal rank using binary positional weighting ($1 + \sum b_i 2^{i-1}$).
5. **Logarithmic Fast Exponentiation (*Saṅkhyā*)**: Computing $2^n$ in $O(\log n)$ operations using the *dvir ardhe* rule.
6. **Binomial Dynamic Programming Pyramid (*Meru-Prastāra*)**: The triangular array of combinatorial coefficients $\binom{n}{k}$, commented by Halāyudha (c. 950 CE) over 700 years before Blaise Pascal.
7. **Mātrā-Prastāra (Virahāṅka-Hemachandra Compositions)**: Generating all rhythmic compositions summing to $M$ mātrās, yielding the Fibonacci recurrence $F(M) = F(M-1) + F(M-2)$ centuries before Fibonacci.

---

## 📂 Deliverables & Documentation

| Document | File Link | Purpose |
| :--- | :--- | :--- |
| **Product Requirements Document** | [`docs/PRD.md`](file:///c:/Users/aayup/Desktop/IKS/docs/PRD.md) | Problem statement, conceptual mapping table, formal algorithm specifications, 12 test cases, complexity, limitations & conclusion |
| **UI/UX Design Specification** | [`docs/DESIGN.md`](file:///c:/Users/aayup/Desktop/IKS/docs/DESIGN.md) | "Vedic Cybernetics" design system, color palette, typography, glassmorphism, wireframes, sound synthesis, accessibility |
| **Software Architecture & Math** | [`docs/ARCHITECTURE.md`](file:///c:/Users/aayup/Desktop/IKS/docs/ARCHITECTURE.md) | System architecture diagram, formal pseudocode, mathematical correctness proofs, state management & execution models |
| **Interactive Application** | [`index.html`](file:///c:/Users/aayup/Desktop/IKS/index.html) | Semantic HTML5 single-page application with 6 interactive studios and modal drawer |
| **Design System Styles** | [`index.css`](file:///c:/Users/aayup/Desktop/IKS/index.css) | Custom CSS with dark mode, glow effects, Meru pyramid styling, and animations |
| **Application Controller** | [`src/main.js`](file:///c:/Users/aayup/Desktop/IKS/src/main.js) | Reactive state management, event orchestration, and module wiring |
| **Automated Test Suite** | [`src/test/test-runner.js`](file:///c:/Users/aayup/Desktop/IKS/src/test/test-runner.js) | Automated runner verifying all 12 formal test cases with sub-millisecond benchmarks |

---

## 🚀 How to Run Locally

### Option 1: Using Node.js (Quick Dev Server)
```powershell
# In c:\Users\aayup\Desktop\IKS
npx -y serve -l 3000 .
```
Then open `http://localhost:3000` in your web browser.

### Option 2: Using Python
```powershell
python -m http.server 3000
```
Then open `http://localhost:3000` in your web browser.

### Option 3: Automated Test Runner CLI
To run all 12 academic test cases directly in the terminal:
```powershell
npm test
```

---

## 🧪 Formal Test Suite Results (12 / 12 PASS)

| Test ID | Test Category | Description | Status |
| :--- | :--- | :--- | :---: |
| **TC-01** | Prastāra | Combinatorial table size check: $n=3 \implies 2^3 = 8$ rows | **PASS** |
| **TC-02** | Prastāra | Boundary rows: Row 1 is `LLLL` (all zeros), Row 16 is `GGGG` (all ones) | **PASS** |
| **TC-03** | Naṣṭam | Canonical minimum rank $R=1 \implies$ `LLLL` | **PASS** |
| **TC-04** | Naṣṭam | Canonical maximum rank $R=16 \implies$ `GGGG` | **PASS** |
| **TC-05** | Naṣṭam | Arbitrary rank $R=6, n=4 \implies$ `GLGL` (Halving rule trace) | **PASS** |
| **TC-06** | Uddiṣṭam | Positional pattern `GLGL` evaluates to Decimal Rank $6$ | **PASS** |
| **TC-07** | Bijection | Round-trip identity: $\text{Uddiṣṭam}(\text{Naṣṭam}(43, 6)) \equiv 43$ | **PASS** |
| **TC-08** | Saṅkhyā | Fast exponentiation: $2^{10} = 1024$ computed in $\le 5$ multiplications | **PASS** |
| **TC-09** | Meru-Prastāra | Binomial row sum $\sum \binom{6}{k} = 64$ and symmetry $\binom{n}{k} = \binom{n}{n-k}$ | **PASS** |
| **TC-10** | Scansion | Sanskrit NLP tokenizer: "Dharmakṣetre" correctly triggers conjunct heavy weight | **PASS** |
| **TC-11** | Edge Case | Monosyllable boundary: $n=1 \implies R=1 \to \text{L}, R=2 \to \text{G}$ | **PASS** |
| **TC-12** | Fibonacci | Mātrā compositions: Duration $M=5$ yields exactly $8$ compositions ($F(6)=8$) | **PASS** |

---

## 🎓 Academic Viva Presentation Highlights

1. **Donald Knuth's Endorsement**:
   * Refer to *The Art of Computer Programming*, Vol 4A, pp. 50–52, where Knuth credits Piṅgala with the first binary numbering system, rank conversions, and combinatorial generator in human history.
2. **Interactive Live Demo**:
   * Demonstrate live bit flipping in the hero strip.
   * Demonstrate bidirectional conversion on Tab 02 showing halving and place-value multiplication side-by-side.
   * Hover over cells in the Meru pyramid to show dynamic programming memoization.
   * Paste classical Sanskrit verses (Gītā, Gāyatrī) on Tab 04 to show automatic phonetic scansion and classical meter classification.
   * Click **"Execute All 12 Tests"** on Tab 06 during the viva to show live automated verification in $\approx 1.5\text{ ms}$.
