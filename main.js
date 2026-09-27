/**
 * Main Application Controller & Reactive UI
 * Connects Piṅgala Mathematical Engines to modern interactive DOM elements.
 * Features: Dual Theme Switcher, Studio Metronome Dock, Step-by-Step Stepper, and Method Tab.
 */

import { generatePrastara, pingalaNastam, pingalaUddistam, pingalaSankhya } from './src/core/pingala-engine.js';
import { generateMeruPrastara, binomialCoefficient, getLaghvaksharaDistribution } from './src/core/meru-engine.js';
import { generateMatraCompositions, getVirahankaSequence } from './src/core/matra-fibonacci.js';
import { scanSanskritVerse } from './src/core/scansion-engine.js';
import { rhythmSynth } from './src/audio/rhythm-synth.js';
import { executeTestSuite } from './src/test/test-runner.js';
import { ALGORITHM_SPECS } from './src/core/algorithms-data.js';
import { initHero3DCanvas } from './src/fx/hero-3d-canvas.js';

// Central Reactive Application State
const state = {
  theme: localStorage.getItem('iks_theme') || 'light',
  activeTab: 'tab-prastara',
  activeMethodAlg: 'prastara',
  // Tab 1 state
  prastaraN: 4,
  prastaraFilter: 'all',
  showBinary: true,
  showSymbols: true,
  showGanas: true,
  // Tab 2 state & Stepper
  nastamN: 6,
  nastamRank: 43,
  uddistamPattern: ['G', 'L', 'G', 'L', 'G', 'G'],
  sankhyaExp: 10,
  stepperCurrentStep: 1,
  stepperAutoTimer: null,
  // Tab 3 state
  meruRows: 7,
  selectedMeruCell: null,
  // Tab 5 state
  scansionText: 'yadā yadā hi dharmasya glānir bhavati bhārata',
  padantaGuru: true,
  // Tab 6 state
  matraM: 5,
};

// Shloka Presets
const SHLOKA_PRESETS = {
  gita: 'yadā yadā hi dharmasya glānir bhavati bhārata',
  gayatri: 'tat savitur vareṇyaṁ bhargo devasya dhīmahi',
  indra: 'indravajrā kathyate yadi tau jagau gaḥ',
  mrityun: 'tryambakaṁ yajāmahe sugandhiṁ puṣṭivardhanam'
};

document.addEventListener('DOMContentLoaded', () => {
  initThemeSystem();
  initMetronomeDock();
  initHeroBits();
  initHero3DCanvas();      // ← 3D interactive background
  initTabNavigation();
  initPrastaraModule();
  initNastamUddistamModule();
  initMeruModule();
  initMethodModule();
  initScansionModule();
  initFibonacciModule();
  initTestModule();
  initModalAndHeaderActions();
  initScrollReveal();

  // Run test suite once in background to initialize status badge
  runTestSuiteAndRender();
});

/* -------------------------------------------------------------
 * SCROLL REVEAL — Fade-in-up cards/sections on viewport entry
 * ------------------------------------------------------------- */
function initScrollReveal() {
  // Add .reveal class to all cards and pane headers
  const targets = document.querySelectorAll(
    '.card, .control-card, .display-card, .pane-header, ' +
    '.hero-interactive-strip, .knuth-citation-banner, ' +
    '.fibonacci-callout-card, .complexity-card'
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // Stagger siblings with modest delay caps
    const delay = Math.min(i * 0.04, 0.24);
    el.style.transitionDelay = `${delay}s`;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after first reveal to avoid re-animating
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}


/* -------------------------------------------------------------
/* -------------------------------------------------------------
 * UNIFIED THEME SLIDE TOGGLE (Light ☀️ / Dark 🌑)
 * Features: 2-State Sliding Pill Indicator, Kevin Powell View Transitions & CSS Variable Interpolation
 * ------------------------------------------------------------- */
function initThemeSystem() {
  const radioInputs = document.querySelectorAll('input[name="theme-mode"]');
  const slideLabels = document.querySelectorAll('.theme-slide-btn');

  // Load saved theme: 'light' or 'dark'
  const savedTheme = localStorage.getItem('iks_theme') || 'light';
  state.theme = savedTheme;
  
  // Initial application without transition
  updateTheme(savedTheme, false);
  updateThemeSliderUI(savedTheme);

  // Click listeners for slide button labels (captures click coordinates for ripple)
  slideLabels.forEach((label) => {
    label.addEventListener('click', (event) => {
      const val = label.getAttribute('data-theme-val');
      if (val !== state.theme) {
        executeViewTransition(val, event);
      }
    });
  });

  // Change listeners for native radio inputs (supports keyboard navigation)
  radioInputs.forEach((input) => {
    input.addEventListener('change', (event) => {
      if (input.checked && input.value !== state.theme) {
        const correspondingLabel = document.querySelector(`label[for="${input.id}"]`);
        executeViewTransition(input.value, { currentTarget: correspondingLabel });
      }
    });
  });
}

function updateThemeSliderUI(theme) {
  const sliderThumb = document.getElementById('theme-slider-thumb');
  const isDark = theme === 'dark';

  if (sliderThumb) {
    sliderThumb.style.transform = isDark ? 'translateX(100%)' : 'translateX(0%)';
  }

  const targetRadio = document.getElementById(`theme-${theme}`);
  if (targetRadio) {
    targetRadio.checked = true;
  }

  const slideLabels = document.querySelectorAll('.theme-slide-btn');
  slideLabels.forEach((label) => {
    const isTarget = label.getAttribute('data-theme-val') === theme;
    label.classList.toggle('active', isTarget);
  });
}

function updateTheme(theme, animateUI = true) {
  state.theme = theme;
  localStorage.setItem('iks_theme', theme);
  document.documentElement.style.setProperty('--theme', theme === 'dark' ? '🌑' : '☀️');
  updateThemeSliderUI(theme);
  applyTheme(theme);
}

function executeViewTransition(theme, event) {
  if (theme === state.theme) return;

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Set origin coordinates for CSS @keyframes circle-in clip-path
  const target = event?.currentTarget || event?.target;
  const rect = target?.getBoundingClientRect ? target.getBoundingClientRect() : null;
  const x = event?.clientX ?? (rect ? (rect.left + rect.width / 2) : (window.innerWidth / 2));
  const y = event?.clientY ?? (rect ? (rect.top + rect.height / 2) : 30);
  document.documentElement.style.setProperty('--click-x', `${x}px`);
  document.documentElement.style.setProperty('--click-y', `${y}px`);

  // Add temporary transition class for smooth CSS property interpolation
  document.documentElement.classList.add('theme-transitioning');
  clearTimeout(window.__themeTransitionTimer);
  window.__themeTransitionTimer = setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 600);

  // Modern View Transitions API (Kevin Powell pattern)
  if (!document.startViewTransition || prefersReducedMotion) {
    updateTheme(theme, true);
    return;
  }

  try {
    document.startViewTransition(() => {
      updateTheme(theme, true);
    });
  } catch (err) {
    updateTheme(theme, true);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

/* -------------------------------------------------------------
 * STUDIO METRONOME TRANSPORT DOCK
 * ------------------------------------------------------------- */
function initMetronomeDock() {
  const bpmSlider = document.getElementById('bpm-slider');
  const bpmVal = document.getElementById('bpm-val');
  const volSlider = document.getElementById('vol-slider');
  const volVal = document.getElementById('vol-val');
  const masterPlayBtn = document.getElementById('btn-master-play');
  const masterStopBtn = document.getElementById('btn-master-stop');
  const pulseLed = document.getElementById('pulse-led');
  const soundWaveBars = document.getElementById('sound-wave-bars');
  const metronomeDock = document.getElementById('metronome-dock');

  // Register visual pulse listener
  rhythmSynth.addPulseListener((type, durationMs) => {
    if (pulseLed) {
      const pulseClass = type === 'G' ? 'pulse-active-guru' : 'pulse-active-laghu';
      pulseLed.classList.add(pulseClass);
      setTimeout(() => {
        pulseLed.classList.remove(pulseClass);
      }, durationMs * 0.9);
    }

    if (soundWaveBars) {
      soundWaveBars.classList.add('active');
      setTimeout(() => {
        if (!rhythmSynth.isPlaying) {
          soundWaveBars.classList.remove('active');
        }
      }, durationMs * 0.9);
    }
  });

  bpmSlider.addEventListener('input', (e) => {
    const bpm = parseInt(e.target.value, 10);
    bpmVal.textContent = `${bpm} BPM`;
    rhythmSynth.setTempo(bpm);
  });

  volSlider.addEventListener('input', (e) => {
    const volPercent = parseInt(e.target.value, 10);
    volVal.textContent = `${volPercent}%`;
    rhythmSynth.setVolume(volPercent / 100);
  });

  masterPlayBtn.addEventListener('click', () => {
    const gayatriPattern = ['L', 'L', 'G', 'G', 'G', 'G', 'L', 'G', 'G', 'L', 'G', 'G', 'L', 'L', 'G', 'L'];
    if (metronomeDock) metronomeDock.classList.add('sequence-playing');
    if (soundWaveBars) soundWaveBars.classList.add('active');

    rhythmSynth.playSequence(gayatriPattern, null, () => {
      document.getElementById('master-play-text').textContent = 'Audition Gāyatrī';
      if (metronomeDock) metronomeDock.classList.remove('sequence-playing');
      if (soundWaveBars) soundWaveBars.classList.remove('active');
    });
    document.getElementById('master-play-text').textContent = 'Playing...';
  });

  masterStopBtn.addEventListener('click', () => {
    rhythmSynth.stop();
    document.getElementById('master-play-text').textContent = 'Audition Gāyatrī';
    if (metronomeDock) metronomeDock.classList.remove('sequence-playing');
    if (soundWaveBars) soundWaveBars.classList.remove('active');
  });
}

/* -------------------------------------------------------------
 * HERO SECTION INTERACTIVE BIT-STRIP
 * ------------------------------------------------------------- */
function initHeroBits() {
  const container = document.getElementById('hero-bits-container');
  if (!container) return;

  const initialBits = [0, 1, 0, 1, 1, 0, 0, 1];
  container.innerHTML = '';

  initialBits.forEach((bit, idx) => {
    const cell = document.createElement('div');
    const isGuru = bit === 1;
    cell.className = `strip-cell ${isGuru ? 'guru' : 'laghu'}`;
    cell.dataset.bit = bit;
    cell.innerHTML = `
      <span class="strip-cell-bit">${bit}</span>
      <span class="strip-cell-sym">${isGuru ? '—' : '∪'}</span>
    `;

    cell.addEventListener('click', () => {
      const currentBit = parseInt(cell.dataset.bit, 10);
      const nextBit = currentBit === 1 ? 0 : 1;
      cell.dataset.bit = nextBit;

      // 3D Flip animation
      cell.classList.remove('cell-flipping');
      void cell.offsetWidth;
      cell.classList.add('cell-flipping');

      setTimeout(() => {
        cell.className = `strip-cell ${nextBit === 1 ? 'guru' : 'laghu'} cell-flipping`;
        cell.querySelector('.strip-cell-bit').textContent = nextBit;
        cell.querySelector('.strip-cell-sym').textContent = nextBit === 1 ? '—' : '∪';
      }, 150);

      rhythmSynth.playTone(nextBit === 1 ? 'G' : 'L');
    });

    container.appendChild(cell);
  });
}

/* -------------------------------------------------------------
 * TABS NAVIGATION
 * ------------------------------------------------------------- */
function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      switchTab(targetTab);
    });
  });

  const testLink = document.getElementById('link-view-tests');
  if (testLink) {
    testLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('tab-tests');
    });
  }

  const methodLink = document.getElementById('link-view-method');
  if (methodLink) {
    methodLink.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab('tab-method');
    });
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
}

/* -------------------------------------------------------------
 * TAB 1: PRASTĀRA (Combinatorial Permutations)
 * ------------------------------------------------------------- */
function initPrastaraModule() {
  const slider = document.getElementById('prastara-n-slider');
  const nValDisplay = document.getElementById('prastara-n-val');
  const tableN = document.getElementById('prastara-table-n');
  const weightSelect = document.getElementById('prastara-filter-weight');
  const chkBinary = document.getElementById('chk-show-binary');
  const chkSymbols = document.getElementById('chk-show-symbols');
  const chkGanas = document.getElementById('chk-show-ganas');
  const exportBtn = document.getElementById('btn-export-prastara-csv');
  const playAllBtn = document.getElementById('btn-play-all-prastara');

  function renderPrastara() {
    nValDisplay.textContent = state.prastaraN;
    tableN.textContent = state.prastaraN;
    document.getElementById('metric-total-rows').textContent = Math.pow(2, state.prastaraN);

    // Update filter options
    const prevFilter = weightSelect.value;
    weightSelect.innerHTML = '<option value="all">Show All Combinations (2^n)</option>';
    for (let k = 0; k <= state.prastaraN; k++) {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = `k = ${k} Guru(s) [${binomialCoefficient(state.prastaraN, k)} rows]`;
      weightSelect.appendChild(opt);
    }
    if (prevFilter !== 'all' && parseInt(prevFilter, 10) <= state.prastaraN) {
      weightSelect.value = prevFilter;
      state.prastaraFilter = prevFilter;
    } else {
      weightSelect.value = 'all';
      state.prastaraFilter = 'all';
    }

    const rows = generatePrastara(state.prastaraN);
    const filteredRows = state.prastaraFilter === 'all' 
      ? rows 
      : rows.filter(r => r.guruCount === parseInt(state.prastaraFilter, 10));

    document.getElementById('prastara-filter-status').textContent = 
      `Showing ${filteredRows.length} of ${rows.length} rows`;

    const tbody = document.getElementById('prastara-table-body');
    tbody.innerHTML = '';

    filteredRows.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      tr.style.setProperty('--row-index', Math.min(rowIndex, 25));

      // Metric Pattern Pills
      const patternPills = row.pattern.map(s => `
        <span class="syllable-pill ${s === 'G' ? 'guru' : 'laghu'}" title="${s === 'G' ? 'Guru (Heavy, 2 mātrās)' : 'Laghu (Light, 1 mātrā)'}">
          ${state.showSymbols ? (s === 'G' ? '—' : '∪') : s}
        </span>
      `).join('');

      tr.innerHTML = `
        <td class="rank-badge">${row.rank}</td>
        <td>${patternPills}</td>
        <td class="col-binary ${state.showBinary ? '' : 'hidden-col'}"><code>${row.binary}</code></td>
        <td class="col-ganas ${state.showGanas ? '' : 'hidden-col'}"><span class="gana-tag">${row.ganas}</span></td>
        <td><strong>${row.matras}</strong></td>
        <td>
          <button type="button" class="btn-table-play" data-rank="${row.rank}" title="Play rhythm">🔊</button>
        </td>
      `;

      tr.querySelector('.btn-table-play').addEventListener('click', () => {
        rhythmSynth.playSequence(row.pattern);
      });

      tbody.appendChild(tr);
    });
  }

  slider.addEventListener('input', (e) => {
    state.prastaraN = parseInt(e.target.value, 10);
    renderPrastara();
  });

  document.querySelectorAll('.preset-n-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-n-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const n = parseInt(btn.dataset.n, 10);
      state.prastaraN = n;
      slider.value = n;
      renderPrastara();
    });
  });

  weightSelect.addEventListener('change', (e) => {
    state.prastaraFilter = e.target.value;
    renderPrastara();
  });

  chkBinary.addEventListener('change', (e) => {
    state.showBinary = e.target.checked;
    renderPrastara();
  });
  chkSymbols.addEventListener('change', (e) => {
    state.showSymbols = e.target.checked;
    renderPrastara();
  });
  chkGanas.addEventListener('change', (e) => {
    state.showGanas = e.target.checked;
    renderPrastara();
  });

  // Export CSV
  exportBtn.addEventListener('click', () => {
    const rows = generatePrastara(state.prastaraN);
    let csv = 'Rank,Pattern,Binary,Ganas,Matras,LaghuCount,GuruCount\n';
    rows.forEach(r => {
      csv += `${r.rank},"${r.pattern.join('')}",${r.binary},"${r.ganas}",${r.matras},${r.laghuCount},${r.guruCount}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pingala_prastara_n${state.prastaraN}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });

  playAllBtn.addEventListener('click', () => {
    const rows = generatePrastara(state.prastaraN).slice(0, 4);
    let delay = 0;
    rows.forEach((r, i) => {
      setTimeout(() => {
        rhythmSynth.playSequence(r.pattern);
      }, delay);
      delay += r.pattern.length * 400 + 400;
    });
  });

  renderPrastara();
}

/* -------------------------------------------------------------
 * TAB 2: NAṢṬAM & UDDIṢṬAM (With Interactive Stepper)
 * ------------------------------------------------------------- */
function initNastamUddistamModule() {
  const nInput = document.getElementById('nastam-n-input');
  const rankInput = document.getElementById('nastam-rank-input');
  const randomRankBtn = document.getElementById('btn-random-rank');
  const playNastamBtn = document.getElementById('btn-play-nastam-audio');
  const syncBtn = document.getElementById('btn-sync-to-nastam');
  const sankhyaSlider = document.getElementById('sankhya-exp-slider');

  // Stepper elements
  const stepLabel = document.getElementById('stepper-step-label');
  const resetBtn = document.getElementById('btn-stepper-reset');
  const prevBtn = document.getElementById('btn-stepper-prev');
  const playStepBtn = document.getElementById('btn-stepper-play');
  const nextBtn = document.getElementById('btn-stepper-next');
  const endBtn = document.getElementById('btn-stepper-end');

  let currentTrace = [];

  function renderNastam() {
    const n = parseInt(nInput.value, 10);
    const maxRank = Math.pow(2, n);
    rankInput.max = maxRank;

    let rank = parseInt(rankInput.value, 10);
    if (isNaN(rank) || rank < 1) rank = 1;
    if (rank > maxRank) rank = maxRank;
    rankInput.value = rank;

    state.nastamN = n;
    state.nastamRank = rank;

    const { pattern, binary, trace } = pingalaNastam(rank, n);
    currentTrace = trace;
    const matras = pattern.reduce((acc, s) => acc + (s === 'G' ? 2 : 1), 0);

    // Render large pattern pills
    const container = document.getElementById('nastam-pattern-display');
    container.innerHTML = pattern.map((s, idx) => `
      <div class="syllable-pill ${s === 'G' ? 'guru' : 'laghu'}" id="nastam-syl-${idx}" style="width: 38px; height: 38px; font-size: 1.1rem;">
        ${s === 'G' ? '—' : '∪'}
      </div>
    `).join('');

    document.getElementById('nastam-binary-display').textContent = binary;
    document.getElementById('nastam-matra-display').textContent = matras;

    // Render trace
    const traceBox = document.getElementById('nastam-trace-container');
    traceBox.innerHTML = trace.map((t, i) => `
      <div class="trace-step-card" id="trace-step-${i+1}">
        <div>
          <span class="trace-step-num">Step ${t.step}:</span>
          <span class="trace-step-action">${t.action}</span>
        </div>
        <span class="trace-step-bit ${t.syllable === 'G' ? 'guru' : 'laghu'}">
          ${t.syllable} (${t.bit})
        </span>
      </div>
    `).join('');

    // Check bijection invariant
    const { rank: recoveredRank } = pingalaUddistam(pattern);
    const badge = document.getElementById('bijection-invariant-badge');
    if (recoveredRank === rank) {
      badge.innerHTML = `<span class="badge-icon">✓</span> <span>Bijection Invariant Verified: Uddiṣṭam(Naṣṭam(${rank})) === ${recoveredRank}</span>`;
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    }

    // Reset stepper
    state.stepperCurrentStep = n;
    updateStepperHighlight();

    // Render Uddistam side
    renderUddistamStrip(n);
  }

  function updateStepperHighlight() {
    const total = state.nastamN;
    const curr = state.stepperCurrentStep;
    if (stepLabel) stepLabel.textContent = `Step ${curr} of ${total}`;

    // Highlight active card
    document.querySelectorAll('.trace-step-card').forEach((card, idx) => {
      card.classList.toggle('active-step', idx + 1 === curr);
    });

    // Highlight active syllable with bouncing animation
    document.querySelectorAll('[id^="nastam-syl-"]').forEach((el, idx) => {
      const isActive = idx + 1 === curr;
      el.classList.toggle('step-active', isActive);
      el.style.transform = isActive ? 'scale(1.28)' : 'scale(1)';
    });

    if (currentTrace[curr - 1]) {
      rhythmSynth.playTone(currentTrace[curr - 1].syllable);
    }
  }

  // Stepper handlers
  resetBtn.addEventListener('click', () => {
    state.stepperCurrentStep = 1;
    updateStepperHighlight();
  });
  prevBtn.addEventListener('click', () => {
    if (state.stepperCurrentStep > 1) {
      state.stepperCurrentStep--;
      updateStepperHighlight();
    }
  });
  nextBtn.addEventListener('click', () => {
    if (state.stepperCurrentStep < state.nastamN) {
      state.stepperCurrentStep++;
      updateStepperHighlight();
    }
  });
  endBtn.addEventListener('click', () => {
    state.stepperCurrentStep = state.nastamN;
    updateStepperHighlight();
  });

  playStepBtn.addEventListener('click', () => {
    if (state.stepperAutoTimer) {
      clearInterval(state.stepperAutoTimer);
      state.stepperAutoTimer = null;
      document.getElementById('stepper-play-icon').textContent = '▶';
      return;
    }

    state.stepperCurrentStep = 1;
    updateStepperHighlight();
    document.getElementById('stepper-play-icon').textContent = '⏸';

    state.stepperAutoTimer = setInterval(() => {
      if (state.stepperCurrentStep < state.nastamN) {
        state.stepperCurrentStep++;
        updateStepperHighlight();
      } else {
        clearInterval(state.stepperAutoTimer);
        state.stepperAutoTimer = null;
        document.getElementById('stepper-play-icon').textContent = '▶';
      }
    }, 800);
  });

  function renderUddistamStrip(n) {
    const strip = document.getElementById('uddistam-selector-strip');
    strip.innerHTML = '';

    while (state.uddistamPattern.length < n) state.uddistamPattern.push('L');
    state.uddistamPattern = state.uddistamPattern.slice(0, n);

    state.uddistamPattern.forEach((syl, i) => {
      const btn = document.createElement('div');
      const isGuru = syl === 'G';
      btn.className = `syl-click-btn ${isGuru ? 'guru' : 'laghu'}`;
      btn.innerHTML = `
        <span style="font-size: 0.7rem; opacity: 0.7;">#${i+1}</span>
        <strong style="font-size: 1.1rem;">${isGuru ? '—' : '∪'}</strong>
        <span style="font-size: 0.7rem; font-family: monospace;">2<sup>${i}</sup></span>
      `;

      btn.addEventListener('click', () => {
        state.uddistamPattern[i] = state.uddistamPattern[i] === 'G' ? 'L' : 'G';
        rhythmSynth.playTone(state.uddistamPattern[i]);
        renderUddistamResults();
      });

      strip.appendChild(btn);
    });

    renderUddistamResults();
  }

  function renderUddistamResults() {
    const { rank, trace } = pingalaUddistam(state.uddistamPattern);
    const n = state.uddistamPattern.length;
    const rankEl = document.getElementById('uddistam-rank-display');
    rankEl.textContent = rank;
    rankEl.classList.remove('rank-bump');
    void rankEl.offsetWidth; // force reflow for animation
    rankEl.classList.add('rank-bump');
    document.getElementById('uddistam-max-rank').textContent = Math.pow(2, n);

    const traceBox = document.getElementById('uddistam-trace-container');
    traceBox.innerHTML = trace.map(t => `
      <div class="trace-step-card">
        <div>
          <span class="trace-step-num">Pos ${t.position}:</span>
          <span>${t.syllable === 'G' ? 'Guru (1)' : 'Laghu (0)'} &times; ${t.placeValue} = <strong>${t.contribution}</strong></span>
        </div>
        <span style="font-family: monospace; color: var(--gold-light);">Sum: ${t.runningSum}</span>
      </div>
    `).join('');
  }

  nInput.addEventListener('change', renderNastam);
  rankInput.addEventListener('input', renderNastam);
  randomRankBtn.addEventListener('click', () => {
    const n = parseInt(nInput.value, 10);
    const max = Math.pow(2, n);
    rankInput.value = Math.floor(Math.random() * max) + 1;
    renderNastam();
  });

  playNastamBtn.addEventListener('click', () => {
    const { pattern } = pingalaNastam(parseInt(rankInput.value, 10), parseInt(nInput.value, 10));
    rhythmSynth.playSequence(pattern);
  });

  syncBtn.addEventListener('click', () => {
    const { rank } = pingalaUddistam(state.uddistamPattern);
    rankInput.value = rank;
    renderNastam();
  });

  // Saṅkhyā slider
  sankhyaSlider.addEventListener('input', (e) => {
    const exp = parseInt(e.target.value, 10);
    state.sankhyaExp = exp;
    document.getElementById('sankhya-n-val').textContent = exp;
    document.getElementById('sankhya-exp-label').textContent = exp;

    const { result, multiplications, steps } = pingalaSankhya(exp);
    document.getElementById('sankhya-result-val').textContent = result.toLocaleString();
    document.getElementById('sankhya-mult-count').textContent = `(${multiplications} multiplications)`;

    const stepsBox = document.getElementById('sankhya-steps-container');
    stepsBox.innerHTML = steps.map(s => `<div>&rarr; ${s}</div>`).join('');
  });

  renderNastam();
  sankhyaSlider.dispatchEvent(new Event('input'));
}

/* -------------------------------------------------------------
 * TAB 3: MERU-PRASTĀRA (Pascal Dynamic Programming Pyramid)
 * ------------------------------------------------------------- */
function initMeruModule() {
  const rowsSlider = document.getElementById('meru-rows-slider');

  function renderMeru() {
    const maxRows = state.meruRows;
    document.getElementById('meru-height-val').textContent = `Row ${maxRows}`;
    const pyramid = generateMeruPrastara(maxRows);
    const container = document.getElementById('meru-pyramid-container');
    container.innerHTML = '';

    pyramid.forEach((rowObj) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'meru-row';
      rowDiv.style.setProperty('--row-n', rowObj.row);

      const lbl = document.createElement('span');
      lbl.className = 'meru-row-label';
      lbl.textContent = `n=${rowObj.row}`;
      rowDiv.appendChild(lbl);

      rowObj.cells.forEach(cell => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'meru-cell';
        cellDiv.dataset.n = cell.n;
        cellDiv.dataset.k = cell.k;
        cellDiv.textContent = cell.value;

        cellDiv.addEventListener('mouseenter', () => {
          highlightParents(cell.parents);
          inspectCell(cell);
        });

        cellDiv.addEventListener('mouseleave', () => {
          clearHighlights();
        });

        cellDiv.addEventListener('click', () => {
          document.querySelectorAll('.meru-cell').forEach(c => c.classList.remove('selected'));
          cellDiv.classList.add('selected');
          inspectCell(cell);
          renderDistribution(cell.n);
        });

        rowDiv.appendChild(cellDiv);
      });

      const sumPill = document.createElement('span');
      sumPill.className = 'meru-row-sum-badge';
      sumPill.textContent = `Σ = 2^${rowObj.row} = ${rowObj.sum}`;
      rowDiv.appendChild(sumPill);

      container.appendChild(rowDiv);
    });

    renderDistribution(maxRows);
  }

  function highlightParents(parents) {
    clearHighlights();
    parents.forEach(([pn, pk]) => {
      const parentEl = document.querySelector(`.meru-cell[data-n="${pn}"][data-k="${pk}"]`);
      if (parentEl) parentEl.classList.add('highlight-parent');
    });
  }

  function clearHighlights() {
    document.querySelectorAll('.meru-cell.highlight-parent').forEach(el => {
      el.classList.remove('highlight-parent');
    });
  }

  function inspectCell(cell) {
    const box = document.getElementById('meru-cell-inspection');
    const isBoundary = cell.k === 0 || cell.k === cell.n;

    box.innerHTML = `
      <div class="cell-inspector-content">
        <div class="inspector-formula">
          <strong>Binomial Coefficient C(${cell.n}, ${cell.k}):</strong> ${cell.value}
        </div>
        <div>
          ${isBoundary 
            ? `<em>Boundary Base Case:</em> C(${cell.n}, ${cell.k}) = 1 (Only 1 way to have all Gurus or all Laghus)`
            : `<em>Dynamic Programming Recurrence:</em><br>
               C(${cell.n}, ${cell.k}) = C(${cell.n - 1}, ${cell.k - 1}) + C(${cell.n - 1}, ${cell.k}) = 
               ${binomialCoefficient(cell.n - 1, cell.k - 1)} + ${binomialCoefficient(cell.n - 1, cell.k)} = <strong>${cell.value}</strong>`
          }
        </div>
        <div style="color: var(--text-muted); font-size: 0.85rem;">
          In a meter of ${cell.n} syllables, exactly <strong>${cell.value}</strong> meters have ${cell.k} Guru(s) and ${cell.n - cell.k} Laghu(s).
        </div>
      </div>
    `;
  }

  function renderDistribution(n) {
    const dist = getLaghvaksharaDistribution(n);
    const chartContainer = document.getElementById('meru-distribution-chart');
    const maxCount = Math.max(...dist.map(d => d.count));

    let html = `
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
        Row n = ${n} (Total combinations = ${Math.pow(2, n)}):
      </div>
      <div style="display: flex; align-items: flex-end; gap: 0.5rem; height: 160px; padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);">
    `;

    dist.forEach(d => {
      const heightPercent = Math.max(10, Math.round((d.count / maxCount) * 100));
      html += `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
          <div style="font-size: 0.72rem; font-family: monospace; color: var(--gold-light); margin-bottom: 4px;">${d.count}</div>
          <div style="width: 100%; height: ${heightPercent}%; background: var(--gold-gradient); border-radius: 4px 4px 0 0; transition: height 0.3s ease;" title="k=${d.gurus} Gurus: ${d.count} (${d.percentage}%)"></div>
          <div style="font-size: 0.7rem; font-family: monospace; color: var(--text-muted); margin-top: 4px;">k=${d.gurus}</div>
        </div>
      `;
    });

    html += `</div>`;
    chartContainer.innerHTML = html;
  }

  rowsSlider.addEventListener('input', (e) => {
    state.meruRows = parseInt(e.target.value, 10);
    renderMeru();
  });

  renderMeru();
}

/* -------------------------------------------------------------
 * TAB 4: METHOD & PSEUDOCODE (Codex #method Equivalent)
 * ------------------------------------------------------------- */
function initMethodModule() {
  const navButtons = document.querySelectorAll('.method-nav-btn');
  const copyBtn = document.getElementById('btn-copy-pseudocode');

  function renderMethodAlgorithm(algKey) {
    const spec = ALGORITHM_SPECS[algKey];
    if (!spec) return;

    state.activeMethodAlg = algKey;
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.alg === algKey));

    document.getElementById('alg-sutra-tag').textContent = spec.sutra;
    document.getElementById('alg-title').textContent = spec.title;
    document.getElementById('alg-subtitle').textContent = spec.subtitle;
    document.getElementById('alg-code-block').textContent = spec.pseudocode;
    document.getElementById('alg-caption').textContent = spec.description;

    document.getElementById('worked-heading').textContent = spec.workedStep.heading;
    document.getElementById('worked-note').textContent = spec.workedStep.note;

    // Render worked content
    const workedBox = document.getElementById('worked-content-box');
    if (spec.workedStep.steps) {
      workedBox.innerHTML = spec.workedStep.steps.map(s => `<div>&rarr; ${s}</div>`).join('');
    } else if (spec.workedStep.illustration) {
      workedBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          ${spec.workedStep.illustration.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.3rem 0.5rem; background: rgba(0,0,0,0.15); border-radius: 4px;">
              <span><strong>#${item.rank}</strong>: <code style="color: var(--cyan-light);">${item.pattern}</code></span>
              <span style="color: var(--gold-light);">${item.gana}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    // Complexity Cards
    document.getElementById('comp-time').textContent = spec.complexity.time;
    document.getElementById('comp-space').textContent = spec.complexity.space;
    document.getElementById('comp-aux').textContent = spec.complexity.auxiliary;
    document.getElementById('comp-invariant').textContent = spec.invariant;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      renderMethodAlgorithm(btn.dataset.alg);
    });
  });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = document.getElementById('alg-code-block').textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy Code'; }, 1500);
      });
    });
  }

  renderMethodAlgorithm('prastara');
}

/* -------------------------------------------------------------
 * TAB 5: SANSKRIT SCANSION (NLP Syllabifier & Classifier)
 * ------------------------------------------------------------- */
function initScansionModule() {
  const textArea = document.getElementById('scansion-input-text');
  const scanBtn = document.getElementById('btn-scan-verse');
  const playVerseBtn = document.getElementById('btn-play-verse-audio');
  const padantaChk = document.getElementById('chk-padanta-guru');

  function runScansion() {
    const rawText = textArea.value;
    const allowPadanta = padantaChk.checked;
    const result = scanSanskritVerse(rawText, allowPadanta);

    document.getElementById('scansion-syllable-count').textContent = result.syllables.length;
    document.getElementById('scansion-matra-count').textContent = result.totalMatras;

    const guruCount = result.pattern.filter(s => s === 'G').length;
    const laghuCount = result.pattern.length - guruCount;
    document.getElementById('scansion-ratio').textContent = `${guruCount}G / ${laghuCount}L`;

    const badge = document.getElementById('scansion-detected-badge');
    const infoCard = document.getElementById('scansion-meter-info');

    if (result.detectedMeter) {
      badge.textContent = result.detectedMeter.name;
      infoCard.innerHTML = `
        <div style="font-weight: 700; color: var(--gold-light); font-size: 1.05rem;">
          ✓ Identified Meter: ${result.detectedMeter.name}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.35rem;">
          ${result.detectedMeter.description}
        </p>
      `;
    } else {
      badge.textContent = 'Custom Vṛtta';
      infoCard.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem;">
          Custom metrical pattern (${result.syllables.length} syllables, ${result.totalMatras} mātrās). Matches classical prosodic rules.
        </div>
      `;
    }

    const cardsContainer = document.getElementById('scansion-cards-container');
    cardsContainer.innerHTML = result.syllables.map((s, idx) => `
      <div class="syllable-badge-item ${s.code === 'G' ? 'guru' : 'laghu'}" style="--syl-idx: ${idx};" title="${s.reason}">
        <span class="syl-text">${s.text}</span>
        <span class="syl-symbol">${s.symbol}</span>
        <span class="syl-type">${s.code} (${s.matras}m)</span>
      </div>
    `).join('');
  }

  scanBtn.addEventListener('click', runScansion);
  padantaChk.addEventListener('change', runScansion);

  document.querySelectorAll('.preset-shloka-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      if (SHLOKA_PRESETS[key]) {
        textArea.value = SHLOKA_PRESETS[key];
        runScansion();
      }
    });
  });

  playVerseBtn.addEventListener('click', () => {
    const result = scanSanskritVerse(textArea.value, padantaChk.checked);
    if (result.pattern.length > 0) {
      rhythmSynth.playSequence(result.pattern);
    }
  });

  runScansion();
}

/* -------------------------------------------------------------
 * TAB 6: VIRAHĀṄKA-HEMACHANDRA MĀTRĀVRITTA (Fibonacci Engine)
 * ------------------------------------------------------------- */
function initFibonacciModule() {
  const slider = document.getElementById('matra-m-slider');
  const mVal = document.getElementById('matra-m-val');
  const displayM = document.getElementById('matra-display-m');
  const countBadge = document.getElementById('matra-comp-count');
  const formulaDisplay = document.getElementById('fib-formula-display');
  const seqStrip = document.getElementById('virahanka-sequence-strip');
  const compContainer = document.getElementById('matra-compositions-container');

  function renderFibonacci() {
    const M = state.matraM;
    mVal.textContent = M;
    displayM.textContent = M;

    const { compositions, count } = generateMatraCompositions(M);
    countBadge.textContent = `${count} Compositions`;

    if (M === 1) {
      formulaDisplay.textContent = 'F(1) = 1 Composition (L)';
    } else if (M === 2) {
      formulaDisplay.textContent = 'F(2) = 2 Compositions (LL, G)';
    } else {
      const prev1 = generateMatraCompositions(M - 1).count;
      const prev2 = generateMatraCompositions(M - 2).count;
      formulaDisplay.textContent = `F(${M}) = F(${M-1}) + F(${M-2}) = ${prev1} + ${prev2} = ${count} Compositions`;
    }

    const seq = getVirahankaSequence(8);
    seqStrip.innerHTML = seq.map(item => `
      <div class="seq-item ${item.matras === M ? 'selected-seq' : ''}">
        ${item.formula}
      </div>
    `).join('');

    compContainer.innerHTML = compositions.map((comp, idx) => {
      const pills = comp.map(s => `
        <span class="syllable-pill ${s === 'G' ? 'guru' : 'laghu'}" style="width: 24px; height: 24px; font-size: 0.75rem;">
          ${s === 'G' ? '—' : '∪'}
        </span>
      `).join('');

      return `
        <div class="comp-row" style="--comp-idx: ${idx};">
          <span class="comp-index">#${idx + 1}</span>
          <div>${pills}</div>
          <span style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${comp.join('')}</span>
        </div>
      `;
    }).join('');
  }

  slider.addEventListener('input', (e) => {
    state.matraM = parseInt(e.target.value, 10);
    renderFibonacci();
  });

  renderFibonacci();
}

/* -------------------------------------------------------------
 * TAB 7: FORMAL TEST SUITE (12 Tests)
 * ------------------------------------------------------------- */
function initTestModule() {
  const runBtn = document.getElementById('btn-run-tests-action');
  const quickVivaBtn = document.getElementById('btn-quick-viva');

  if (runBtn) {
    runBtn.addEventListener('click', runTestSuiteAndRender);
  }
  if (quickVivaBtn) {
    quickVivaBtn.addEventListener('click', () => {
      switchTab('tab-tests');
      runTestSuiteAndRender();
    });
  }
}

function runTestSuiteAndRender() {
  const { results, total, passed, totalTimeMs } = executeTestSuite();

  const statusEl = document.getElementById('test-overall-status');
  const countsEl = document.getElementById('test-counts-caption');
  const latencyEl = document.getElementById('test-latency-val');
  const badgeMini = document.getElementById('badge-all-tests-pass');

  if (passed === total) {
    statusEl.textContent = 'ALL PASSED';
    statusEl.className = 'metric-large-text text-emerald';
    if (badgeMini) badgeMini.textContent = `${total} PASS`;
  } else {
    statusEl.textContent = `${passed}/${total} PASSED`;
    statusEl.className = 'metric-large-text text-saffron';
  }

  countsEl.textContent = `${passed} of ${total} Tests Passed (${Math.round((passed/total)*100)}%)`;
  latencyEl.textContent = `${totalTimeMs} ms`;

  const container = document.getElementById('test-cases-container');
  if (!container) return;

  container.innerHTML = results.map((t, idx) => `
    <div class="test-card ${t.passed ? 'passed' : 'failed'}" style="--test-idx: ${idx};">
      <div class="test-card-header">
        <span class="test-id-name">${t.id}: ${t.name}</span>
        <span class="test-status-badge ${t.passed ? 'pass' : 'fail'}">${t.passed ? 'PASS' : 'FAIL'}</span>
      </div>
      <p class="test-desc">${t.description}</p>
      <div class="test-meta-box">
        <div class="test-meta-row">
          <span class="test-meta-key">Input:</span>
          <span class="test-meta-val">${t.input}</span>
        </div>
        <div class="test-meta-row">
          <span class="test-meta-key">Expected:</span>
          <span class="test-meta-val">${t.expected}</span>
        </div>
        <div class="test-meta-row">
          <span class="test-meta-key">Actual:</span>
          <span class="test-meta-val">${t.actual}</span>
        </div>
        <div class="test-meta-row">
          <span class="test-meta-key">Invariant:</span>
          <span class="test-meta-val" style="color: var(--cyan-light);">${t.invariant}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* -------------------------------------------------------------
 * MODAL & AUXILIARY CONTROLS
 * ------------------------------------------------------------- */
function initModalAndHeaderActions() {
  const modal = document.getElementById('theory-modal');
  const openBtn = document.getElementById('btn-theory-modal');
  const closeBtn = document.getElementById('btn-close-modal');
  const footerBtn = document.getElementById('btn-footer-theory');

  function openModal() {
    modal.classList.add('open');
  }
  function closeModal() {
    modal.classList.remove('open');
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (footerBtn) footerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
