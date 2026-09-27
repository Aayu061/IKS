(() => {
  // src/core/pingala-engine.js
  var GANAS = {
    "Ya": { name: "Ya-ga\u1E47a (\u092F\u0917\u0923)", pattern: ["L", "G", "G"], binary: "011", meaning: "Adilaghu (Light initial)" },
    "Ma": { name: "Ma-ga\u1E47a (\u092E\u0917\u0923)", pattern: ["G", "G", "G"], binary: "111", meaning: "Sarvaguru (All heavy)" },
    "Ta": { name: "Ta-ga\u1E47a (\u0924\u0917\u0923)", pattern: ["G", "G", "L"], binary: "110", meaning: "Antyalaghu (Light final)" },
    "Ra": { name: "Ra-ga\u1E47a (\u0930\u0917\u0923)", pattern: ["G", "L", "G"], binary: "101", meaning: "Madhyalaghu (Light middle)" },
    "Ja": { name: "Ja-ga\u1E47a (\u091C\u0917\u0923)", pattern: ["L", "G", "L"], binary: "010", meaning: "Madhyaguru (Heavy middle)" },
    "Bha": { name: "Bha-ga\u1E47a (\u092D\u0917\u0923)", pattern: ["G", "L", "L"], binary: "100", meaning: "Adiguru (Heavy initial)" },
    "Na": { name: "Na-ga\u1E47a (\u0928\u0917\u0923)", pattern: ["L", "L", "L"], binary: "000", meaning: "Sarvalaghu (All light)" },
    "Sa": { name: "Sa-ga\u1E47a (\u0938\u0917\u0923)", pattern: ["L", "L", "G"], binary: "001", meaning: "Antyaguru (Heavy final)" }
  };
  function identifyGana(triplet) {
    if (!triplet || triplet.length !== 3) return "-";
    const key = triplet.join("");
    for (const [code, info] of Object.entries(GANAS)) {
      if (info.pattern.join("") === key) {
        return code;
      }
    }
    return "-";
  }
  function pingalaNastam(rank, n) {
    if (rank < 1 || rank > Math.pow(2, n)) {
      throw new Error(`Rank ${rank} is out of bounds for n = ${n} syllables (Valid: 1 to ${Math.pow(2, n)})`);
    }
    const pattern = [];
    const trace = [];
    let currentR = rank;
    for (let i = 1; i <= n; i++) {
      const isOdd = currentR % 2 !== 0;
      const syllable = isOdd ? "L" : "G";
      const bit = isOdd ? "0" : "1";
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
    const binary = pattern.map((s) => s === "G" ? "1" : "0").join("");
    return { pattern, binary, trace };
  }
  function pingalaUddistam(inputPattern) {
    const pattern = Array.isArray(inputPattern) ? inputPattern : inputPattern.toUpperCase().split("").map((c) => c === "1" || c === "G" ? "G" : "L");
    let rank = 1;
    let placeValue = 1;
    const trace = [];
    const placeValues = [];
    for (let i = 0; i < pattern.length; i++) {
      const syl = pattern[i];
      const isGuru = syl === "G";
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
  function generatePrastara(n) {
    const total = Math.pow(2, n);
    const rows = [];
    for (let r = 1; r <= total; r++) {
      const { pattern, binary } = pingalaNastam(r, n);
      const matras = pattern.reduce((sum, syl) => sum + (syl === "G" ? 2 : 1), 0);
      const laghuCount = pattern.filter((s) => s === "L").length;
      const guruCount = pattern.filter((s) => s === "G").length;
      const ganas = [];
      for (let i = 0; i < pattern.length; i += 3) {
        const slice = pattern.slice(i, i + 3);
        if (slice.length === 3) {
          ganas.push(identifyGana(slice));
        } else {
          ganas.push(slice.map((s) => s === "G" ? "Ga" : "La").join("-"));
        }
      }
      rows.push({
        rank: r,
        pattern,
        patternStr: pattern.join(" "),
        binary,
        matras,
        laghuCount,
        guruCount,
        ganas: ganas.join(" ")
      });
    }
    return rows;
  }
  function pingalaSankhya(n) {
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
        steps.push(`Odd exponent ${exponent}: Subtract 1 to ${exponent - 1}, multiply by 2 (r\u016Bpe \u015B\u016Bnyam)`);
        const prev = recurse(exponent - 1);
        multiplications++;
        return 2 * prev;
      }
    }
    const result = recurse(n);
    return { result, multiplications, steps };
  }

  // src/core/meru-engine.js
  function generateMeruPrastara(maxRows = 8) {
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
  function binomialCoefficient(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let c = 1;
    for (let i = 1; i <= k; i++) {
      c = c * (n - i + 1) / i;
    }
    return Math.round(c);
  }
  function getLaghvaksharaDistribution(n) {
    const total = Math.pow(2, n);
    const distribution = [];
    for (let k = 0; k <= n; k++) {
      const count = binomialCoefficient(n, k);
      distribution.push({
        gurus: k,
        laghus: n - k,
        count,
        percentage: (count / total * 100).toFixed(1)
      });
    }
    return distribution;
  }

  // src/core/matra-fibonacci.js
  function generateMatraCompositions(totalMatras) {
    const compositions = [];
    function backtrack(currentSum, currentPattern) {
      if (currentSum === totalMatras) {
        compositions.push([...currentPattern]);
        return;
      }
      if (currentSum > totalMatras) return;
      currentPattern.push("L");
      backtrack(currentSum + 1, currentPattern);
      currentPattern.pop();
      currentPattern.push("G");
      backtrack(currentSum + 2, currentPattern);
      currentPattern.pop();
    }
    backtrack(0, []);
    return {
      compositions,
      count: compositions.length,
      fibonacciIndex: totalMatras
    };
  }
  function getVirahankaSequence(n = 8) {
    const sequence = [
      { matras: 1, count: 1, formula: "F(1) = 1 (L)" },
      { matras: 2, count: 2, formula: "F(2) = 2 (LL, G)" }
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

  // src/core/scansion-engine.js
  var KNOWN_METERS = [
    {
      name: "Anu\u1E63\u1E6Dubh / \u015Aloka (\u0905\u0928\u0941\u0937\u094D\u091F\u0941\u092C\u094D)",
      syllablesPerPada: 8,
      totalSyllables: 32,
      description: "The standard 8-syllable quarter-verse meter of the Ramayana, Mahabharata, and Gita. 5th syllable is L, 6th is G.",
      test: (patt) => patt.length === 8 && patt[4] === "L" && patt[5] === "G"
    },
    {
      name: "G\u0101yatr\u012B (\u0917\u093E\u092F\u0924\u094D\u0930\u0940)",
      syllablesPerPada: 8,
      totalSyllables: 24,
      description: "Vedic meter consisting of 3 triplets of 8 syllables (24 total syllables).",
      test: (patt) => patt.length === 8
    },
    {
      name: "Indravajr\u0101 (\u0907\u0928\u094D\u0926\u094D\u0930\u0935\u091C\u094D\u0930\u093E)",
      syllablesPerPada: 11,
      pattern: ["G", "G", "L", "G", "G", "L", "L", "G", "L", "G", "G"],
      // Ta, Ta, Ja, Ga, Ga
      description: "11 syllables: Ta-ga\u1E47a, Ta-ga\u1E47a, Ja-ga\u1E47a, Guru, Guru (\u2014 \u2014 \u222A \u2014 \u2014 \u222A \u222A \u2014 \u222A \u2014 \u2014)",
      test: (patt) => patt.join("") === "GGLGGLLGLGG"
    },
    {
      name: "Upendravajr\u0101 (\u0909\u092A\u0947\u0928\u094D\u0926\u094D\u0930\u0935\u091C\u094D\u0930\u093E)",
      syllablesPerPada: 11,
      pattern: ["L", "G", "L", "G", "G", "L", "L", "G", "L", "G", "G"],
      // Ja, Ta, Ja, Ga, Ga
      description: "11 syllables: Ja-ga\u1E47a, Ta-ga\u1E47a, Ja-ga\u1E47a, Guru, Guru (\u222A \u2014 \u222A \u2014 \u2014 \u222A \u222A \u2014 \u222A \u2014 \u2014)",
      test: (patt) => patt.join("") === "LGLGGLLGLGG"
    },
    {
      name: "Upaj\u0101ti (\u0909\u092A\u091C\u093E\u0924\u093F)",
      syllablesPerPada: 11,
      description: "11 syllables: Any mixture of Indravajr\u0101 and Upendravajr\u0101 lines.",
      test: (patt) => patt.length === 11 && patt.slice(3).join("") === "GGLLGLGG"
    },
    {
      name: "Vasantatilak\u0101 (\u0935\u0938\u0928\u094D\u0924\u0924\u093F\u0932\u0915\u093E)",
      syllablesPerPada: 14,
      pattern: ["G", "G", "L", "G", "L", "L", "L", "G", "L", "L", "G", "L", "G", "G"],
      // Ta, Bha, Ja, Ja, Ga, Ga
      description: "14 syllables: Ta, Bha, Ja, Ja, Ga, Ga",
      test: (patt) => patt.join("") === "GGLGLLLGLLGLGG"
    },
    {
      name: "M\u0101lin\u012B (\u092E\u093E\u0932\u093F\u0928\u0940)",
      syllablesPerPada: 15,
      pattern: ["L", "L", "L", "L", "L", "L", "G", "G", "L", "G", "G", "L", "G", "G", "G"],
      // Na, Na, Ma, Ya, Ya
      description: "15 syllables: Na, Na, Ma, Ya, Ya with caesura at 8 and 7",
      test: (patt) => patt.length === 15
    },
    {
      name: "Mand\u0101kr\u0101nt\u0101 (\u092E\u0928\u094D\u0926\u093E\u0915\u094D\u0930\u093E\u0928\u094D\u0924\u093E)",
      syllablesPerPada: 17,
      pattern: ["G", "G", "G", "G", "L", "L", "L", "L", "L", "G", "G", "L", "G", "G", "L", "G", "G"],
      // Ma, Bha, Na, Ta, Ta, Ga, Ga
      description: "17 syllables of Kalidasa's Meghad\u016Bta: Ma, Bha, Na, Ta, Ta, Ga, Ga",
      test: (patt) => patt.length === 17
    },
    {
      name: "\u015A\u0101rd\u016Blavikr\u012B\u1E0Dita (\u0936\u093E\u0930\u094D\u0926\u0942\u0932\u0935\u093F\u0915\u094D\u0930\u0940\u0921\u093F\u0924)",
      syllablesPerPada: 19,
      pattern: ["G", "G", "G", "L", "L", "G", "L", "G", "L", "L", "L", "G", "G", "L", "G", "G", "L", "G", "G"],
      description: "19 syllables: Ma, Sa, Ja, Sa, Ta, Ta, Ga",
      test: (patt) => patt.length === 19
    }
  ];
  var DEVA_VOWELS = {
    "\u0905": "a",
    "\u0906": "\u0101",
    "\u0907": "i",
    "\u0908": "\u012B",
    "\u0909": "u",
    "\u090A": "\u016B",
    "\u090B": "\u1E5B",
    "\u0960": "\u1E5D",
    "\u090C": "\u1E37",
    "\u0961": "\u1E39",
    "\u090F": "e",
    "\u0910": "ai",
    "\u0913": "o",
    "\u0914": "au"
  };
  var DEVA_MATRAS = {
    "\u093E": "\u0101",
    "\u093F": "i",
    "\u0940": "\u012B",
    "\u0941": "u",
    "\u0942": "\u016B",
    "\u0943": "\u1E5B",
    "\u0944": "\u1E5D",
    "\u0962": "\u1E37",
    "\u0963": "\u1E39",
    "\u0947": "e",
    "\u0948": "ai",
    "\u094B": "o",
    "\u094C": "au"
  };
  var DEVA_CONSONANTS = {
    "\u0915": "k",
    "\u0916": "kh",
    "\u0917": "g",
    "\u0918": "gh",
    "\u0919": "\u1E45",
    "\u091A": "c",
    "\u091B": "ch",
    "\u091C": "j",
    "\u091D": "jh",
    "\u091E": "\xF1",
    "\u091F": "\u1E6D",
    "\u0920": "\u1E6Dh",
    "\u0921": "\u1E0D",
    "\u0922": "\u1E0Dh",
    "\u0923": "\u1E47",
    "\u0924": "t",
    "\u0925": "th",
    "\u0926": "d",
    "\u0927": "dh",
    "\u0928": "n",
    "\u092A": "p",
    "\u092B": "ph",
    "\u092C": "b",
    "\u092D": "bh",
    "\u092E": "m",
    "\u092F": "y",
    "\u0930": "r",
    "\u0932": "l",
    "\u0935": "v",
    "\u0936": "\u015B",
    "\u0937": "\u1E63",
    "\u0938": "s",
    "\u0939": "h"
  };
  function normalizeSanskritInput(text) {
    let result = "";
    const len = text.length;
    for (let i = 0; i < len; i++) {
      const ch = text[i];
      if (DEVA_VOWELS[ch]) {
        result += DEVA_VOWELS[ch];
        continue;
      }
      if (DEVA_CONSONANTS[ch]) {
        const cons = DEVA_CONSONANTS[ch];
        const nextCh = text[i + 1];
        if (nextCh === "\u094D") {
          result += cons;
          i++;
        } else if (DEVA_MATRAS[nextCh]) {
          result += cons + DEVA_MATRAS[nextCh];
          i++;
        } else {
          result += cons + "a";
        }
        continue;
      }
      if (ch === "\u0902") {
        result += "\u1E41";
        continue;
      }
      if (ch === "\u0903") {
        result += "\u1E25";
        continue;
      }
      if (ch === "\u093D") {
        result += "'";
        continue;
      }
      result += ch;
    }
    return result.toLowerCase();
  }
  function scanSanskritVerse(rawText, allowPadantaGuru = true) {
    const normalized = normalizeSanskritInput(rawText.trim());
    const vowelRegex = /(ā|ī|ū|ṝ|ai|au|e|o|a|i|u|ṛ|ḷ)/gi;
    const longVowels = /* @__PURE__ */ new Set(["\u0101", "\u012B", "\u016B", "\u1E5D", "ai", "au", "e", "o"]);
    const cleanText = normalized.replace(/[^a-zāīūṛṝḷṁḥ\s]/gi, "");
    const words = cleanText.split(/\s+/).filter(Boolean);
    const scannedSyllables = [];
    for (const word of words) {
      const matches = [];
      let m;
      while ((m = vowelRegex.exec(word)) !== null) {
        matches.push({ vowel: m[0], index: m.index });
      }
      for (let k = 0; k < matches.length; k++) {
        const current = matches[k];
        const next = matches[k + 1];
        const startIdx = k === 0 ? 0 : current.index;
        const endIdx = next ? next.index : word.length;
        const syllableSlice = word.slice(startIdx, endIdx);
        const isLongVowel = longVowels.has(current.vowel);
        let isGuru = isLongVowel;
        let reason = isLongVowel ? `Long vowel '${current.vowel}'` : `Short vowel '${current.vowel}'`;
        const afterVowel = word.slice(current.index + current.vowel.length, next ? next.index : word.length);
        if (!isGuru) {
          if (afterVowel.includes("\u1E41")) {
            isGuru = true;
            reason = `Short vowel with Anusv\u0101ra (\u1E41)`;
          } else if (afterVowel.includes("\u1E25")) {
            isGuru = true;
            reason = `Short vowel with Visarga (\u1E25)`;
          } else {
            const consonantsAfter = afterVowel.replace(/[^b-df-hj-np-tv-zñṅṇṭḍṣś]/g, "").length;
            if (consonantsAfter >= 2) {
              isGuru = true;
              reason = `Short vowel followed by conjunct consonants (${consonantsAfter} consonants)`;
            }
          }
        }
        scannedSyllables.push({
          text: syllableSlice,
          vowel: current.vowel,
          weight: isGuru ? "Guru" : "Laghu",
          symbol: isGuru ? "\u2014" : "\u222A",
          code: isGuru ? "G" : "L",
          bit: isGuru ? 1 : 0,
          matras: isGuru ? 2 : 1,
          reason
        });
      }
    }
    if (allowPadantaGuru && scannedSyllables.length > 0) {
      const last = scannedSyllables[scannedSyllables.length - 1];
      if (last.code === "L") {
        last.weight = "Guru (Pad\u0101nta)";
        last.symbol = "\u2014";
        last.code = "G";
        last.bit = 1;
        last.matras = 2;
        last.reason += " (Promoted to Guru at verse end / Pad\u0101nta)";
      }
    }
    const pattern = scannedSyllables.map((s) => s.code);
    const binary = pattern.map((s) => s === "G" ? "1" : "0").join("");
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

  // src/audio/rhythm-synth.js
  var RhythmSynthesizer = class {
    constructor() {
      this.audioCtx = null;
      this.masterGain = null;
      this.isPlaying = false;
      this.playbackTimeouts = [];
      this.tempoBpm = 110;
      this.volume = 0.4;
      this.pulseListeners = [];
    }
    init() {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContextClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
        this.masterGain.connect(this.audioCtx.destination);
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }
    }
    setVolume(val) {
      this.volume = Math.max(0, Math.min(1, val));
      if (this.masterGain && this.audioCtx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.audioCtx.currentTime);
      }
    }
    setTempo(bpm) {
      this.tempoBpm = Math.max(40, Math.min(240, bpm));
    }
    addPulseListener(fn) {
      this.pulseListeners.push(fn);
    }
    notifyPulse(type, durationMs) {
      this.pulseListeners.forEach((fn) => fn(type, durationMs));
    }
    /**
     * Play a single tone
     * @param {'L'|'G'} type 
     * @param {number} timeOffset - in seconds from now
     */
    playTone(type, timeOffset = 0) {
      this.init();
      if (!this.audioCtx || this.volume <= 1e-3) return;
      const isGuru = type === "G";
      const freq = isGuru ? 440 : 880;
      const baseDuration = 60 / this.tempoBpm;
      const duration = isGuru ? baseDuration * 0.45 : baseDuration * 0.22;
      const now = this.audioCtx.currentTime + timeOffset;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = isGuru ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(1e-4, now);
      gain.gain.linearRampToValueAtTime(isGuru ? 0.45 : 0.35, now + 8e-3);
      gain.gain.exponentialRampToValueAtTime(1e-4, now + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.05);
      this.notifyPulse(type, duration * 1e3);
    }
    /**
     * Play a full meter sequence with visual step callbacks
     * @param {Array<'L'|'G'>} pattern 
     * @param {Function} onStepCallback - Called with (index, syllable) on each beat
     * @param {Function} onCompleteCallback - Called when pattern finishes
     */
    playSequence(pattern, onStepCallback = null, onCompleteCallback = null) {
      this.stop();
      this.init();
      this.isPlaying = true;
      const beatDurationMs = 60 / this.tempoBpm * 1e3;
      let accumulatedTimeMs = 0;
      pattern.forEach((syl, idx) => {
        const sylDurationMs = syl === "G" ? beatDurationMs * 1.5 : beatDurationMs * 0.9;
        const timeoutId = setTimeout(() => {
          if (!this.isPlaying) return;
          this.playTone(syl);
          if (onStepCallback) onStepCallback(idx, syl);
        }, accumulatedTimeMs);
        this.playbackTimeouts.push(timeoutId);
        accumulatedTimeMs += sylDurationMs;
      });
      const completionTimeout = setTimeout(() => {
        this.isPlaying = false;
        if (onCompleteCallback) onCompleteCallback();
      }, accumulatedTimeMs + 200);
      this.playbackTimeouts.push(completionTimeout);
    }
    stop() {
      this.isPlaying = false;
      this.playbackTimeouts.forEach((t) => clearTimeout(t));
      this.playbackTimeouts = [];
    }
  };
  var rhythmSynth = new RhythmSynthesizer();

  // src/test/test-runner.js
  var TEST_SUITE = [
    {
      id: "TC-01",
      name: "Prast\u0101ra Combinatorial Size (n = 3)",
      category: "Prast\u0101ra",
      description: "Verify that a 3-syllable meter yields exactly 2^3 = 8 permutations.",
      run: () => {
        const rows = generatePrastara(3);
        const passed = rows.length === 8;
        return {
          passed,
          input: "n = 3 syllables",
          expected: "8 rows (|S_n| = 2^3)",
          actual: `${rows.length} rows`,
          invariant: "|S_n| == 2^n"
        };
      }
    },
    {
      id: "TC-02",
      name: "Prast\u0101ra Canonical Boundaries (n = 4)",
      category: "Prast\u0101ra",
      description: "Verify that the first row is all Laghus (0000) and last row is all Gurus (1111).",
      run: () => {
        const rows = generatePrastara(4);
        const firstRowPattern = rows[0].pattern.join("");
        const lastRowPattern = rows[15].pattern.join("");
        const passed = firstRowPattern === "LLLL" && lastRowPattern === "GGGG";
        return {
          passed,
          input: "n = 4 syllables",
          expected: "Row 1: LLLL, Row 16: GGGG",
          actual: `Row 1: ${firstRowPattern}, Row 16: ${lastRowPattern}`,
          invariant: "First row is zero-vector, last row is all-ones vector"
        };
      }
    },
    {
      id: "TC-03",
      name: "Na\u1E63\u1E6Dam Minimum Boundary Rank (R = 1, n = 4)",
      category: "Na\u1E63\u1E6Dam",
      description: "Verify that Rank 1 reconstructs the all-light pattern [L, L, L, L].",
      run: () => {
        const { pattern } = pingalaNastam(1, 4);
        const resultStr = pattern.join("");
        const passed = resultStr === "LLLL";
        return {
          passed,
          input: "Rank R = 1, n = 4",
          expected: "LLLL",
          actual: resultStr,
          invariant: "Nastam(1, n) == [L]^n"
        };
      }
    },
    {
      id: "TC-04",
      name: "Na\u1E63\u1E6Dam Maximum Boundary Rank (R = 16, n = 4)",
      category: "Na\u1E63\u1E6Dam",
      description: "Verify that Rank 2^n reconstructs the all-heavy pattern [G, G, G, G].",
      run: () => {
        const { pattern } = pingalaNastam(16, 4);
        const resultStr = pattern.join("");
        const passed = resultStr === "GGGG";
        return {
          passed,
          input: "Rank R = 16, n = 4",
          expected: "GGGG",
          actual: resultStr,
          invariant: "Nastam(2^n, n) == [G]^n"
        };
      }
    },
    {
      id: "TC-05",
      name: "Na\u1E63\u1E6Dam Arbitrary Rank Evaluation (R = 6, n = 4)",
      category: "Na\u1E63\u1E6Dam",
      description: "Verify that Rank 6 produces [G, L, G, L] according to Pi\u1E45gala's halving rule.",
      run: () => {
        const { pattern } = pingalaNastam(6, 4);
        const resultStr = pattern.join("");
        const passed = resultStr === "GLGL";
        return {
          passed,
          input: "Rank R = 6, n = 4",
          expected: "GLGL",
          actual: resultStr,
          invariant: "Step arithmetic satisfies Pi\u1E45gala's dvir ardhe rule"
        };
      }
    },
    {
      id: "TC-06",
      name: "Uddi\u1E63\u1E6Dam Place-Value Evaluation (Pattern [G, L, G, L])",
      category: "Uddi\u1E63\u1E6Dam",
      description: "Verify that pattern GLGL evaluates to decimal rank 6 via Horner's positional rule.",
      run: () => {
        const { rank } = pingalaUddistam(["G", "L", "G", "L"]);
        const passed = rank === 6;
        return {
          passed,
          input: "Pattern: [G, L, G, L]",
          expected: "Rank = 6 (1 + 1*1 + 0*2 + 1*4 + 0*8)",
          actual: `Rank = ${rank}`,
          invariant: "Uddistam(B) == 1 + sum(b_i * 2^i)"
        };
      }
    },
    {
      id: "TC-07",
      name: "Bidirectional Bijection Invariant (Round-Trip Test)",
      category: "Bijection",
      description: "Verify that Uddi\u1E63\u1E6Dam(Na\u1E63\u1E6Dam(R, n)) === R for arbitrary rank R = 43, n = 6.",
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
          actual: `Recovered Rank = ${recoveredRank} (Pattern: ${pattern.join("")})`,
          invariant: "Uddistam(Nastam(R, n)) === R (Bijective Isomorphism)"
        };
      }
    },
    {
      id: "TC-08",
      name: "Fast Exponentiation Sa\u1E45khy\u0101 (2^10 = 1024 in O(log n))",
      category: "Sa\u1E45khy\u0101",
      description: "Verify that 2^10 computes to 1024 with logarithmic multiplications.",
      run: () => {
        const { result, multiplications } = pingalaSankhya(10);
        const passed = result === 1024 && multiplications <= 5;
        return {
          passed,
          input: "Exponent n = 10",
          expected: "Result = 1024, Multiplications <= 5",
          actual: `Result = ${result}, Multiplications = ${multiplications}`,
          invariant: "Time complexity is strictly logarithmic O(log n)"
        };
      }
    },
    {
      id: "TC-09",
      name: "Meru-Prast\u0101ra Binomial Row Sum & Symmetry (n = 6)",
      category: "Meru-Prast\u0101ra",
      description: "Verify that row n=6 has sum 2^6 = 64 and satisfies C(n, k) = C(n, n-k).",
      run: () => {
        const pyramid = generateMeruPrastara(6);
        const row6 = pyramid[6];
        const values = row6.cells.map((c) => c.value);
        const sum = row6.sum;
        const isSymmetric = values[1] === values[5] && values[2] === values[4];
        const passed = sum === 64 && isSymmetric && values.join(",") === "1,6,15,20,15,6,1";
        return {
          passed,
          input: "Row n = 6",
          expected: "Coefficients: [1, 6, 15, 20, 15, 6, 1], Sum = 64",
          actual: `Coefficients: [${values.join(", ")}], Sum = ${sum}`,
          invariant: "sum(C(n, k)) == 2^n AND C(n, k) == C(n, n-k)"
        };
      }
    },
    {
      id: "TC-10",
      name: 'Sanskrit Scansion Phonetics ("Dharmak\u1E63etre")',
      category: "Scansion",
      description: 'Verify that "Dharmak\u1E63etre" correctly scans syllables with heavy conjunct weight.',
      run: () => {
        const result = scanSanskritVerse("dharmak\u1E63etre kuruk\u1E63etre");
        const firstSyllable = result.syllables[0];
        const passed = firstSyllable.code === "G" && result.syllables.length >= 8;
        return {
          passed,
          input: 'Text: "dharmak\u1E63etre kuruk\u1E63etre"',
          expected: '1st syllable (dhar) marked Guru due to conjunct "rm", total >= 8 syllables',
          actual: `1st syllable weight: ${firstSyllable.weight} (${firstSyllable.reason}), Total Syllables: ${result.syllables.length}`,
          invariant: "Phonological conjunct promotion rule (guru sa\u1E41yoge)"
        };
      }
    },
    {
      id: "TC-11",
      name: "Minimal Monosyllable Boundary (n = 1)",
      category: "Edge Case",
      description: "Verify boundary behavior for n = 1 syllable (R=1 -> L, R=2 -> G).",
      run: () => {
        const { pattern: p1 } = pingalaNastam(1, 1);
        const { pattern: p2 } = pingalaNastam(2, 1);
        const passed = p1.join("") === "L" && p2.join("") === "G";
        return {
          passed,
          input: "n = 1, R = 1 and R = 2",
          expected: "R=1 -> [L], R=2 -> [G]",
          actual: `R=1 -> [${p1.join("")}], R=2 -> [${p2.join("")}]`,
          invariant: "Boundary condition n=1 handles zero-overflow"
        };
      }
    },
    {
      id: "TC-12",
      name: "M\u0101tr\u0101-Prast\u0101ra Fibonacci Compositions (Duration M = 5)",
      category: "Fibonacci",
      description: "Verify that duration M = 5 m\u0101tr\u0101s yields exactly 8 rhythmic compositions (Fib(6) = 8).",
      run: () => {
        const { compositions, count } = generateMatraCompositions(5);
        const passed = count === 8;
        return {
          passed,
          input: "Duration M = 5 m\u0101tr\u0101s",
          expected: "8 compositions (Virah\u0101\u1E45ka sequence: 1, 2, 3, 5, 8)",
          actual: `${count} compositions generated`,
          invariant: "Count(M) == F(M + 1) (Fibonacci integer composition)"
        };
      }
    }
  ];
  function executeTestSuite() {
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
          input: "Exception occurred",
          expected: "Execution without exception",
          actual: err.message,
          invariant: "Error-free evaluation"
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

  // src/core/algorithms-data.js
  var ALGORITHM_SPECS = {
    "prastara": {
      id: "prastara",
      title: "Combinatorial Prast\u0101ra (\u092A\u094D\u0930\u0938\u094D\u0924\u093E\u0930)",
      subtitle: "Systematic Permutation Matrix & Truth Table Generation",
      sutra: "prast\u0101ro dvy-a\u1E45gulena (\u092A\u094D\u0930\u0938\u094D\u0924\u093E\u0930\u094B \u0926\u094D\u0935\u094D\u092F\u0919\u094D\u0917\u0941\u0932\u0947\u0928)",
      description: "Generates all 2^n metrical patterns for an n-syllable meter in Pi\u1E45gala's canonical lexicographical sequence.",
      pseudocode: `// Algorithm 1: Combinatorial Prast\u0101ra Generation
// Complexity: Time O(n \xB7 2^n), Space O(n \xB7 2^n)

ALGORITHM PingalaPrastara(n: Integer) -> Matrix of Syllables
INPUT:  Syllable length n >= 1
OUTPUT: List P containing 2^n patterns, each of length n

1. total \u2190 2^n
2. P \u2190 empty list of rows
3. FOR rank r \u2190 1 TO total DO
4.     pattern \u2190 PingalaNastam(r, n)
5.     APPEND pattern TO P
6. END FOR
7. RETURN P`,
      workedStep: {
        heading: "Permutation Ordering for n = 3 Syllables (2\xB3 = 8 Meters)",
        illustration: [
          { rank: 1, pattern: "L L L", binary: "000", gana: "Na-ga\u1E47a (All Light)", matras: 3 },
          { rank: 2, pattern: "G L L", binary: "100", gana: "Bha-ga\u1E47a (Initial Heavy)", matras: 4 },
          { rank: 3, pattern: "L G L", binary: "010", gana: "Ja-ga\u1E47a (Middle Heavy)", matras: 4 },
          { rank: 4, pattern: "G G L", binary: "110", gana: "Ta-ga\u1E47a (Initial 2 Heavy)", matras: 5 },
          { rank: 5, pattern: "L L G", binary: "001", gana: "Sa-ga\u1E47a (Final Heavy)", matras: 4 },
          { rank: 6, pattern: "G L G", binary: "101", gana: "Ra-ga\u1E47a (Middle Light)", matras: 5 },
          { rank: 7, pattern: "L G G", binary: "011", gana: "Ya-ga\u1E47a (Initial Light)", matras: 5 },
          { rank: 8, pattern: "G G G", binary: "111", gana: "Ma-ga\u1E47a (All Heavy)", matras: 6 }
        ],
        note: "Notice the alternation: Column 1 alternates every 1 row, Column 2 every 2 rows, Column 3 every 4 rows\u2014matching binary place values exactly."
      },
      complexity: {
        time: "O(n \xB7 2\u207F)",
        space: "O(n \xB7 2\u207F)",
        auxiliary: "O(n)",
        bits: "n bits per meter"
      },
      invariant: "|S_n| = 2^n (Canonical bijection with n-dimensional hypercube)"
    },
    "nastam": {
      id: "nastam",
      title: "Na\u1E63\u1E6Dam (\u0928\u0937\u094D\u091F\u092E\u094D): Rank-to-Binary Decoder",
      subtitle: 'Reconstructing the "Lost" Meter from its Ordinal Index via Halving',
      sutra: "lagheveti sam\u0101nam, vi\u1E63ame r\u016Bpa\u1E41 prak\u1E63ipya (\u0932\u0918\u0947\u0935\u0947\u0924\u093F \u0938\u092E\u093E\u0928\u092E\u094D, \u0935\u093F\u0937\u092E\u0947 \u0930\u0942\u092A\u0902 \u092A\u094D\u0930\u0915\u094D\u0937\u093F\u092A\u094D\u092F)",
      description: "Given any decimal rank R in [1, 2^n], recovers the exact sequence of Laghus and Gurus using integer division and modulo parity.",
      pseudocode: `// Algorithm 2: Na\u1E63\u1E6Dam (Decimal Rank to Syllable Pattern)
// Complexity: Time O(n), Auxiliary Space O(1)

ALGORITHM PingalaNastam(R: Integer, n: Integer) -> Array of Syllables
INPUT:  Decimal Rank R in [1, 2^n], Syllable count n >= 1
OUTPUT: Syllable array B = [b_1, b_2, ..., b_n] where b_i in {'L', 'G'}

1. current_R \u2190 R
2. B \u2190 array of size n
3. FOR i \u2190 1 TO n DO
4.     IF current_R is ODD THEN
5.         B[i] \u2190 'L'              // Laghu (0)
6.         current_R \u2190 (current_R + 1) / 2
7.     ELSE
8.         B[i] \u2190 'G'              // Guru (1)
9.         current_R \u2190 current_R / 2
10.    END IF
11. END FOR
12. RETURN B`,
      workedStep: {
        heading: "Worked Trace for Rank R = 43, Syllables n = 6",
        steps: [
          "Step 1: R = 43 (Odd)  \u2192 Assign Laghu (L),  R' = (43 + 1) / 2 = 22",
          "Step 2: R = 22 (Even) \u2192 Assign Guru (G),   R' = 22 / 2 = 11",
          "Step 3: R = 11 (Odd)  \u2192 Assign Laghu (L),  R' = (11 + 1) / 2 = 6",
          "Step 4: R = 6  (Even) \u2192 Assign Guru (G),   R' = 6 / 2 = 3",
          "Step 5: R = 3  (Odd)  \u2192 Assign Laghu (L),  R' = (3 + 1) / 2 = 2",
          "Step 6: R = 2  (Even) \u2192 Assign Guru (G),   R' = 2 / 2 = 1",
          "Result: Pattern = [L, G, L, G, L, G] (Binary: 010101)"
        ],
        note: "Pi\u1E45gala's addition of 1 before halving odd numbers mathematically shifts the 1-based rank to 0-based bit extraction."
      },
      complexity: {
        time: "O(n)",
        space: "O(n)",
        auxiliary: "O(1)",
        bits: "Requires \u2308log\u2082 R\u2309 bits of integer precision"
      },
      invariant: "Reconstructs canonical representation without full table generation"
    },
    "uddistam": {
      id: "uddistam",
      title: "Uddi\u1E63\u1E6Dam (\u0909\u0926\u094D\u0926\u093F\u0937\u094D\u091F\u092E\u094D): Binary-to-Rank Encoder",
      subtitle: "Evaluating the Ordinal Rank from a Pattern via Positional Weights",
      sutra: "var\u1E47\u0101nup\u016Brvy\u0101 r\u016Bpe sa\u1E45khy\u0101nam (\u0935\u0930\u094D\u0923\u093E\u0928\u0941\u092A\u0942\u0930\u094D\u0935\u094D\u092F\u093E \u0930\u0942\u092A\u0947 \u0938\u0919\u094D\u0916\u094D\u092F\u093E\u0928\u092E\u094D)",
      description: "Determines the decimal rank R of a given meter pattern by accumulating binary powers of two across positions.",
      pseudocode: `// Algorithm 3: Uddi\u1E63\u1E6Dam (Syllable Pattern to Decimal Rank)
// Complexity: Time O(n), Auxiliary Space O(1)

ALGORITHM PingalaUddistam(B: Array of Syllables) -> Integer
INPUT:  Syllable array B = [b_1, b_2, ..., b_n] where b_i in {'L', 'G'}
OUTPUT: Decimal Rank R in [1, 2^n]

1. R \u2190 1
2. place_value \u2190 1
3. FOR i \u2190 1 TO LENGTH(B) DO
4.     IF B[i] == 'G' THEN
5.         R \u2190 R + place_value
6.     END IF
7.     place_value \u2190 place_value * 2
8. END FOR
9. RETURN R`,
      workedStep: {
        heading: "Worked Calculation for Pattern [L, G, L, G, L, G]",
        steps: [
          "Position 1: Laghu (0) \u2192 Contribution: 0 \xD7 2\u2070 = 0",
          "Position 2: Guru  (1) \u2192 Contribution: 1 \xD7 2\xB9 = 2",
          "Position 3: Laghu (0) \u2192 Contribution: 0 \xD7 2\xB2 = 0",
          "Position 4: Guru  (1) \u2192 Contribution: 1 \xD7 2\xB3 = 8",
          "Position 5: Laghu (0) \u2192 Contribution: 0 \xD7 2\u2074 = 0",
          "Position 6: Guru  (1) \u2192 Contribution: 1 \xD7 2\u2075 = 32",
          "Rank = 1 + (0 + 2 + 0 + 8 + 0 + 32) = 1 + 42 = 43"
        ],
        note: "Notice the perfect inverse: Uddi\u1E63\u1E6Dam([L,G,L,G,L,G]) recovers Rank 43 exactly."
      },
      complexity: {
        time: "O(n)",
        space: "O(1)",
        auxiliary: "O(1)",
        bits: "Little-endian bit summation"
      },
      invariant: "Uddi\u1E63\u1E6Dam(Na\u1E63\u1E6Dam(R, n)) \u2261 R (Bijective Isomorphism)"
    },
    "sankhya": {
      id: "sankhya",
      title: "Sa\u1E45khy\u0101 (\u0938\u0902\u0916\u094D\u092F\u093E): Fast Exponentiation",
      subtitle: "Computing 2\u207F in O(log n) Time via Repeated Squaring",
      sutra: "dvir ardhe, r\u016Bpe \u015B\u016Bnyam (\u0926\u094D\u0935\u093F\u0930\u0930\u094D\u0927\u0947, \u0930\u0942\u092A\u0947 \u0936\u0942\u0928\u094D\u092F\u092E\u094D)",
      description: "Computes total combinations 2^n using divide-and-conquer halving and squaring centuries before modern binary exponentiation.",
      pseudocode: `// Algorithm 4: Sa\u1E45khy\u0101 (Fast Exponentiation)
// Complexity: Time O(log n), Space O(log n) call stack

ALGORITHM PingalaSankhya(n: Integer) -> Integer
INPUT:  Exponent n >= 0
OUTPUT: Value of 2^n

1. IF n == 0 THEN RETURN 1
2. IF n is EVEN THEN
3.     half \u2190 PingalaSankhya(n / 2)
4.     RETURN half * half          // "dvir ardhe" (square when halved)
5. ELSE
6.     RETURN 2 * PingalaSankhya(n - 1)  // "r\u016Bpe \u015B\u016Bnyam" (multiply by 2)
7. END IF`,
      workedStep: {
        heading: "Evaluation of 2\xB9\u2070 = 1024 in 4 Multiplications",
        steps: [
          "Step 1: n=10 (Even) \u2192 Halve to 5, compute (2\u2075)\xB2",
          "Step 2: n=5  (Odd)  \u2192 Compute 2 \xD7 2\u2074",
          "Step 3: n=4  (Even) \u2192 Halve to 2, compute (2\xB2)\xB2",
          "Step 4: n=2  (Even) \u2192 Halve to 1, compute (2\xB9)\xB2 = (2 \xD7 2\u2070)\xB2 = 4",
          "Ascent: 2\xB2 = 4 \u2192 2\u2074 = 16 \u2192 2\u2075 = 32 \u2192 2\xB9\u2070 = (32)\xB2 = 1024"
        ],
        note: "Total multiplications required: 4, compared to 9 in naive linear multiplication."
      },
      complexity: {
        time: "O(log n)",
        space: "O(1) iterative / O(log n) recursive",
        auxiliary: "O(1)",
        bits: "Optimal arithmetic operations"
      },
      invariant: "2\u207F = (2\u207F/\xB2)\xB2 for even n; 2\u207F = 2 \xB7 2\u207F\u207B\xB9 for odd n"
    },
    "meru": {
      id: "meru",
      title: "Meru-Prast\u0101ra (\u092E\u0947\u0930\u0941\u092A\u094D\u0930\u0938\u094D\u0924\u093E\u0930): Binomial DP Triangle",
      subtitle: "Dynamic Programming Memoization & Combinatorial Pyramids",
      sutra: "pare\u1E47a p\u016Brva\u1E41 sa\u1E45kalan\u0101t (\u092A\u0930\u0947\u0923 \u092A\u0942\u0930\u094D\u0935\u0902 \u0938\u0919\u094D\u0915\u0932\u0928\u093E\u0924\u094D)",
      description: "Constructs the pyramid of binomial coefficients where each inner cell is the dynamic programming sum of the two cells directly above it.",
      pseudocode: `// Algorithm 5: Meru-Prast\u0101ra Dynamic Programming Table
// Complexity: Time O(N\xB2), Space O(N\xB2)

ALGORITHM BuildMeruPrastara(N: Integer) -> 2D Matrix
INPUT:  Max row height N >= 0
OUTPUT: Triangular matrix M where M[n][k] = Binomial(n, k)

1. M \u2190 array of size N + 1
2. FOR r \u2190 0 TO N DO
3.     current \u2190 array of size r + 1
4.     current[0] \u2190 1              // Left edge base case
5.     current[r] \u2190 1              // Right edge base case
6.     FOR k \u2190 1 TO r - 1 DO
7.         current[k] \u2190 M[r - 1][k - 1] + M[r - 1][k]  // DP recurrence
8.     END FOR
9.     M[r] \u2190 current
10. END FOR
11. RETURN M`,
      workedStep: {
        heading: "Dynamic Step: Constructing Row n = 5 from Row n = 4",
        steps: [
          "Row n=4: [ 1,   4,   6,   4,   1 ]",
          "            \\ /  \\ /  \\ /  \\ /",
          "Add pairs:  1+4  4+6  6+4  4+1",
          "Row n=5: [ 1,   5,  10,  10,   5,   1 ]",
          "Verification: 1 + 5 + 10 + 10 + 5 + 1 = 32 = 2\u2075"
        ],
        note: "Cell (5, 2) = 10 represents the 10 distinct meters of 5 syllables containing exactly 2 Gurus."
      },
      complexity: {
        time: "O(N\xB2)",
        space: "O(N\xB2)",
        auxiliary: "O(1) to evaluate C(n, k) with multiplicative formula",
        bits: "Precedes Blaise Pascal (1654 CE) by over 700 years"
      },
      invariant: "\u2211 C(n, k) = 2\u207F AND C(n, k) = C(n, n - k)"
    },
    "scansion": {
      id: "scansion",
      title: "Sanskrit Scansion (\u0935\u0930\u094D\u0923\u0932\u0918\u0941\u0917\u0941\u0930\u0941\u0935\u093F\u0935\u0947\u0915)",
      subtitle: "Phonological Syllabification & Classical Meter Classifier",
      sutra: "s\u0101nusv\u0101ro visargastho gurur d\u012Brgha\u015B ca sa\u1E41yoge (\u0938\u093E\u0928\u0941\u0938\u094D\u0935\u093E\u0930\u094B \u0935\u093F\u0938\u0930\u094D\u0917\u0938\u094D\u0925\u094B \u0917\u0941\u0930\u0941\u0930\u094D\u0926\u0940\u0930\u094D\u0918\u0936\u094D\u091A \u0938\u0902\u092F\u094B\u0917\u0947)",
      description: "Parses Sanskrit natural language text into metrical syllables, determines syllable weights, and identifies Vedic and classical meters.",
      pseudocode: `// Algorithm 6: Sanskrit Phonological Scansion
// Complexity: Time O(m) for m characters, Space O(m)

ALGORITHM ScanSanskritVerse(text: String, padantaGuru: Boolean) -> MetricalAnalysis
INPUT:  Sanskrit text (IAST or Devanagari), padantaGuru flag
OUTPUT: Syllables, weights, total m\u0101tr\u0101s, detected classical meter

1. normalized \u2190 TransliterateToIAST(text)
2. vowels \u2190 ExtractVocalicNuclei(normalized)
3. FOR EACH vowel v IN vowels DO
4.     weight \u2190 IsLongVowel(v) ? 'Guru' : 'Laghu'
5.     IF weight == 'Laghu' THEN
6.         IF FollowedByAnusvaraOrVisarga(v) THEN weight \u2190 'Guru'
7.         ELSE IF FollowedByConjunctConsonants(v) THEN weight \u2190 'Guru'
8.     END IF
9.     RecordSyllable(v, weight)
10. END FOR
11. IF padantaGuru THEN PromoteLastSyllableToGuru()
12. detectedMeter \u2190 ClassifyMeter(syllables)
13. RETURN { syllables, detectedMeter }`,
      workedStep: {
        heading: 'Scansion of "yad\u0101 yad\u0101 hi dharmasya"',
        steps: [
          'ya: short "a" + single "d" \u2192 Laghu (\u222A, 1m)',
          'd\u0101: long "\u0101"               \u2192 Guru  (\u2014, 2m)',
          'ya: short "a" + single "d" \u2192 Laghu (\u222A, 1m)',
          'd\u0101: long "\u0101"               \u2192 Guru  (\u2014, 2m)',
          'hi: short "i" + single "dh"\u2192 Laghu (\u222A, 1m)',
          'dhar: short "a" + conjunct "rm" \u2192 Guru (\u2014, 2m) [Positionally heavy]',
          'ma: short "a" + single "sy"\u2192 Laghu (\u222A, 1m) or Guru before "sy"',
          'sya: short "a" at verse boundary \u2192 Guru by Pad\u0101nta convention'
        ],
        note: "Matches the 8-syllable Anu\u1E63\u1E6Dubh / \u015Aloka cadence of the Mahabharata and Gita."
      },
      complexity: {
        time: "O(m) where m is string length",
        space: "O(m)",
        auxiliary: "O(1)",
        bits: "Context-sensitive phonological automaton"
      },
      invariant: "Phonetic conjunct promotion rule (guru sa\u1E41yoge)"
    }
  };

  // main.js
  var state = {
    theme: localStorage.getItem("iks_theme") || "light",
    activeTab: "tab-prastara",
    activeMethodAlg: "prastara",
    // Tab 1 state
    prastaraN: 4,
    prastaraFilter: "all",
    showBinary: true,
    showSymbols: true,
    showGanas: true,
    // Tab 2 state & Stepper
    nastamN: 6,
    nastamRank: 43,
    uddistamPattern: ["G", "L", "G", "L", "G", "G"],
    sankhyaExp: 10,
    stepperCurrentStep: 1,
    stepperAutoTimer: null,
    // Tab 3 state
    meruRows: 7,
    selectedMeruCell: null,
    // Tab 5 state
    scansionText: "yad\u0101 yad\u0101 hi dharmasya gl\u0101nir bhavati bh\u0101rata",
    padantaGuru: true,
    // Tab 6 state
    matraM: 5
  };
  var SHLOKA_PRESETS = {
    gita: "yad\u0101 yad\u0101 hi dharmasya gl\u0101nir bhavati bh\u0101rata",
    gayatri: "tat savitur vare\u1E47ya\u1E41 bhargo devasya dh\u012Bmahi",
    indra: "indravajr\u0101 kathyate yadi tau jagau ga\u1E25",
    mrityun: "tryambaka\u1E41 yaj\u0101mahe sugandhi\u1E41 pu\u1E63\u1E6Divardhanam"
  };
  document.addEventListener("DOMContentLoaded", () => {
    initThemeSystem();
    initMetronomeDock();
    initHeroBits();
    initTabNavigation();
    initPrastaraModule();
    initNastamUddistamModule();
    initMeruModule();
    initMethodModule();
    initScansionModule();
    initFibonacciModule();
    initTestModule();
    initModalAndHeaderActions();
    runTestSuiteAndRender();
  });
  function initThemeSystem() {
    const radioInputs = document.querySelectorAll('input[name="theme-mode"]');
    const slideLabels = document.querySelectorAll(".theme-slide-btn");
    const savedTheme = localStorage.getItem("iks_theme") || "light";
    state.theme = savedTheme;
    updateTheme(savedTheme, false);
    updateThemeSliderUI(savedTheme);
    slideLabels.forEach((label) => {
      label.addEventListener("click", (event) => {
        const val = label.getAttribute("data-theme-val");
        if (val !== state.theme) {
          executeViewTransition(val, event);
        }
      });
    });
    radioInputs.forEach((input) => {
      input.addEventListener("change", (event) => {
        if (input.checked && input.value !== state.theme) {
          const correspondingLabel = document.querySelector(`label[for="${input.id}"]`);
          executeViewTransition(input.value, { currentTarget: correspondingLabel });
        }
      });
    });
  }
  function updateThemeSliderUI(theme) {
    const sliderThumb = document.getElementById("theme-slider-thumb");
    const isDark = theme === "dark";
    if (sliderThumb) {
      sliderThumb.style.transform = isDark ? "translateX(100%)" : "translateX(0%)";
    }
    const targetRadio = document.getElementById(`theme-${theme}`);
    if (targetRadio) {
      targetRadio.checked = true;
    }
    const slideLabels = document.querySelectorAll(".theme-slide-btn");
    slideLabels.forEach((label) => {
      const isTarget = label.getAttribute("data-theme-val") === theme;
      label.classList.toggle("active", isTarget);
    });
  }
  function updateTheme(theme, animateUI = true) {
    state.theme = theme;
    localStorage.setItem("iks_theme", theme);
    document.documentElement.style.setProperty("--theme", theme === "dark" ? "\u{1F311}" : "\u2600\uFE0F");
    updateThemeSliderUI(theme);
    applyTheme(theme);
  }
  function executeViewTransition(theme, event) {
    if (theme === state.theme) return;
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const target = event?.currentTarget || event?.target;
    const rect = target?.getBoundingClientRect ? target.getBoundingClientRect() : null;
    const x = event?.clientX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const y = event?.clientY ?? (rect ? rect.top + rect.height / 2 : 30);
    document.documentElement.style.setProperty("--click-x", `${x}px`);
    document.documentElement.style.setProperty("--click-y", `${y}px`);
    document.documentElement.classList.add("theme-transitioning");
    clearTimeout(window.__themeTransitionTimer);
    window.__themeTransitionTimer = setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 600);
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
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
  }
  function initMetronomeDock() {
    const bpmSlider = document.getElementById("bpm-slider");
    const bpmVal = document.getElementById("bpm-val");
    const volSlider = document.getElementById("vol-slider");
    const volVal = document.getElementById("vol-val");
    const masterPlayBtn = document.getElementById("btn-master-play");
    const masterStopBtn = document.getElementById("btn-master-stop");
    const pulseLed = document.getElementById("pulse-led");
    const soundWaveBars = document.getElementById("sound-wave-bars");
    const metronomeDock = document.getElementById("metronome-dock");
    rhythmSynth.addPulseListener((type, durationMs) => {
      if (pulseLed) {
        const pulseClass = type === "G" ? "pulse-active-guru" : "pulse-active-laghu";
        pulseLed.classList.add(pulseClass);
        setTimeout(() => {
          pulseLed.classList.remove(pulseClass);
        }, durationMs * 0.9);
      }
      if (soundWaveBars) {
        soundWaveBars.classList.add("active");
        setTimeout(() => {
          if (!rhythmSynth.isPlaying) {
            soundWaveBars.classList.remove("active");
          }
        }, durationMs * 0.9);
      }
    });
    bpmSlider.addEventListener("input", (e) => {
      const bpm = parseInt(e.target.value, 10);
      bpmVal.textContent = `${bpm} BPM`;
      rhythmSynth.setTempo(bpm);
    });
    volSlider.addEventListener("input", (e) => {
      const volPercent = parseInt(e.target.value, 10);
      volVal.textContent = `${volPercent}%`;
      rhythmSynth.setVolume(volPercent / 100);
    });
    masterPlayBtn.addEventListener("click", () => {
      const gayatriPattern = ["L", "L", "G", "G", "G", "G", "L", "G", "G", "L", "G", "G", "L", "L", "G", "L"];
      if (metronomeDock) metronomeDock.classList.add("sequence-playing");
      if (soundWaveBars) soundWaveBars.classList.add("active");
      rhythmSynth.playSequence(gayatriPattern, null, () => {
        document.getElementById("master-play-text").textContent = "Audition G\u0101yatr\u012B";
        if (metronomeDock) metronomeDock.classList.remove("sequence-playing");
        if (soundWaveBars) soundWaveBars.classList.remove("active");
      });
      document.getElementById("master-play-text").textContent = "Playing...";
    });
    masterStopBtn.addEventListener("click", () => {
      rhythmSynth.stop();
      document.getElementById("master-play-text").textContent = "Audition G\u0101yatr\u012B";
      if (metronomeDock) metronomeDock.classList.remove("sequence-playing");
      if (soundWaveBars) soundWaveBars.classList.remove("active");
    });
  }
  function initHeroBits() {
    const container = document.getElementById("hero-bits-container");
    if (!container) return;
    const initialBits = [0, 1, 0, 1, 1, 0, 0, 1];
    container.innerHTML = "";
    initialBits.forEach((bit, idx) => {
      const cell = document.createElement("div");
      const isGuru = bit === 1;
      cell.className = `strip-cell ${isGuru ? "guru" : "laghu"}`;
      cell.dataset.bit = bit;
      cell.innerHTML = `
      <span class="strip-cell-bit">${bit}</span>
      <span class="strip-cell-sym">${isGuru ? "\u2014" : "\u222A"}</span>
    `;
      cell.addEventListener("click", () => {
        const currentBit = parseInt(cell.dataset.bit, 10);
        const nextBit = currentBit === 1 ? 0 : 1;
        cell.dataset.bit = nextBit;
        cell.classList.remove("cell-flipping");
        void cell.offsetWidth;
        cell.classList.add("cell-flipping");
        setTimeout(() => {
          cell.className = `strip-cell ${nextBit === 1 ? "guru" : "laghu"} cell-flipping`;
          cell.querySelector(".strip-cell-bit").textContent = nextBit;
          cell.querySelector(".strip-cell-sym").textContent = nextBit === 1 ? "\u2014" : "\u222A";
        }, 150);
        rhythmSynth.playTone(nextBit === 1 ? "G" : "L");
      });
      container.appendChild(cell);
    });
  }
  function initTabNavigation() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetTab = btn.dataset.tab;
        switchTab(targetTab);
      });
    });
    const testLink = document.getElementById("link-view-tests");
    if (testLink) {
      testLink.addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("tab-tests");
      });
    }
    const methodLink = document.getElementById("link-view-method");
    if (methodLink) {
      methodLink.addEventListener("click", (e) => {
        e.preventDefault();
        switchTab("tab-method");
      });
    }
  }
  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-pane").forEach((p) => {
      p.classList.toggle("active", p.id === tabId);
    });
  }
  function initPrastaraModule() {
    const slider = document.getElementById("prastara-n-slider");
    const nValDisplay = document.getElementById("prastara-n-val");
    const tableN = document.getElementById("prastara-table-n");
    const weightSelect = document.getElementById("prastara-filter-weight");
    const chkBinary = document.getElementById("chk-show-binary");
    const chkSymbols = document.getElementById("chk-show-symbols");
    const chkGanas = document.getElementById("chk-show-ganas");
    const exportBtn = document.getElementById("btn-export-prastara-csv");
    const playAllBtn = document.getElementById("btn-play-all-prastara");
    function renderPrastara() {
      nValDisplay.textContent = state.prastaraN;
      tableN.textContent = state.prastaraN;
      document.getElementById("metric-total-rows").textContent = Math.pow(2, state.prastaraN);
      const prevFilter = weightSelect.value;
      weightSelect.innerHTML = '<option value="all">Show All Combinations (2^n)</option>';
      for (let k = 0; k <= state.prastaraN; k++) {
        const opt = document.createElement("option");
        opt.value = k;
        opt.textContent = `k = ${k} Guru(s) [${binomialCoefficient(state.prastaraN, k)} rows]`;
        weightSelect.appendChild(opt);
      }
      if (prevFilter !== "all" && parseInt(prevFilter, 10) <= state.prastaraN) {
        weightSelect.value = prevFilter;
        state.prastaraFilter = prevFilter;
      } else {
        weightSelect.value = "all";
        state.prastaraFilter = "all";
      }
      const rows = generatePrastara(state.prastaraN);
      const filteredRows = state.prastaraFilter === "all" ? rows : rows.filter((r) => r.guruCount === parseInt(state.prastaraFilter, 10));
      document.getElementById("prastara-filter-status").textContent = `Showing ${filteredRows.length} of ${rows.length} rows`;
      const tbody = document.getElementById("prastara-table-body");
      tbody.innerHTML = "";
      filteredRows.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        tr.style.setProperty("--row-index", Math.min(rowIndex, 25));
        const patternPills = row.pattern.map((s) => `
        <span class="syllable-pill ${s === "G" ? "guru" : "laghu"}" title="${s === "G" ? "Guru (Heavy, 2 m\u0101tr\u0101s)" : "Laghu (Light, 1 m\u0101tr\u0101)"}">
          ${state.showSymbols ? s === "G" ? "\u2014" : "\u222A" : s}
        </span>
      `).join("");
        tr.innerHTML = `
        <td class="rank-badge">${row.rank}</td>
        <td>${patternPills}</td>
        <td class="col-binary ${state.showBinary ? "" : "hidden-col"}"><code>${row.binary}</code></td>
        <td class="col-ganas ${state.showGanas ? "" : "hidden-col"}"><span class="gana-tag">${row.ganas}</span></td>
        <td><strong>${row.matras}</strong></td>
        <td>
          <button type="button" class="btn-table-play" data-rank="${row.rank}" title="Play rhythm">\u{1F50A}</button>
        </td>
      `;
        tr.querySelector(".btn-table-play").addEventListener("click", () => {
          rhythmSynth.playSequence(row.pattern);
        });
        tbody.appendChild(tr);
      });
    }
    slider.addEventListener("input", (e) => {
      state.prastaraN = parseInt(e.target.value, 10);
      renderPrastara();
    });
    document.querySelectorAll(".preset-n-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".preset-n-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const n = parseInt(btn.dataset.n, 10);
        state.prastaraN = n;
        slider.value = n;
        renderPrastara();
      });
    });
    weightSelect.addEventListener("change", (e) => {
      state.prastaraFilter = e.target.value;
      renderPrastara();
    });
    chkBinary.addEventListener("change", (e) => {
      state.showBinary = e.target.checked;
      renderPrastara();
    });
    chkSymbols.addEventListener("change", (e) => {
      state.showSymbols = e.target.checked;
      renderPrastara();
    });
    chkGanas.addEventListener("change", (e) => {
      state.showGanas = e.target.checked;
      renderPrastara();
    });
    exportBtn.addEventListener("click", () => {
      const rows = generatePrastara(state.prastaraN);
      let csv = "Rank,Pattern,Binary,Ganas,Matras,LaghuCount,GuruCount\n";
      rows.forEach((r) => {
        csv += `${r.rank},"${r.pattern.join("")}",${r.binary},"${r.ganas}",${r.matras},${r.laghuCount},${r.guruCount}
`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pingala_prastara_n${state.prastaraN}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
    playAllBtn.addEventListener("click", () => {
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
  function initNastamUddistamModule() {
    const nInput = document.getElementById("nastam-n-input");
    const rankInput = document.getElementById("nastam-rank-input");
    const randomRankBtn = document.getElementById("btn-random-rank");
    const playNastamBtn = document.getElementById("btn-play-nastam-audio");
    const syncBtn = document.getElementById("btn-sync-to-nastam");
    const sankhyaSlider = document.getElementById("sankhya-exp-slider");
    const stepLabel = document.getElementById("stepper-step-label");
    const resetBtn = document.getElementById("btn-stepper-reset");
    const prevBtn = document.getElementById("btn-stepper-prev");
    const playStepBtn = document.getElementById("btn-stepper-play");
    const nextBtn = document.getElementById("btn-stepper-next");
    const endBtn = document.getElementById("btn-stepper-end");
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
      const matras = pattern.reduce((acc, s) => acc + (s === "G" ? 2 : 1), 0);
      const container = document.getElementById("nastam-pattern-display");
      container.innerHTML = pattern.map((s, idx) => `
      <div class="syllable-pill ${s === "G" ? "guru" : "laghu"}" id="nastam-syl-${idx}" style="width: 38px; height: 38px; font-size: 1.1rem;">
        ${s === "G" ? "\u2014" : "\u222A"}
      </div>
    `).join("");
      document.getElementById("nastam-binary-display").textContent = binary;
      document.getElementById("nastam-matra-display").textContent = matras;
      const traceBox = document.getElementById("nastam-trace-container");
      traceBox.innerHTML = trace.map((t, i) => `
      <div class="trace-step-card" id="trace-step-${i + 1}">
        <div>
          <span class="trace-step-num">Step ${t.step}:</span>
          <span class="trace-step-action">${t.action}</span>
        </div>
        <span class="trace-step-bit ${t.syllable === "G" ? "guru" : "laghu"}">
          ${t.syllable} (${t.bit})
        </span>
      </div>
    `).join("");
      const { rank: recoveredRank } = pingalaUddistam(pattern);
      const badge = document.getElementById("bijection-invariant-badge");
      if (recoveredRank === rank) {
        badge.innerHTML = `<span class="badge-icon">\u2713</span> <span>Bijection Invariant Verified: Uddi\u1E63\u1E6Dam(Na\u1E63\u1E6Dam(${rank})) === ${recoveredRank}</span>`;
        badge.style.borderColor = "rgba(16, 185, 129, 0.4)";
      }
      state.stepperCurrentStep = n;
      updateStepperHighlight();
      renderUddistamStrip(n);
    }
    function updateStepperHighlight() {
      const total = state.nastamN;
      const curr = state.stepperCurrentStep;
      if (stepLabel) stepLabel.textContent = `Step ${curr} of ${total}`;
      document.querySelectorAll(".trace-step-card").forEach((card, idx) => {
        card.classList.toggle("active-step", idx + 1 === curr);
      });
      document.querySelectorAll('[id^="nastam-syl-"]').forEach((el, idx) => {
        const isActive = idx + 1 === curr;
        el.classList.toggle("step-active", isActive);
        el.style.transform = isActive ? "scale(1.28)" : "scale(1)";
      });
      if (currentTrace[curr - 1]) {
        rhythmSynth.playTone(currentTrace[curr - 1].syllable);
      }
    }
    resetBtn.addEventListener("click", () => {
      state.stepperCurrentStep = 1;
      updateStepperHighlight();
    });
    prevBtn.addEventListener("click", () => {
      if (state.stepperCurrentStep > 1) {
        state.stepperCurrentStep--;
        updateStepperHighlight();
      }
    });
    nextBtn.addEventListener("click", () => {
      if (state.stepperCurrentStep < state.nastamN) {
        state.stepperCurrentStep++;
        updateStepperHighlight();
      }
    });
    endBtn.addEventListener("click", () => {
      state.stepperCurrentStep = state.nastamN;
      updateStepperHighlight();
    });
    playStepBtn.addEventListener("click", () => {
      if (state.stepperAutoTimer) {
        clearInterval(state.stepperAutoTimer);
        state.stepperAutoTimer = null;
        document.getElementById("stepper-play-icon").textContent = "\u25B6";
        return;
      }
      state.stepperCurrentStep = 1;
      updateStepperHighlight();
      document.getElementById("stepper-play-icon").textContent = "\u23F8";
      state.stepperAutoTimer = setInterval(() => {
        if (state.stepperCurrentStep < state.nastamN) {
          state.stepperCurrentStep++;
          updateStepperHighlight();
        } else {
          clearInterval(state.stepperAutoTimer);
          state.stepperAutoTimer = null;
          document.getElementById("stepper-play-icon").textContent = "\u25B6";
        }
      }, 800);
    });
    function renderUddistamStrip(n) {
      const strip = document.getElementById("uddistam-selector-strip");
      strip.innerHTML = "";
      while (state.uddistamPattern.length < n) state.uddistamPattern.push("L");
      state.uddistamPattern = state.uddistamPattern.slice(0, n);
      state.uddistamPattern.forEach((syl, i) => {
        const btn = document.createElement("div");
        const isGuru = syl === "G";
        btn.className = `syl-click-btn ${isGuru ? "guru" : "laghu"}`;
        btn.innerHTML = `
        <span style="font-size: 0.7rem; opacity: 0.7;">#${i + 1}</span>
        <strong style="font-size: 1.1rem;">${isGuru ? "\u2014" : "\u222A"}</strong>
        <span style="font-size: 0.7rem; font-family: monospace;">2<sup>${i}</sup></span>
      `;
        btn.addEventListener("click", () => {
          state.uddistamPattern[i] = state.uddistamPattern[i] === "G" ? "L" : "G";
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
      const rankEl = document.getElementById("uddistam-rank-display");
      rankEl.textContent = rank;
      rankEl.classList.remove("rank-bump");
      void rankEl.offsetWidth;
      rankEl.classList.add("rank-bump");
      document.getElementById("uddistam-max-rank").textContent = Math.pow(2, n);
      const traceBox = document.getElementById("uddistam-trace-container");
      traceBox.innerHTML = trace.map((t) => `
      <div class="trace-step-card">
        <div>
          <span class="trace-step-num">Pos ${t.position}:</span>
          <span>${t.syllable === "G" ? "Guru (1)" : "Laghu (0)"} &times; ${t.placeValue} = <strong>${t.contribution}</strong></span>
        </div>
        <span style="font-family: monospace; color: var(--gold-light);">Sum: ${t.runningSum}</span>
      </div>
    `).join("");
    }
    nInput.addEventListener("change", renderNastam);
    rankInput.addEventListener("input", renderNastam);
    randomRankBtn.addEventListener("click", () => {
      const n = parseInt(nInput.value, 10);
      const max = Math.pow(2, n);
      rankInput.value = Math.floor(Math.random() * max) + 1;
      renderNastam();
    });
    playNastamBtn.addEventListener("click", () => {
      const { pattern } = pingalaNastam(parseInt(rankInput.value, 10), parseInt(nInput.value, 10));
      rhythmSynth.playSequence(pattern);
    });
    syncBtn.addEventListener("click", () => {
      const { rank } = pingalaUddistam(state.uddistamPattern);
      rankInput.value = rank;
      renderNastam();
    });
    sankhyaSlider.addEventListener("input", (e) => {
      const exp = parseInt(e.target.value, 10);
      state.sankhyaExp = exp;
      document.getElementById("sankhya-n-val").textContent = exp;
      document.getElementById("sankhya-exp-label").textContent = exp;
      const { result, multiplications, steps } = pingalaSankhya(exp);
      document.getElementById("sankhya-result-val").textContent = result.toLocaleString();
      document.getElementById("sankhya-mult-count").textContent = `(${multiplications} multiplications)`;
      const stepsBox = document.getElementById("sankhya-steps-container");
      stepsBox.innerHTML = steps.map((s) => `<div>&rarr; ${s}</div>`).join("");
    });
    renderNastam();
    sankhyaSlider.dispatchEvent(new Event("input"));
  }
  function initMeruModule() {
    const rowsSlider = document.getElementById("meru-rows-slider");
    function renderMeru() {
      const maxRows = state.meruRows;
      document.getElementById("meru-height-val").textContent = `Row ${maxRows}`;
      const pyramid = generateMeruPrastara(maxRows);
      const container = document.getElementById("meru-pyramid-container");
      container.innerHTML = "";
      pyramid.forEach((rowObj) => {
        const rowDiv = document.createElement("div");
        rowDiv.className = "meru-row";
        rowDiv.style.setProperty("--row-n", rowObj.row);
        const lbl = document.createElement("span");
        lbl.className = "meru-row-label";
        lbl.textContent = `n=${rowObj.row}`;
        rowDiv.appendChild(lbl);
        rowObj.cells.forEach((cell) => {
          const cellDiv = document.createElement("div");
          cellDiv.className = "meru-cell";
          cellDiv.dataset.n = cell.n;
          cellDiv.dataset.k = cell.k;
          cellDiv.textContent = cell.value;
          cellDiv.addEventListener("mouseenter", () => {
            highlightParents(cell.parents);
            inspectCell(cell);
          });
          cellDiv.addEventListener("mouseleave", () => {
            clearHighlights();
          });
          cellDiv.addEventListener("click", () => {
            document.querySelectorAll(".meru-cell").forEach((c) => c.classList.remove("selected"));
            cellDiv.classList.add("selected");
            inspectCell(cell);
            renderDistribution(cell.n);
          });
          rowDiv.appendChild(cellDiv);
        });
        const sumPill = document.createElement("span");
        sumPill.className = "meru-row-sum-badge";
        sumPill.textContent = `\u03A3 = 2^${rowObj.row} = ${rowObj.sum}`;
        rowDiv.appendChild(sumPill);
        container.appendChild(rowDiv);
      });
      renderDistribution(maxRows);
    }
    function highlightParents(parents) {
      clearHighlights();
      parents.forEach(([pn, pk]) => {
        const parentEl = document.querySelector(`.meru-cell[data-n="${pn}"][data-k="${pk}"]`);
        if (parentEl) parentEl.classList.add("highlight-parent");
      });
    }
    function clearHighlights() {
      document.querySelectorAll(".meru-cell.highlight-parent").forEach((el) => {
        el.classList.remove("highlight-parent");
      });
    }
    function inspectCell(cell) {
      const box = document.getElementById("meru-cell-inspection");
      const isBoundary = cell.k === 0 || cell.k === cell.n;
      box.innerHTML = `
      <div class="cell-inspector-content">
        <div class="inspector-formula">
          <strong>Binomial Coefficient C(${cell.n}, ${cell.k}):</strong> ${cell.value}
        </div>
        <div>
          ${isBoundary ? `<em>Boundary Base Case:</em> C(${cell.n}, ${cell.k}) = 1 (Only 1 way to have all Gurus or all Laghus)` : `<em>Dynamic Programming Recurrence:</em><br>
               C(${cell.n}, ${cell.k}) = C(${cell.n - 1}, ${cell.k - 1}) + C(${cell.n - 1}, ${cell.k}) = 
               ${binomialCoefficient(cell.n - 1, cell.k - 1)} + ${binomialCoefficient(cell.n - 1, cell.k)} = <strong>${cell.value}</strong>`}
        </div>
        <div style="color: var(--text-muted); font-size: 0.85rem;">
          In a meter of ${cell.n} syllables, exactly <strong>${cell.value}</strong> meters have ${cell.k} Guru(s) and ${cell.n - cell.k} Laghu(s).
        </div>
      </div>
    `;
    }
    function renderDistribution(n) {
      const dist = getLaghvaksharaDistribution(n);
      const chartContainer = document.getElementById("meru-distribution-chart");
      const maxCount = Math.max(...dist.map((d) => d.count));
      let html = `
      <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">
        Row n = ${n} (Total combinations = ${Math.pow(2, n)}):
      </div>
      <div style="display: flex; align-items: flex-end; gap: 0.5rem; height: 160px; padding: 1rem 0; border-bottom: 1px solid var(--border-subtle);">
    `;
      dist.forEach((d) => {
        const heightPercent = Math.max(10, Math.round(d.count / maxCount * 100));
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
    rowsSlider.addEventListener("input", (e) => {
      state.meruRows = parseInt(e.target.value, 10);
      renderMeru();
    });
    renderMeru();
  }
  function initMethodModule() {
    const navButtons = document.querySelectorAll(".method-nav-btn");
    const copyBtn = document.getElementById("btn-copy-pseudocode");
    function renderMethodAlgorithm(algKey) {
      const spec = ALGORITHM_SPECS[algKey];
      if (!spec) return;
      state.activeMethodAlg = algKey;
      navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.alg === algKey));
      document.getElementById("alg-sutra-tag").textContent = spec.sutra;
      document.getElementById("alg-title").textContent = spec.title;
      document.getElementById("alg-subtitle").textContent = spec.subtitle;
      document.getElementById("alg-code-block").textContent = spec.pseudocode;
      document.getElementById("alg-caption").textContent = spec.description;
      document.getElementById("worked-heading").textContent = spec.workedStep.heading;
      document.getElementById("worked-note").textContent = spec.workedStep.note;
      const workedBox = document.getElementById("worked-content-box");
      if (spec.workedStep.steps) {
        workedBox.innerHTML = spec.workedStep.steps.map((s) => `<div>&rarr; ${s}</div>`).join("");
      } else if (spec.workedStep.illustration) {
        workedBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          ${spec.workedStep.illustration.map((item) => `
            <div style="display: flex; justify-content: space-between; padding: 0.3rem 0.5rem; background: rgba(0,0,0,0.15); border-radius: 4px;">
              <span><strong>#${item.rank}</strong>: <code style="color: var(--cyan-light);">${item.pattern}</code></span>
              <span style="color: var(--gold-light);">${item.gana}</span>
            </div>
          `).join("")}
        </div>
      `;
      }
      document.getElementById("comp-time").textContent = spec.complexity.time;
      document.getElementById("comp-space").textContent = spec.complexity.space;
      document.getElementById("comp-aux").textContent = spec.complexity.auxiliary;
      document.getElementById("comp-invariant").textContent = spec.invariant;
    }
    navButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        renderMethodAlgorithm(btn.dataset.alg);
      });
    });
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const code = document.getElementById("alg-code-block").textContent;
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.textContent = "\u2713 Copied!";
          setTimeout(() => {
            copyBtn.textContent = "\u{1F4CB} Copy Code";
          }, 1500);
        });
      });
    }
    renderMethodAlgorithm("prastara");
  }
  function initScansionModule() {
    const textArea = document.getElementById("scansion-input-text");
    const scanBtn = document.getElementById("btn-scan-verse");
    const playVerseBtn = document.getElementById("btn-play-verse-audio");
    const padantaChk = document.getElementById("chk-padanta-guru");
    function runScansion() {
      const rawText = textArea.value;
      const allowPadanta = padantaChk.checked;
      const result = scanSanskritVerse(rawText, allowPadanta);
      document.getElementById("scansion-syllable-count").textContent = result.syllables.length;
      document.getElementById("scansion-matra-count").textContent = result.totalMatras;
      const guruCount = result.pattern.filter((s) => s === "G").length;
      const laghuCount = result.pattern.length - guruCount;
      document.getElementById("scansion-ratio").textContent = `${guruCount}G / ${laghuCount}L`;
      const badge = document.getElementById("scansion-detected-badge");
      const infoCard = document.getElementById("scansion-meter-info");
      if (result.detectedMeter) {
        badge.textContent = result.detectedMeter.name;
        infoCard.innerHTML = `
        <div style="font-weight: 700; color: var(--gold-light); font-size: 1.05rem;">
          \u2713 Identified Meter: ${result.detectedMeter.name}
        </div>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.35rem;">
          ${result.detectedMeter.description}
        </p>
      `;
      } else {
        badge.textContent = "Custom V\u1E5Btta";
        infoCard.innerHTML = `
        <div style="color: var(--text-muted); font-size: 0.88rem;">
          Custom metrical pattern (${result.syllables.length} syllables, ${result.totalMatras} m\u0101tr\u0101s). Matches classical prosodic rules.
        </div>
      `;
      }
      const cardsContainer = document.getElementById("scansion-cards-container");
      cardsContainer.innerHTML = result.syllables.map((s, idx) => `
      <div class="syllable-badge-item ${s.code === "G" ? "guru" : "laghu"}" style="--syl-idx: ${idx};" title="${s.reason}">
        <span class="syl-text">${s.text}</span>
        <span class="syl-symbol">${s.symbol}</span>
        <span class="syl-type">${s.code} (${s.matras}m)</span>
      </div>
    `).join("");
    }
    scanBtn.addEventListener("click", runScansion);
    padantaChk.addEventListener("change", runScansion);
    document.querySelectorAll(".preset-shloka-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.preset;
        if (SHLOKA_PRESETS[key]) {
          textArea.value = SHLOKA_PRESETS[key];
          runScansion();
        }
      });
    });
    playVerseBtn.addEventListener("click", () => {
      const result = scanSanskritVerse(textArea.value, padantaChk.checked);
      if (result.pattern.length > 0) {
        rhythmSynth.playSequence(result.pattern);
      }
    });
    runScansion();
  }
  function initFibonacciModule() {
    const slider = document.getElementById("matra-m-slider");
    const mVal = document.getElementById("matra-m-val");
    const displayM = document.getElementById("matra-display-m");
    const countBadge = document.getElementById("matra-comp-count");
    const formulaDisplay = document.getElementById("fib-formula-display");
    const seqStrip = document.getElementById("virahanka-sequence-strip");
    const compContainer = document.getElementById("matra-compositions-container");
    function renderFibonacci() {
      const M = state.matraM;
      mVal.textContent = M;
      displayM.textContent = M;
      const { compositions, count } = generateMatraCompositions(M);
      countBadge.textContent = `${count} Compositions`;
      if (M === 1) {
        formulaDisplay.textContent = "F(1) = 1 Composition (L)";
      } else if (M === 2) {
        formulaDisplay.textContent = "F(2) = 2 Compositions (LL, G)";
      } else {
        const prev1 = generateMatraCompositions(M - 1).count;
        const prev2 = generateMatraCompositions(M - 2).count;
        formulaDisplay.textContent = `F(${M}) = F(${M - 1}) + F(${M - 2}) = ${prev1} + ${prev2} = ${count} Compositions`;
      }
      const seq = getVirahankaSequence(8);
      seqStrip.innerHTML = seq.map((item) => `
      <div class="seq-item ${item.matras === M ? "selected-seq" : ""}">
        ${item.formula}
      </div>
    `).join("");
      compContainer.innerHTML = compositions.map((comp, idx) => {
        const pills = comp.map((s) => `
        <span class="syllable-pill ${s === "G" ? "guru" : "laghu"}" style="width: 24px; height: 24px; font-size: 0.75rem;">
          ${s === "G" ? "\u2014" : "\u222A"}
        </span>
      `).join("");
        return `
        <div class="comp-row" style="--comp-idx: ${idx};">
          <span class="comp-index">#${idx + 1}</span>
          <div>${pills}</div>
          <span style="font-family: monospace; font-size: 0.8rem; color: var(--text-muted);">${comp.join("")}</span>
        </div>
      `;
      }).join("");
    }
    slider.addEventListener("input", (e) => {
      state.matraM = parseInt(e.target.value, 10);
      renderFibonacci();
    });
    renderFibonacci();
  }
  function initTestModule() {
    const runBtn = document.getElementById("btn-run-tests-action");
    const quickVivaBtn = document.getElementById("btn-quick-viva");
    if (runBtn) {
      runBtn.addEventListener("click", runTestSuiteAndRender);
    }
    if (quickVivaBtn) {
      quickVivaBtn.addEventListener("click", () => {
        switchTab("tab-tests");
        runTestSuiteAndRender();
      });
    }
  }
  function runTestSuiteAndRender() {
    const { results, total, passed, totalTimeMs } = executeTestSuite();
    const statusEl = document.getElementById("test-overall-status");
    const countsEl = document.getElementById("test-counts-caption");
    const latencyEl = document.getElementById("test-latency-val");
    const badgeMini = document.getElementById("badge-all-tests-pass");
    if (passed === total) {
      statusEl.textContent = "ALL PASSED";
      statusEl.className = "metric-large-text text-emerald";
      if (badgeMini) badgeMini.textContent = `${total} PASS`;
    } else {
      statusEl.textContent = `${passed}/${total} PASSED`;
      statusEl.className = "metric-large-text text-saffron";
    }
    countsEl.textContent = `${passed} of ${total} Tests Passed (${Math.round(passed / total * 100)}%)`;
    latencyEl.textContent = `${totalTimeMs} ms`;
    const container = document.getElementById("test-cases-container");
    if (!container) return;
    container.innerHTML = results.map((t, idx) => `
    <div class="test-card ${t.passed ? "passed" : "failed"}" style="--test-idx: ${idx};">
      <div class="test-card-header">
        <span class="test-id-name">${t.id}: ${t.name}</span>
        <span class="test-status-badge ${t.passed ? "pass" : "fail"}">${t.passed ? "PASS" : "FAIL"}</span>
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
  `).join("");
  }
  function initModalAndHeaderActions() {
    const modal = document.getElementById("theory-modal");
    const openBtn = document.getElementById("btn-theory-modal");
    const closeBtn = document.getElementById("btn-close-modal");
    const footerBtn = document.getElementById("btn-footer-theory");
    function openModal() {
      modal.classList.add("open");
    }
    function closeModal() {
      modal.classList.remove("open");
    }
    if (openBtn) openBtn.addEventListener("click", openModal);
    if (footerBtn) footerBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
})();
