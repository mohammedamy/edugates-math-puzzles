/* ==========================================================================
   Edugates International School — Math-Science Team
   Smartboard & Low-Processor Optimization + In-Game Graphics Polish Engine
   ========================================================================== */

(function () {
  "use strict";

  // 1. Hardware & Low-Processor Smartboard Auto-Optimizer
  var savedPerf = localStorage.getItem("edugates_math_lowcpu");
  var isLowCpu = savedPerf !== "false"; // Default ON for Smartboards
  window.__EDUGATES_PERF_LITE__ = isLowCpu;
  window.__EDUGATES_DPR__ = isLowCpu ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  window.__EDUGATES_CLICK_MODE__ = 0; // 0 = Left, 2 = Right (Mark), 1 = Middle (Lock)
  window.__EDUGATES_ANNOTATE_ACTIVE__ = false;

  // Apply saved theme (night by default for LED smartboards, day for bright projectors)
  var savedTheme = localStorage.getItem("edugates_math_theme") || "night";
  if (savedTheme === "day") {
    document.documentElement.setAttribute("data-theme", "day");
  }

  // Saved In-Game Board Palette Style: "studio" (default), "parchment", "blueprint"
  var currentBoardStyle = localStorage.getItem("edugates_board_style") || "studio";

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

  // Detect current puzzle ID from body attribute or script tag
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
  // 2. IN-GAME GRAPHICS POLISH ENGINE (Curated Palettes & Vector Primitives)
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

  // Per-Puzzle Exact Colour Index Remapping
  function getPuzzlePaletteOverride(puzzleId, idx, s) {
    switch (puzzleId) {
      case "bridges":
        // 0:BG, 1:FG, 2:HIGHLIGHT, 3:LOWLIGHT, 4:SELECTED, 5:MARK, 6:HINT, 7:GRID, 8:WARNING, 9:CURSOR
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
        // 0:BG, 1:GRID, 2:USER, 3:HIGHLIGHT, 4:ERROR, 5:PENCIL, 6:DONE
        if (idx === 0) return s.bg;
        if (idx === 1) return s.ink;
        if (idx === 2) return s.user;
        if (idx === 3) return s.select;
        if (idx === 4) return s.err;
        if (idx === 5) return s.pencil;
        if (idx === 6) return "#94a3b8";
        break;

      case "lightup":
        // 0:BG, 1:GRID, 2:BLACK, 3:LIGHT, 4:LIT, 5:ERROR, 6:CURSOR
        if (idx === 0) return s.tile;
        if (idx === 1) return s.lo;
        if (idx === 2) return "#0f172a";
        if (idx === 3) return "#ffffff";
        if (idx === 4) return s.lit;
        if (idx === 5) return s.err;
        if (idx === 6) return "#0284c7";
        break;

      case "slant":
        // 0:BG, 1:GRID, 2:INK, 3:SLANT1, 4:SLANT2, 5:ERROR, 6:CURSOR, 7:FILLEDSQUARE, 8:GROUNDED
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
        // 0:BG, 1:LOCKED/FLASH, 2:BORDER, 3:WIRE, 4:ENDPOINT, 5:POWERED, 6:BARRIER, 7:ERR/LOWLIGHT
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
        // 0:BG, 1:FG, 2:LINEUNKNOWN, 3:HIGHLIGHT, 4:MISTAKE, 5:SATISFIED, 6:CURSOR, 7:FAINT
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
        // 0:BG, 1:XDIAGONALS, 2:GRID, 3:GRID_BLOCK, 4:CLUE, 5:USER, 6:HIGHLIGHT, 7:ERROR, 8:PENCIL, 9:KILLER
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
        // 0:BG, 1:GRID, 2:BLOCK_BORDER/USER, 3:USER/HIGHLIGHT, 4:HIGHLIGHT/ERROR, 5:ERROR/PENCIL, 6:PENCIL/DIAG
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
        // 0:BG, 1:GRID, 2:TEXT, 3:GUESS, 4:ERROR, 5:PENCIL, 6:HIGHLIGHT, 7:LOWLIGHT
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
        // 0:BG, 1:WHITEBG, 2:BLACKBG, 3:WHITEDOT, 4:BLACKDOT, 5:GRID, 6:EDGE, 7:ARROW, 8:CURSOR
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
        // 0:BG, 1:GRID, 2:GRASS, 3:TREETRUNK, 4:TREELEAF, 5:TENT, 6:ERROR, 7:ERRTEXT, 8:ERRTRUNK
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
        // 0:SYSBG, 1:BG, 2:LINE, 3:CROSSEDLINE, 4:OUTLINE, 5:POINT, 6:DRAGPOINT, 7:CURSORPOINT, 8:NEIGHBOUR
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
    }
    return null;
  }

  // Universal Smart RGB Harmonizer for all 41 Puzzles
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

    // Pure black -> Deep Oxford Navy
    if (r === 0 && g === 0 && b === 0) return s.ink;
    // Pure white -> Pure white
    if (r === 255 && g === 255 && b === 255) return "#ffffff";

    // Pure / harsh red -> Modern Crimson Rose
    if (r > 200 && g < 80 && b < 80) return s.err;
    // Dark user green (0, ~130, 0) -> Vibrant Royal Blue
    if (r < 40 && g > 90 && g < 190 && b < 40) return s.user;
    // Bright neon green -> Emerald
    if (r < 90 && g >= 190 && b < 90) return "#10b981";
    // Pure blue -> Royal Blue
    if (r < 50 && g < 50 && b > 190) return "#2563eb";
    // Pure yellow -> Warm Amber Glow
    if (r > 210 && g > 210 && b < 60) return s.lit;
    // Pure cyan -> Vibrant Teal
    if (r < 50 && g > 200 && b > 200) return "#06b6d4";

    // Neutral greys (bevels, grid lines, tile faces) -> Harmonized slate
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

  // Custom Enhanced Rectangle Renderer
  window.__edugatesDrawRect = function (ctx, x, y, w, h, colour, colours) {
    var puzzleId = getCurrentPuzzleId();
    var colStr = colours[colour] || "#000000";

    // 1. Light Up custom 3D walls, glowing lit corridors & rounded impossible marks
    if (puzzleId === "lightup") {
      // Right-click "No-Light" dot marker (small black square in center of cell)
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
      // Black Wall Block (3D machined slate block)
      if (colour === 2 && w >= 18 && h >= 18) {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(x, y, w, h);
        // Top/left bevel highlight
        ctx.fillStyle = "#334155";
        ctx.fillRect(x + 1, y + 1, w - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, h - 2);
        // Inner dark plate
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
        return;
      }
      // Lit Corridor Square (warm golden sunlight glow)
      if (colour === 4 && w >= 18 && h >= 18) {
        ctx.fillStyle = colStr;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#fef9c3";
        ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
        return;
      }
    }

    // 2. Bridges dimensional bridge planks
    if (puzzleId === "bridges" && (colour === 1 || colour === 4 || colour === 8)) {
      ctx.fillStyle = colStr;
      ctx.fillRect(x, y, w, h);
      // Horizontal bridge plank highlight stripe
      if (w > h * 1.4 && h >= 3 && h <= 20) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(x, y + Math.floor(h * 0.25), w, Math.max(1, Math.floor(h * 0.22)));
      } else if (h > w * 1.4 && w >= 3 && w <= 20) {
        // Vertical bridge plank highlight stripe
        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(x + Math.floor(w * 0.25), y, Math.max(1, Math.floor(w * 0.22)), h);
      }
      return;
    }

    // Default rectangle fill + subtle top inner highlight on medium grid tiles
    ctx.fillStyle = colStr;
    ctx.fillRect(x, y, w, h);
    if (colour === 0 && w >= 22 && w <= 130 && Math.abs(w - h) <= 4) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(x + 1, y + 1, w - 2, 1.5);
    }
  };

  // Custom Enhanced Circle Renderer (Islands, Glowing Lightbulbs, Vertex Clues, 3D Tokens)
  window.__edugatesDrawCircle = function (ctx, x, y, r, fill, outline, colours) {
    var puzzleId = getCurrentPuzzleId();
    var cx = x + 0.5;
    var cy = y + 0.5;

    // 1. Light Up: Glowing Multi-Ring Lightbulb
    if (puzzleId === "lightup" && r >= 5 && (fill === 3 || fill === 5)) {
      var isErr = (fill === 5);
      // Outer warm aura
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.16, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "rgba(225, 29, 72, 0.25)" : "rgba(245, 158, 11, 0.30)";
      ctx.fill();

      // Bulb glass body
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "#ffe4e6" : "#fffbeb";
      ctx.fill();
      ctx.lineWidth = Math.max(1.8, r * 0.16);
      ctx.strokeStyle = isErr ? "#e11d48" : "#d97706";
      ctx.stroke();

      // Glowing filament core
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.52, 0, 2 * Math.PI);
      ctx.fillStyle = isErr ? "#f43f5e" : "#f59e0b";
      ctx.fill();

      // Specular reflection dot
      ctx.beginPath();
      ctx.arc(cx - r * 0.28, cy - r * 0.28, Math.max(1.3, r * 0.18), 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      return;
    }

    // 2. Bridges: Tactile 3D Island Medallions
    if (puzzleId === "bridges" && r >= 7 && fill === outline) {
      var isInnerFace = (fill === 0 || fill === 5 || fill === 9);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      if (isInnerFace) {
        ctx.fillStyle = fill === 5 ? "#dcfce7" : (fill === 9 ? "#fef08a" : "#ffffff");
        ctx.fill();
        // Subtle inner rim
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = fill === 5 ? "#86efac" : "#cbd5e1";
        ctx.stroke();
        // Top crescent sheen
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.82, -0.8 * Math.PI, -0.2 * Math.PI);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();
      } else {
        // Outer island ring
        ctx.fillStyle = colours[fill];
        ctx.fill();
      }
      return;
    }

    // 3. Slant: Elevated Porcelain Vertex Clue Badges
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

    // 4. Loopy / Slitherlink: Crisp Grid Vertex Pins
    if (puzzleId === "loopy" && r <= 6 && fill >= 0) {
      var pinR = Math.max(2.2, r + 0.5);
      ctx.beginPath();
      ctx.arc(cx, cy, pinR, 0, 2 * Math.PI);
      ctx.fillStyle = colours[fill] || "#0f172a";
      ctx.fill();
      return;
    }

    // 5. General Circle / Sphere Token (Pegs, Pearl, Galaxies, Untangle, Guess, Mines, etc.)
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

    // Add 3D specular highlight arc on larger filled tokens/marbles
    if (fill >= 0 && fill !== 0 && r >= 6) {
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.68, -0.78 * Math.PI, -0.18 * Math.PI);
      ctx.lineWidth = Math.max(1.2, r * 0.14);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
      ctx.stroke();
    }
  };

  // Custom Enhanced Polygon Renderer (3D Towers Skyscrapers, Net LED Terminals, Tents)
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

      // Towers: True 3D directional lighting on left and bottom skyscraper walls
      if (puzzleId === "towers" && npoints === 4) {
        var isHighlighted = (fill === 3);
        if (xs[0] === xs[1] && xs[2] === xs[3] && xs[2] !== xs[0]) {
          // Left 3D wall of skyscraper
          fillCol = isHighlighted ? "#7dd3fc" : s.wallLeft;
        } else if (ys[0] === ys[1] && ys[2] === ys[3] && ys[2] !== ys[0]) {
          // Bottom 3D wall of skyscraper
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

    // Net / Netslide: Glowing LED core inside terminal endpoint boxes
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

  // Custom Enhanced Line Renderer (Smooth Slant Diagonals, Clean Slitherlink Loops)
  window.__edugatesDrawLine = function (ctx, x1, y1, x2, y2, width, colour, colours) {
    var puzzleId = getCurrentPuzzleId();
    var colStr = colours[colour] || "#0f172a";
    var w = width;

    if (puzzleId === "loopy") {
      // Undecided edge (COL_LINEUNKNOWN = 2) -> thin, clean guide line
      if (colour === 2) {
        w = Math.max(1.25, width * 0.42);
      } else if (colour === 7) {
        // Eliminated edge (COL_FAINT = 7)
        w = 1.0;
      } else if (colour === 1 || colour === 3 || colour === 4) {
        // Active loop edge / highlight / error -> bold, crisp bar
        w = Math.max(2.6, width * 1.28);
      }
    } else if (puzzleId === "slant") {
      // Diagonal slash lines -> smooth thick vector beam
      var dx = Math.abs(x2 - x1);
      var dy = Math.abs(y2 - y1);
      if (dx > 4 && dy > 4 && w <= 1.5) {
        w = 2.25;
      }
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

  // Custom Enhanced Text Renderer (Crisp Bold Clues & Subtle Emboss)
  window.__edugatesDrawText = function (ctx, x, y, halign, colour, fontsize, monospaced, str, colours, canvas_set_font) {
    canvas_set_font(ctx, fontsize, monospaced);
    ctx.textAlign = halign === 0 ? "left" : (halign === 1 ? "center" : "right");
    ctx.textBaseline = "alphabetic";
    var colStr = colours[colour] || "#0f172a";

    // Subtle 1px vertical emboss for main digits (fontsize >= 15)
    if (fontsize >= 15) {
      var isLightText = (colStr === "#ffffff" || colStr === "#fffbeb");
      ctx.fillStyle = isLightText ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.55)";
      ctx.fillText(str, x, y + 1);
    }

    ctx.fillStyle = colStr;
    ctx.fillText(str, x, y);
  };

  // Switch In-Game Board Style Live ("studio", "parchment", "blueprint")
  window.setEdugatesBoardStyle = function (styleName) {
    currentBoardStyle = styleName;
    localStorage.setItem("edugates_board_style", styleName);
    var pills = document.querySelectorAll(".sb-palette-pill");
    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle("active", pills[i].getAttribute("data-style") === styleName);
    }
    if (window.__edugatesForceRedraw) {
      window.__edugatesForceRedraw();
    }
  };

  // ==========================================================================
  // 3. TOUCH CONTROLS, KEYPADS, TIMER & CLASSROOM TOOLS
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

  // Send key event directly to Emscripten C puzzle backend
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
    cwrapKeyFn(keyCode, keyStr, chr, 0, 0, 0);
    if (window.__edugatesOnMove) window.__edugatesOnMove();
    var canvas = document.getElementById("puzzlecanvas");
    if (canvas) canvas.focus();
  }
  window.sendPuzzleKey = sendPuzzleKey;

  // Set Touch Click Mode (0 = Left, 2 = Right, 1 = Middle)
  function setClickMode(mode) {
    window.__EDUGATES_CLICK_MODE__ = mode;
    var btns = document.querySelectorAll(".sb-click-btn");
    for (var i = 0; i < btns.length; i++) {
      var bMode = parseInt(btns[i].getAttribute("data-mode"), 10);
      if (bMode === mode) btns[i].classList.add("active");
      else btns[i].classList.remove("active");
    }
  }
  window.setClickMode = setClickMode;

  // Auto-Fit Puzzle Canvas to Smartboard Stage
  var currentZoomScale = 1.0;
  function autoFitBoard(scaleMultiplier) {
    if (typeof scaleMultiplier === "number") {
      currentZoomScale = Math.max(0.5, Math.min(1.6, scaleMultiplier));
    }
    var viewport = document.querySelector(".sb-canvas-viewport");
    if (!viewport || !window.Module || !window.Module._resize_puzzle) return;
    var dpr = window.__EDUGATES_DPR__ || window.devicePixelRatio || 1;
    var availW = Math.max(260, (viewport.clientWidth - 28) * currentZoomScale);
    var availH = Math.max(260, (viewport.clientHeight - 28) * currentZoomScale);
    try {
      window.Module._resize_puzzle((availW * dpr) | 0, (availH * dpr) | 0);
      syncAnnotationCanvasSize();
    } catch (e) {}
  }
  window.autoFitBoard = autoFitBoard;
  window.zoomBoard = function (delta) {
    if (delta === 0) currentZoomScale = 1.0;
    else currentZoomScale = Math.max(0.55, Math.min(1.5, currentZoomScale + delta));
    autoFitBoard(currentZoomScale);
  };

  // Sync Difficulty / Preset Select Dropdown from #gametype
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
      setTimeout(function () { autoFitBoard(1.0); }, 40);
      resetTimer();
    };
  }

  // Classroom Stopwatch Timer & Move Counter
  var timerSeconds = 0;
  var moveCount = 0;
  var timerPaused = false;
  var timerSolved = false;
  var timerInterval = null;

  function formatTime(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
  }

  function updateTimerDisplay() {
    var el = document.getElementById("sb-timer-display");
    if (el) el.textContent = formatTime(timerSeconds);
    var mEl = document.getElementById("sb-moves-display");
    if (mEl) mEl.textContent = String(moveCount);
  }

  function startClassroomTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
      if (!timerPaused && !timerSolved && !document.hidden) {
        timerSeconds++;
        updateTimerDisplay();
      }
    }, 1000);
  }

  function resetTimer() {
    timerSeconds = 0;
    moveCount = 0;
    timerSolved = false;
    updateTimerDisplay();
    var banner = document.getElementById("sb-victory-banner");
    if (banner) banner.classList.remove("visible");
  }
  window.resetClassroomTimer = resetTimer;

  window.toggleClassroomTimer = function () {
    timerPaused = !timerPaused;
    var btn = document.getElementById("sb-timer-toggle");
    if (btn) btn.textContent = timerPaused ? "▶️" : "⏸️";
  };

  // Status Bar & Victory Detection Hook
  window.__edugatesOnStatus = function (txt) {
    var banner = document.getElementById("sb-victory-banner");
    var victoryTime = document.getElementById("sb-victory-time");
    if (!banner) return;
    if (txt && txt.indexOf("COMPLETED") !== -1 && txt.indexOf("Auto-solved") === -1) {
      timerSolved = true;
      if (victoryTime) victoryTime.textContent = "Solved in " + formatTime(timerSeconds) + " (" + moveCount + " actions)!";
      banner.classList.add("visible");
    } else if (txt && txt.indexOf("COMPLETED") === -1) {
      banner.classList.remove("visible");
    }
  };

  var pulseTimeout = null;
  window.__edugatesOnMove = function () {
    moveCount++;
    updateTimerDisplay();
    var resDiv = document.getElementById("resizable");
    if (resDiv) {
      resDiv.classList.add("move-pulse");
      if (pulseTimeout) clearTimeout(pulseTimeout);
      pulseTimeout = setTimeout(function () {
        resDiv.classList.remove("move-pulse");
      }, 160);
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

  // Teacher Board Pen / Scratchpad Overlay
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
    }
  };

  // Global Header Controls (Theme, Low-CPU Turbo, Fullscreen)
  window.toggleEdugatesTheme = function () {
    var cur = document.documentElement.getAttribute("data-theme") === "day" ? "day" : "night";
    var next = cur === "day" ? "night" : "day";
    if (next === "day") document.documentElement.setAttribute("data-theme", "day");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("edugates_math_theme", next);
    var btn = document.getElementById("eis-theme-btn");
    if (btn) btn.textContent = next === "day" ? "🌙 Dark Board" : "☀️ Light Board";
  };

  window.toggleLowCpuTurbo = function () {
    window.__EDUGATES_PERF_LITE__ = !window.__EDUGATES_PERF_LITE__;
    window.__EDUGATES_DPR__ = window.__EDUGATES_PERF_LITE__ ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    localStorage.setItem("edugates_math_lowcpu", window.__EDUGATES_PERF_LITE__ ? "true" : "false");
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

  // Inject Live Moves Pill & In-Game Board Style Switcher into Action Bar
  function injectInGamePolishControls() {
    var timerPill = document.querySelector(".sb-timer-pill");
    if (timerPill && !document.getElementById("sb-moves-display")) {
      var movesPill = document.createElement("div");
      movesPill.className = "sb-moves-pill";
      movesPill.title = "Total Moves / Actions in Current Puzzle";
      movesPill.innerHTML = '<span>🎯 Moves:</span><span id="sb-moves-display">0</span>';
      if (timerPill.parentNode) {
        timerPill.parentNode.appendChild(movesPill);
      }
    }

    var actionBar = document.querySelector(".sb-actionbar");
    if (actionBar && !document.getElementById("sb-palette-bar")) {
      var zoomGroup = actionBar.lastElementChild;
      var palBar = document.createElement("div");
      palBar.id = "sb-palette-bar";
      palBar.className = "sb-palette-bar";
      palBar.title = "Switch In-Game Canvas Graphics Theme";
      var styles = [
        { id: "studio", label: "🎨 Studio" },
        { id: "parchment", label: "📜 Paper" },
        { id: "blueprint", label: "📐 Blueprint" }
      ];
      for (var i = 0; i < styles.length; i++) {
        var st = styles[i];
        var b = document.createElement("button");
        b.type = "button";
        b.className = "sb-palette-pill" + (currentBoardStyle === st.id ? " active" : "");
        b.setAttribute("data-style", st.id);
        b.textContent = st.label;
        (function (sid) {
          b.onclick = function () { window.setEdugatesBoardStyle(sid); };
        })(st.id);
        palBar.appendChild(b);
      }
      if (zoomGroup) {
        zoomGroup.insertBefore(palBar, zoomGroup.firstChild);
      } else {
        actionBar.appendChild(palBar);
      }
    }
  }

  // Build Puzzle-Specific Touch Keypad & Click Mode Labels
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

    // Hook New Game & Restart buttons to also reset the classroom timer & clear ink
    var newBtn = document.getElementById("new");
    var restartBtn = document.getElementById("restart");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
      });
    }
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
      });
    }
  }

  // Hook into _js_post_init so that as soon as WASM finishes booting, we apply our polished palette, sync presets & auto-fit the board
  var postInitDone = false;
  window.__edugatesPostInit = function () {
    if (postInitDone) return;
    postInitDone = true;
    injectInGamePolishControls();
    syncPresetsDropdown();
    buildSmartboardControls();
    initAnnotationLayer();
    startClassroomTimer();
    if (window.__edugatesForceRedraw) {
      window.__edugatesForceRedraw();
    }
    setTimeout(function () { autoFitBoard(1.0); }, 50);
  };

  // Throttled window resize handler for Smartboard orientation/fullscreen changes
  var resizeRaf = null;
  window.addEventListener("resize", function () {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      autoFitBoard(currentZoomScale);
    });
  });

  // Initialize header button states on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", function () {
    injectInGamePolishControls();
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
