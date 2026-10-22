/* ==========================================================================
   Edugates International School — Math-Science Team
   Smartboard & Low-Processor Optimization + In-Game Graphics Polish Engine
   + Classroom Gamification, Team Scoreboard, WebAudio & Ergonomic UI (v3.0)
   ========================================================================== */

(function () {
  "use strict";

  // ==========================================================================
  // 1. HARDWARE, THEME & SMARTBOARD PREFERENCES
  // ==========================================================================
  var savedPerf = localStorage.getItem("edugates_math_lowcpu");
  var isLowCpu = savedPerf !== "false"; // Default ON for Smartboards
  window.__EDUGATES_PERF_LITE__ = isLowCpu;
  window.__EDUGATES_DPR__ = isLowCpu ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  window.__EDUGATES_CLICK_MODE__ = 0; // 0 = Left, 2 = Right (Mark), 1 = Middle (Lock)
  window.__EDUGATES_ANNOTATE_ACTIVE__ = false;

  var savedTheme = localStorage.getItem("edugates_math_theme") || "night";
  if (savedTheme === "day") {
    document.documentElement.setAttribute("data-theme", "day");
  }

  var currentBoardStyle = localStorage.getItem("edugates_board_style") || "studio";
  var currentDockSide = localStorage.getItem("edugates_dock_side") || "right";
  var soundEnabled = localStorage.getItem("edugates_sound_enabled") !== "false";

  // Bypass Canvas2D shadowBlur in Low-CPU mode
  if (typeof CanvasRenderingContext2D !== "undefined") {
    var origShadow = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "shadowBlur");
    if (origShadow && origShadow.set) {
      Object.defineProperty(CanvasRenderingContext2D.prototype, "shadowBlur", {
        configurable: true,
        enumerable: true,
        get: function () { return origShadow.get.call(this); },
        set: function (v) { origShadow.set.call(this, window.__EDUGATES_PERF_LITE__ ? 0 : v); }
      });
    }
  }

  var cachedPuzzleId = null;
  function getCurrentPuzzleId() {
    if (cachedPuzzleId !== null) return cachedPuzzleId;
    var bodyId = document.body ? document.body.getAttribute("data-puzzle") : "";
    if (bodyId) {
      cachedPuzzleId = bodyId.toLowerCase();
      return cachedPuzzleId;
    }
    var scripts = document.querySelectorAll("script[src*='js/']");
    for (var i = 0; i < scripts.length; i++) {
      var m = scripts[i].src.match(/js\/([a-z0-9]+)\.js/i);
      if (m && m[1] !== "edugates") {
        cachedPuzzleId = m[1].toLowerCase();
        return cachedPuzzleId;
      }
    }
    cachedPuzzleId = "";
    return "";
  }

  // ==========================================================================
  // 2. ZERO-DEPENDENCY WEB AUDIO API SOUND SYNTHESIZER
  // ==========================================================================
  var audioCtx = null;
  function getAudioCtx() {
    if (!soundEnabled) return null;
    if (!audioCtx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        try { audioCtx = new Ctx(); } catch (e) { audioCtx = null; }
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(function () {});
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    var ctx = getAudioCtx();
    if (!ctx) return;
    var now = ctx.currentTime;

    try {
      if (type === "tap") {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.038);
        gain.gain.setValueAtTime(0.11, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.048);
      } else if (type === "key") {
        var oscK = ctx.createOscillator();
        var gainK = ctx.createGain();
        oscK.type = "sine";
        oscK.frequency.setValueAtTime(440, now);
        oscK.frequency.exponentialRampToValueAtTime(580, now + 0.045);
        gainK.gain.setValueAtTime(0.09, now);
        gainK.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        oscK.connect(gainK);
        gainK.connect(ctx.destination);
        oscK.start(now);
        oscK.stop(now + 0.058);
      } else if (type === "undo") {
        var oscU = ctx.createOscillator();
        var gainU = ctx.createGain();
        oscU.type = "sine";
        oscU.frequency.setValueAtTime(350, now);
        oscU.frequency.exponentialRampToValueAtTime(210, now + 0.06);
        gainU.gain.setValueAtTime(0.09, now);
        gainU.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        oscU.connect(gainU);
        gainU.connect(ctx.destination);
        oscU.start(now);
        oscU.stop(now + 0.07);
      } else if (type === "mode") {
        var oscM = ctx.createOscillator();
        var gainM = ctx.createGain();
        oscM.type = "sine";
        oscM.frequency.setValueAtTime(520, now);
        gainM.gain.setValueAtTime(0.07, now);
        gainM.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        oscM.connect(gainM);
        gainM.connect(ctx.destination);
        oscM.start(now);
        oscM.stop(now + 0.04);
      } else if (type === "victory") {
        var notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
        for (var i = 0; i < notes.length; i++) {
          (function (freq, delay) {
            var o = ctx.createOscillator();
            var g = ctx.createGain();
            o.type = "triangle";
            o.frequency.setValueAtTime(freq, now + delay);
            g.gain.setValueAtTime(0.001, now + delay);
            g.gain.linearRampToValueAtTime(0.14, now + delay + 0.02);
            g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.36);
            o.connect(g);
            g.connect(ctx.destination);
            o.start(now + delay);
            o.stop(now + delay + 0.38);
          })(notes[i], i * 0.075);
        }
      }
    } catch (e) {}
  }
  window.playEdugatesSound = playSound;

  window.toggleEdugatesSound = function () {
    soundEnabled = !soundEnabled;
    localStorage.setItem("edugates_sound_enabled", soundEnabled ? "true" : "false");
    var btn = document.getElementById("eis-sound-btn");
    if (btn) {
      btn.textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
      btn.classList.toggle("is-active", soundEnabled);
    }
    if (soundEnabled) playSound("mode");
  };

  // ==========================================================================
  // 3. CLASSROOM GAMIFICATION, MASTERY & DAILY CHALLENGE ENGINE
  // ==========================================================================
  var PUZZLE_DIFFICULTY = {
    bridges: "starter", lightup: "starter", slant: "starter", tents: "starter",
    unruly: "starter", rect: "starter", flood: "starter", fifteen: "starter",
    samegame: "starter", flip: "starter", pattern: "starter", mosaic: "starter",
    range: "starter", untangle: "starter",
    towers: "intermediate", net: "intermediate", loopy: "intermediate", solo: "intermediate",
    keen: "intermediate", unequal: "intermediate", singles: "intermediate", magnets: "intermediate",
    galaxies: "intermediate", mines: "intermediate", dominosa: "intermediate", palisade: "intermediate",
    filling: "intermediate", map: "intermediate", inertia: "intermediate", pegs: "intermediate",
    group: "olympiad", blackbox: "olympiad", undead: "olympiad", cube: "olympiad",
    pearl: "olympiad", tracks: "olympiad", signpost: "olympiad", netslide: "olympiad",
    guess: "olympiad", sixteen: "olympiad", twiddle: "olympiad"
  };

  function loadMasteryData() {
    try {
      var raw = localStorage.getItem("edugates_mastery_v1");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          parsed.puzzles = parsed.puzzles || {};
          parsed.dailyCompleted = parsed.dailyCompleted || {};
          parsed.streak = parsed.streak || { count: 0, lastDate: "" };
          return parsed;
        }
      }
    } catch (e) {}
    return { puzzles: {}, dailyCompleted: {}, streak: { count: 0, lastDate: "" } };
  }

  function saveMasteryData(data) {
    try {
      localStorage.setItem("edugates_mastery_v1", JSON.stringify(data));
    } catch (e) {}
  }

  function getTodayDateString() {
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  var DAILY_POOL = [
    { id: "bridges", href: "bridges.html", title: "🌉 Bridges (Hashi)", domain: "Graph Theory & Vertex Degrees", desc: "Connect islands with single or double bridges so no two bridges cross." },
    { id: "towers", href: "towers.html", title: "🏙️ Towers (Skyscrapers)", domain: "Latin Squares & 3D Sightlines", desc: "Deduce 3D skyscraper heights from orthogonal visibility clues." },
    { id: "lightup", href: "lightup.html", title: "💡 Light Up (Akari)", domain: "Ray-Casting & Coordinate Logic", desc: "Place light emitters to illuminate every corridor without conflict." },
    { id: "slant", href: "slant.html", title: "📐 Slant (Gokigen)", domain: "Combinatorics & Acyclic Trees", desc: "Draw diagonal slashes matching vertex counts while avoiding closed loops." },
    { id: "net", href: "net.html", title: "⚡ Net (Network)", domain: "Spanning Trees & Connectivity", desc: "Rotate network tiles to power every terminal from the central hub." },
    { id: "loopy", href: "slither.html", title: "➰ Slitherlink (Loopy)", domain: "Jordan Curve Theorem & Topology", desc: "Form a single continuous closed loop around numbered grid clues." },
    { id: "solo", href: "solo.html", title: "🔢 Solo (Sudoku)", domain: "Bijective Latin Squares", desc: "Complete the Latin square blocks with zero row or column repetition." },
    { id: "keen", href: "keen.html", title: "➗ Keen (KenKen)", domain: "Number Theory & Cage Arithmetic", desc: "Solve arithmetic cage equations inside a Latin square." },
    { id: "galaxies", href: "galaxies.html", title: "🌌 Galaxies (Symmetry)", domain: "180° Rotational Point Symmetry", desc: "Partition the grid into rotationally symmetric polyomino domains." },
    { id: "tents", href: "tents.html", title: "⛺ Tents (Matching)", domain: "Bipartite Matching & Hall's Theorem", desc: "Pair each tree with a non-adjacent tent matching row and column counts." },
    { id: "magnets", href: "magnets.html", title: "🧲 Magnets (Polarity)", domain: "Electromagnetism & Dipole Balance", desc: "Place +/- dipole magnets satisfying pole counts without like-pole repulsion." },
    { id: "untangle", href: "untangle.html", title: "🕸️ Untangle (Planar)", domain: "Kuratowski's Theorem & Planarity", desc: "Drag vertices so that no two graph edges cross." }
  ];

  function getDailyChallenge() {
    var today = getTodayDateString();
    var hash = 0;
    for (var i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0;
    }
    var idx = Math.abs(hash) % DAILY_POOL.length;
    var item = DAILY_POOL[idx];
    var data = loadMasteryData();
    return {
      date: today,
      id: item.id,
      href: item.href,
      title: item.title,
      domain: item.domain,
      desc: item.desc,
      thumb: "assets/puzzles/" + item.id + ".png",
      completed: !!data.dailyCompleted[today]
    };
  }

  function getMasterySummary() {
    var data = loadMasteryData();
    var pMap = data.puzzles || {};
    var keys = Object.keys(pMap);
    var solvedPuzzlesCount = 0;
    var totalStars = 0;
    var totalSolves = 0;

    for (var i = 0; i < keys.length; i++) {
      var rec = pMap[keys[i]];
      if (rec && rec.solvedCount > 0) {
        solvedPuzzlesCount++;
        totalStars += (rec.stars || 0);
        totalSolves += (rec.solvedCount || 0);
      }
    }

    var rankTitle = "Logic Initiate";
    var nextThreshold = 5;
    if (totalStars >= 90) { rankTitle = "Edugates Grandmaster"; nextThreshold = 123; }
    else if (totalStars >= 50) { rankTitle = "STEM Olympiad Fellow"; nextThreshold = 90; }
    else if (totalStars >= 20) { rankTitle = "Axiom Architect"; nextThreshold = 50; }
    else if (totalStars >= 5) { rankTitle = "Graph Explorer"; nextThreshold = 20; }

    return {
      solvedPuzzlesCount: solvedPuzzlesCount,
      totalStars: totalStars,
      totalSolves: totalSolves,
      streak: (data.streak && data.streak.count) || 0,
      rankTitle: rankTitle,
      nextThreshold: nextThreshold
    };
  }

  function recordPuzzleCompletion(puzzleId, seconds, moves) {
    if (!puzzleId) return { stars: 3, isNewRecord: false, bestTime: seconds };
    var data = loadMasteryData();
    var prev = data.puzzles[puzzleId] || { solvedCount: 0, stars: 0, bestTime: null, bestMoves: null };

    var earnedStars = 1;
    if (seconds <= 150) earnedStars = 3;
    else if (seconds <= 330) earnedStars = 2;

    var isNewRecord = (prev.bestTime === null || seconds < prev.bestTime);
    var bestTime = isNewRecord ? seconds : prev.bestTime;
    var bestMoves = (prev.bestMoves === null || moves < prev.bestMoves) ? moves : prev.bestMoves;

    data.puzzles[puzzleId] = {
      solvedCount: (prev.solvedCount || 0) + 1,
      stars: Math.max(prev.stars || 0, earnedStars),
      bestTime: bestTime,
      bestMoves: bestMoves,
      lastSolved: getTodayDateString()
    };

    var today = getTodayDateString();
    var daily = getDailyChallenge();
    if (daily && daily.id === puzzleId) {
      data.dailyCompleted[today] = true;
    }

    if (data.streak.lastDate !== today) {
      data.streak.count = (data.streak.count || 0) + 1;
      data.streak.lastDate = today;
    }

    saveMasteryData(data);
    return {
      stars: earnedStars,
      isNewRecord: isNewRecord,
      bestTime: bestTime
    };
  }

  // ==========================================================================
  // 4. IN-GAME GRAPHICS POLISH ENGINE (Curated Palettes & Vector Primitives)
  // ==========================================================================
  var STYLE_SURFACES = {
    studio: {
      bg: "#eef2f6",
      tile: "#f8fafc",
      hi: "#ffffff",
      lo: "#cbd5e1",
      grid: "#94a3b8",
      ink: "#0f172a",
      user: "#0284c7",
      select: "#bae6fd",
      mark: "#dcfce7",
      lit: "#fef08a",
      err: "#e11d48",
      pencil: "#4f46e5",
      wallLeft: "#cbd5e1",
      wallBottom: "#94a3b8"
    },
    parchment: {
      bg: "#f3ede2",
      tile: "#faf6ee",
      hi: "#fffdf9",
      lo: "#d6cbb9",
      grid: "#a89f91",
      ink: "#1c1917",
      user: "#1d4ed8",
      select: "#fde68a",
      mark: "#d1fae5",
      lit: "#fde047",
      err: "#dc2626",
      pencil: "#6d28d9",
      wallLeft: "#dfd5c3",
      wallBottom: "#bfb29c"
    },
    blueprint: {
      bg: "#e0f2fe",
      tile: "#f0f9ff",
      hi: "#ffffff",
      lo: "#bae6fd",
      grid: "#7dd3fc",
      ink: "#0c4a6e",
      user: "#0369a1",
      select: "#a5f3fc",
      mark: "#ccfbf1",
      lit: "#fef08a",
      err: "#e11d48",
      pencil: "#4338ca",
      wallLeft: "#bae6fd",
      wallBottom: "#7dd3fc"
    }
  };

  function getSurface() {
    return STYLE_SURFACES[currentBoardStyle] || STYLE_SURFACES.studio;
  }

  function getPuzzlePaletteOverride(puzzleId, idx, s) {
    switch (puzzleId) {
      case "bridges":
        if (idx === 0) return s.bg;
        if (idx === 1) return s.ink;
        if (idx === 2) return s.hi;
        if (idx === 3) return s.lo;
        if (idx === 4) return "#0284c7";
        if (idx === 5) return s.mark;
        if (idx === 6) return s.lo;
        if (idx === 7) return "#dbeafe";
        if (idx === 8) return s.err;
        if (idx === 9) return "#fef08a";
        break;
      case "towers":
        if (idx === 0) return s.bg;
        if (idx === 1) return s.ink;
        if (idx === 2) return s.user;
        if (idx === 3) return s.select;
        if (idx === 4) return s.err;
        if (idx === 5) return s.pencil;
        if (idx === 6) return "#94a3b8";
        break;
      case "lightup":
        if (idx === 0) return s.tile;
        if (idx === 1) return s.lo;
        if (idx === 2) return "#0f172a";
        if (idx === 3) return "#ffffff";
        if (idx === 4) return s.lit;
        if (idx === 5) return s.err;
        if (idx === 6) return "#0284c7";
        break;
      case "slant":
        if (idx === 0) return s.bg;
        if (idx === 1) return s.lo;
        if (idx === 2) return s.ink;
        if (idx === 3) return "#0f172a";
        if (idx === 4) return "#1e3a8a";
        if (idx === 5) return s.err;
        if (idx === 6) return s.select;
        if (idx === 7) return s.tile;
        if (idx === 8) return "#0284c7";
        break;
      case "net":
      case "netslide":
        if (idx === 0) return s.tile;
        if (idx === 1) return "#dbeafe";
        if (idx === 2) return s.lo;
        if (idx === 3) return "#1e293b";
        if (idx === 4) return "#2563eb";
        if (idx === 5) return "#10b981";
        if (idx === 6) return s.err;
        if (idx === 7 && puzzleId === "net") return s.err;
        break;
      case "loopy":
        if (idx === 0) return s.tile;
        if (idx === 1) return s.ink;
        if (idx === 2) return s.lo;
        if (idx === 3) return "#10b981";
        if (idx === 4) return s.err;
        if (idx === 5) return "#0284c7";
        if (idx === 6) return "#0284c7";
        if (idx === 7) return "#e2e8f0";
        break;
      case "solo":
        if (idx === 0) return s.tile;
        if (idx === 1) return "#e0f2fe";
        if (idx === 2) return "#94a3b8";
        if (idx === 3) return s.ink;
        if (idx === 4) return s.ink;
        if (idx === 5) return s.user;
        if (idx === 6) return s.select;
        if (idx === 7) return s.err;
        if (idx === 8) return s.pencil;
        if (idx === 9) return "#475569";
        break;
      case "keen":
      case "group":
        if (idx === 0) return s.tile;
        if (idx === 1) return "#94a3b8";
        if (puzzleId === "keen") {
          if (idx === 2) return s.ink;
          if (idx === 3) return s.user;
          if (idx === 4) return s.select;
          if (idx === 5) return s.err;
          if (idx === 6) return s.pencil;
        } else {
          if (idx === 2) return s.user;
          if (idx === 3) return s.select;
          if (idx === 4) return s.err;
          if (idx === 5) return s.pencil;
          if (idx === 6) return "#e0f2fe";
        }
        break;
      case "unequal":
        if (idx === 0) return s.bg;
        if (idx === 1) return "#64748b";
        if (idx === 2) return s.ink;
        if (idx === 3) return s.user;
        if (idx === 4) return s.err;
        if (idx === 5) return s.pencil;
        if (idx === 6) return s.tile;
        if (idx === 7) return "#94a3b8";
        break;
      case "galaxies":
        if (idx === 0) return s.bg;
        if (idx === 1) return "#dbeafe";
        if (idx === 2) return "#334155";
        if (idx === 3) return "#ffffff";
        if (idx === 4) return "#0f172a";
        if (idx === 5) return s.lo;
        if (idx === 6) return s.ink;
        if (idx === 7) return "#0284c7";
        if (idx === 8) return "#f59e0b";
        break;
      case "tents":
        if (idx === 0) return s.tile;
        if (idx === 1) return "#64748b";
        if (idx === 2) return "#bbf7d0";
        if (idx === 3) return "#78350f";
        if (idx === 4) return "#16a34a";
        if (idx === 5) return "#f59e0b";
        if (idx === 6) return s.err;
        if (idx === 7) return "#ffffff";
        if (idx === 8) return "#991b1b";
        break;
      case "untangle":
        if (idx === 0) return s.bg;
        if (idx === 1) return s.tile;
        if (idx === 2) return "#0284c7";
        if (idx === 3) return "#e11d48";
        if (idx === 4) return "#0f172a";
        if (idx === 5) return "#3b82f6";
        if (idx === 6) return "#f59e0b";
        if (idx === 7) return "#10b981";
        if (idx === 8) return "#8b5cf6";
        break;
      case "mines":
        // 0:BG2, 1:BG, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7, 9:8, 10:MINE, 11:BANG, 12:CROSS, 13:FLAG
        if (idx === 0) return s.tile;
        if (idx === 1) return s.bg;
        if (idx === 2) return "#0284c7";
        if (idx === 3) return "#059669";
        if (idx === 4) return "#e11d48";
        if (idx === 5) return "#4f46e5";
        if (idx === 6) return "#b45309";
        if (idx === 7) return "#0891b2";
        if (idx === 8) return "#0f172a";
        if (idx === 9) return "#475569";
        if (idx === 10) return "#0f172a";
        if (idx === 11) return "#fda4af";
        if (idx === 12) return "#e11d48";
        if (idx === 13) return "#f59e0b";
        break;
      case "pearl":
        // 0:BG, 1:GRID, 2:OUTLINE, 3:BLACK, 4:WHITE, 5:ERROR, 6:DRAGON, 7:CURSOR, 8:FAINT
        if (idx === 0) return s.tile;
        if (idx === 1) return s.lo;
        if (idx === 2) return s.ink;
        if (idx === 3) return "#0f172a";
        if (idx === 4) return "#ffffff";
        if (idx === 5) return s.err;
        if (idx === 6) return "#0284c7";
        if (idx === 7) return "#f59e0b";
        if (idx === 8) return "#cbd5e1";
        break;
      case "magnets":
        if (idx === 0) return s.bg;
        if (idx === 1) return s.hi;
        if (idx === 2) return s.lo;
        if (idx === 3) return s.ink;
        if (idx === 4) return s.err;
        if (idx === 5) return "#e11d48"; // + Red North Pole
        if (idx === 6) return "#0284c7"; // - Blue South Pole
        if (idx === 7) return "#94a3b8"; // Neutral
        break;
      case "flood":
      case "samegame":
        // Jewel-tone colorblind-friendly palette for Flood & SameGame
        if (idx === 0) return s.bg;
        var jewel = [null, "#ef4444", "#10b981", "#2563eb", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6", "#6366f1", "#84cc16"];
        if (idx >= 1 && idx <= 10 && jewel[idx]) return jewel[idx];
        break;
    }
    return null;
  }

  window.__edugatesMapColour = function (colour_number, rawHex) {
    var s = getSurface();
    var puzzleId = getCurrentPuzzleId();
    var override = getPuzzlePaletteOverride(puzzleId, colour_number, s);
    if (override) return override;

    if (colour_number === 0) return s.bg;
    if (!rawHex || rawHex.charAt(0) !== "#" || rawHex.length !== 7) return rawHex;

    var r = parseInt(rawHex.slice(1, 3), 16);
    var g = parseInt(rawHex.slice(3, 5), 16);
    var b = parseInt(rawHex.slice(5, 7), 16);

    if (r === 0 && g === 0 && b === 0) return s.ink;
    if (r === 255 && g === 255 && b === 255) return "#ffffff";
    if (r > 200 && g < 80 && b < 80) return s.err;
    if (r < 40 && g > 90 && g < 190 && b < 40) return s.user;
    if (r < 90 && g >= 190 && b < 90) return "#10b981";
    if (r < 50 && g < 50 && b > 190) return "#2563eb";
    if (r > 210 && g > 210 && b < 60) return s.lit;
    if (r < 50 && g > 200 && b > 200) return "#06b6d4";

    if (Math.abs(r - g) <= 16 && Math.abs(g - b) <= 16) {
      var lum = (r + g + b) / 3;
      if (lum > 240) return s.hi;
      if (lum > 205) return s.tile;
      if (lum > 170) return s.lo;
      if (lum > 120) return s.grid;
      if (lum > 60) return "#475569";
      return "#1e293b";
    }

    return rawHex;
  };

  window.__edugatesDrawRect = function (ctx, x, y, w, h, colour, colours) {
    var puzzleId = getCurrentPuzzleId();
    var colStr = colours[colour] || "#000000";

    if (puzzleId === "lightup") {
      if (colour === 2 && w === h && w >= 4 && w <= 16) {
        var cx = x + w * 0.5;
        var cy = y + h * 0.5;
        var rad = Math.max(3, w * 0.46);
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, 2 * Math.PI);
        ctx.fillStyle = "#475569";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 0.42, 0, 2 * Math.PI);
        ctx.fillStyle = "#cbd5e1";
        ctx.fill();
        return;
      }
      if (colour === 2 && w >= 18 && h >= 18) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#334155";
        ctx.fillRect(x + 1, y + 1, w - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, h - 2);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
        return;
      }
      if (colour === 4 && w >= 18 && h >= 18) {
        ctx.fillStyle = colStr;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#fef9c3";
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        return;
      }
    }

    if (puzzleId === "bridges" && (colour === 1 || colour === 4 || colour === 8)) {
      ctx.fillStyle = colStr;
      ctx.fillRect(x, y, w, h);
      if (w > h * 1.4 && h >= 3 && h <= 20) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(x, y + Math.floor(h * 0.25), w, Math.max(1, Math.floor(h * 0.22)));
      } else if (h > w * 1.4 && w >= 3 && w <= 20) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(x + Math.floor(w * 0.25), y, Math.max(1, Math.floor(w * 0.22)), h);
      }
      return;
    }

    ctx.fillStyle = colStr;
    ctx.fillRect(x, y, w, h);
    if (colour === 0 && w >= 22 && w <= 130 && Math.abs(w - h) <= 4) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(x + 1, y + 1, w - 2, 1.5);
    }
  };

  window.__edugatesDrawCircle = function (ctx, x, y, r, fill, outline, colours) {
    var puzzleId = getCurrentPuzzleId();
    var cx = x + 0.5;
    var cy = y + 0.5;

    if (puzzleId === "lightup" && r >= 5 && (fill === 3 || fill === 5)) {
      var isErr = (fill === 5);
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.16, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "rgba(225, 29, 72, 0.25)" : "rgba(245, 158, 11, 0.30)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "#ffe4e6" : "#fffbeb";
      ctx.fill();
      ctx.lineWidth = Math.max(1.8, r * 0.16);
      ctx.strokeStyle = isErr ? "#e11d48" : "#d97706";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.52, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "#f43f5e" : "#f59e0b";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy - r * 0.28, Math.max(1.3, r * 0.18), 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      return;
    }

    if (puzzleId === "bridges" && r >= 7 && fill === outline) {
      var isInnerFace = (fill === 0 || fill === 5 || fill === 9);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      if (isInnerFace) {
        ctx.fillStyle = fill === 5 ? "#dcfce7" : (fill === 9 ? "#fef08a" : "#ffffff");
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = fill === 5 ? "#86efac" : "#cbd5e1";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.82, -0.8 * Math.PI, -0.2 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();
      } else {
        ctx.fillStyle = colours[fill];
        ctx.fill();
      }
      return;
    }

    if (puzzleId === "slant" && r >= 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = fill === 0 ? "#ffffff" : (colours[fill] || "#ffffff");
      ctx.fill();
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = outline === 5 ? colours[5] : "#0284c7";
      ctx.stroke();
      return;
    }

    if (puzzleId === "loopy" && r <= 6 && fill >= 0) {
      var pinR = Math.max(2.2, r + 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, pinR, 0, 2 * Math.PI);
      ctx.fillStyle = colours[fill] || "#0f172a";
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    if (fill >= 0) {
      ctx.fillStyle = colours[fill];
      ctx.fill();
    }
    ctx.lineWidth = r >= 7 ? 1.75 : 1.35;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = colours[outline];
    ctx.stroke();

    if (fill >= 0 && fill !== 0 && r >= 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.68, -0.78 * Math.PI, -0.18 * Math.PI);
      ctx.lineWidth = Math.max(1.2, r * 0.14);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
      ctx.stroke();
    }
  };

  window.__edugatesDrawPoly = function (ctx, pointptr, npoints, fill, outline, colours, getValue) {
    var puzzleId = getCurrentPuzzleId();
    var s = getSurface();

    var xs = new Array(npoints);
    var ys = new Array(npoints);
    for (var i = 0; i < npoints; i++) {
      xs[i] = getValue(pointptr + 8 * i, "i32");
      ys[i] = getValue(pointptr + 8 * i + 4, "i32");
    }

    ctx.beginPath();
    ctx.moveTo(xs[0] + 0.5, ys[0] + 0.5);
    for (var j = 1; j < npoints; j++) {
      ctx.lineTo(xs[j] + 0.5, ys[j] + 0.5);
    }
    ctx.closePath();

    if (fill >= 0) {
      var fillCol = colours[fill];
      if (puzzleId === "towers" && npoints === 4) {
        var isHighlighted = (fill === 3);
        if (xs[0] === xs[1] && xs[2] === xs[3] && xs[2] !== xs[0]) {
          fillCol = isHighlighted ? "#7dd3fc" : s.wallLeft;
        } else if (ys[0] === ys[1] && ys[2] === ys[3] && ys[2] !== ys[0]) {
          fillCol = isHighlighted ? "#38bdf8" : s.wallBottom;
        }
      }
      ctx.fillStyle = fillCol;
      ctx.fill();
    }

    ctx.lineWidth = (puzzleId === "towers" || puzzleId === "solo" || puzzleId === "keen") ? 1.5 : 1.25;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = colours[outline];
    ctx.stroke();

    if ((puzzleId === "net" || puzzleId === "netslide") && npoints === 4 && outline === 3 && (fill === 4 || fill === 5)) {
      var cx = (xs[0] + xs[1] + xs[2] + xs[3]) * 0.25 + 0.5;
      var cy = (ys[0] + ys[1] + ys[2] + ys[3]) * 0.25 + 0.5;
      var boxSpan = Math.hypot(xs[1] - xs[0], ys[1] - ys[0]);
      if (boxSpan >= 8) {
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(2, boxSpan * 0.22), 0, 2 * Math.PI);
        ctx.fillStyle = fill === 5 ? "#ffffff" : "#bfdbfe";
        ctx.fill();
      }
    }
  };

  window.__edugatesDrawLine = function (ctx, x1, y1, x2, y2, width, colour, colours) {
    var puzzleId = getCurrentPuzzleId();
    var colStr = colours[colour] || "#0f172a";
    var w = width;

    if (puzzleId === "loopy") {
      if (colour === 2) w = Math.max(1.25, width * 0.42);
      else if (colour === 7) w = 1.0;
      else if (colour === 1 || colour === 3 || colour === 4) w = Math.max(2.6, width * 1.28);
    } else if (puzzleId === "slant") {
      var dx = Math.abs(x2 - x1);
      var dy = Math.abs(y2 - y1);
      if (dx > 4 && dy > 4 && w <= 1.5) w = 2.25;
    } else if (puzzleId === "untangle") {
      w = Math.max(width, 2.1);
    }

    ctx.beginPath();
    ctx.moveTo(x1 + 0.5, y1 + 0.5);
    ctx.lineTo(x2 + 0.5, y2 + 0.5);
    ctx.lineWidth = w;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = colStr;
    ctx.stroke();
  };

  window.__edugatesDrawText = function (ctx, x, y, halign, colour, fontsize, monospaced, str, colours, canvas_set_font) {
    canvas_set_font(ctx, fontsize, monospaced);
    ctx.textAlign = halign === 0 ? "left" : (halign === 1 ? "center" : "right");
    ctx.textBaseline = "alphabetic";
    var colStr = colours[colour] || "#0f172a";

    if (fontsize >= 15) {
      var isLightText = (colStr === "#ffffff" || colStr === "#fffbeb");
      ctx.fillStyle = isLightText ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.55)";
      ctx.fillText(str, x, y + 1);
    }

    ctx.fillStyle = colStr;
    ctx.fillText(str, x, y);
  };

  window.setEdugatesBoardStyle = function (styleName) {
    currentBoardStyle = styleName;
    localStorage.setItem("edugates_board_style", styleName);
    playSound("mode");
    var pills = document.querySelectorAll(".sb-palette-pill");
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle("active", pills[i].getAttribute("data-style") === styleName);
    }
    if (window.__edugatesForceRedraw) {
      window.__edugatesForceRedraw();
    }
  };

  // ==========================================================================
  // 5. CLASSROOM TEAM BATTLE SCOREBOARD & BLITZ TIMER
  // ==========================================================================
  var DEFAULT_TEAMS = [
    { name: "⚡ Euler", color: "#2ABFBF", score: 0 },
    { name: "📐 Gauss", color: "#f59e0b", score: 0 },
    { name: "🌌 Noether", color: "#10b981", score: 0 },
    { name: "🔬 Turing", color: "#f43f5e", score: 0 }
  ];

  function loadTeamsState() {
    try {
      var raw = localStorage.getItem("edugates_teams_v1");
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.teams) && parsed.teams.length === 4) {
          return parsed;
        }
      }
    } catch (e) {}
    return { activeIdx: 0, open: false, teams: JSON.parse(JSON.stringify(DEFAULT_TEAMS)) };
  }

  var teamsState = loadTeamsState();
  if (typeof window !== "undefined" && window.location && window.location.search.indexOf("teams=1") !== -1) {
    teamsState.open = true;
  }

  function saveTeamsState() {
    try {
      localStorage.setItem("edugates_teams_v1", JSON.stringify(teamsState));
    } catch (e) {}
  }

  function renderTeamBar() {
    var bar = document.getElementById("sb-team-bar");
    var list = document.getElementById("sb-teams-list");
    if (!bar || !list) return;

    bar.classList.toggle("visible", !!teamsState.open);
    var toggleBtn = document.getElementById("sb-team-toggle-btn");
    if (toggleBtn) toggleBtn.classList.toggle("is-active", !!teamsState.open);

    list.innerHTML = "";
    for (var i = 0; i < teamsState.teams.length; i++) {
      (function (idx) {
        var t = teamsState.teams[idx];
        var chip = document.createElement("div");
        chip.className = "sb-team-chip" + (teamsState.activeIdx === idx ? " active-turn" : "");
        chip.title = "Tap to set as Active Team • Double-click name to rename";
        chip.onclick = function (e) {
          if (e.target.tagName === "BUTTON") return;
          teamsState.activeIdx = idx;
          saveTeamsState();
          playSound("mode");
          renderTeamBar();
          updateAwardButtonLabel();
        };

        var dot = document.createElement("span");
        dot.className = "sb-team-dot";
        dot.style.backgroundColor = t.color;

        var nameSpan = document.createElement("span");
        nameSpan.className = "sb-team-name";
        nameSpan.textContent = t.name + (teamsState.activeIdx === idx ? " ★" : "");
        nameSpan.ondblclick = function (ev) {
          ev.stopPropagation();
          var nextName = window.prompt("Rename Classroom Team:", t.name);
          if (nextName && nextName.trim()) {
            teamsState.teams[idx].name = nextName.trim();
            saveTeamsState();
            renderTeamBar();
            updateAwardButtonLabel();
          }
        };

        var scoreSpan = document.createElement("span");
        scoreSpan.className = "sb-team-score";
        scoreSpan.textContent = String(t.score);

        var minusBtn = document.createElement("button");
        minusBtn.type = "button";
        minusBtn.className = "sb-team-btn";
        minusBtn.textContent = "−";
        minusBtn.title = "-5 Points";
        minusBtn.onclick = function (ev) {
          ev.stopPropagation();
          teamsState.teams[idx].score = Math.max(0, teamsState.teams[idx].score - 5);
          saveTeamsState();
          playSound("undo");
          renderTeamBar();
        };

        var plusBtn = document.createElement("button");
        plusBtn.type = "button";
        plusBtn.className = "sb-team-btn";
        plusBtn.textContent = "+";
        plusBtn.title = "+10 Points";
        plusBtn.onclick = function (ev) {
          ev.stopPropagation();
          teamsState.teams[idx].score += 10;
          saveTeamsState();
          playSound("key");
          renderTeamBar();
        };

        chip.appendChild(dot);
        chip.appendChild(nameSpan);
        chip.appendChild(scoreSpan);
        chip.appendChild(minusBtn);
        chip.appendChild(plusBtn);
        list.appendChild(chip);
      })(i);
    }
  }

  function updateAwardButtonLabel() {
    var awardBtn = document.getElementById("sb-victory-award-btn");
    if (!awardBtn) return;
    var activeTeam = teamsState.teams[teamsState.activeIdx] || teamsState.teams[0];
    awardBtn.textContent = "🏅 +10 Pts to " + activeTeam.name;
  }

  window.toggleClassroomTeamBar = function () {
    teamsState.open = !teamsState.open;
    saveTeamsState();
    playSound("mode");
    renderTeamBar();
    setTimeout(function () { autoFitBoard(currentZoomScale); }, 40);
  };

  window.resetClassroomTeamScores = function () {
    for (var i = 0; i < teamsState.teams.length; i++) {
      teamsState.teams[i].score = 0;
    }
    saveTeamsState();
    playSound("undo");
    renderTeamBar();
  };

  window.awardVictoryPointsToActiveTeam = function (btnEl) {
    var activeTeam = teamsState.teams[teamsState.activeIdx] || teamsState.teams[0];
    activeTeam.score += 10;
    teamsState.activeIdx = (teamsState.activeIdx + 1) % teamsState.teams.length;
    teamsState.open = true;
    saveTeamsState();
    playSound("victory");
    renderTeamBar();
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = "✅ +10 Pts Awarded to " + activeTeam.name + "!";
    }
  };

  // ==========================================================================
  // 6. TOUCH CONTROLS, KEYPADS, TIMER, CONFETTI & CLASSROOM TOOLS
  // ==========================================================================
  var PUZZLE_PROFILES = {
    bridges:  { left: "Draw Bridge / Lock", right: "Non-Bridge Mark", middle: "Mark Island", keys: ["1","2","3","4","5","6","7","8", {k:"g", label:"📏 Grid (G)", cls:"key-accent"}, {k:"l", label:"🔒 Lock (L)", cls:"key-accent"}] },
    towers:   { left: "Select Square", right: "Pencil Mode", middle: "Clear Square", keys: ["1","2","3","4","5","6","7","8","9", {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger key-wide"}] },
    lightup:  { left: "💡 Place Bulb", right: "⚫ Mark No-Bulb", middle: "Clear Cell", keys: [{k:"Spacebar", label:"💡 Place Bulb", cls:"key-accent key-wide"}, {k:"Enter", label:"⚫ Mark Dot", cls:"key-wide"}] },
    slant:    { left: "╱ Draw / Slant", right: "╲ Draw \\ Slant", middle: "Clear Cell", keys: [{k:"Enter", label:"╱ Slant (/)" , cls:"key-accent"}, {k:"Spacebar", label:"╲ Slant (\\)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    net:      { left: "↺ Rotate CCW", right: "↻ Rotate CW", middle: "🔒 Lock Tile", keys: [{k:"a", label:"↺ CCW (A)", cls:"key-accent"}, {k:"d", label:"↻ CW (D)", cls:"key-accent"}, {k:"s", label:"🔒 Lock (S)", cls:"key-accent"}, {k:"j", label:"🔀 Jumble (J)", cls:"key-wide"}, {k:"c", label:"🎯 Center (C)", cls:""}] },
    loopy:    { left: "➰ Draw Loop Edge", right: "✖️ Mark Non-Edge", middle: "Clear Edge", keys: [{k:"Enter", label:"➰ Toggle Edge", cls:"key-accent key-wide"}, {k:"Spacebar", label:"✖️ Mark X", cls:"key-wide"}] },
    solo:     { left: "Select Cell", right: "Pencil Mark", middle: "Clear Cell", keys: ["1","2","3","4","5","6","7","8","9", {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    keen:     { left: "Select Cell", right: "Pencil Mark", middle: "Clear Cell", keys: ["1","2","3","4","5","6","7","8","9", {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    unequal:  { left: "Select Cell", right: "Pencil Mark", middle: "Clear Cell", keys: ["1","2","3","4","5","6","7","8","9", {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    filling:  { left: "Select / Drag", right: "Clear Cell", middle: "Clear", keys: ["1","2","3","4","5","6","7","8","9","0", {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    range:    { left: "⬛ Fill Black", right: "⬜ Mark Dot", middle: "Clear", keys: [{k:"Enter", label:"⬛ Fill Black", cls:"key-accent"}, {k:"Spacebar", label:"⬜ Mark White", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    undead:   { left: "Select Cell", right: "Pencil Mark", middle: "Clear", keys: [{k:"g", label:"👻 Ghost (G)", cls:"key-accent"}, {k:"v", label:"🧛 Vampire (V)", cls:"key-accent"}, {k:"z", label:"🧟 Zombie (Z)", cls:"key-accent"}, {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    group:    { left: "Select Cell", right: "Pencil Mark", middle: "Clear", keys: ["a","b","c","d","e","f","g","h","i", {k:"m", label:"✏️ Pencil (M)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger key-wide"}] },
    dominosa: { left: "Place Domino", right: "Mark Border", middle: "Clear", keys: ["0","1","2","3","4","5","6","7","8","9"] },
    mines:    { left: "⛏️ Uncover Cell", right: "🚩 Flag Mine", middle: "Chord / Clear", keys: [{k:"Enter", label:"⛏️ Uncover", cls:"key-accent"}, {k:"Spacebar", label:"🚩 Flag Mine", cls:"key-accent"}] },
    tents:    { left: "⛺ Place Tent", right: "🌿 Mark Grass", middle: "Clear", keys: [{k:"Enter", label:"⛺ Place Tent", cls:"key-accent"}, {k:"Spacebar", label:"🌿 Mark Grass", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    pattern:  { left: "⬛ Fill Black", right: "⬜ Mark Empty", middle: "Erase", keys: [{k:"Enter", label:"⬛ Fill Black", cls:"key-accent"}, {k:"Spacebar", label:"⬜ Mark White", cls:"key-accent"}, {k:"Backspace", label:"⌫ Erase", cls:"key-danger"}] },
    mosaic:   { left: "⬛ Fill Black", right: "⬜ Mark White", middle: "Erase", keys: [{k:"Enter", label:"⬛ Fill", cls:"key-accent"}, {k:"Spacebar", label:"⬜ Empty", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    unruly:   { left: "⬛ Fill Black", right: "⬜ Fill White", middle: "Clear", keys: [{k:"Enter", label:"⬛ Black", cls:"key-accent"}, {k:"Spacebar", label:"⬜ White", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    singles:  { left: "⬛ Black Out", right: "⭕ Circle Keep", middle: "Clear", keys: [{k:"Enter", label:"⬛ Black Out", cls:"key-accent"}, {k:"Spacebar", label:"⭕ Circle", cls:"key-accent"}] },
    palisade: { left: "🧱 Draw Border", right: "✖️ No Border", middle: "Clear", keys: [{k:"h", label:"⬅️ Left (H)"}, {k:"k", label:"⬆️ Top (K)"}, {k:"j", label:"⬇️ Bottom (J)"}, {k:"l", label:"➡️ Right (L)"}] },
    pearl:    { left: "⚪ Draw Loop", right: "✖️ Mark X", middle: "Clear", keys: [] },
    tracks:   { left: "🛤️ Lay Track", right: "✖️ Mark No-Track", middle: "Clear", keys: [] },
    magnets:  { left: "➕ Place Magnet", right: "✖️ Mark Neutral", middle: "Clear", keys: [{k:"Enter", label:"➕ [+ −]", cls:"key-accent"}, {k:"Spacebar", label:"✖️ Neutral", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger"}] },
    blackbox: { left: "🔴 Place Ball / Fire", right: "✖️ Mark Empty", middle: "Lock", keys: [{k:"Enter", label:"🔴 Action", cls:"key-accent"}, {k:"Spacebar", label:"🏁 Reveal / Check", cls:"key-accent key-wide"}] },
    map:      { left: "🎨 Drag Color", right: "✏️ Stipple Mark", middle: "Clear", keys: ["1","2","3","4", {k:"l", label:"🏷️ Labels (L)", cls:"key-accent"}, {k:"c", label:"🎨 Colors (C)", cls:"key-accent"}, {k:"Backspace", label:"⌫ Clear", cls:"key-danger key-wide"}] },
    guess:    { left: "🎨 Place Peg", right: "🔒 Hold Peg", middle: "Clear", keys: ["1","2","3","4","5","6", {k:"l", label:"🏷️ Labels (L)", cls:"key-accent"}, {k:"Enter", label:"✅ Submit Guess", cls:"key-accent key-wide"}] },
    signpost: { left: "🔗 Drag Link", right: "✂️ Unlink", middle: "Clear", keys: [{k:"Backspace", label:"⌫ Unlink Square", cls:"key-danger key-wide"}] },
    galaxies: { left: "🌌 Toggle Edge / Drag", right: "Mark Center", middle: "Clear", keys: [{k:"Enter", label:"🌌 Toggle Edge", cls:"key-accent key-wide"}, {k:"Backspace", label:"⌫ Remove Arrow", cls:"key-danger"}] },
    rect:     { left: "📐 Drag Rectangle", right: "Erase Line", middle: "Clear", keys: [] },
    flip:     { left: "💡 Flip Tile Group", right: "Flip Tile", middle: "Flip", keys: [{k:"Enter", label:"💡 Flip Selected", cls:"key-accent key-wide"}] },
    flood:    { left: "🎨 Flood Fill Color", right: "Flood Fill", middle: "Flood", keys: ["1","2","3","4","5","6"] },
    samegame: { left: "🧱 Select / Clear Group", right: "Select Group", middle: "Clear", keys: [{k:"Enter", label:"🧱 Select / Clear", cls:"key-accent key-wide"}] },
    untangle: { left: "🕸️ Drag Vertex", right: "Drag Vertex", middle: "Drag", keys: [] },
    fifteen:  { left: "🔢 Slide Tile", right: "Slide Tile", middle: "Slide", keys: [], dpadOpen: true },
    sixteen:  { left: "🔄 Slide Row/Col", right: "Reverse Slide", middle: "Slide", keys: [], dpadOpen: true },
    twiddle:  { left: "↺ Rotate Block CCW", right: "↻ Rotate Block CW", middle: "Rotate", keys: [], dpadOpen: true },
    netslide: { left: "🔄 Slide Row/Col", right: "🔒 Lock Tile", middle: "Lock", keys: [], dpadOpen: true },
    cube:     { left: "🧊 Roll Cube", right: "Roll Cube", middle: "Roll", keys: [], dpadOpen: true },
    inertia:  { left: "💎 Roll Ball", right: "Roll Ball", middle: "Roll", keys: [], dpadOpen: true },
    pegs:     { left: "📍 Drag Peg Jump", right: "Select Peg", middle: "Jump", keys: [], dpadOpen: true }
  };

  var cwrapKeyFn = null;
  function sendPuzzleKey(keyStr) {
    if (!window.Module || !window.Module.cwrap) return;
    if (!cwrapKeyFn) {
      cwrapKeyFn = window.Module.cwrap("key", "boolean", ["number", "string", "string", "number", "number", "number"]);
    }
    var keyCode = 0;
    var chr = "";
    if (keyStr === "Backspace") keyCode = 8;
    else if (keyStr === "Enter") keyCode = 13;
    else if (keyStr === "Spacebar") { keyCode = 32; chr = " "; }
    else if (keyStr === "Escape") keyCode = 27;
    else if (keyStr.length === 1) {
      keyCode = keyStr.toUpperCase().charCodeAt(0);
      chr = keyStr;
    }
    playSound("key");
    cwrapKeyFn(keyCode, keyStr, chr, 0, 0, 0);
    if (window.__edugatesOnMove) window.__edugatesOnMove(true);
    var canvas = document.getElementById("puzzlecanvas");
    if (canvas) canvas.focus();
  }
  window.sendPuzzleKey = sendPuzzleKey;

  function setClickMode(mode) {
    window.__EDUGATES_CLICK_MODE__ = mode;
    playSound("mode");
    var btns = document.querySelectorAll(".sb-click-btn, .sb-quick-mode-btn");
    for (var i = 0; i < btns.length; i++) {
      var bMode = parseInt(btns[i].getAttribute("data-mode"), 10);
      if (bMode === mode) btns[i].classList.add("active");
      else btns[i].classList.remove("active");
    }
  }
  window.setClickMode = setClickMode;

  var currentZoomScale = 1.0;
  function autoFitBoard(scaleMultiplier) {
    if (typeof scaleMultiplier === "number") {
      currentZoomScale = Math.max(0.5, Math.min(1.6, scaleMultiplier));
    }
    var viewport = document.querySelector(".sb-canvas-viewport");
    if (!viewport || !window.Module || !window.Module._resize_puzzle) return;
    var dpr = window.__EDUGATES_DPR__ || window.devicePixelRatio || 1;
    var availW = Math.max(260, (viewport.clientWidth - 24) * currentZoomScale);
    var availH = Math.max(240, (viewport.clientHeight - 24) * currentZoomScale);
    try {
      window.Module._resize_puzzle((availW * dpr) | 0, (availH * dpr) | 0);
      syncAnnotationCanvasSize();
    } catch (e) {}
  }
  window.autoFitBoard = autoFitBoard;
  window.zoomBoard = function (delta) {
    if (delta === 0) currentZoomScale = 1.0;
    else currentZoomScale = Math.max(0.55, Math.min(1.5, currentZoomScale + delta));
    playSound("mode");
    autoFitBoard(currentZoomScale);
  };

  window.toggleDockSide = function () {
    currentDockSide = currentDockSide === "left" ? "right" : "left";
    localStorage.setItem("edugates_dock_side", currentDockSide);
    document.body.classList.toggle("dock-left", currentDockSide === "left");
    var btn = document.getElementById("sb-dock-swap-btn");
    if (btn) {
      btn.textContent = currentDockSide === "left" ? "➡️ Dock Right" : "⬅️ Dock Left";
    }
    playSound("mode");
  };

  function syncPresetsDropdown() {
    var selectEl = document.getElementById("sb-preset-select");
    var gametypeUl = document.getElementById("gametype");
    var menuform = document.getElementById("gamemenu");
    if (!selectEl || !gametypeUl || !menuform) return;

    selectEl.innerHTML = "";
    var radios = gametypeUl.querySelectorAll("input[type='radio'][name='preset']");
    if (radios.length === 0) {
      selectEl.style.display = "none";
      return;
    }
    selectEl.style.display = "";

    for (var i = 0; i < radios.length; i++) {
      var r = radios[i];
      var opt = document.createElement("option");
      opt.value = r.value;
      var labelText = r.parentElement ? r.parentElement.textContent.trim() : ("Preset " + (i + 1));
      var parentSub = r.closest("ul");
      if (parentSub && parentSub.id !== "gametype" && parentSub.parentElement) {
        var groupTitleNode = parentSub.parentElement.childNodes[1];
        var groupTitle = groupTitleNode ? groupTitleNode.textContent.trim() : "";
        if (groupTitle) labelText = groupTitle + " — " + labelText;
      }
      opt.textContent = labelText;
      if (r.checked) opt.selected = true;
      selectEl.appendChild(opt);
    }

    selectEl.onchange = function () {
      var val = selectEl.value;
      for (var j = 0; j < radios.length; j++) {
        if (String(radios[j].value) === String(val)) {
          radios[j].checked = true;
          if (typeof radios[j].onclick === "function") {
            radios[j].onclick();
          } else if (window.Module && window.Module._command) {
            window.Module._command(2);
          }
          break;
        }
      }
      playSound("mode");
      setTimeout(function () { autoFitBoard(1.0); }, 40);
      resetTimer();
    };
  }

  // ==========================================================================
  // 7. CLASSROOM STOPWATCH / BLITZ COUNTDOWN & VICTORY CELEBRATION
  // ==========================================================================
  var timerSeconds = 0;
  var blitzLimitSeconds = 0; // 0 = Stopwatch mode, >0 = Blitz countdown mode
  var moveCount = 0;
  var timerPaused = false;
  var timerSolved = false;
  var wasAutoSolved = false;
  var timerInterval = null;

  function formatTime(sec) {
    var absSec = Math.max(0, sec);
    var m = Math.floor(absSec / 60);
    var s = absSec % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  function updateTimerDisplay() {
    var el = document.getElementById("sb-timer-display");
    var pill = document.querySelector(".sb-timer-pill");
    if (el) {
      if (blitzLimitSeconds > 0) {
        var rem = Math.max(0, blitzLimitSeconds - timerSeconds);
        el.textContent = formatTime(rem);
        if (pill) pill.classList.toggle("blitz-urgent", rem <= 15 && rem > 0);
      } else {
        el.textContent = formatTime(timerSeconds);
        if (pill) pill.classList.remove("blitz-urgent");
      }
    }
    var mEl = document.getElementById("sb-moves-display");
    if (mEl) mEl.textContent = String(moveCount);
  }

  function updateBestTimeBadge() {
    var puzzleId = getCurrentPuzzleId();
    var bestEl = document.getElementById("sb-best-display");
    if (!bestEl || !puzzleId) return;
    var data = loadMasteryData();
    var rec = data.puzzles[puzzleId];
    if (rec && rec.bestTime !== null && rec.bestTime !== undefined) {
      var starStr = "";
      for (var s = 0; s < (rec.stars || 0); s++) starStr += "★";
      bestEl.textContent = formatTime(rec.bestTime) + (starStr ? " " + starStr : "");
    } else {
      bestEl.textContent = "—";
    }
  }

  function startClassroomTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      if (!timerPaused && !timerSolved && !document.hidden) {
        timerSeconds++;
        updateTimerDisplay();
        if (blitzLimitSeconds > 0 && timerSeconds >= blitzLimitSeconds) {
          timerPaused = true;
          playSound("undo");
        }
      }
    }, 1000);
  }

  function resetTimer() {
    timerSeconds = 0;
    moveCount = 0;
    timerSolved = false;
    timerPaused = false;
    wasAutoSolved = false;
    updateTimerDisplay();
    var banner = document.getElementById("sb-victory-banner");
    if (banner) banner.classList.remove("visible");
    var solveConfirm = document.getElementById("sb-solve-confirm");
    if (solveConfirm) solveConfirm.classList.remove("open");
  }
  window.resetClassroomTimer = resetTimer;

  window.toggleClassroomTimer = function () {
    timerPaused = !timerPaused;
    var btn = document.getElementById("sb-timer-toggle");
    if (btn) btn.textContent = timerPaused ? "▶️" : "⏸️";
  };

  window.setBlitzTimerMode = function (seconds) {
    blitzLimitSeconds = parseInt(seconds, 10) || 0;
    resetTimer();
    playSound("mode");
  };

  // Lightweight 60 FPS Confetti Burst on Board Stage
  var confettiAnimId = null;
  function triggerVictoryConfetti() {
    var stage = document.querySelector(".sb-board-stage");
    if (!stage) return;
    var cCanvas = document.getElementById("sb-confetti-canvas");
    if (!cCanvas) {
      cCanvas = document.createElement("canvas");
      cCanvas.id = "sb-confetti-canvas";
      stage.appendChild(cCanvas);
    }
    var w = stage.clientWidth || 600;
    var h = stage.clientHeight || 450;
    cCanvas.width = w;
    cCanvas.height = h;
    var ctx = cCanvas.getContext("2d");
    var count = window.__EDUGATES_PERF_LITE__ ? 34 : 64;
    var colors = ["#f59e0b", "#2ABFBF", "#38bdf8", "#10b981", "#fde047", "#f43f5e"];
    var parts = [];
    for (var i = 0; i < count; i++) {
      parts.push({
        x: w * 0.5 + (Math.random() - 0.5) * 80,
        y: h * 0.45,
        vx: (Math.random() - 0.5) * 11,
        vy: -Math.random() * 10 - 3,
        size: Math.random() * 6 + 5,
        color: colors[i % colors.length],
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.2
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    var frames = 0;
    function step() {
      frames++;
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28;
        p.rot += p.vrot;
        if (p.y < h + 20) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.35, p.size, p.size * 0.7);
        ctx.restore();
      }
      if (alive && frames < 130) {
        confettiAnimId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
    confettiAnimId = requestAnimationFrame(step);
  }

  window.__edugatesOnStatus = function (txt) {
    var banner = document.getElementById("sb-victory-banner");
    if (!banner) return;
    if (txt && txt.indexOf("COMPLETED") !== -1 && txt.indexOf("Auto-solved") === -1 && !wasAutoSolved) {
      if (!timerSolved) {
        timerSolved = true;
        var puzzleId = getCurrentPuzzleId();
        var res = recordPuzzleCompletion(puzzleId, timerSeconds, moveCount);
        updateBestTimeBadge();
        playSound("victory");
        triggerVictoryConfetti();

        var starsStr = "";
        for (var i = 0; i < 3; i++) {
          starsStr += (i < res.stars) ? "★" : "☆";
        }
        var activeTeam = teamsState.teams[teamsState.activeIdx] || teamsState.teams[0];
        banner.innerHTML =
          '<div class="sb-victory-stars">' + starsStr + '</div>' +
          '<div class="sb-victory-title">🎉 Excellent Deduction!</div>' +
          '<div style="font-size:0.86rem;color:var(--text-muted)">Edugates Math-Science Team Workbench Completed</div>' +
          '<div class="sb-victory-stats">' +
            '<div class="sb-vstat"><div class="sb-vstat-label">⏱️ Solve Time</div><div class="sb-vstat-val">' + formatTime(timerSeconds) + (res.isNewRecord ? ' <span style="color:#10b981;font-size:0.72rem">🔥 RECORD!</span>' : '') + '</div></div>' +
            '<div class="sb-vstat"><div class="sb-vstat-label">🎯 Total Moves</div><div class="sb-vstat-val">' + moveCount + '</div></div>' +
            '<div class="sb-vstat"><div class="sb-vstat-label">🏆 Class Best</div><div class="sb-vstat-val">' + formatTime(res.bestTime) + '</div></div>' +
          '</div>' +
          '<div class="sb-victory-actions">' +
            '<button type="button" class="eis-btn eis-btn-gold" onclick="document.getElementById(\'new\').click()">🆕 Next Puzzle →</button>' +
            '<button type="button" id="sb-victory-award-btn" class="eis-btn eis-btn-green" onclick="awardVictoryPointsToActiveTeam(this)">🏅 +10 Pts to ' + activeTeam.name + '</button>' +
            '<button type="button" class="eis-btn" onclick="document.getElementById(\'sb-victory-banner\').classList.remove(\'visible\')">🔍 Inspect Board</button>' +
          '</div>';
        banner.classList.add("visible");
      }
    } else if (txt && txt.indexOf("COMPLETED") === -1) {
      banner.classList.remove("visible");
    }
  };

  var pulseTimeout = null;
  window.__edugatesOnMove = function (skipTapSound) {
    moveCount++;
    if (!skipTapSound) playSound("tap");
    updateTimerDisplay();
    var resDiv = document.getElementById("resizable");
    if (resDiv) {
      resDiv.classList.add("move-pulse");
      if (pulseTimeout) clearTimeout(pulseTimeout);
      pulseTimeout = setTimeout(function () {
        resDiv.classList.remove("move-pulse");
      }, 150);
    }
    var selectEl = document.getElementById("sb-preset-select");
    var menuform = document.getElementById("gamemenu");
    if (selectEl && menuform && menuform.elements["preset"]) {
      var curVal = menuform.elements["preset"].value;
      if (curVal !== undefined && String(selectEl.value) !== String(curVal)) {
        selectEl.value = curVal;
      }
    }
  };

  // ==========================================================================
  // 8. TEACHER WHITEBOARD ANNOTATION PEN
  // ==========================================================================
  var annotCanvas = null;
  var annotCtx = null;
  var annotDrawing = false;
  var annotColor = "#f59e0b";

  function syncAnnotationCanvasSize() {
    var pCanvas = document.getElementById("puzzlecanvas");
    annotCanvas = document.getElementById("annotation-canvas");
    if (!pCanvas || !annotCanvas) return;
    var w = pCanvas.offsetWidth || pCanvas.width;
    var h = pCanvas.offsetHeight || pCanvas.height;
    if (annotCanvas.width !== w || annotCanvas.height !== h) {
      annotCanvas.width = w;
      annotCanvas.height = h;
    }
  }

  function initAnnotationLayer() {
    annotCanvas = document.getElementById("annotation-canvas");
    if (!annotCanvas) return;
    annotCtx = annotCanvas.getContext("2d");

    function getPt(e) {
      var rect = annotCanvas.getBoundingClientRect();
      var cx = e.clientX !== undefined ? e.clientX : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : 0);
      var cy = e.clientY !== undefined ? e.clientY : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : 0);
      return { x: cx - rect.left, y: cy - rect.top };
    }

    function startStroke(e) {
      if (!window.__EDUGATES_ANNOTATE_ACTIVE__) return;
      annotDrawing = true;
      var pt = getPt(e);
      annotCtx.beginPath();
      annotCtx.moveTo(pt.x, pt.y);
      annotCtx.strokeStyle = annotColor;
      annotCtx.lineWidth = 3.5;
      annotCtx.lineCap = "round";
      annotCtx.lineJoin = "round";
      if (e.cancelable) e.preventDefault();
    }

    function moveStroke(e) {
      if (!annotDrawing || !window.__EDUGATES_ANNOTATE_ACTIVE__) return;
      var pt = getPt(e);
      annotCtx.lineTo(pt.x, pt.y);
      annotCtx.stroke();
      if (e.cancelable) e.preventDefault();
    }

    function endStroke(e) {
      if (!annotDrawing) return;
      annotDrawing = false;
      if (e && e.cancelable) e.preventDefault();
    }

    annotCanvas.addEventListener("mousedown", startStroke);
    annotCanvas.addEventListener("mousemove", moveStroke);
    window.addEventListener("mouseup", endStroke);
    annotCanvas.addEventListener("touchstart", startStroke, { passive: false });
    annotCanvas.addEventListener("touchmove", moveStroke, { passive: false });
    annotCanvas.addEventListener("touchend", endStroke, { passive: false });
  }

  window.toggleBoardPen = function () {
    window.__EDUGATES_ANNOTATE_ACTIVE__ = !window.__EDUGATES_ANNOTATE_ACTIVE__;
    syncAnnotationCanvasSize();
    playSound("mode");
    var btn = document.getElementById("sb-pen-toggle");
    var bar = document.getElementById("sb-pen-bar");
    if (annotCanvas) {
      annotCanvas.classList.toggle("active", window.__EDUGATES_ANNOTATE_ACTIVE__);
    }
    if (btn) btn.classList.toggle("is-active", window.__EDUGATES_ANNOTATE_ACTIVE__);
    if (bar) bar.classList.toggle("visible", window.__EDUGATES_ANNOTATE_ACTIVE__);
  };

  window.setPenColor = function (col, el) {
    annotColor = col;
    var dots = document.querySelectorAll(".sb-color-dot");
    for (var i = 0; i < dots.length; i++) dots[i].classList.remove("active");
    if (el) el.classList.add("active");
  };

  window.clearBoardPen = function () {
    if (annotCanvas && annotCtx) {
      annotCtx.clearRect(0, 0, annotCanvas.width, annotCanvas.height);
      playSound("undo");
    }
  };

  // ==========================================================================
  // 9. GLOBAL HEADER CONTROLS (Theme, Low-CPU, Fullscreen)
  // ==========================================================================
  window.toggleEdugatesTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme") === "day" ? "day" : "night";
    var next = cur === "day" ? "night" : "day";
    if (next === "day") document.documentElement.setAttribute("data-theme", "day");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("edugates_math_theme", next);
    playSound("mode");
    var btn = document.getElementById("eis-theme-btn");
    if (btn) btn.textContent = next === "day" ? "🌙 Dark Board" : "☀️ Light Board";
  };

  window.toggleLowCpuTurbo = function () {
    window.__EDUGATES_PERF_LITE__ = !window.__EDUGATES_PERF_LITE__;
    window.__EDUGATES_DPR__ = window.__EDUGATES_PERF_LITE__ ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    localStorage.setItem("edugates_math_lowcpu", window.__EDUGATES_PERF_LITE__ ? "true" : "false");
    playSound("mode");
    var btn = document.getElementById("eis-turbo-btn");
    if (btn) {
      btn.textContent = window.__EDUGATES_PERF_LITE__ ? "⚡ Low-CPU: ON" : "🖥️ HD Mode";
      btn.classList.toggle("is-active", window.__EDUGATES_PERF_LITE__);
    }
    if (window.Module && window.Module._rescale_puzzle) {
      window.Module._rescale_puzzle();
      autoFitBoard(currentZoomScale);
    }
  };

  window.toggleSmartboardFullscreen = function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
    setTimeout(function () { autoFitBoard(currentZoomScale); }, 180);
  };

  // ==========================================================================
  // 10. WORKSPACE UI OVERHAUL (De-Cluttered Toolbar, More Tools, Bottom QuickBar)
  // ==========================================================================
  function upgradePuzzleWorkspaceUI() {
    var puzzleId = getCurrentPuzzleId();
    if (!puzzleId) return;

    if (currentDockSide === "left") {
      document.body.classList.add("dock-left");
    }

    // 1. Add Sound Button, Quick Lab Switcher & Best Time Pill to Topbar
    var topbar = document.querySelector(".eis-topbar");
    var homeLink = topbar ? topbar.querySelector("a[href='index.html'].eis-btn") : null;
    if (homeLink) {
      homeLink.textContent = "🏠 Hub";
    }
    var penToggleBtn = document.getElementById("sb-pen-toggle");
    if (penToggleBtn) {
      penToggleBtn.textContent = "🖊️ Pen";
    }
    if (homeLink && homeLink.parentNode && !document.getElementById("sb-quick-lab-select")) {
      var labSelect = document.createElement("select");
      labSelect.id = "sb-quick-lab-select";
      labSelect.className = "sb-quick-lab-select";
      labSelect.title = "Quick-Switch to Any of the 41 Math-Science Workbenches";
      var labGroups = [
        { label: "★ Featured Classics", items: [["bridges","🌉 Bridges"],["towers","🏙️ Towers"],["lightup","💡 Light Up"],["slant","📐 Slant"],["net","⚡ Net"],["loopy","➰ Slitherlink"]] },
        { label: "🕸️ Graph Theory", items: [["untangle","🕸️ Untangle"],["map","🗺️ Map"],["pearl","⚪ Pearl"],["tracks","🛤️ Tracks"],["signpost","🧭 Signpost"],["netslide","🔄 Netslide"]] },
        { label: "🔢 Algebra & Squares", items: [["solo","🔢 Solo (Sudoku)"],["keen","➗ Keen (KenKen)"],["unequal","⚖️ Unequal"],["group","🧮 Group"],["singles","🎯 Singles"]] },
        { label: "🔬 Physics & Optics", items: [["blackbox","🔬 Black Box"],["undead","🪞 Undead"],["magnets","🧲 Magnets"],["inertia","💎 Inertia"],["cube","🧊 Cube"],["galaxies","🌌 Galaxies"]] },
        { label: "🧮 Combinatorics", items: [["pattern","🏁 Pattern"],["mines","💣 Mines"],["dominosa","🁣 Dominosa"],["rect","▭ Rectangles"],["palisade","🧱 Palisade"],["filling","🧩 Filling"],["range","🔭 Range"],["tents","⛺ Tents"],["mosaic","🔳 Mosaic"],["unruly","⚖️ Unruly"]] },
        { label: "🎯 Algorithmic", items: [["flip","💡 Flip"],["guess","🔐 Guess"],["flood","🌊 Flood"],["fifteen","🔢 Fifteen"],["sixteen","🔄 Sixteen"],["twiddle","🌀 Twiddle"],["pegs","📍 Pegs"],["samegame","🧱 Same Game"]] }
      ];
      for (var gIdx = 0; gIdx < labGroups.length; gIdx++) {
        var grp = document.createElement("optgroup");
        grp.label = labGroups[gIdx].label;
        var gItems = labGroups[gIdx].items;
        for (var mIdx = 0; mIdx < gItems.length; mIdx++) {
          var opt = document.createElement("option");
          var targetFile = gItems[mIdx][0] === "loopy" ? "slither.html" : (gItems[mIdx][0] + ".html");
          opt.value = targetFile;
          opt.textContent = gItems[mIdx][1];
          if (gItems[mIdx][0] === puzzleId) opt.selected = true;
          grp.appendChild(opt);
        }
        labSelect.appendChild(grp);
      }
      labSelect.onchange = function () {
        if (labSelect.value) window.location.href = labSelect.value;
      };
      homeLink.parentNode.insertBefore(labSelect, homeLink.nextSibling);
    }

    var topActions = document.querySelector(".eis-topbar-actions");
    if (topActions && !document.getElementById("eis-sound-btn")) {
      var soundBtn = document.createElement("button");
      soundBtn.type = "button";
      soundBtn.id = "eis-sound-btn";
      soundBtn.className = "eis-btn" + (soundEnabled ? " is-active" : "");
      soundBtn.textContent = soundEnabled ? "🔊 Sound" : "🔇 Muted";
      soundBtn.title = "Toggle Smartboard Sound Effects";
      soundBtn.onclick = window.toggleEdugatesSound;
      topActions.insertBefore(soundBtn, topActions.firstChild);
    }

    var timerPill = document.querySelector(".sb-timer-pill");
    if (timerPill && timerPill.parentNode) {
      if (!document.getElementById("sb-moves-display")) {
        var movesPill = document.createElement("div");
        movesPill.className = "sb-moves-pill";
        movesPill.innerHTML = '<span>🎯 Moves:</span><span id="sb-moves-display">0</span>';
        timerPill.parentNode.appendChild(movesPill);
      }
      if (!document.getElementById("sb-best-display")) {
        var bestPill = document.createElement("div");
        bestPill.className = "sb-best-pill";
        bestPill.title = "Personal / Class Best Solve Time";
        bestPill.innerHTML = '<span>🏆 Best:</span><span id="sb-best-display">—</span>';
        timerPill.parentNode.appendChild(bestPill);
      }
    }
    updateBestTimeBadge();

    // 2. Consolidate Secondary Action Bar Buttons into '🛠️ More Tools' Popover
    var actionBar = document.querySelector(".sb-actionbar");
    if (actionBar && !document.getElementById("sb-more-wrap")) {
      var zoomGroup = actionBar.lastElementChild;

      // Inject Palette Switcher if missing
      if (!document.getElementById("sb-palette-bar")) {
        var palBar = document.createElement("div");
        palBar.id = "sb-palette-bar";
        palBar.className = "sb-palette-bar";
        var styles = [
          { id: "studio", label: "🎨 Studio" },
          { id: "parchment", label: "📜 Paper" },
          { id: "blueprint", label: "📐 Blueprint" }
        ];
        for (var sIdx = 0; sIdx < styles.length; sIdx++) {
          (function (st) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "sb-palette-pill" + (currentBoardStyle === st.id ? " active" : "");
            b.setAttribute("data-style", st.id);
            b.textContent = st.label;
            b.onclick = function () { window.setEdugatesBoardStyle(st.id); };
            palBar.appendChild(b);
          })(styles[sIdx]);
        }
        if (zoomGroup) zoomGroup.insertBefore(palBar, zoomGroup.firstChild);
      }

      // Inject Team Scoreboard Toggle & Dock Swap Button
      if (zoomGroup) {
        var teamToggle = document.createElement("button");
        teamToggle.type = "button";
        teamToggle.id = "sb-team-toggle-btn";
        teamToggle.className = "eis-btn" + (teamsState.open ? " is-active" : "");
        teamToggle.textContent = "🏆 Teams";
        teamToggle.title = "Toggle Classroom 4-Team Scoreboard";
        teamToggle.onclick = window.toggleClassroomTeamBar;
        zoomGroup.appendChild(teamToggle);

        var dockSwap = document.createElement("button");
        dockSwap.type = "button";
        dockSwap.id = "sb-dock-swap-btn";
        dockSwap.className = "eis-btn";
        dockSwap.textContent = currentDockSide === "left" ? "➡️ Dock Right" : "⬅️ Dock Left";
        dockSwap.title = "Move Control Dock to Left or Right Side of Smartboard";
        dockSwap.onclick = window.toggleDockSide;
        zoomGroup.appendChild(dockSwap);

        // Build 🛠️ More Tools Popover
        var moreWrap = document.createElement("div");
        moreWrap.id = "sb-more-wrap";
        moreWrap.className = "sb-more-wrap";

        var moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.className = "eis-btn";
        moreBtn.textContent = "🛠️ Tools ▾";
        moreBtn.title = "Game ID, Seed, Save/Load, Low-CPU & Permalinks";

        var popover = document.createElement("div");
        popover.id = "sb-more-popover";
        popover.className = "sb-more-popover";

        moreBtn.onclick = function (ev) {
          ev.stopPropagation();
          popover.classList.toggle("open");
          playSound("mode");
        };

        document.addEventListener("click", function (ev) {
          if (!moreWrap.contains(ev.target)) {
            popover.classList.remove("open");
          }
        });

        // Shorten the preset label so the actionbar stays on a single row
        var presetLabel = document.querySelector("label[for='sb-preset-select']");
        if (presetLabel) {
          presetLabel.textContent = "📐";
          presetLabel.title = "Size / Difficulty Preset";
        }

        // Move secondary buttons + Manual link into popover so topbars fit on 1 row
        var manualLink = topActions ? topActions.querySelector("a[href^='doc/']") : null;
        if (manualLink) {
          manualLink.textContent = "📖 Full Puzzle Manual";
          popover.appendChild(manualLink);
        }

        var secondaryIds = ["specific", "random", "prefs", "save", "load", "eis-turbo-btn"];
        var labelsMap = {
          specific: "🎯 Enter Game ID",
          random: "🎲 Enter Random Seed",
          prefs: "⚙️ Puzzle Preferences",
          save: "💾 Download Save File",
          load: "📂 Upload Save File"
        };
        for (var k = 0; k < secondaryIds.length; k++) {
          var secEl = document.getElementById(secondaryIds[k]);
          if (secEl) {
            if (labelsMap[secondaryIds[k]]) secEl.textContent = labelsMap[secondaryIds[k]];
            popover.appendChild(secEl);
          }
        }

        moreWrap.appendChild(moreBtn);
        moreWrap.appendChild(popover);
        zoomGroup.appendChild(moreWrap);
      }

      // 3. Safe Solve Confirmation Guard
      var solveBtn = document.getElementById("solve");
      if (solveBtn) {
        var confirmBox = document.createElement("div");
        confirmBox.id = "sb-solve-confirm";
        confirmBox.className = "sb-solve-confirm";
        confirmBox.innerHTML =
          '<span style="font-size:0.86rem;font-weight:800;color:var(--brand-gold)">💡 Reveal full solution? (Assisted solves do not award stars)</span>' +
          '<button type="button" id="sb-confirm-solve-yes" class="eis-btn eis-btn-gold" style="padding:5px 12px;min-height:32px">✅ Reveal Solution</button>' +
          '<button type="button" id="sb-confirm-solve-no" class="eis-btn" style="padding:5px 12px;min-height:32px">Cancel</button>';
        actionBar.appendChild(confirmBox);

        var allowImmediateSolve = false;
        solveBtn.addEventListener("click", function (ev) {
          if (!allowImmediateSolve) {
            ev.stopImmediatePropagation();
            ev.preventDefault();
            confirmBox.classList.toggle("open");
            playSound("mode");
          } else {
            allowImmediateSolve = false;
            wasAutoSolved = true;
          }
        }, true);

        var yesBtn = confirmBox.querySelector("#sb-confirm-solve-yes");
        var noBtn = confirmBox.querySelector("#sb-confirm-solve-no");
        if (yesBtn) {
          yesBtn.onclick = function () {
            confirmBox.classList.remove("open");
            allowImmediateSolve = true;
            wasAutoSolved = true;
            solveBtn.click();
          };
        }
        if (noBtn) {
          noBtn.onclick = function () {
            confirmBox.classList.remove("open");
          };
        }
      }
    }

    // 4. Inject Classroom Team Scoreboard Strip right after .sb-actionbar
    if (actionBar && !document.getElementById("sb-team-bar")) {
      var teamBar = document.createElement("div");
      teamBar.id = "sb-team-bar";
      teamBar.className = "sb-team-bar" + (teamsState.open ? " visible" : "");
      teamBar.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span style="font-size:0.78rem;font-weight:900;text-transform:uppercase;color:var(--brand-gold)">🏆 Classroom Teams:</span>' +
        '</div>' +
        '<div id="sb-teams-list" class="sb-teams-list"></div>' +
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          '<select class="sb-select" style="min-height:30px;padding:3px 8px;font-size:0.78rem" onchange="setBlitzTimerMode(this.value)" title="Stopwatch or Blitz Countdown">' +
            '<option value="0">⏱️ Stopwatch</option>' +
            '<option value="60">⏳ 1m Blitz</option>' +
            '<option value="120">⏳ 2m Blitz</option>' +
            '<option value="180">⏳ 3m Blitz</option>' +
            '<option value="300">⏳ 5m Blitz</option>' +
          '</select>' +
          '<button type="button" class="eis-btn" style="min-height:30px;padding:3px 9px;font-size:0.76rem" onclick="resetClassroomTeamScores()">🔄 Reset Pts</button>' +
        '</div>';
      actionBar.parentNode.insertBefore(teamBar, actionBar.nextSibling);
      renderTeamBar();
    }

    // 5. Inject Ergonomic Bottom Quick-Action Bar under the Canvas
    var boardStage = document.querySelector(".sb-board-stage");
    if (boardStage && !document.getElementById("sb-bottom-quickbar")) {
      var prof = PUZZLE_PROFILES[puzzleId] || { left: "Primary", right: "Secondary", middle: "Aux" };
      var quickBar = document.createElement("div");
      quickBar.id = "sb-bottom-quickbar";
      quickBar.className = "sb-bottom-quickbar";
      quickBar.innerHTML =
        '<div class="sb-quickbar-group">' +
          '<span style="font-size:0.74rem;font-weight:800;color:var(--text-muted);text-transform:uppercase">👇 Quick Reach:</span>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn active" data-mode="0" onclick="setClickMode(0)">👆 ' + prof.left + '</button>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn" data-mode="2" onclick="setClickMode(2)">🚩 ' + prof.right + '</button>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn" data-mode="1" onclick="setClickMode(1)">🔒 ' + prof.middle + '</button>' +
        '</div>' +
        '<div class="sb-quickbar-group">' +
          '<button type="button" class="sb-quick-pill" onclick="document.getElementById(\'undo\').click()">↩️ Undo</button>' +
          '<button type="button" class="sb-quick-pill" onclick="document.getElementById(\'redo\').click()">↪️ Redo</button>' +
          '<button type="button" class="sb-quick-pill" onclick="document.getElementById(\'new\').click()">🆕 New</button>' +
        '</div>';
      boardStage.appendChild(quickBar);
    }

    // 6. Smart D-Pad Accordion & Structured Quick-Start Rules in Dock
    var dockCards = document.querySelectorAll(".sb-control-dock .sb-dock-card");
    if (dockCards.length >= 3) {
      var dpadCard = dockCards[2];
      var profDpad = PUZZLE_PROFILES[puzzleId] || {};
      var dpadTitle = dpadCard.querySelector(".sb-dock-title");
      var dpadGrid = dpadCard.querySelector(".sb-dpad-grid");
      if (dpadTitle && dpadGrid && !dpadCard.hasAttribute("data-accordion-init")) {
        dpadCard.setAttribute("data-accordion-init", "true");
        var bodyWrap = document.createElement("div");
        bodyWrap.className = "sb-accordion-body";
        while (dpadTitle.nextSibling) {
          bodyWrap.appendChild(dpadTitle.nextSibling);
        }
        dpadCard.appendChild(bodyWrap);
        dpadTitle.classList.add("clickable-accordion");
        var shouldOpen = !!profDpad.dpadOpen;
        if (shouldOpen) dpadCard.classList.add("expanded");
        var indicator = dpadTitle.querySelector("span:last-child");
        if (indicator) indicator.textContent = shouldOpen ? "▼ Hide" : "▶ Show 8-Way Pad";
        dpadTitle.onclick = function () {
          var isExp = dpadCard.classList.toggle("expanded");
          if (indicator) indicator.textContent = isExp ? "▼ Hide" : "▶ Show 8-Way Pad";
          playSound("mode");
        };
      }
    }

    // Enhance Rules Card with 3-Bullet Quick-Start Summary
    var rulesBox = document.querySelector(".sb-rules-box");
    if (rulesBox && !document.getElementById("sb-quickstart-list")) {
      var pProf = PUZZLE_PROFILES[puzzleId] || { left: "Primary Action", right: "Secondary Mark", keys: [] };
      var qsDiv = document.createElement("div");
      qsDiv.id = "sb-quickstart-list";
      qsDiv.className = "sb-quickstart-list";
      var keySummary = (pProf.keys && pProf.keys.length > 0) ? "Use Touch Keypad or Board Tap" : "Direct Touch / Drag on Board";
      qsDiv.innerHTML =
        '<div class="sb-quickstart-item"><strong>👆 Left Tap:</strong> <span>' + pProf.left + '</span></div>' +
        '<div class="sb-quickstart-item"><strong>🚩 Right Tap:</strong> <span>' + pProf.right + '</span></div>' +
        '<div class="sb-quickstart-item"><strong>⚡ Controls:</strong> <span>' + keySummary + '</span></div>';
      rulesBox.parentNode.insertBefore(qsDiv, rulesBox);
    }
  }

  function buildSmartboardControls() {
    var puzzleId = getCurrentPuzzleId();
    if (!puzzleId) return;
    var prof = PUZZLE_PROFILES[puzzleId] || { left: "Primary Action", right: "Secondary / Mark", middle: "Aux Action", keys: [] };

    var leftHint = document.getElementById("sb-left-hint");
    var rightHint = document.getElementById("sb-right-hint");
    if (leftHint) leftHint.textContent = prof.left;
    if (rightHint) rightHint.textContent = prof.right;

    var keypadCard = document.getElementById("sb-keypad-card");
    var keypadContainer = document.getElementById("sb-keypad-grid");
    if (keypadContainer && keypadCard) {
      if (!prof.keys || prof.keys.length === 0) {
        keypadCard.style.display = "none";
      } else {
        keypadCard.style.display = "";
        keypadContainer.innerHTML = "";
        for (var i = 0; i < prof.keys.length; i++) {
          var item = prof.keys[i];
          var kVal = typeof item === "string" ? item : item.k;
          var kLabel = typeof item === "string" ? item.toUpperCase() : item.label;
          var kCls = typeof item === "object" && item.cls ? (" " + item.cls) : "";
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "sb-key-btn" + kCls;
          btn.textContent = kLabel;
          (function (keyToSend) {
            btn.onclick = function () { sendPuzzleKey(keyToSend); };
          })(kVal);
          keypadContainer.appendChild(btn);
        }
      }
    }

    var newBtn = document.getElementById("new");
    var restartBtn = document.getElementById("restart");
    var undoBtn = document.getElementById("undo");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
        playSound("mode");
      });
    }
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
        playSound("undo");
      });
    }
    if (undoBtn) {
      undoBtn.addEventListener("click", function () {
        playSound("undo");
      });
    }
  }

  // ==========================================================================
  // 11. PORTAL HUB (index.html) GAMIFICATION & DISCOVERY INITIALIZER
  // ==========================================================================
  function initHubPortalEnhancements() {
    var grid = document.getElementById("puzzleGrid");
    if (!grid) return; // Not on index.html

    var mastery = loadMasteryData();
    var summary = getMasterySummary();
    var daily = getDailyChallenge();

    // Update Hero Mastery Strip if present
    var rankEl = document.getElementById("hub-stat-rank");
    var starsEl = document.getElementById("hub-stat-stars");
    var solvedEl = document.getElementById("hub-stat-solved");
    var streakEl = document.getElementById("hub-stat-streak");
    if (rankEl) rankEl.textContent = "🏅 " + summary.rankTitle;
    if (starsEl) starsEl.textContent = "⭐ " + summary.totalStars + " / 123";
    if (solvedEl) solvedEl.textContent = "✅ " + summary.solvedPuzzlesCount + " / 41 Labs";
    if (streakEl) streakEl.textContent = "🔥 " + summary.streak + (summary.streak === 1 ? " Day" : " Days");

    var statBoxes = document.querySelectorAll(".hub-mastery-strip .hub-stat-box");
    for (var sbIdx = 0; sbIdx < statBoxes.length; sbIdx++) {
      statBoxes[sbIdx].title = "Tap to Open Classroom Trophy Room & Team Standings";
      statBoxes[sbIdx].onclick = window.openTrophyRoomModal;
    }

    if (window.location.search.indexOf("trophy=1") !== -1) {
      setTimeout(function () { window.openTrophyRoomModal(); }, 120);
    }

    // Populate Daily STEM Olympiad Challenge Card if present
    var dailyContainer = document.getElementById("hub-daily-card");
    if (dailyContainer && daily) {
      dailyContainer.innerHTML =
        '<div class="hub-daily-header">' +
          '<span class="hub-daily-tag">🏆 Daily STEM Olympiad Challenge</span>' +
          '<span class="hub-daily-date">📅 ' + daily.date + '</span>' +
        '</div>' +
        '<div class="hub-daily-body">' +
          '<img src="' + daily.thumb + '" alt="' + daily.title + '" class="hub-daily-thumb">' +
          '<div class="hub-daily-info">' +
            '<h3>' + daily.title + '</h3>' +
            '<p>' + daily.desc + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="hub-daily-footer">' +
          '<span style="font-size:0.76rem;font-weight:800;color:' + (daily.completed ? 'var(--brand-green)' : 'var(--brand-gold)') + '">' +
            (daily.completed ? '✅ Completed Today!' : '⚡ ' + daily.domain) +
          '</span>' +
          '<a href="' + daily.href + '" class="eis-btn eis-btn-gold" style="min-height:34px;padding:6px 14px">' +
            (daily.completed ? '🔄 Play Again →' : '🚀 Launch Daily →') +
          '</a>' +
        '</div>';
    }

    // Enhance all 41 Puzzle Cards with Difficulty Tier, Stars & Best Time
    var cards = grid.querySelectorAll(".puzzle-card");
    var diffLabels = {
      starter: { text: "🟢 Starter", cls: "diff-starter" },
      intermediate: { text: "🟡 Intermediate", cls: "diff-intermediate" },
      olympiad: { text: "🔴 Olympiad", cls: "diff-olympiad" }
    };

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var href = card.getAttribute("href") || "";
      var pId = href.replace(".html", "").toLowerCase();
      if (pId === "slither") pId = "loopy";

      var diffKey = PUZZLE_DIFFICULTY[pId] || "intermediate";
      card.setAttribute("data-diff", diffKey);

      var pRec = mastery.puzzles[pId];
      var isSolved = !!(pRec && pRec.solvedCount > 0);
      card.setAttribute("data-solved", isSolved ? "true" : "false");
      card.classList.toggle("is-solved", isSolved);

      if (!card.querySelector(".puzzle-card-meta")) {
        var metaRow = document.createElement("div");
        metaRow.className = "puzzle-card-meta";

        var dInfo = diffLabels[diffKey] || diffLabels.intermediate;
        var starCount = (pRec && pRec.stars) || 0;
        var starStr = "";
        for (var s = 0; s < 3; s++) starStr += (s < starCount ? "★" : "☆");

        var timeLabel = isSolved && pRec.bestTime !== null
          ? ("⏱️ Best " + formatTime(pRec.bestTime))
          : "⏱️ Unplayed";

        metaRow.innerHTML =
          '<span class="diff-badge ' + dInfo.cls + '">' + dInfo.text + '</span>' +
          '<span class="card-stars" title="Mastery Stars">' + starStr + '</span>' +
          '<span class="card-best-time">' + timeLabel + '</span>';

        var footer = card.querySelector(".puzzle-card-footer");
        if (footer) {
          card.insertBefore(metaRow, footer);
        } else {
          card.appendChild(metaRow);
        }
      }
    }
  }

  // Random 'Surprise Me' Puzzle Launcher for Hub
  window.launchRandomPuzzle = function () {
    var cards = document.querySelectorAll("#puzzleGrid .puzzle-card");
    var visibleCards = [];
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].style.display !== "none") visibleCards.push(cards[i]);
    }
    if (visibleCards.length === 0) visibleCards = Array.prototype.slice.call(cards);
    if (visibleCards.length === 0) return;

    playSound("victory");
    var chosen = visibleCards[Math.floor(Math.random() * visibleCards.length)];
    chosen.scrollIntoView({ behavior: "smooth", block: "center" });
    chosen.classList.add("spotlight-pulse");
    setTimeout(function () {
      window.location.href = chosen.getAttribute("href");
    }, 420);
  };

  // ==========================================================================
  // 11B. CLASSROOM TROPHY ROOM, ACHIEVEMENTS & HOUSE STANDINGS MODAL
  // ==========================================================================
  function computeOlympiadBadges() {
    var data = loadMasteryData();
    var pMap = data.puzzles || {};
    var summary = getMasterySummary();

    function countSolvedInList(list) {
      var c = 0;
      for (var i = 0; i < list.length; i++) {
        if (pMap[list[i]] && pMap[list[i]].solvedCount > 0) c++;
      }
      return c;
    }

    var hasFastSolve = false;
    var pKeys = Object.keys(pMap);
    for (var k = 0; k < pKeys.length; k++) {
      var bt = pMap[pKeys[k]].bestTime;
      if (bt !== null && bt !== undefined && bt <= 60) {
        hasFastSolve = true;
        break;
      }
    }

    var dailyDates = Object.keys(data.dailyCompleted || {});

    return [
      { icon: "🌟", title: "First Axiom", desc: "Complete your first Math-Science puzzle workbench.", unlocked: summary.solvedPuzzlesCount >= 1 },
      { icon: "⚡", title: "Speed Tactician", desc: "Solve any workbench in under 60 seconds.", unlocked: hasFastSolve },
      { icon: "🌉", title: "Graph Theorist", desc: "Master 3+ Graph Theory & Topology workbenches.", unlocked: countSolvedInList(["bridges","slant","net","loopy","untangle","map","pearl","tracks","signpost","netslide"]) >= 3 },
      { icon: "🔢", title: "Algebra Virtuoso", desc: "Master 3+ Latin Squares & Abstract Algebra labs.", unlocked: countSolvedInList(["towers","solo","keen","unequal","group","singles"]) >= 3 },
      { icon: "🔬", title: "Quantum Physicist", desc: "Master 3+ Ray Optics, Polarity & 3D Geometry labs.", unlocked: countSolvedInList(["lightup","blackbox","undead","magnets","inertia","cube","galaxies"]) >= 3 },
      { icon: "🧮", title: "Combinatorialist", desc: "Master 5+ Combinatorics & Grid Deduction labs.", unlocked: countSolvedInList(["pattern","mines","dominosa","rect","palisade","filling","range","tents","mosaic","unruly"]) >= 5 },
      { icon: "📅", title: "Daily Olympian", desc: "Complete a Daily STEM Olympiad Challenge.", unlocked: dailyDates.length >= 1 },
      { icon: "👑", title: "Olympiad Grandmaster", desc: "Earn 30+ total Mastery Stars across the lab.", unlocked: summary.totalStars >= 30 }
    ];
  }

  window.openTrophyRoomModal = function () {
    playSound("mode");
    var backdrop = document.getElementById("eis-trophy-modal");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.id = "eis-trophy-modal";
      backdrop.className = "eis-modal-backdrop";
      backdrop.onclick = function (e) {
        if (e.target === backdrop) backdrop.classList.remove("open");
      };
      document.body.appendChild(backdrop);
    }

    var summary = getMasterySummary();
    var badges = computeOlympiadBadges();
    var unlockedCount = 0;
    for (var i = 0; i < badges.length; i++) {
      if (badges[i].unlocked) unlockedCount++;
    }

    var teamsHtml = "";
    for (var tIdx = 0; tIdx < teamsState.teams.length; tIdx++) {
      var t = teamsState.teams[tIdx];
      teamsHtml +=
        '<div class="sb-team-chip' + (teamsState.activeIdx === tIdx ? ' active-turn' : '') + '" style="flex:1;min-width:165px;justify-content:space-between" onclick="window.__selectModalTeam(' + tIdx + ')">' +
          '<div style="display:flex;align-items:center;gap:6px">' +
            '<span class="sb-team-dot" style="background:' + t.color + '"></span>' +
            '<span class="sb-team-name">' + t.name + '</span>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:5px">' +
            '<span class="sb-team-score">' + t.score + '</span>' +
            '<button type="button" class="sb-team-btn" onclick="event.stopPropagation();window.__adjModalTeam(' + tIdx + ',-5)">−</button>' +
            '<button type="button" class="sb-team-btn" onclick="event.stopPropagation();window.__adjModalTeam(' + tIdx + ',10)">+</button>' +
          '</div>' +
        '</div>';
    }

    var badgesHtml = "";
    for (var bIdx = 0; bIdx < badges.length; bIdx++) {
      var b = badges[bIdx];
      badgesHtml +=
        '<div class="eis-badge-card' + (b.unlocked ? ' unlocked' : '') + '">' +
          '<div class="eis-badge-icon"><span>' + b.icon + '</span><span style="font-size:0.72rem;font-weight:800;color:' + (b.unlocked ? 'var(--brand-green)' : 'var(--text-muted)') + '">' + (b.unlocked ? '✅ UNLOCKED' : '🔒 LOCKED') + '</span></div>' +
          '<div class="eis-badge-title">' + b.title + '</div>' +
          '<div class="eis-badge-desc">' + b.desc + '</div>' +
        '</div>';
    }

    backdrop.innerHTML =
      '<div class="eis-modal-card">' +
        '<div class="eis-modal-header">' +
          '<h2>🏆 Edugates Math-Science Team — Trophy Room & House Standings</h2>' +
          '<button type="button" class="eis-btn" onclick="document.getElementById(\'eis-trophy-modal\').classList.remove(\'open\')">✖ Close</button>' +
        '</div>' +
        '<div class="hub-mastery-strip" style="border-top:none;padding-top:0">' +
          '<div class="hub-stat-box"><span class="hub-stat-label">Current Rank</span><span class="hub-stat-val gold">🏅 ' + summary.rankTitle + '</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">Mastery Stars</span><span class="hub-stat-val gold">⭐ ' + summary.totalStars + ' / 123</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">Labs Solved</span><span class="hub-stat-val teal">✅ ' + summary.solvedPuzzlesCount + ' / 41</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">Olympiad Badges</span><span class="hub-stat-val green">🎖️ ' + unlockedCount + ' / 8</span></div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:0.84rem;font-weight:900;text-transform:uppercase;color:var(--brand-teal)">🏅 Classroom House / Team Standings</span>' +
            '<button type="button" class="eis-btn" style="min-height:28px;padding:3px 10px;font-size:0.75rem" onclick="resetClassroomTeamScores();openTrophyRoomModal()">🔄 Reset Team Scores</button>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + teamsHtml + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:0.84rem;font-weight:900;text-transform:uppercase;color:var(--brand-gold);margin-bottom:8px">🎖️ STEM Olympiad Achievement Badges (' + unlockedCount + ' / 8 Unlocked)</div>' +
          '<div class="eis-badges-grid">' + badgesHtml + '</div>' +
        '</div>' +
      '</div>';

    backdrop.classList.add("open");
  };

  window.__selectModalTeam = function (idx) {
    teamsState.activeIdx = idx;
    saveTeamsState();
    renderTeamBar();
    window.openTrophyRoomModal();
  };

  window.__adjModalTeam = function (idx, delta) {
    teamsState.teams[idx].score = Math.max(0, teamsState.teams[idx].score + delta);
    saveTeamsState();
    playSound(delta > 0 ? "key" : "undo");
    renderTeamBar();
    window.openTrophyRoomModal();
  };

  // ==========================================================================
  // 12. BOOTSTRAP & LIFECYCLE HOOKS
  // ==========================================================================
  var postInitDone = false;
  window.__edugatesPostInit = function () {
    if (postInitDone) return;
    postInitDone = true;
    if (window.location.search.indexOf("teams=1") !== -1) {
      teamsState.open = true;
    }
    upgradePuzzleWorkspaceUI();
    syncPresetsDropdown();
    buildSmartboardControls();
    initAnnotationLayer();
    startClassroomTimer();
    if (window.__edugatesForceRedraw) {
      window.__edugatesForceRedraw();
    }
    setTimeout(function () {
      autoFitBoard(1.0);
      if (window.location.search.indexOf("victory=1") !== -1) {
        timerSeconds = 68;
        moveCount = 24;
        window.__edugatesOnStatus("COMPLETED!");
      }
    }, 50);
  };

  var resizeRaf = null;
  window.addEventListener("resize", function () {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      autoFitBoard(currentZoomScale);
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body && document.body.classList.contains("puzzle-page")) {
      upgradePuzzleWorkspaceUI();
    } else {
      initHubPortalEnhancements();
    }

    var themeBtn = document.getElementById("eis-theme-btn");
    if (themeBtn) {
      var isDay = document.documentElement.getAttribute("data-theme") === "day";
      themeBtn.textContent = isDay ? "🌙 Dark Board" : "☀️ Light Board";
    }
    var turboBtn = document.getElementById("eis-turbo-btn");
    if (turboBtn) {
      turboBtn.textContent = window.__EDUGATES_PERF_LITE__ ? "⚡ Low-CPU: ON" : "🖥️ HD Mode";
      turboBtn.classList.toggle("is-active", window.__EDUGATES_PERF_LITE__);
    }
  });
})();
