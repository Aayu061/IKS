# UI/UX Design Specification: Minimal Editorial Studio

## Project: Piṅgala's Chandaḥśāstra as Binary Encoding & Combinatorial Generation
**Document**: `DESIGN.md`  
**Design Paradigm**: Simple & Minimal Editorial Style (Sand & Ink Paper Aesthetic)  
**Target Experience**: Elegant, Understated, Academic Research Publication Layout (Inspired by Distill.pub, Observable, and Classical Mathematical Treatises)

---

## 1. Design Philosophy & Vision

The UI/UX adheres to clean, modern, restrained **editorial minimalism**:
1. **Calm Paper Canvas**: Warm, natural off-white / sand background (`#f6f3ec`) paired with pure white card surfaces (`#ffffff`) and deep, readable ink typography (`#172421`).
2. **Quiet Elegance**: Avoids flashy neon drop-shadows, saturated gradients, or distracting background animations. Information is organized with generous whitespace, subtle 1px divider lines (`#e3ded5`), and refined micro-typography.
3. **Refined Typography**: Editorial serif headings (`Newsreader`), clean neutral sans-serif body text (`Plus Jakarta Sans`), and crisp monospace numerals and bit arrays (`JetBrains Mono`).

---

## 2. Color System & Design Tokens

### 2.1 Minimalist Editorial Palette (Sand & Ink)

```css
:root {
  /* Surfaces & Canvas */
  --sand: #f6f3ec;           /* Warm paper background */
  --sand-subtle: #fbf9f4;    /* Secondary warm tone */
  --white: #ffffff;          /* Clean card surface */

  /* Ink & Typography */
  --ink: #172421;            /* Deep slate/charcoal ink */
  --deep: #0f1a18;           /* Primary header ink */
  --muted: #5e6862;          /* Secondary body text */
  --light-muted: #8a948e;    /* Tertiary captions */

  /* Accents */
  --saffron: #c87622;        /* Warm terracotta / ochre accent */
  --saffron-light: #faf2e3;  /* Guru syllable background */
  --saffron-border: #ecdcc3; /* Guru pill border */

  --teal: #225147;           /* Academic forest teal */
  --teal-light: #edf4f1;     /* Laghu syllable background */
  --teal-border: #d0ded8;    /* Laghu pill border */

  --border: #e3ded5;         /* Clean divider rule */
  --border-light: #ece7de;   /* Subtle table rule */
  --shadow-card: 0 4px 16px rgba(23, 36, 33, 0.05);
}
```

### 2.2 Semantic States for Laghu & Guru

| Element | Sanskrit Concept | Visual Indicator | Color Token | Auditory Pulse |
| :--- | :--- | :--- | :--- | :--- |
| **Laghu ($\breve{}$)** | Light syllable, 1 mātrā, `0` | Cyan circular pill with crescent `∪` icon | `--cyan-binary` (`#06B6D4`) | Crisp $880\text{ Hz}$ sine beep ($100\text{ms}$) |
| **Guru ($-$)** | Heavy syllable, 2 mātrās, `1` | Saffron elongated capsule with bar `—` icon | `--saffron-primary` (`#FF6B35`) | Deep $440\text{ Hz}$ sine tone ($220\text{ms}$) |

---

## 3. Typography & Font Hierarchy

The application leverages three distinct typefaces via Google Fonts:
1. **Display & Sacred Headings**: `'Outfit'`, sans-serif (Weights: 600, 700, 800) paired with optional `'Cinzel'` for classical headers.
2. **Body & Clean Technical UI**: `'Plus Jakarta Sans'`, sans-serif (Weights: 400, 500, 600).
3. **Algorithms, Binary Vectors & Test Suite**: `'JetBrains Mono'`, monospace (Weights: 400, 600, 700).

```
Hero Title:        clamp(2.2rem, 5vw, 3.8rem) | Weight: 800 | Letter-spacing: -0.02em
Section Title:     clamp(1.5rem, 3vw, 2.2rem) | Weight: 700 | Suvarṇa Gradient
Card Headers:      1.15rem                    | Weight: 600 | Text Primary
Body Text:         0.95rem                    | Weight: 400 | Line-height: 1.6
Code / Bit Stream: 0.90rem                    | Monospace   | High-contrast Cyan/Saffron
```

---

## 4. Layout Architecture & Component Hierarchy

The application utilizes a single-page interactive studio with a persistent sticky navigation bar, a high-impact Hero banner, a 6-tabbed computation deck, and a quick-action viva control dock.

```
+---------------------------------------------------------------------------------------+
|  HEADER: [🕉️ Piṅgala Chandaḥśāstra]  [Theory] [Studio] [Meru] [Analyzer] [Viva Tests]   |
+---------------------------------------------------------------------------------------+
|  HERO BANNER:                                                                         |
|  - "The Ancient Genesis of Binary Computation: 300 BCE"                               |
|  - Interactive live binary toggle strip: [ 0 | 1 | 0 | 1 ] <-> [ ∪ | — | ∪ | — ]      |
|  - Quick Statistics: [2^n Combinatorics] [O(log n) Exponentiation] [1800 yrs pre-Pascal]
+---------------------------------------------------------------------------------------+
|  STUDIO WORKBENCH NAVIGATION (Interactive Tabs):                                      |
|  [1. Prastāra Table] [2. Naṣṭam & Uddiṣṭam] [3. Meru DP Pyramid]                      |
|  [4. Sanskrit Scansion] [5. Mātrā & Fibonacci] [6. Automated Test Harness (10+ Tests)] |
+---------------------------------------------------------------------------------------+
|  ACTIVE TAB WORKSPACE:                                                                |
|                                                                                       |
|  [Left: Control Panel & Param Sliders]  |  [Right: Interactive Visualizer & Canvas]   |
|  - Syllable Count slider (n = 1..12)   |  - Animated Binary Table / Meru Pyramid     |
|  - Rank input box & Stepper buttons    |  - Step-by-Step Mathematical Trace          |
|  - Preset Metrical buttons             |  - Real-time Audio-Visual Metronome         |
|                                                                                       |
+---------------------------------------------------------------------------------------+
|  PERSISTENT VIVA FOOTER DOCK:                                                         |
|  [▶ Run All 12 Formal Tests] [🔊 Sound On/Off] [📋 Export PRD] [🎓 View IKS Mapping]  |
+---------------------------------------------------------------------------------------+
```

---

## 5. Screen-by-Screen Detailed Design

### 5.1 Tab 1: Combinatorial Prastāra Generator
- **User Controls**:
  - Syllable count slider ($n \in [1, 10]$).
  - Quick preset buttons: $n=2$ (Dvi-varṇa), $n=3$ (Tri-varṇa / 8 Gaṇas), $n=4$ (Catuṣ-pada), $n=8$ (Anuṣṭubh pada).
  - Display options: Show binary ($0/1$), show symbols ($\breve{}/-$), show Gaṇa notation, show total mātrā weight.
- **Visual Display**:
  - A glowing, responsive CSS Grid.
  - Rows alternate in subtle card shading with hover elevation.
  - Play button on each row triggers instantaneous audio-visual metronome playback of that specific meter.

### 5.2 Tab 2: Bidirectional Naṣṭam & Uddiṣṭam Converter
- **Two Linked Panels**:
  - **Left Panel (Naṣṭam: Rank $\to$ Pattern)**:
    - User types decimal Rank $R$ or drags an interactive number wheel.
    - System renders the step-by-step division trace with Piṅgala’s aphorism:
      * *Lagheveti samānam* (If even, Guru and halve; if odd, Laghu and add 1 then halve).
    - Step visualizer displays: `Step 1: R=6 (Even) -> G (1), R' = 6/2 = 3` $\to$ `Step 2: R=3 (Odd) -> L (0), R' = (3+1)/2 = 2`, etc.
  - **Right Panel (Uddiṣṭam: Pattern $\to$ Rank)**:
    - Interactive 8-cell syllabic toggle strip. Clicking any syllable instantly flips it between Laghu ($\breve{}$) and Guru ($-$).
    - Dynamic place-value cards below each syllable:
      $$\text{Total Rank} = 1 + [b_0 \times 1] + [b_1 \times 2] + [b_2 \times 4] + [b_3 \times 8] + \dots$$
    - Live Invariant Badge: Confirms $\text{Uddiṣṭam}(\text{Naṣṭam}(R)) \equiv R$ in glowing emerald green.

### 5.3 Tab 3: Meru-Prastāra (Pascal's Triangle & Dynamic Programming)
- **Interactive Staggered Pyramid**:
  - Symmetrically centered pyramid rendering up to $n = 12$ rows.
  - Each hexagonal/curved cell displays $\binom{n}{k}$.
  - **Hover Interaction**: Hovering over cell $(n, k)$ highlights parent cells $(n-1, k-1)$ and $(n-1, k)$ with glowing connecting lines and shows the DP recurrence:
    $$\text{Cell}(n, k) = \text{Cell}(n-1, k-1) + \text{Cell}(n-1, k)$$
  - **Row Inspection Bar**: Clicking any row displays its total combinatorial power $2^n$ and renders an interactive SVG binomial distribution bar chart.

### 5.4 Tab 4: Sanskrit Verse Scansion Engine
- **Input Area**:
  - Text area with pre-loaded classical Sanskrit presets:
    1. *Bhagavad Gītā 4.7*: "yadā yadā hi dharmasya glānir bhavati bhārata"
    2. *Gāyatrī Mantra*: "tat savitur vareṇyaṁ bhargo devasya dhīmahi"
    3. *Mahāmṛtyuñjaya Mantra*: "tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam"
    4. *Custom Freeform Input* (IAST or Devanagari).
- **Output Cards**:
  - Syllable-by-syllable decomposition card with color-coded weight tags.
  - Rule application indicator: Displays why a syllable is Guru (e.g., "Long Vowel: ā", "Followed by Conjunct: rm", "Followed by Anusvāra: ṁ").
  - Identified Meter card: Displays detected meter name (e.g., Anuṣṭubh, Triṣṭubh) and its decimal index in the Prastāra master space.

### 5.5 Tab 5: Virahāṅka-Hemachandra Mātrāvṛtta (Fibonacci Compositions)
- **Concept**:
  - Generating all rhythmic compositions of total duration $M$ mātrās using short ($1$) and long ($2$) syllables.
- **Visuals**:
  - Interactive tree diagram and tabular permutation list showing how $F(M+1)$ compositions naturally form the Fibonacci sequence.

### 5.6 Tab 6: Formal Test Runner & Verification Suite (10+ Test Cases)
- **Viva Demo Ready**:
  - Header displays total test count, passed count, execution benchmark in milliseconds ($< 5\text{ms}$), and status badge.
  - Interactive "Run All Tests" button triggers automated execution with progress bar.
  - Filterable by: All, Passed, Edge Cases, Invariant Checks.
  - Expandable test case cards displaying input arguments, expected return value, actual computed value, and the underlying mathematical proof.

---

## 6. Micro-Interactions & Animation Guidelines

1. **Card Entrance**: Smooth cubic-bezier elevation `transform: translateY(0) scale(1)`, `transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1)`.
2. **Syllable Flip**: 3D flip animation when toggling between Laghu and Guru (`transform: rotateY(180deg)`).
3. **Pyramid Parent Highlighting**: Ambient glow pulsing on parent cells when hovering over any child cell in Meru-Prastāra.
4. **Metronome Pulse Indicator**: Glowing ring pulse propagating outward on each synthesized audio beat.

---

## 7. Accessibility & Performance Specs

- **Zero Heavy Framework Bloat**: Custom lightweight reactive components for instantaneous load time ($< 100\text{ms}$).
- **WCAG AA Compliance**: Foreground/background contrast exceeds $4.8:1$.
- **Keyboard Navigation**: All interactive elements (sliders, syllabic toggles, test runners) are fully focusable with standard keyboard tab navigation.
- **Audio Safety**: Web Audio synthesis is clamped at $-6\text{dB}$ with linear gain ramps to avoid abrupt auditory clicks.
