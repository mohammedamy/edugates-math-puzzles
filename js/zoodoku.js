/*
 * js/zoodoku.js — Authentic ZooDoku Engine (Star Battle 1-Star / Queens Habitat Logic)
 * Modeled faithfully after ZooDoku (com.nebula.zoodoku & zoodoku.org)
 * Edugates International School — Math-Science Team Smartboard Edition
 *
 * Core Rules:
 *   1. Place exactly ONE animal in every horizontal row.
 *   2. Place exactly ONE animal in every vertical column.
 *   3. Place exactly ONE animal in every colored habitat region.
 *   4. No two animals may touch — not even diagonally (King-graph independence).
 *   5. Every puzzle has a single unique solution solvable by pure logical deduction.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // 1. CONSTANTS, HABITAT PALETTES, MASCOTS & PRESETS
  // ---------------------------------------------------------------------------
  var CELL_EMPTY = 0;
  var CELL_MANUAL_X = 1;
  var CELL_AUTO_X = 2;
  var CELL_ANIMAL = 3;

  var ANIMALS = [
    { emoji: "🦁", en: "Lion", ar: "الأسد", sci: "Panthera leo" },
    { emoji: "🐱", en: "Cat", ar: "القط", sci: "Felis catus" },
    { emoji: "🐼", en: "Giant Panda", ar: "الباندا العملاقة", sci: "Ailuropoda melanoleuca" },
    { emoji: "🦊", en: "Red Fox", ar: "الثعلب الأحمر", sci: "Vulpes vulpes" },
    { emoji: "🐸", en: "Tree Frog", ar: "ضفدع الأشجار", sci: "Hyla arborea" },
    { emoji: "🐶", en: "Dog", ar: "الكلب", sci: "Canis familiaris" },
    { emoji: "🐮", en: "Dairy Cow", ar: "البقرة", sci: "Bos taurus" },
    { emoji: "🐨", en: "Koala", ar: "الكوالا", sci: "Phascolarctos cinereus" },
    { emoji: "🦉", en: "Eagle Owl", ar: "البومة", sci: "Bubo bubo" },
    { emoji: "🦒", en: "Giraffe", ar: "الزرافة", sci: "Giraffa camelopardalis" },
    { emoji: "🐯", en: "Bengal Tiger", ar: "النمر البنغالي", sci: "Panthera tigris" },
    { emoji: "🐵", en: "Macaque Monkey", ar: "القرد", sci: "Macaca sylvanus" }
  ];

  // Authentic zoodoku.org & com.nebula.zoodoku 12-region habitat colors
  var HABITAT_COLORS = [
    { studio: "#96c28a", paper: "#b6d4a8", blueprint: "#88c096", en: "Meadow Green", ar: "الأخضر العشبي" },
    { studio: "#f272ad", paper: "#f3a0c5", blueprint: "#ec7eb2", en: "Flamingo Pink", ar: "الوردي" },
    { studio: "#ffc52e", paper: "#f9d678", blueprint: "#f6c445", en: "Savanna Gold", ar: "الذهبي" },
    { studio: "#46c0fc", paper: "#8fd4f8", blueprint: "#5bc4f7", en: "Lagoon Blue", ar: "الأزرق السماوي" },
    { studio: "#9b7bff", paper: "#bcabfa", blueprint: "#a086f9", en: "Orchid Purple", ar: "البنفسجي" },
    { studio: "#f89547", paper: "#f6b480", blueprint: "#f49c56", en: "Sunset Orange", ar: "البرتقالي" },
    { studio: "#3bb4ad", paper: "#84cfc9", blueprint: "#4cbab3", en: "Rainforest Teal", ar: "الفيروزي" },
    { studio: "#e9e0f5", paper: "#efe9f6", blueprint: "#dfd5f0", en: "Cloud Lilac", ar: "الليلكي الفاتح" },
    { studio: "#e47a78", paper: "#eca3a1", blueprint: "#e08583", en: "Coral Red", ar: "المرجاني" },
    { studio: "#c5b95b", paper: "#dad18e", blueprint: "#c6bb67", en: "Bamboo Olive", ar: "الزيتوني" },
    { studio: "#93a8c7", paper: "#b8c6db", blueprint: "#96accb", en: "Arctic Slate", ar: "الرمادي الأزرق" },
    { studio: "#d97a38", paper: "#e5a476", blueprint: "#d68349", en: "Canyon Ochre", ar: "العنبري" }
  ];

  var PRESETS = [
    { id: "daily8", labelEn: "📅 Daily ZooDoku (8×8)", labelAr: "📅 تحدي زودوكو اليومي (8×8)", n: 8, minReg: 2, singles: 0, maxTier: 2, disc: 0, isDaily: true },
    { id: "starter5", labelEn: "🐾 5×5 Junior Zoo — Starter", labelAr: "🐾 5×5 حديقة الصغار — مبتدئ", n: 5, minReg: 1, singles: 1, maxTier: 1, disc: 0 },
    { id: "easy6", labelEn: "🟢 6×6 Easy — Warm-Up", labelAr: "🟢 6×6 سهل — إحماء منطقي", n: 6, minReg: 1, singles: 1, maxTier: 1, disc: 0 },
    { id: "classic7", labelEn: "🟡 7×7 Classic — Savanna", labelAr: "🟡 7×7 كلاسيكي — السافانا", n: 7, minReg: 2, singles: 0, maxTier: 2, disc: 0 },
    { id: "medium8", labelEn: "🟠 8×8 Medium — Standard", labelAr: "🟠 8×8 متوسط — القياسي", n: 8, minReg: 2, singles: 0, maxTier: 2, disc: 0 },
    { id: "hard9", labelEn: "🔴 9×9 Hard — Master Keeper", labelAr: "🔴 9×9 متقدم — حارس المحمية", n: 9, minReg: 2, singles: 0, maxTier: 3, disc: 0 },
    { id: "olympiad10", labelEn: "🏆 10×10 Olympiad — Split Zones", labelAr: "🏆 10×10 أولمبياد — مناطق منفصلة", n: 10, minReg: 2, singles: 0, maxTier: 3, disc: 1 }
  ];

  // ---------------------------------------------------------------------------
  // 2. DETERMINISTIC PRNG & HASHING
  // ---------------------------------------------------------------------------
  function hashSeed(str) {
    var s = String(str || "zoodoku");
    var h = 2166136261 >>> 0;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  function makeRng(seedInt) {
    var a = (seedInt >>> 0) || 0x9e3779b9;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randInt(rng, n) {
    return (rng() * n) | 0;
  }

  function shuffleInPlace(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = (rng() * (i + 1)) | 0;
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function getTodayString() {
    var d = new Date();
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function getDailyNumber(dateStr) {
    var epoch = Date.UTC(2026, 7, 1); // 2026-08-01 (matches zoodoku.org epoch!)
    var parts = dateStr.split("-");
    var cur = Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var diff = Math.floor((cur - epoch) / 86400000) + 1;
    return diff > 0 ? diff : 1;
  }

  // ---------------------------------------------------------------------------
  // 3. EXACT SOLVER, UNIQUENESS VERIFIER & HUMAN LOGIC SOLVER
  // ---------------------------------------------------------------------------
  // Generate a random valid non-touching Rook + King permutation sol[0..N-1]
  function generateValidPlacement(N, rng) {
    var sol = new Int32Array(N);
    sol.fill(-1);
    var cols = [];
    for (var c = 0; c < N; c++) cols.push(c);

    function backtrack(r, usedMask) {
      if (r === N) return true;
      var order = cols.slice();
      shuffleInPlace(order, rng);
      for (var i = 0; i < N; i++) {
        var col = order[i];
        if (usedMask & (1 << col)) continue;
        if (r > 0 && Math.abs(col - sol[r - 1]) <= 1) continue;
        sol[r] = col;
        if (backtrack(r + 1, usedMask | (1 << col))) return true;
        sol[r] = -1;
      }
      return false;
    }

    if (backtrack(0, 0)) return Array.from(sol);
    return null;
  }

  // Find up to `limit` solutions for (N, regions flat array of length N*N).
  // If `knownSol` is provided and `onlyAlt` is true, returns the first solution != knownSol.
  function searchSolutions(N, regFlat, limit, knownSol, onlyAlt) {
    var found = [];
    var sol = new Int32Array(N);
    sol.fill(-1);

    // Precompute candidate columns per row grouped by region availability
    function dfs(r, colMask, regMask) {
      if (r === N) {
        if (onlyAlt && knownSol) {
          var same = true;
          for (var k = 0; k < N; k++) {
            if (sol[k] !== knownSol[k]) { same = false; break; }
          }
          if (same) return false;
        }
        found.push(Array.from(sol));
        return found.length >= limit;
      }

      var prevCol = r > 0 ? sol[r - 1] : -99;
      var rowOff = r * N;
      for (var c = 0; c < N; c++) {
        if (colMask & (1 << c)) continue;
        if (c - prevCol <= 1 && prevCol - c <= 1) continue;
        var g = regFlat[rowOff + c];
        if (regMask & (1 << g)) continue;
        sol[r] = c;
        if (dfs(r + 1, colMask | (1 << c), regMask | (1 << g))) return true;
      }
      sol[r] = -1;
      return false;
    }

    dfs(0, 0, 0);
    return found;
  }

  // Check if removing cell `removeIdx` from region `g` keeps region `g` connected
  function remainsConnectedAfterRemoval(N, regFlat, g, removeIdx) {
    var start = -1;
    var count = 0;
    for (var i = 0; i < N * N; i++) {
      if (i !== removeIdx && regFlat[i] === g) {
        count++;
        if (start === -1) start = i;
      }
    }
    if (count <= 0) return false;
    if (count === 1) return true;

    var visited = new Uint8Array(N * N);
    var queue = [start];
    visited[start] = 1;
    var seen = 1;
    var head = 0;

    while (head < queue.length) {
      var cur = queue[head++];
      var r = (cur / N) | 0;
      var c = cur % N;
      if (r > 0) {
        var up = cur - N;
        if (up !== removeIdx && !visited[up] && regFlat[up] === g) { visited[up] = 1; seen++; queue.push(up); }
      }
      if (r + 1 < N) {
        var dn = cur + N;
        if (dn !== removeIdx && !visited[dn] && regFlat[dn] === g) { visited[dn] = 1; seen++; queue.push(dn); }
      }
      if (c > 0) {
        var lf = cur - 1;
        if (lf !== removeIdx && !visited[lf] && regFlat[lf] === g) { visited[lf] = 1; seen++; queue.push(lf); }
      }
      if (c + 1 < N) {
        var rt = cur + 1;
        if (rt !== removeIdx && !visited[rt] && regFlat[rt] === g) { visited[rt] = 1; seen++; queue.push(rt); }
      }
    }
    return seen === count;
  }

  // Human-logic deduction engine (also powers interactive Smart Hints!)
  // Board state encoding for solver: 0 = candidate, 1 = eliminated (X), 3 = animal
  function runHumanDeductionStep(N, regFlat, stateArr, maxTier) {
    // 1. Direct elimination around already placed animals
    var directElims = [];
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var idx = r * N + c;
        if (stateArr[idx] !== CELL_ANIMAL) continue;
        var g = regFlat[idx];
        for (var r2 = 0; r2 < N; r2++) {
          for (var c2 = 0; c2 < N; c2++) {
            var idx2 = r2 * N + c2;
            if (idx2 === idx || stateArr[idx2] !== CELL_EMPTY) continue;
            if (r2 === r || c2 === c || regFlat[idx2] === g || (Math.abs(r2 - r) <= 1 && Math.abs(c2 - c) <= 1)) {
              directElims.push(idx2);
            }
          }
        }
        if (directElims.length > 0) {
          return {
            tier: 1,
            type: "direct_elim",
            sourceCell: idx,
            elims: directElims
          };
        }
      }
    }

    // Gather open candidates for each row, col, and region
    var rowHasAnimal = new Uint8Array(N);
    var colHasAnimal = new Uint8Array(N);
    var regHasAnimal = new Uint8Array(N);
    var rowOpen = [];
    var colOpen = [];
    var regOpen = [];
    for (var k = 0; k < N; k++) { rowOpen.push([]); colOpen.push([]); regOpen.push([]); }

    for (var i = 0; i < N * N; i++) {
      var rr = (i / N) | 0;
      var cc = i % N;
      var gg = regFlat[i];
      if (stateArr[i] === CELL_ANIMAL) {
        rowHasAnimal[rr] = 1;
        colHasAnimal[cc] = 1;
        regHasAnimal[gg] = 1;
      } else if (stateArr[i] === CELL_EMPTY) {
        rowOpen[rr].push(i);
        colOpen[cc].push(i);
        regOpen[gg].push(i);
      }
    }

    // Contradiction check (0 candidates left in an unsatisfied unit)
    for (var u = 0; u < N; u++) {
      if (!regHasAnimal[u] && regOpen[u].length === 0) return { contradiction: true, unit: "reg", index: u };
      if (!rowHasAnimal[u] && rowOpen[u].length === 0) return { contradiction: true, unit: "row", index: u };
      if (!colHasAnimal[u] && colOpen[u].length === 0) return { contradiction: true, unit: "col", index: u };
    }

    // 2. Tier 1: Last Cell Standing (Hidden Single in Region, Row, or Column)
    for (var g1 = 0; g1 < N; g1++) {
      if (!regHasAnimal[g1] && regOpen[g1].length === 1) {
        return { tier: 1, type: "single_region", unitIndex: g1, placeCell: regOpen[g1][0] };
      }
    }
    for (var r1 = 0; r1 < N; r1++) {
      if (!rowHasAnimal[r1] && rowOpen[r1].length === 1) {
        return { tier: 1, type: "single_row", unitIndex: r1, placeCell: rowOpen[r1][0] };
      }
    }
    for (var c1 = 0; c1 < N; c1++) {
      if (!colHasAnimal[c1] && colOpen[c1].length === 1) {
        return { tier: 1, type: "single_col", unitIndex: c1, placeCell: colOpen[c1][0] };
      }
    }

    // Helper: Does candidate `candA` attack candidate `candB`?
    function attacks(candA, candB) {
      if (candA === candB) return false;
      var ar = (candA / N) | 0, ac = candA % N;
      var br = (candB / N) | 0, bc = candB % N;
      if (ar === br || ac === bc) return true;
      if (regFlat[candA] === regFlat[candB]) return true;
      return Math.abs(ar - br) <= 1 && Math.abs(ac - bc) <= 1;
    }

    // 3. Tier 1.5 / Tier 2: Common Peer / Confinement (Every candidate of a unit attacks cell X)
    // Note: Single-line claiming (all open cells of Region G lie in Row R) is a special case of this!
    // Let's check explicit Region -> Row/Col Confinement first for super clear pedagogical hints!
    if (maxTier >= 2) {
      for (var gc = 0; gc < N; gc++) {
        if (regHasAnimal[gc] || regOpen[gc].length < 2) continue;
        var cands = regOpen[gc];
        var sameR = (cands[0] / N) | 0;
        var sameC = cands[0] % N;
        for (var m = 1; m < cands.length; m++) {
          if (((cands[m] / N) | 0) !== sameR) sameR = -1;
          if ((cands[m] % N) !== sameC) sameC = -1;
        }
        if (sameR !== -1) {
          var elimsR = [];
          for (var j = 0; j < rowOpen[sameR].length; j++) {
            if (regFlat[rowOpen[sameR][j]] !== gc) elimsR.push(rowOpen[sameR][j]);
          }
          if (elimsR.length > 0) {
            return { tier: 2, type: "confine_reg_in_row", regIndex: gc, rowIndex: sameR, elims: elimsR };
          }
        }
        if (sameC !== -1) {
          var elimsC = [];
          for (var j2 = 0; j2 < colOpen[sameC].length; j2++) {
            if (regFlat[colOpen[sameC][j2]] !== gc) elimsC.push(colOpen[sameC][j2]);
          }
          if (elimsC.length > 0) {
            return { tier: 2, type: "confine_reg_in_col", regIndex: gc, colIndex: sameC, elims: elimsC };
          }
        }
      }

      // Row/Col confined to a single Region
      for (var rc = 0; rc < N; rc++) {
        if (!rowHasAnimal[rc] && rowOpen[rc].length >= 2) {
          var rg0 = regFlat[rowOpen[rc][0]];
          var allSameReg = true;
          for (var m2 = 1; m2 < rowOpen[rc].length; m2++) {
            if (regFlat[rowOpen[rc][m2]] !== rg0) { allSameReg = false; break; }
          }
          if (allSameReg) {
            var elimsRR = [];
            for (var j3 = 0; j3 < regOpen[rg0].length; j3++) {
              if (((regOpen[rg0][j3] / N) | 0) !== rc) elimsRR.push(regOpen[rg0][j3]);
            }
            if (elimsRR.length > 0) {
              return { tier: 2, type: "confine_row_in_reg", rowIndex: rc, regIndex: rg0, elims: elimsRR };
            }
          }
        }
        if (!colHasAnimal[rc] && colOpen[rc].length >= 2) {
          var cg0 = regFlat[colOpen[rc][0]];
          var allSameRegC = true;
          for (var m3 = 1; m3 < colOpen[rc].length; m3++) {
            if (regFlat[colOpen[rc][m3]] !== cg0) { allSameRegC = false; break; }
          }
          if (allSameRegC) {
            var elimsCR = [];
            for (var j4 = 0; j4 < regOpen[cg0].length; j4++) {
              if ((regOpen[cg0][j4] % N) !== rc) elimsCR.push(regOpen[cg0][j4]);
            }
            if (elimsCR.length > 0) {
              return { tier: 2, type: "confine_col_in_reg", colIndex: rc, regIndex: cg0, elims: elimsCR };
            }
          }
        }
      }
    }

    // King-Shadow / Common Attack Intersection (Tier 1 for 2-cell dominoes, Tier 2 general)
    var units = [];
    for (var ug = 0; ug < N; ug++) {
      if (!regHasAnimal[ug] && regOpen[ug].length >= 2 && (maxTier >= 2 || regOpen[ug].length <= 2)) {
        units.push({ kind: "reg", idx: ug, cells: regOpen[ug] });
      }
    }
    if (maxTier >= 2) {
      for (var ur = 0; ur < N; ur++) {
        if (!rowHasAnimal[ur] && rowOpen[ur].length >= 2 && rowOpen[ur].length <= 3) {
          units.push({ kind: "row", idx: ur, cells: rowOpen[ur] });
        }
        if (!colHasAnimal[ur] && colOpen[ur].length >= 2 && colOpen[ur].length <= 3) {
          units.push({ kind: "col", idx: ur, cells: colOpen[ur] });
        }
      }
    }

    for (var ui = 0; ui < units.length; ui++) {
      var uCells = units[ui].cells;
      var shadowElims = [];
      for (var target = 0; target < N * N; target++) {
        if (stateArr[target] !== CELL_EMPTY) continue;
        var inUnit = false;
        var allAttack = true;
        for (var ci = 0; ci < uCells.length; ci++) {
          if (uCells[ci] === target) { inUnit = true; break; }
          if (!attacks(uCells[ci], target)) { allAttack = false; break; }
        }
        if (!inUnit && allAttack) shadowElims.push(target);
      }
      if (shadowElims.length > 0) {
        return {
          tier: uCells.length <= 2 ? 1 : 2,
          type: "king_shadow",
          unitKind: units[ui].kind,
          unitIndex: units[ui].idx,
          unitCells: uCells,
          elims: shadowElims
        };
      }
    }

    // 4. Tier 2: 2-Region / 2-Line Pigeonhole Subset Confinement
    if (maxTier >= 2) {
      // Pair of regions confined to 2 rows or 2 cols
      var regRowMasks = new Int32Array(N);
      var regColMasks = new Int32Array(N);
      for (var g2 = 0; g2 < N; g2++) {
        if (regHasAnimal[g2] || regOpen[g2].length === 0) continue;
        var rm = 0, cm = 0;
        for (var q = 0; q < regOpen[g2].length; q++) {
          rm |= (1 << ((regOpen[g2][q] / N) | 0));
          cm |= (1 << (regOpen[g2][q] % N));
        }
        regRowMasks[g2] = rm;
        regColMasks[g2] = cm;
      }
      function popcount(x) {
        x = x - ((x >>> 1) & 0x55555555);
        x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
        return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
      }
      for (var ga = 0; ga < N; ga++) {
        if (!regRowMasks[ga]) continue;
        for (var gb = ga + 1; gb < N; gb++) {
          if (!regRowMasks[gb]) continue;
          var uRows = regRowMasks[ga] | regRowMasks[gb];
          if (popcount(uRows) === 2) {
            var pairElimsR = [];
            for (var rx = 0; rx < N; rx++) {
              if (!(uRows & (1 << rx))) continue;
              for (var rci = 0; rci < rowOpen[rx].length; rci++) {
                var cellId = rowOpen[rx][rci];
                if (regFlat[cellId] !== ga && regFlat[cellId] !== gb) pairElimsR.push(cellId);
              }
            }
            if (pairElimsR.length > 0) {
              return { tier: 2, type: "pair_confine_rows", regs: [ga, gb], mask: uRows, elims: pairElimsR };
            }
          }
          var uCols = regColMasks[ga] | regColMasks[gb];
          if (popcount(uCols) === 2) {
            var pairElimsC = [];
            for (var cx = 0; cx < N; cx++) {
              if (!(uCols & (1 << cx))) continue;
              for (var cci = 0; cci < colOpen[cx].length; cci++) {
                var cellId2 = colOpen[cx][cci];
                if (regFlat[cellId2] !== ga && regFlat[cellId2] !== gb) pairElimsC.push(cellId2);
              }
            }
            if (pairElimsC.length > 0) {
              return { tier: 2, type: "pair_confine_cols", regs: [ga, gb], mask: uCols, elims: pairElimsC };
            }
          }
        }
      }
    }

    // 5. Tier 3: 1-Step What-If Contradiction (Proof by Contradiction without Guessing)
    if (maxTier >= 3) {
      // Test candidates in smallest units first for natural human focus
      var candidateOrder = [];
      for (var p = 0; p < N * N; p++) {
        if (stateArr[p] === CELL_EMPTY) candidateOrder.push(p);
      }
      candidateOrder.sort(function (a, b) {
        return regOpen[regFlat[a]].length - regOpen[regFlat[b]].length;
      });

      for (var ti = 0; ti < candidateOrder.length; ti++) {
        var testCell = candidateOrder[ti];
        var sim = new Uint8Array(stateArr);
        sim[testCell] = CELL_ANIMAL;
        var steps = 0;
        var contradicted = false;
        while (steps < 18) {
          steps++;
          var sub = runHumanDeductionStep(N, regFlat, sim, 1);
          if (!sub) break;
          if (sub.contradiction) { contradicted = true; break; }
          if (sub.placeCell !== undefined) {
            sim[sub.placeCell] = CELL_ANIMAL;
          } else if (sub.elims) {
            for (var ei = 0; ei < sub.elims.length; ei++) sim[sub.elims[ei]] = CELL_MANUAL_X;
          } else break;
        }
        if (contradicted) {
          return { tier: 3, type: "what_if", testCell: testCell, elims: [testCell] };
        }
      }
    }

    return null;
  }

  function solveByHumanLogic(N, regFlat, maxTier) {
    var state = new Uint8Array(N * N);
    var highestTier = 1;
    var placedCount = 0;
    var guard = 0;

    while (placedCount < N && guard < 400) {
      guard++;
      var step = runHumanDeductionStep(N, regFlat, state, maxTier);
      if (!step || step.contradiction) return { solved: false, maxTierUsed: highestTier };
      if (step.tier > highestTier) highestTier = step.tier;
      if (step.placeCell !== undefined) {
        state[step.placeCell] = CELL_ANIMAL;
        placedCount++;
      } else if (step.elims) {
        for (var i = 0; i < step.elims.length; i++) {
          state[step.elims[i]] = CELL_MANUAL_X;
        }
      } else {
        break;
      }
    }
    return { solved: placedCount === N, maxTierUsed: highestTier };
  }

  // ---------------------------------------------------------------------------
  // 4. ORGANIC REGION PARTITIONER & SCULPTING GENERATOR
  // ---------------------------------------------------------------------------
  function growHabitatRegions(N, sol, rng, preset) {
    var total = N * N;
    var reg = new Int32Array(total);
    reg.fill(-1);
    var regSizes = new Int32Array(N);

    // Target region size caps to create realistic ZooDoku variety (small anchor zones + large savannas)
    var caps = new Int32Array(N);
    var order = [];
    for (var i = 0; i < N; i++) order.push(i);
    shuffleInPlace(order, rng);

    for (var k = 0; k < N; k++) {
      var rk = order[k];
      if (preset.singles > 0 && k === 0) {
        caps[rk] = rng() < 0.65 ? 1 : 2;
      } else if (k === 0) {
        caps[rk] = 2 + randInt(rng, 2); // 2..3
      } else if (k <= 2) {
        caps[rk] = 2 + randInt(rng, 3); // 2..4
      } else if (k <= (N >> 1)) {
        caps[rk] = 4 + randInt(rng, N);
      } else {
        caps[rk] = total; // unbounded sprawling habitat
      }
    }

    var frontier = [];
    function addNeighbors(cellIdx, g) {
      var r = (cellIdx / N) | 0;
      var c = cellIdx % N;
      if (r > 0 && reg[cellIdx - N] === -1) frontier.push(cellIdx - N, g);
      if (r + 1 < N && reg[cellIdx + N] === -1) frontier.push(cellIdx + N, g);
      if (c > 0 && reg[cellIdx - 1] === -1) frontier.push(cellIdx - 1, g);
      if (c + 1 < N && reg[cellIdx + 1] === -1) frontier.push(cellIdx + 1, g);
    }

    for (var r0 = 0; r0 < N; r0++) {
      var seedCell = r0 * N + sol[r0];
      reg[seedCell] = r0;
      regSizes[r0] = 1;
    }
    for (var r1 = 0; r1 < N; r1++) {
      if (regSizes[r1] < caps[r1]) {
        addNeighbors(r1 * N + sol[r1], r1);
      }
    }

    var assigned = N;
    while (assigned < total) {
      if (frontier.length === 0) {
        // Relax caps for any remaining unassigned cells adjacent to an assigned cell
        for (var idx = 0; idx < total; idx++) {
          if (reg[idx] !== -1) continue;
          var rr = (idx / N) | 0, cc = idx % N;
          var nbrs = [];
          if (rr > 0 && reg[idx - N] !== -1) nbrs.push(reg[idx - N]);
          if (rr + 1 < N && reg[idx + N] !== -1) nbrs.push(reg[idx + N]);
          if (cc > 0 && reg[idx - 1] !== -1) nbrs.push(reg[idx - 1]);
          if (cc + 1 < N && reg[idx + 1] !== -1) nbrs.push(reg[idx + 1]);
          if (nbrs.length > 0) {
            var chosenG = nbrs[randInt(rng, nbrs.length)];
            // Avoid expanding intentional single-cell anchor unless forced
            if (preset.singles > 0 && chosenG === order[0] && nbrs.length > 1) {
              for (var ni = 0; ni < nbrs.length; ni++) {
                if (nbrs[ni] !== order[0]) { chosenG = nbrs[ni]; break; }
              }
            }
            reg[idx] = chosenG;
            regSizes[chosenG]++;
            assigned++;
            addNeighbors(idx, chosenG);
          }
        }
        continue;
      }

      var pickPair = randInt(rng, frontier.length >> 1) * 2;
      var targetCell = frontier[pickPair];
      var targetG = frontier[pickPair + 1];
      // Pop swap
      frontier[pickPair] = frontier[frontier.length - 2];
      frontier[pickPair + 1] = frontier[frontier.length - 1];
      frontier.length -= 2;

      if (reg[targetCell] !== -1) continue;
      if (regSizes[targetG] >= caps[targetG]) continue;

      reg[targetCell] = targetG;
      regSizes[targetG]++;
      assigned++;
      if (regSizes[targetG] < caps[targetG]) {
        addNeighbors(targetCell, targetG);
      }
    }

    // Enforce minimum region size >= preset.minReg (e.g. 2 for Medium/Hard)
    if (preset.minReg >= 2) {
      for (var gCheck = 0; gCheck < N; gCheck++) {
        if (regSizes[gCheck] >= preset.minReg) continue;
        var sCell = gCheck * N + sol[gCheck];
        var sr = gCheck, sc = sol[gCheck];
        var candNbrs = [];
        if (sr > 0) candNbrs.push(sCell - N);
        if (sr + 1 < N) candNbrs.push(sCell + N);
        if (sc > 0) candNbrs.push(sCell - 1);
        if (sc + 1 < N) candNbrs.push(sCell + 1);
        shuffleInPlace(candNbrs, rng);
        for (var m = 0; m < candNbrs.length; m++) {
          var nb = candNbrs[m];
          var donorG = reg[nb];
          var nbR = (nb / N) | 0, nbC = nb % N;
          if (sol[nbR] === nbC) continue; // never steal another region's solution cell!
          if (regSizes[donorG] > preset.minReg && remainsConnectedAfterRemoval(N, reg, donorG, nb)) {
            reg[nb] = gCheck;
            regSizes[gCheck]++;
            regSizes[donorG]--;
            break;
          }
        }
      }
    }

    // Optional discontinuous patch injection for 10x10 Olympiad mode
    if (preset.disc > 0) {
      for (var d = 0; d < preset.disc; d++) {
        var nonSolCells = [];
        for (var ci = 0; ci < total; ci++) {
          var cr = (ci / N) | 0, cc2 = ci % N;
          if (sol[cr] === cc2) continue;
          if (regSizes[reg[ci]] >= 4) nonSolCells.push(ci);
        }
        shuffleInPlace(nonSolCells, rng);
        for (var si = 0; si < nonSolCells.length; si++) {
          var patchCell = nonSolCells[si];
          var oldG = reg[patchCell];
          if (!remainsConnectedAfterRemoval(N, reg, oldG, patchCell)) continue;
          var newG = randInt(rng, N);
          if (newG === oldG) continue;
          reg[patchCell] = newG;
          regSizes[oldG]--;
          regSizes[newG]++;
          break;
        }
      }
    }

    return { reg: reg, regSizes: regSizes };
  }

  // Sculpt region boundaries to eliminate alternative solutions cleanly in milliseconds
  function sculptToUnique(N, sol, reg, regSizes, rng, minReg, allowDisc) {
    for (var step = 0; step < 48; step++) {
      var alts = searchSolutions(N, reg, 1, sol, true);
      if (alts.length === 0) return true; // Unique solution achieved!

      var alt = alts[0];
      var diffRows = [];
      for (var r = 0; r < N; r++) {
        if (alt[r] !== sol[r]) diffRows.push(r);
      }
      shuffleInPlace(diffRows, rng);

      var mutated = false;
      for (var di = 0; di < diffRows.length && !mutated; di++) {
        var dr = diffRows[di];
        // Candidate cells to mutate: either (dr, alt[dr]) or (dr, sol[dr])'s region neighbors
        var altCell = dr * N + alt[dr];
        var oldG = reg[altCell];
        if (regSizes[oldG] > minReg && remainsConnectedAfterRemoval(N, reg, oldG, altCell)) {
          var nbrCells = [];
          var ar = dr, ac = alt[dr];
          if (ar > 0 && reg[altCell - N] !== oldG) nbrCells.push(reg[altCell - N]);
          if (ar + 1 < N && reg[altCell + N] !== oldG) nbrCells.push(reg[altCell + N]);
          if (ac > 0 && reg[altCell - 1] !== oldG) nbrCells.push(reg[altCell - 1]);
          if (ac + 1 < N && reg[altCell + 1] !== oldG) nbrCells.push(reg[altCell + 1]);
          if (allowDisc && nbrCells.length === 0) {
            nbrCells.push(randInt(rng, N));
          }
          if (nbrCells.length > 0) {
            shuffleInPlace(nbrCells, rng);
            var newG = nbrCells[0];
            if (newG !== oldG) {
              reg[altCell] = newG;
              regSizes[oldG]--;
              regSizes[newG]++;
              mutated = true;
            }
          }
        }
      }

      if (!mutated) {
        // Fallback boundary tweak: pick a random boundary cell not in `sol` and flip to adjacent region
        var boundary = [];
        for (var idx = 0; idx < N * N; idx++) {
          var br = (idx / N) | 0, bc = idx % N;
          if (sol[br] === bc) continue;
          var bg = reg[idx];
          if (regSizes[bg] <= minReg) continue;
          if (
            (br > 0 && reg[idx - N] !== bg) ||
            (br + 1 < N && reg[idx + N] !== bg) ||
            (bc > 0 && reg[idx - 1] !== bg) ||
            (bc + 1 < N && reg[idx + 1] !== bg)
          ) {
            boundary.push(idx);
          }
        }
        shuffleInPlace(boundary, rng);
        for (var bi = 0; bi < boundary.length; bi++) {
          var bIdx = boundary[bi];
          var bOld = reg[bIdx];
          if (!remainsConnectedAfterRemoval(N, reg, bOld, bIdx)) continue;
          var bR = (bIdx / N) | 0, bC = bIdx % N;
          var adjG = [];
          if (bR > 0 && reg[bIdx - N] !== bOld) adjG.push(reg[bIdx - N]);
          if (bR + 1 < N && reg[bIdx + N] !== bOld) adjG.push(reg[bIdx + N]);
          if (bC > 0 && reg[bIdx - 1] !== bOld) adjG.push(reg[bIdx - 1]);
          if (bC + 1 < N && reg[bIdx + 1] !== bOld) adjG.push(reg[bIdx + 1]);
          if (adjG.length > 0) {
            var chosen = adjG[randInt(rng, adjG.length)];
            reg[bIdx] = chosen;
            regSizes[bOld]--;
            regSizes[chosen]++;
            break;
          }
        }
      }
    }
    return searchSolutions(N, reg, 1, sol, true).length === 0;
  }

  // Canonicalize region IDs 0..N-1 in reading order so Game IDs look clean and colour assignment is stable
  function canonicalizeRegions(N, regFlat) {
    var map = new Int32Array(N);
    map.fill(-1);
    var nextId = 0;
    var out = new Int32Array(N * N);
    for (var i = 0; i < N * N; i++) {
      var g = regFlat[i];
      if (map[g] === -1) map[g] = nextId++;
      out[i] = map[g];
    }
    return out;
  }

  function generateZoodokuBoard(preset, seedStr) {
    var N = preset.n;
    var rng = makeRng(hashSeed(seedStr));
    var bestFallback = null;

    for (var attempt = 0; attempt < 120; attempt++) {
      var sol = generateValidPlacement(N, rng);
      if (!sol) continue;
      var grown = growHabitatRegions(N, sol, rng, preset);
      var isUnique = sculptToUnique(N, sol, grown.reg, grown.regSizes, rng, preset.minReg, preset.disc > 0);
      if (!isUnique) continue;

      var canonReg = canonicalizeRegions(N, grown.reg);
      // Double-verify exact uniqueness (count === 1)
      var allSols = searchSolutions(N, canonReg, 2, null, false);
      if (allSols.length !== 1) continue;

      var logicCheck = solveByHumanLogic(N, canonReg, preset.maxTier);
      if (logicCheck.solved) {
        return {
          N: N,
          regions: Array.from(canonReg),
          solution: allSols[0],
          tierUsed: logicCheck.maxTierUsed,
          seed: seedStr
        };
      }
      if (!bestFallback) {
        var widerCheck = solveByHumanLogic(N, canonReg, 3);
        if (widerCheck.solved) {
          bestFallback = {
            N: N,
            regions: Array.from(canonReg),
            solution: allSols[0],
            tierUsed: widerCheck.maxTierUsed,
            seed: seedStr
          };
        }
      }
    }

    if (bestFallback) return bestFallback;

    // Guaranteed deterministic fallback (N-1 single-cell anchors + 1 savanna region => strictly unique!)
    var fbSol = generateValidPlacement(N, makeRng(1234567 + N)) || [];
    var fbReg = new Int32Array(N * N);
    fbReg.fill(N - 1);
    for (var r = 0; r < N - 1; r++) {
      fbReg[r * N + fbSol[r]] = r;
    }
    var canonFb = canonicalizeRegions(N, fbReg);
    return { N: N, regions: Array.from(canonFb), solution: fbSol, tierUsed: 1, seed: seedStr };
  }

  // Encode / Decode compact Game ID (`N:base36grid`)
  function encodeGameId(N, regions) {
    var chars = "";
    for (var i = 0; i < N * N; i++) {
      chars += regions[i].toString(36);
    }
    return N + ":" + chars;
  }

  function decodeGameId(descStr) {
    if (!descStr || typeof descStr !== "string") return null;
    var clean = descStr.trim().replace(/^#/, "");
    var m = clean.match(/^(\d{1,2}):([0-9a-z]+)$/i);
    if (!m) return null;
    var N = parseInt(m[1], 10);
    var body = m[2].toLowerCase();
    if (N < 4 || N > 12 || body.length !== N * N) return null;
    var reg = new Int32Array(N * N);
    for (var i = 0; i < N * N; i++) {
      var v = parseInt(body.charAt(i), 36);
      if (isNaN(v) || v < 0 || v >= N) return null;
      reg[i] = v;
    }
    var sols = searchSolutions(N, reg, 2, null, false);
    if (sols.length === 0) return null;
    return {
      N: N,
      regions: Array.from(reg),
      solution: sols[0],
      tierUsed: 2,
      seed: "id-" + clean
    };
  }

  // Export core solver/generator for headless Node verification tests if running in Node
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      PRESETS: PRESETS,
      generateZoodokuBoard: generateZoodokuBoard,
      searchSolutions: searchSolutions,
      solveByHumanLogic: solveByHumanLogic,
      encodeGameId: encodeGameId,
      decodeGameId: decodeGameId
    };
    if (typeof window === "undefined") return;
  }

  // ---------------------------------------------------------------------------
  // 5. INTERACTIVE BROWSER & SMARTBOARD ENGINE
  // ---------------------------------------------------------------------------
  var game = {
    presetIndex: 0, // Default: Today's Daily 8x8 (or switched via dropdown)
    N: 8,
    regions: [],
    solution: [],
    cells: [],         // 0=empty, 1=manual X, 2=auto X, 3=animal
    undoStack: [],
    redoStack: [],
    seed: "",
    gameId: "",
    tierUsed: 2,
    animalIndex: 0,    // Index into ANIMALS, or -1 for Mixed Zoo
    mixedZoo: false,
    autoXMode: false,  // Live Auto-X toggle
    cursorR: 0,
    cursorC: 0,
    showCursor: false,
    hoverR: -1,
    hoverC: -1,
    activeHint: null,  // { type, cells:[], targetCell, messageEn, messageAr }
    popCell: -1,
    popProgress: 1,
    discontinuousRegs: {},
    canvasCssW: 520,
    canvasCssH: 520,
    boardMetrics: { x: 24, y: 24, size: 472, cell: 59 },
    dragState: null    // { active, action: "paintX" | "eraseX", changed: boolean, snapshot }
  };

  function isAr() {
    return document.documentElement.getAttribute("lang") === "ar" || window.__EDUGATES_LANG__ === "ar";
  }

  // Pick deterministic mascot for daily puzzle, or current mascot
  function getAnimalEmojiForRegion(regId) {
    if (game.mixedZoo) {
      return ANIMALS[regId % ANIMALS.length].emoji;
    }
    return ANIMALS[game.animalIndex % ANIMALS.length].emoji;
  }

  function detectDiscontinuousRegions(N, regArr) {
    var disc = {};
    for (var g = 0; g < N; g++) {
      var first = -1, total = 0;
      for (var i = 0; i < N * N; i++) {
        if (regArr[i] === g) {
          total++;
          if (first === -1) first = i;
        }
      }
      if (total <= 1) continue;
      var vis = new Uint8Array(N * N);
      var q = [first];
      vis[first] = 1;
      var seen = 1;
      while (q.length > 0) {
        var cur = q.pop();
        var r = (cur / N) | 0, c = cur % N;
        if (r > 0 && !vis[cur - N] && regArr[cur - N] === g) { vis[cur - N] = 1; seen++; q.push(cur - N); }
        if (r + 1 < N && !vis[cur + N] && regArr[cur + N] === g) { vis[cur + N] = 1; seen++; q.push(cur + N); }
        if (c > 0 && !vis[cur - 1] && regArr[cur - 1] === g) { vis[cur - 1] = 1; seen++; q.push(cur - 1); }
        if (c + 1 < N && !vis[cur + 1] && regArr[cur + 1] === g) { vis[cur + 1] = 1; seen++; q.push(cur + 1); }
      }
      if (seen < total) disc[g] = true;
    }
    return disc;
  }

  // Compute all current rule conflicts among placed animals
  function computeConflicts() {
    var N = game.N;
    var animals = [];
    for (var i = 0; i < N * N; i++) {
      if (game.cells[i] === CELL_ANIMAL) {
        animals.push({ idx: i, r: (i / N) | 0, c: i % N, g: game.regions[i] });
      }
    }
    var badCells = {};
    var pairs = [];
    var reason = "";

    for (var a = 0; a < animals.length; a++) {
      for (var b = a + 1; b < animals.length; b++) {
        var A = animals[a], B = animals[b];
        var kind = "";
        if (Math.abs(A.r - B.r) <= 1 && Math.abs(A.c - B.c) <= 1) kind = "touch";
        else if (A.r === B.r) kind = "row";
        else if (A.c === B.c) kind = "col";
        else if (A.g === B.g) kind = "region";

        if (kind) {
          badCells[A.idx] = true;
          badCells[B.idx] = true;
          pairs.push({ a: A, b: B, kind: kind });
          if (!reason) reason = kind;
        }
      }
    }
    return { badCells: badCells, pairs: pairs, reason: reason, animalCount: animals.length };
  }

  function isPuzzleSolved() {
    var conf = computeConflicts();
    return conf.animalCount === game.N && conf.pairs.length === 0;
  }

  // Expose custom victory check for edugates-smartboard.js!
  window.__edugatesCustomVictoryCheck = isPuzzleSolved;

  // Recompute dynamic Auto-X cells (`CELL_AUTO_X`) when `game.autoXMode` is ON
  function syncLiveAutoX() {
    if (!game.autoXMode) return;
    var N = game.N;
    // Clear previous CELL_AUTO_X without touching CELL_MANUAL_X or CELL_ANIMAL
    for (var i = 0; i < N * N; i++) {
      if (game.cells[i] === CELL_AUTO_X) game.cells[i] = CELL_EMPTY;
    }
    for (var idx = 0; idx < N * N; idx++) {
      if (game.cells[idx] !== CELL_ANIMAL) continue;
      var r = (idx / N) | 0, c = idx % N, g = game.regions[idx];
      for (var r2 = 0; r2 < N; r2++) {
        for (var c2 = 0; c2 < N; c2++) {
          var j = r2 * N + c2;
          if (j === idx || game.cells[j] !== CELL_EMPTY) continue;
          if (r2 === r || c2 === c || game.regions[j] === g || (Math.abs(r2 - r) <= 1 && Math.abs(c2 - c) <= 1)) {
            game.cells[j] = CELL_AUTO_X;
          }
        }
      }
    }
  }

  function countAvailableAutoX() {
    var N = game.N;
    var ruledOut = new Uint8Array(N * N);
    for (var idx = 0; idx < N * N; idx++) {
      if (game.cells[idx] !== CELL_ANIMAL) continue;
      var r = (idx / N) | 0, c = idx % N, g = game.regions[idx];
      for (var r2 = 0; r2 < N; r2++) {
        for (var c2 = 0; c2 < N; c2++) {
          var j = r2 * N + c2;
          if (j !== idx && game.cells[j] === CELL_EMPTY) {
            if (r2 === r || c2 === c || game.regions[j] === g || (Math.abs(r2 - r) <= 1 && Math.abs(c2 - c) <= 1)) {
              ruledOut[j] = 1;
            }
          }
        }
      }
    }
    var cnt = 0;
    for (var k = 0; k < N * N; k++) if (ruledOut[k]) cnt++;
    return cnt;
  }

  function pushUndoSnapshot(snapshot) {
    game.undoStack.push(snapshot || game.cells.slice());
    if (game.undoStack.length > 200) game.undoStack.shift();
    game.redoStack.length = 0;
    game.activeHint = null;
  }

  function afterBoardStateChange(skipMoveHook) {
    syncLiveAutoX();
    updateAuxButtonsAndStatus();
    drawBoard();
    if (!skipMoveHook && window.__edugatesOnMove) {
      window.__edugatesOnMove(false);
    }
    if (isPuzzleSolved()) {
      if (window.__edugatesOnStatus) window.__edugatesOnStatus("COMPLETED!");
    } else {
      if (window.__edugatesEvaluateVictory) window.__edugatesEvaluateVictory("postMove", "");
    }
  }

  function triggerPopAnimation(cellIdx) {
    game.popCell = cellIdx;
    game.popProgress = 0;
    function stepAnim() {
      game.popProgress += 0.18;
      if (game.popProgress >= 1) {
        game.popProgress = 1;
        drawBoard();
        return;
      }
      drawBoard();
      requestAnimationFrame(stepAnim);
    }
    requestAnimationFrame(stepAnim);
  }

  // Apply click/tap to cell `(r, c)` according to active click mode
  function applyCellTap(r, c, buttonOverride) {
    var N = game.N;
    if (r < 0 || r >= N || c < 0 || c >= N) return;
    var idx = r * N + c;
    var cur = game.cells[idx];
    var mode = typeof buttonOverride === "number" ? buttonOverride : (window.__EDUGATES_CLICK_MODE__ || 0);

    pushUndoSnapshot();

    if (mode === 1) {
      // Direct 1-Tap Animal Mode
      if (cur === CELL_ANIMAL) {
        game.cells[idx] = CELL_EMPTY;
      } else {
        game.cells[idx] = CELL_ANIMAL;
        triggerPopAnimation(idx);
      }
    } else if (mode === 2) {
      // Direct X Elimination Mode (or Right-Click)
      if (cur === CELL_EMPTY) game.cells[idx] = CELL_MANUAL_X;
      else game.cells[idx] = CELL_EMPTY;
    } else {
      // Authentic ZooDoku Cycle: Empty -> X -> Animal -> Empty
      if (cur === CELL_EMPTY) {
        game.cells[idx] = CELL_MANUAL_X;
      } else if (cur === CELL_MANUAL_X || cur === CELL_AUTO_X) {
        game.cells[idx] = CELL_ANIMAL;
        triggerPopAnimation(idx);
      } else {
        game.cells[idx] = CELL_EMPTY;
      }
    }

    afterBoardStateChange(false);
  }

  // ---------------------------------------------------------------------------
  // 6. TOOLBAR ACTIONS: AUTO-X, LIVE AUTO-X, SMART HINT, MASCOT, UNDO/REDO
  // ---------------------------------------------------------------------------
  window.sweepZoodokuAutoX = function () {
    var N = game.N;
    var avail = countAvailableAutoX();
    if (avail === 0) return;
    pushUndoSnapshot();
    for (var idx = 0; idx < N * N; idx++) {
      if (game.cells[idx] !== CELL_ANIMAL) continue;
      var r = (idx / N) | 0, c = idx % N, g = game.regions[idx];
      for (var r2 = 0; r2 < N; r2++) {
        for (var c2 = 0; c2 < N; c2++) {
          var j = r2 * N + c2;
          if (j !== idx && game.cells[j] === CELL_EMPTY) {
            if (r2 === r || c2 === c || game.regions[j] === g || (Math.abs(r2 - r) <= 1 && Math.abs(c2 - c) <= 1)) {
              game.cells[j] = CELL_MANUAL_X;
            }
          }
        }
      }
    }
    afterBoardStateChange(false);
  };

  window.toggleZoodokuAutoXMode = function () {
    game.autoXMode = !game.autoXMode;
    try { localStorage.setItem("edugates_zoodoku_autox", game.autoXMode ? "1" : "0"); } catch (e) {}
    if (game.autoXMode) {
      syncLiveAutoX();
    } else {
      for (var i = 0; i < game.N * game.N; i++) {
        if (game.cells[i] === CELL_AUTO_X) game.cells[i] = CELL_EMPTY;
      }
    }
    updateAuxButtonsAndStatus();
    drawBoard();
  };

  window.cycleZoodokuMascot = function (specificIdx) {
    if (typeof specificIdx === "number") {
      if (specificIdx === -1) {
        game.mixedZoo = true;
      } else {
        game.mixedZoo = false;
        game.animalIndex = specificIdx % ANIMALS.length;
      }
    } else {
      if (!game.mixedZoo && game.animalIndex === ANIMALS.length - 1) {
        game.mixedZoo = true;
      } else if (game.mixedZoo) {
        game.mixedZoo = false;
        game.animalIndex = 0;
      } else {
        game.animalIndex = (game.animalIndex + 1) % ANIMALS.length;
      }
    }
    updateAuxButtonsAndStatus();
    drawBoard();
  };

  window.clearZoodokuXsKeepAnimals = function () {
    var hasX = false;
    for (var i = 0; i < game.N * game.N; i++) {
      if (game.cells[i] === CELL_MANUAL_X || game.cells[i] === CELL_AUTO_X) { hasX = true; break; }
    }
    if (!hasX) return;
    pushUndoSnapshot();
    for (var j = 0; j < game.N * game.N; j++) {
      if (game.cells[j] !== CELL_ANIMAL) game.cells[j] = CELL_EMPTY;
    }
    afterBoardStateChange(false);
  };

  window.requestZoodokuHint = function () {
    if (isPuzzleSolved()) return;
    var N = game.N;
    var conf = computeConflicts();

    // 1. Check direct rule violations first
    if (conf.pairs.length > 0) {
      var p = conf.pairs[0];
      var msgEn = "⚠️ Rule conflict: Two animals ";
      var msgAr = "⚠️ تعارض مع القواعد: لا يمكن لحيوانين ";
      if (p.kind === "touch") {
        msgEn += "cannot touch each other (not even diagonally)!";
        msgAr += "أن يتلامسا أفقياً أو عمودياً أو حتى قطرياً!";
      } else if (p.kind === "row") {
        msgEn += "cannot share Row " + (p.a.r + 1) + "!";
        msgAr += "التواجد معاً في الصف " + (p.a.r + 1) + "!";
      } else if (p.kind === "col") {
        msgEn += "cannot share Column " + (p.a.c + 1) + "!";
        msgAr += "التواجد معاً في العمود " + (p.a.c + 1) + "!";
      } else {
        var hCol = HABITAT_COLORS[p.a.g % HABITAT_COLORS.length];
        msgEn += "cannot share the " + hCol.en + " habitat!";
        msgAr += "التواجد معاً في موطن اللون " + hCol.ar + "!";
      }
      game.activeHint = {
        cells: [p.a.idx, p.b.idx],
        targetCell: p.b.idx,
        isError: true,
        messageEn: msgEn,
        messageAr: msgAr
      };
      updateAuxButtonsAndStatus();
      drawBoard();
      return;
    }

    // 2. Check silent divergence from unique solution (wrong animal or crossed-out true animal)
    for (var r = 0; r < N; r++) {
      for (var c = 0; c < N; c++) {
        var idx = r * N + c;
        if (game.cells[idx] === CELL_ANIMAL && game.solution[r] !== c) {
          game.activeHint = {
            cells: [idx],
            targetCell: idx,
            isError: true,
            messageEn: "🔍 Check R" + (r + 1) + "C" + (c + 1) + ": This animal doesn't break an immediate rule yet, but leads to an impossible board later.",
            messageAr: "🔍 راجع الخلية (" + (r + 1) + "، " + (c + 1) + "): وضع الحيوان هنا يؤدي إلى استحالة منطقية لاحقاً."
          };
          updateAuxButtonsAndStatus();
          drawBoard();
          return;
        }
      }
    }
    for (var r2 = 0; r2 < N; r2++) {
      var trueIdx = r2 * N + game.solution[r2];
      if (game.cells[trueIdx] === CELL_MANUAL_X || game.cells[trueIdx] === CELL_AUTO_X) {
        game.activeHint = {
          cells: [trueIdx],
          targetCell: trueIdx,
          isError: true,
          messageEn: "🔍 Check R" + (r2 + 1) + "C" + (game.solution[r2] + 1) + ": An ✕ mark here crossed out a square that actually needs an animal!",
          messageAr: "🔍 راجع الخلية (" + (r2 + 1) + "، " + (game.solution[r2] + 1) + "): تم وضع علامة ✕ في مربع يجب أن يحتوي على حيوان!"
        };
        updateAuxButtonsAndStatus();
        drawBoard();
        return;
      }
    }

    // 3. Run real human deduction engine on current board state!
    var simState = new Uint8Array(N * N);
    for (var k = 0; k < N * N; k++) {
      if (game.cells[k] === CELL_ANIMAL) simState[k] = CELL_ANIMAL;
      else if (game.cells[k] === CELL_MANUAL_X || game.cells[k] === CELL_AUTO_X) simState[k] = CELL_MANUAL_X;
      else simState[k] = CELL_EMPTY;
    }

    var step = runHumanDeductionStep(N, game.regions, simState, 3);
    if (step && !step.contradiction) {
      var focusCells = [];
      var target = -1;
      var en = "", ar = "";

      if (step.type === "direct_elim") {
        var sr = (step.sourceCell / N) | 0, sc = step.sourceCell % N;
        focusCells = [step.sourceCell].concat(step.elims.slice(0, 6));
        target = step.elims[0];
        en = "💡 Elimination: The animal at R" + (sr + 1) + "C" + (sc + 1) + " rules out its row, column, habitat, and 8 surrounding squares (tap Auto-✕)!";
        ar = "💡 استبعاد مباشر: الحيوان في (" + (sr + 1) + "، " + (sc + 1) + ") يستبعد صفه وعموده وموطنه اللوني والخلايا الـ 8 المحيطة به!";
      } else if (step.type === "single_region") {
        var hc = HABITAT_COLORS[step.unitIndex % HABITAT_COLORS.length];
        for (var i1 = 0; i1 < N * N; i1++) if (game.regions[i1] === step.unitIndex) focusCells.push(i1);
        target = step.placeCell;
        en = "💡 Last Square Standing: The " + hc.en + " habitat has only ONE open cell left at R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + "!";
        ar = "💡 الخلية الوحيدة المتبقية: موطن اللون " + hc.ar + " لم يتبقَّ فيه سوى مربع واحد متاح عند (" + (((target / N) | 0) + 1) + "، " + ((target % N) + 1) + ")!";
      } else if (step.type === "single_row") {
        for (var c0 = 0; c0 < N; c0++) focusCells.push(step.unitIndex * N + c0);
        target = step.placeCell;
        en = "💡 Last Square Standing: Row " + (step.unitIndex + 1) + " has only ONE open square left — place an animal at R" + (step.unitIndex + 1) + "C" + ((target % N) + 1) + "!";
        ar = "💡 الخلية الوحيدة المتبقية: الصف " + (step.unitIndex + 1) + " لم يتبقَّ فيه سوى مربع واحد متاح — ضع الحيوان في (" + (step.unitIndex + 1) + "، " + ((target % N) + 1) + ")!";
      } else if (step.type === "single_col") {
        for (var r0 = 0; r0 < N; r0++) focusCells.push(r0 * N + step.unitIndex);
        target = step.placeCell;
        en = "💡 Last Square Standing: Column " + (step.unitIndex + 1) + " has only ONE open square left — place an animal at R" + (((target / N) | 0) + 1) + "C" + (step.unitIndex + 1) + "!";
        ar = "💡 الخلية الوحيدة المتبقية: العمود " + (step.unitIndex + 1) + " لم يتبقَّ فيه سوى مربع واحد متاح — ضع الحيوان في (" + (((target / N) | 0) + 1) + "، " + (step.unitIndex + 1) + ")!";
      } else if (step.type === "confine_reg_in_row") {
        var hc2 = HABITAT_COLORS[step.regIndex % HABITAT_COLORS.length];
        for (var i2 = 0; i2 < N * N; i2++) if (game.regions[i2] === step.regIndex && simState[i2] === CELL_EMPTY) focusCells.push(i2);
        target = step.elims[0];
        en = "💡 Region Confinement: All open squares of " + hc2.en + " sit in Row " + (step.rowIndex + 1) + " — mark other habitats in Row " + (step.rowIndex + 1) + " with ✕!";
        ar = "💡 انحصار الموطن: جميع الخلايا المتاحة للون " + hc2.ar + " تقع في الصف " + (step.rowIndex + 1) + " — استبعد بقية الألوان في هذا الصف بعلامة ✕!";
      } else if (step.type === "confine_reg_in_col") {
        var hc3 = HABITAT_COLORS[step.regIndex % HABITAT_COLORS.length];
        for (var i3 = 0; i3 < N * N; i3++) if (game.regions[i3] === step.regIndex && simState[i3] === CELL_EMPTY) focusCells.push(i3);
        target = step.elims[0];
        en = "💡 Region Confinement: All open squares of " + hc3.en + " sit in Column " + (step.colIndex + 1) + " — mark other habitats in Column " + (step.colIndex + 1) + " with ✕!";
        ar = "💡 انحصار الموطن: جميع الخلايا المتاحة للون " + hc3.ar + " تقع في العمود " + (step.colIndex + 1) + " — استبعد بقية الألوان في هذا العمود بعلامة ✕!";
      } else if (step.type === "confine_row_in_reg") {
        var hc4 = HABITAT_COLORS[step.regIndex % HABITAT_COLORS.length];
        focusCells = step.elims.slice();
        target = step.elims[0];
        en = "💡 Line Claiming: Row " + (step.rowIndex + 1) + "'s open cells all belong to " + hc4.en + " — eliminate the rest of " + hc4.en + " outside Row " + (step.rowIndex + 1) + "!";
        ar = "💡 حجز الصف للموطن: جميع خلايا الصف " + (step.rowIndex + 1) + " المتاحة تقع داخل اللون " + hc4.ar + " — استبعد خلايا هذا اللون خارج الصف " + (step.rowIndex + 1) + "!";
      } else if (step.type === "confine_col_in_reg") {
        var hc5 = HABITAT_COLORS[step.regIndex % HABITAT_COLORS.length];
        focusCells = step.elims.slice();
        target = step.elims[0];
        en = "💡 Column Claiming: Column " + (step.colIndex + 1) + "'s open cells all belong to " + hc5.en + " — eliminate the rest of " + hc5.en + " outside Column " + (step.colIndex + 1) + "!";
        ar = "💡 حجز العمود للموطن: جميع خلايا العمود " + (step.colIndex + 1) + " المتاحة تقع داخل اللون " + hc5.ar + " — استبعد خلايا هذا اللون خارج العمود " + (step.colIndex + 1) + "!";
      } else if (step.type === "king_shadow") {
        focusCells = step.unitCells.slice();
        target = step.elims[0];
        en = "💡 No-Touching Shadow: Every valid spot in the highlighted group touches R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + " — so R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + " must be ✕!";
        ar = "💡 تقاطع عدم التلامس: جميع الخيارات المتاحة في المجموعة المظللة تلامس الخلية (" + (((target / N) | 0) + 1) + "، " + ((target % N) + 1) + ") — لذا استبعدها بـ ✕!";
      } else if (step.type === "pair_confine_rows" || step.type === "pair_confine_cols") {
        target = step.elims[0];
        focusCells = step.elims.slice(0, 4);
        en = "💡 Two-Habitat Pigeonhole: Two habitats are completely confined to two lines — rule out R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + "!";
        ar = "💡 مبدأ برج الحمام لموطنين: موطنان محصوران بالكامل في خطين — لذا يمكن استبعاد الخلية (" + (((target / N) | 0) + 1) + "، " + ((target % N) + 1) + ") بعلامة ✕!";
      } else {
        target = step.testCell;
        focusCells = [target];
        en = "💡 What-If Deduction: Placing an animal at R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + " forces another habitat to run out of space — mark R" + (((target / N) | 0) + 1) + "C" + ((target % N) + 1) + " with ✕!";
        ar = "💡 برهان الخُلف (ماذا لو): افتراض حيوان في (" + (((target / N) | 0) + 1) + "، " + ((target % N) + 1) + ") يغلق جميع خيارات موطن آخر — استبعدها بعلامة ✕!";
      }

      game.activeHint = {
        cells: focusCells,
        targetCell: target,
        isError: false,
        messageEn: en,
        messageAr: ar
      };
      updateAuxButtonsAndStatus();
      drawBoard();
      return;
    }

    // Fallback direct nudge
    for (var rf = 0; rf < N; rf++) {
      var solCell = rf * N + game.solution[rf];
      if (game.cells[solCell] !== CELL_ANIMAL) {
        game.activeHint = {
          cells: [solCell],
          targetCell: solCell,
          isError: false,
          messageEn: "💡 Focus on Row " + (rf + 1) + " — examine R" + (rf + 1) + "C" + (game.solution[rf] + 1) + "!",
          messageAr: "💡 ركّز على الصف " + (rf + 1) + " — تفحّص الخلية (" + (rf + 1) + "، " + (game.solution[rf] + 1) + ")!"
        };
        updateAuxButtonsAndStatus();
        drawBoard();
        return;
      }
    }
  };

  // ---------------------------------------------------------------------------
  // 7. CANVAS HIGH-DPI RENDERING (CLASSIC / PLASTIC / PAPER / PATTERNS)
  // ---------------------------------------------------------------------------
  function getActiveBoardStyle() {
    try {
      return localStorage.getItem("edugates_board_style") || "studio";
    } catch (e) {
      return "studio";
    }
  }

  function drawRegionPattern(ctx, patternIdx, x, y, size) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 1, size - 2, size - 2);
    ctx.clip();
    ctx.strokeStyle = "rgba(28, 23, 18, 0.14)";
    ctx.fillStyle = "rgba(28, 23, 18, 0.14)";
    ctx.lineWidth = 1.2;

    var p = patternIdx % 8;
    var step = Math.max(8, Math.round(size / 4));
    if (p === 0) {
      // Polka dots
      for (var dy = step / 2; dy < size; dy += step) {
        for (var dx = step / 2; dx < size; dx += step) {
          ctx.beginPath();
          ctx.arc(x + dx, y + dy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (p === 1) {
      // Forward diagonal stripes
      for (var d = -size; d < size * 2; d += step) {
        ctx.beginPath();
        ctx.moveTo(x + d, y);
        ctx.lineTo(x + d - size, y + size);
        ctx.stroke();
      }
    } else if (p === 2) {
      // Horizontal lines
      for (var hy = step / 2; hy < size; hy += step) {
        ctx.beginPath();
        ctx.moveTo(x, y + hy);
        ctx.lineTo(x + size, y + hy);
        ctx.stroke();
      }
    } else if (p === 3) {
      // Back-diagonal stripes
      for (var d2 = -size; d2 < size * 2; d2 += step) {
        ctx.beginPath();
        ctx.moveTo(x + d2, y);
        ctx.lineTo(x + d2 + size, y + size);
        ctx.stroke();
      }
    } else if (p === 4) {
      // Vertical lines
      for (var vx = step / 2; vx < size; vx += step) {
        ctx.beginPath();
        ctx.moveTo(x + vx, y);
        ctx.lineTo(x + vx, y + size);
        ctx.stroke();
      }
    } else if (p === 5) {
      // Crosshatch
      for (var ch = step; ch < size; ch += step) {
        ctx.beginPath();
        ctx.moveTo(x + ch, y); ctx.lineTo(x + ch, y + size);
        ctx.moveTo(x, y + ch); ctx.lineTo(x + size, y + ch);
        ctx.stroke();
      }
    } else if (p === 6) {
      // Small pluses
      for (var py = step / 2; py < size; py += step) {
        for (var px = step / 2; px < size; px += step) {
          ctx.beginPath();
          ctx.moveTo(x + px - 2.5, y + py); ctx.lineTo(x + px + 2.5, y + py);
          ctx.moveTo(x + px, y + py - 2.5); ctx.lineTo(x + px, y + py + 2.5);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function drawBoard() {
    var canvas = document.getElementById("puzzlecanvas");
    if (!canvas || !game.regions.length) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.__EDUGATES_DPR__ || window.devicePixelRatio || 1;
    var cssW = game.canvasCssW;
    var cssH = game.canvasCssH;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var isDay = document.documentElement.getAttribute("data-theme") === "day";
    var styleMode = getActiveBoardStyle();
    var N = game.N;

    // Outer frame margin for row/column coordinates & breathing room
    var padTop = 26;
    var padLeft = 26;
    var padBottom = 14;
    var padRight = 14;
    var maxGridW = Math.max(160, cssW - padLeft - padRight);
    var maxGridH = Math.max(160, cssH - padTop - padBottom);
    var cellSize = Math.floor(Math.min(maxGridW, maxGridH) / N);
    var gridPx = cellSize * N;
    var ox = Math.floor((cssW - gridPx + (padLeft - padRight)) / 2);
    var oy = Math.floor((cssH - gridPx + (padTop - padBottom)) / 2);

    game.boardMetrics = { x: ox, y: oy, size: gridPx, cell: cellSize };

    // Canvas backdrop card
    var cardBg = styleMode === "parchment" ? "#faf5e8" : (isDay ? "#f8fafc" : "#0f172a");
    document.documentElement.style.setProperty("--puzzle-background", cardBg);
    ctx.fillStyle = cardBg;
    ctx.fillRect(0, 0, cssW, cssH);

    var conf = computeConflicts();
    var rowDone = new Uint8Array(N);
    var colDone = new Uint8Array(N);
    for (var i0 = 0; i0 < N * N; i0++) {
      if (game.cells[i0] === CELL_ANIMAL && !conf.badCells[i0]) {
        rowDone[(i0 / N) | 0] = 1;
        colDone[i0 % N] = 1;
      }
    }

    // 1. Coordinate headers (1..N along top & left, lighting up green when satisfied!)
    ctx.font = "800 " + Math.max(11, Math.min(13, Math.round(cellSize * 0.23))) + "px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (var c = 0; c < N; c++) {
      ctx.fillStyle = colDone[c]
        ? "#10b981"
        : (styleMode === "parchment" || isDay ? "#64748b" : "#94a3b8");
      ctx.fillText(String(c + 1), ox + c * cellSize + cellSize / 2, oy - 12);
    }
    for (var r = 0; r < N; r++) {
      ctx.fillStyle = rowDone[r]
        ? "#10b981"
        : (styleMode === "parchment" || isDay ? "#64748b" : "#94a3b8");
      ctx.fillText(String(r + 1), ox - 13, oy + r * cellSize + cellSize / 2);
    }

    // 2. Soft drop shadow & rounded clip for the ZooDoku grid
    var cornerR = Math.max(8, Math.min(14, Math.round(cellSize * 0.2)));
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 4;
    roundedRectPath(ctx, ox, oy, gridPx, gridPx, cornerR);
    ctx.fillStyle = "#1c1712";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedRectPath(ctx, ox, oy, gridPx, gridPx, cornerR);
    ctx.clip();

    // 3. Draw Colored Habitat Cells
    for (var rr = 0; rr < N; rr++) {
      for (var cc = 0; cc < N; cc++) {
        var idx = rr * N + cc;
        var g = game.regions[idx];
        var hColorObj = HABITAT_COLORS[g % HABITAT_COLORS.length];
        var fillHex = styleMode === "parchment" ? hColorObj.paper : (styleMode === "blueprint" ? hColorObj.blueprint : hColorObj.studio);

        var cx = ox + cc * cellSize;
        var cy = oy + rr * cellSize;
        ctx.fillStyle = fillHex;
        ctx.fillRect(cx, cy, cellSize, cellSize);

        // Plastic 3D bevel sheen in Studio mode (inspired by zoodoku.org 'plastic' style)
        if (styleMode === "studio") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
          ctx.fillRect(cx, cy, cellSize, 2.5);
          ctx.fillRect(cx, cy, 2, cellSize);
          ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
          ctx.fillRect(cx, cy + cellSize - 2.5, cellSize, 2.5);
        } else if (styleMode === "blueprint") {
          drawRegionPattern(ctx, g, cx, cy, cellSize);
        }

        // Hover highlight
        if (rr === game.hoverR && cc === game.hoverC) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
          ctx.fillRect(cx, cy, cellSize, cellSize);
        }

        // Conflict red tint
        if (conf.badCells[idx]) {
          ctx.fillStyle = "rgba(217, 47, 47, 0.28)";
          ctx.fillRect(cx, cy, cellSize, cellSize);
        }

        // Split/Discontinuous habitat indicator dot (for 10x10 Olympiad split zones)
        if (game.discontinuousRegs[g]) {
          ctx.save();
          ctx.fillStyle = "rgba(28, 23, 18, 0.45)";
          ctx.font = "900 " + Math.max(9, Math.round(cellSize * 0.18)) + "px sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText("◆", cx + 4, cy + 3);
          ctx.restore();
        }
      }
    }

    // 4. Subtle internal cell gridlines (within same region)
    ctx.strokeStyle = "rgba(28, 23, 18, 0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var ir = 0; ir < N; ir++) {
      for (var ic = 0; ic < N; ic++) {
        var curG = game.regions[ir * N + ic];
        var x0 = ox + ic * cellSize;
        var y0 = oy + ir * cellSize;
        if (ic + 1 < N && game.regions[ir * N + ic + 1] === curG) {
          ctx.moveTo(x0 + cellSize + 0.5, y0);
          ctx.lineTo(x0 + cellSize + 0.5, y0 + cellSize);
        }
        if (ir + 1 < N && game.regions[(ir + 1) * N + ic] === curG) {
          ctx.moveTo(x0, y0 + cellSize + 0.5);
          ctx.lineTo(x0 + cellSize, y0 + cellSize + 0.5);
        }
      }
    }
    ctx.stroke();

    // 5. Bold dark ink Habitat Region Boundaries (#1c1712)
    var borderW = Math.max(2.8, Math.min(4.2, cellSize * 0.065));
    ctx.strokeStyle = "#1c1712";
    ctx.lineWidth = borderW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (var br = 0; br < N; br++) {
      for (var bc = 0; bc < N; bc++) {
        var bg = game.regions[br * N + bc];
        var bx = ox + bc * cellSize;
        var by = oy + br * cellSize;
        if (bc + 1 < N && game.regions[br * N + bc + 1] !== bg) {
          ctx.moveTo(bx + cellSize, by);
          ctx.lineTo(bx + cellSize, by + cellSize);
        }
        if (br + 1 < N && game.regions[(br + 1) * N + bc] !== bg) {
          ctx.moveTo(bx, by + cellSize);
          ctx.lineTo(bx + cellSize, by + cellSize);
        }
      }
    }
    ctx.stroke();

    // 6. Active Hint / Focus Highlights
    if (game.activeHint && game.activeHint.cells) {
      var hColor = game.activeHint.isError ? "#ef4444" : "#f59e0b";
      for (var hi = 0; hi < game.activeHint.cells.length; hi++) {
        var hIdx = game.activeHint.cells[hi];
        var hr = (hIdx / N) | 0, hc = hIdx % N;
        ctx.save();
        ctx.strokeStyle = hColor;
        ctx.lineWidth = 3;
        ctx.fillStyle = game.activeHint.isError ? "rgba(239, 68, 68, 0.18)" : "rgba(250, 204, 21, 0.22)";
        ctx.fillRect(ox + hc * cellSize + 2, oy + hr * cellSize + 2, cellSize - 4, cellSize - 4);
        ctx.strokeRect(ox + hc * cellSize + 3, oy + hr * cellSize + 3, cellSize - 6, cellSize - 6);
        ctx.restore();
      }
      if (game.activeHint.targetCell !== undefined && game.activeHint.targetCell >= 0) {
        var tr = (game.activeHint.targetCell / N) | 0;
        var tc = game.activeHint.targetCell % N;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ox + tc * cellSize + cellSize / 2, oy + tr * cellSize + cellSize / 2, cellSize * 0.38, 0, Math.PI * 2);
        ctx.strokeStyle = game.activeHint.isError ? "#dc2626" : "#fffbeb";
        ctx.lineWidth = 3.2;
        ctx.setLineDash([5, 4]);
        ctx.stroke();
        ctx.restore();
      }
    }

    // 7. Keyboard / D-Pad Focus Cursor
    if (game.showCursor) {
      ctx.save();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3;
      ctx.strokeRect(ox + game.cursorC * cellSize + 3.5, oy + game.cursorR * cellSize + 3.5, cellSize - 7, cellSize - 7);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(ox + game.cursorC * cellSize + 5.5, oy + game.cursorR * cellSize + 5.5, cellSize - 11, cellSize - 11);
      ctx.restore();
    }

    // 8. Conflict connecting lines (subtle dashed red line linking conflicting animals)
    if (conf.pairs.length > 0) {
      ctx.save();
      ctx.strokeStyle = "rgba(217, 47, 47, 0.88)";
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 5]);
      for (var pi = 0; pi < conf.pairs.length; pi++) {
        var pa = conf.pairs[pi].a, pb = conf.pairs[pi].b;
        ctx.beginPath();
        ctx.moveTo(ox + pa.c * cellSize + cellSize / 2, oy + pa.r * cellSize + cellSize / 2);
        ctx.lineTo(ox + pb.c * cellSize + cellSize / 2, oy + pb.r * cellSize + cellSize / 2);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. Draw X Elimination Marks & Placed ZooDoku Animals!
    for (var r3 = 0; r3 < N; r3++) {
      for (var c3 = 0; c3 < N; c3++) {
        var cIdx = r3 * N + c3;
        var st = game.cells[cIdx];
        if (st === CELL_EMPTY) continue;

        var centerX = ox + c3 * cellSize + cellSize / 2;
        var centerY = oy + r3 * cellSize + cellSize / 2;

        if (st === CELL_MANUAL_X || st === CELL_AUTO_X) {
          var arm = Math.max(4.5, cellSize * (st === CELL_MANUAL_X ? 0.17 : 0.145));
          ctx.save();
          ctx.strokeStyle = st === CELL_MANUAL_X ? "rgba(28, 23, 18, 0.68)" : "rgba(28, 23, 18, 0.38)";
          ctx.lineWidth = Math.max(1.8, cellSize * (st === CELL_MANUAL_X ? 0.055 : 0.042));
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(centerX - arm, centerY - arm);
          ctx.lineTo(centerX + arm, centerY + arm);
          ctx.moveTo(centerX + arm, centerY - arm);
          ctx.lineTo(centerX - arm, centerY + arm);
          ctx.stroke();
          ctx.restore();
        } else if (st === CELL_ANIMAL) {
          var scale = 1.0;
          if (cIdx === game.popCell && game.popProgress < 1) {
            // Elastic pop-in curve
            var t = game.popProgress;
            scale = 0.55 + 0.62 * Math.sin(t * Math.PI * 0.82);
          }

          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);

          // Soft circular token cushion behind animal (crimson ring if conflicting!)
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.36, 0, Math.PI * 2);
          if (conf.badCells[cIdx]) {
            ctx.fillStyle = "rgba(220, 38, 38, 0.32)";
            ctx.fill();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#dc2626";
            ctx.stroke();
          } else {
            ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
            ctx.fill();
          }

          var emoji = getAnimalEmojiForRegion(game.regions[cIdx]);
          var fontPx = Math.max(16, Math.round(cellSize * 0.58));
          ctx.font = fontPx + "px -apple-system, BlinkMacSystemFont, 'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 3;
          ctx.shadowOffsetY = 1.5;
          ctx.fillText(emoji, 0, cellSize * 0.02);
          ctx.restore();
        }
      }
    }

    ctx.restore(); // end grid clip

    // Outer crisp walnut frame border
    ctx.save();
    roundedRectPath(ctx, ox, oy, gridPx, gridPx, cornerR);
    ctx.strokeStyle = "#1c1712";
    ctx.lineWidth = Math.max(3.2, borderW + 0.6);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  window.__edugatesForceRedraw = drawBoard;
  window.__zoodokuEngine = {
    getState: function () {
      var conf = computeConflicts();
      return {
        N: game.N,
        presetIndex: game.presetIndex,
        gameId: game.gameId,
        seed: game.seed,
        regions: game.regions.slice(),
        solution: game.solution.slice(),
        cells: game.cells.slice(),
        autoXMode: game.autoXMode,
        animalIndex: game.animalIndex,
        mixedZoo: game.mixedZoo,
        animalCount: conf.animalCount,
        conflictCount: conf.pairs.length,
        activeHint: game.activeHint,
        boardMetrics: game.boardMetrics,
        canvasCssW: game.canvasCssW,
        canvasCssH: game.canvasCssH,
        discontinuousCount: Object.keys(game.discontinuousRegs).length
      };
    }
  };

  // ---------------------------------------------------------------------------
  // 8. UI SYNCHRONIZATION, STATUS STRIP & STUCK DETECTOR
  // ---------------------------------------------------------------------------
  function updatePermalinks() {
    var descLink = document.getElementById("permalink-desc");
    var seedLink = document.getElementById("permalink-seed");
    var base = window.location.pathname;
    if (descLink) descLink.href = base + "#" + encodeURIComponent(game.gameId);
    if (seedLink) seedLink.href = base + "#seed=" + encodeURIComponent(game.seed) + "&p=" + game.presetIndex;
  }

  function updateAuxButtonsAndStatus() {
    var ar = isAr();
    var conf = computeConflicts();
    var availAutoX = countAvailableAutoX();

    // 1. Undo / Redo disabled state
    var undoBtn = document.getElementById("undo");
    var redoBtn = document.getElementById("redo");
    if (undoBtn) undoBtn.disabled = game.undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = game.redoStack.length === 0;

    // 2. Auto-X Sweep button & Live Auto-X Toggle button
    var sweepBtn = document.getElementById("zoodoku-autox-btn");
    if (sweepBtn) {
      sweepBtn.disabled = availAutoX === 0 || game.autoXMode;
      sweepBtn.textContent = ar
        ? ("✕ استبعاد تلقائي" + (availAutoX > 0 && !game.autoXMode ? " (" + availAutoX + ")" : ""))
        : ("✕ Auto-✕" + (availAutoX > 0 && !game.autoXMode ? " (" + availAutoX + ")" : ""));
      sweepBtn.title = availAutoX > 0
        ? (ar ? "شطب جميع الخلايا المستبعدة حول الحيوانات الموضوعة" : "Cross off all squares ruled out by placed animals")
        : (ar ? "لا توجد خلايا إضافية لاستبعادها حالياً" : "Nothing left to rule out right now");
    }

    var autoToggleBtn = document.getElementById("zoodoku-autox-toggle");
    if (autoToggleBtn) {
      autoToggleBtn.classList.toggle("is-active", game.autoXMode);
      autoToggleBtn.textContent = game.autoXMode
        ? (ar ? "⚡ شطب تلقائي: مفعل" : "⚡ Auto-✕: ON")
        : (ar ? "⚡ شطب تلقائي: متوقف" : "⚡ Auto-✕: OFF");
    }

    var hintBtn = document.getElementById("zoodoku-hint-btn");
    if (hintBtn) {
      hintBtn.textContent = ar ? "💡 تلميح منطقي" : "💡 Smart Hint";
    }

    var mascotBtn = document.getElementById("zoodoku-mascot-btn");
    if (mascotBtn) {
      if (game.mixedZoo) {
        mascotBtn.textContent = ar ? "🌈 حديقة متنوعة" : "🌈 Mixed Zoo";
      } else {
        var mInfo = ANIMALS[game.animalIndex % ANIMALS.length];
        mascotBtn.textContent = mInfo.emoji + " " + (ar ? mInfo.ar : mInfo.en);
      }
    }

    // 3. Animal STEM Factoid & Progress Counter
    var factEl = document.getElementById("zoodoku-fact-bar");
    if (factEl) {
      var curAnimal = ANIMALS[game.animalIndex % ANIMALS.length];
      var preset = PRESETS[game.presetIndex] || PRESETS[0];
      var tagLabel = preset.isDaily
        ? (ar ? ("📅 تحدي اليوم #" + getDailyNumber(getTodayString()) + " · " + game.N + "×" + game.N) : ("📅 Daily #" + getDailyNumber(getTodayString()) + " · " + game.N + "×" + game.N))
        : (ar ? preset.labelAr : preset.labelEn);
      var placedTxt = ar
        ? ("الحيوانات: " + conf.animalCount + " / " + game.N)
        : ("Animals: " + conf.animalCount + " / " + game.N);
      factEl.innerHTML =
        '<span><strong>' + tagLabel + '</strong></span>' +
        '<span style="color:var(--brand-gold);font-weight:800">' + placedTxt + '</span>' +
        '<span>' + curAnimal.emoji + ' <em>' + curAnimal.sci + '</em> (' + (ar ? curAnimal.ar : curAnimal.en) + ')</span>';
    }

    // 4. Status / Hint / Conflict / Stuck Strip (#statusbar & #zoodoku-stuck-bar)
    var statusEl = document.getElementById("statusbar");
    if (statusEl) {
      if (isPuzzleSolved()) {
        statusEl.style.color = "#10b981";
        statusEl.textContent = ar
          ? "🎉 أحسنت! تم توزيع جميع الحيوانات في مواطنها دون أي تلامس!"
          : "🎉 Solved! Every row, column, and colored habitat has 1 non-touching animal!";
      } else if (game.activeHint) {
        statusEl.style.color = game.activeHint.isError ? "#f87171" : "#fbbf24";
        statusEl.textContent = ar ? game.activeHint.messageAr : game.activeHint.messageEn;
      } else if (conf.pairs.length > 0) {
        statusEl.style.color = "#f87171";
        if (conf.reason === "touch") {
          statusEl.textContent = ar ? "⚠️ تنبيه: لا يجوز تلامس حيوانين حتى قطرياً!" : "⚠️ Rule alert: Two animals cannot touch — not even diagonally!";
        } else if (conf.reason === "row") {
          statusEl.textContent = ar ? "⚠️ تنبيه: حيوان واحد فقط في كل صف!" : "⚠️ Rule alert: Only ONE animal allowed per row!";
        } else if (conf.reason === "col") {
          statusEl.textContent = ar ? "⚠️ تنبيه: حيوان واحد فقط في كل عمود!" : "⚠️ Rule alert: Only ONE animal allowed per column!";
        } else {
          statusEl.textContent = ar ? "⚠️ تنبيه: حيوان واحد فقط في كل موطن لوني!" : "⚠️ Rule alert: Only ONE animal allowed per colored habitat!";
        }
      } else {
        var curEmoji = getAnimalEmojiForRegion(0);
        statusEl.style.color = "";
        statusEl.textContent = ar
          ? ("انقر مرة لوضع ✕، وانقر ثانية لوضع " + curEmoji + " • اسحب لرسم عدة علامات ✕")
          : ("Tap once to mark ✕, tap again to place " + curEmoji + " • Drag to sweep ✕s");
      }
    }

    // Stuck detector (every cell filled with X or Animal, no rule conflict, but < N animals)
    var stuckBar = document.getElementById("zoodoku-stuck-bar");
    if (stuckBar) {
      var emptyCount = 0;
      for (var s = 0; s < game.N * game.N; s++) {
        if (game.cells[s] === CELL_EMPTY) emptyCount++;
      }
      var isStuck = emptyCount === 0 && conf.animalCount < game.N && conf.pairs.length === 0;
      stuckBar.style.display = isStuck ? "flex" : "none";
      if (isStuck) {
        var stuckTxt = document.getElementById("zoodoku-stuck-msg");
        var stuckBtn = document.getElementById("zoodoku-stuck-btn");
        if (stuckTxt) {
          stuckTxt.textContent = ar
            ? "امتلأت جميع الخلايا دون اكتمال الحل! يبدو أن حيواناً وُضع في غير مكانه أو شُطبت خلية صحيحة."
            : "Every square is marked, so only " + conf.animalCount + "/" + game.N + " animals fit! A square that needs an animal was crossed out.";
        }
        if (stuckBtn) {
          stuckBtn.textContent = ar ? "🧹 مسح علامات ✕ والاحتفاظ بالحيوانات" : "🧹 Clear ✕s, Keep My Animals";
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 9. BOARD LOADING, PRESETS & POINTER / KEYBOARD EVENTS
  // ---------------------------------------------------------------------------
  function loadBoardData(boardObj, presetIdx) {
    if (typeof presetIdx === "number") game.presetIndex = presetIdx;
    game.N = boardObj.N;
    game.regions = boardObj.regions.slice();
    game.solution = boardObj.solution.slice();
    game.tierUsed = boardObj.tierUsed || 2;
    game.seed = boardObj.seed || "";
    game.gameId = encodeGameId(game.N, game.regions);
    game.cells = new Array(game.N * game.N).fill(CELL_EMPTY);
    game.undoStack = [];
    game.redoStack = [];
    game.activeHint = null;
    game.cursorR = 0;
    game.cursorC = 0;
    game.discontinuousRegs = detectDiscontinuousRegions(game.N, game.regions);

    // Deterministic daily mascot on Daily preset (or preserve user choice)
    var p = PRESETS[game.presetIndex];
    if (p && p.isDaily && !game.mixedZoo) {
      game.animalIndex = getDailyNumber(getTodayString()) % 10;
    }

    // Keep hidden preset radios & Smartboard dropdown synchronized
    var ul = document.getElementById("gametype");
    if (ul) {
      var radios = ul.querySelectorAll("input[type='radio'][name='preset']");
      for (var ri = 0; ri < radios.length; ri++) {
        radios[ri].checked = (ri === game.presetIndex);
      }
    }
    var sel = document.getElementById("sb-preset-select");
    if (sel && String(sel.value) !== String(game.presetIndex)) {
      sel.value = String(game.presetIndex);
    }

    updatePermalinks();
    updateAuxButtonsAndStatus();
    drawBoard();
    if (window.__edugatesEvaluateVictory) window.__edugatesEvaluateVictory("reset", "");
  }

  function startNewGame(customSeed) {
    var preset = PRESETS[game.presetIndex] || PRESETS[0];
    var seedStr;
    if (customSeed) {
      seedStr = String(customSeed);
    } else if (preset.isDaily && !game._dailyPlayedOnce) {
      game._dailyPlayedOnce = true;
      seedStr = "zoodoku-daily-" + getTodayString() + "-8x8";
    } else {
      seedStr = preset.id + "-" + Date.now() + "-" + Math.floor(Math.random() * 1000000);
    }
    var board = generateZoodokuBoard(preset, seedStr);
    loadBoardData(board, game.presetIndex);
  }

  function populateHiddenPresetMenu() {
    var ul = document.getElementById("gametype");
    if (!ul) return;
    var existingRadios = ul.querySelectorAll("input[type='radio'][name='preset']");
    if (existingRadios.length === PRESETS.length) {
      for (var k = 0; k < PRESETS.length; k++) {
        existingRadios[k].checked = (k === game.presetIndex);
        var lbl = existingRadios[k].parentElement;
        if (lbl && lbl.lastChild) {
          lbl.lastChild.nodeValue = " " + (isAr() ? PRESETS[k].labelAr : PRESETS[k].labelEn);
        }
      }
      return;
    }
    ul.innerHTML = "";
    for (var i = 0; i < PRESETS.length; i++) {
      var li = document.createElement("li");
      var label = document.createElement("label");
      var radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "preset";
      radio.value = String(i);
      if (i === game.presetIndex) radio.checked = true;
      (function (idx) {
        radio.onclick = function () {
          game.presetIndex = idx;
          if (PRESETS[idx].isDaily) game._dailyPlayedOnce = false;
          startNewGame();
        };
      })(i);
      label.appendChild(radio);
      label.appendChild(document.createTextNode(" " + (isAr() ? PRESETS[i].labelAr : PRESETS[i].labelEn)));
      li.appendChild(label);
      ul.appendChild(li);
    }
  }

  function cellFromClientCoords(clientX, clientY) {
    var canvas = document.getElementById("puzzlecanvas");
    if (!canvas) return null;
    var rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    var x = (clientX - rect.left) * (game.canvasCssW / rect.width);
    var y = (clientY - rect.top) * (game.canvasCssH / rect.height);
    var m = game.boardMetrics;
    var c = Math.floor((x - m.x) / m.cell);
    var r = Math.floor((y - m.y) / m.cell);
    if (r < 0 || r >= game.N || c < 0 || c >= game.N) return null;
    return { r: r, c: c, idx: r * game.N + c };
  }

  function bindCanvasInteractions() {
    var canvas = document.getElementById("puzzlecanvas");
    if (!canvas) return;

    canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    canvas.addEventListener("pointerdown", function (e) {
      if (window.__EDUGATES_ANNOTATE_ACTIVE__) return;
      var hit = cellFromClientCoords(e.clientX, e.clientY);
      if (!hit) return;
      e.preventDefault();
      canvas.focus();
      game.showCursor = false;
      game.cursorR = hit.r;
      game.cursorC = hit.c;

      var isRight = e.button === 2;
      var curState = game.cells[hit.idx];

      // Prepare potential drag-sweep for X marks (authentic zoodoku.org UX!)
      var dragAction = null;
      if (isRight) {
        dragAction = curState === CELL_EMPTY ? "paintX" : "eraseX";
      } else if ((window.__EDUGATES_CLICK_MODE__ || 0) !== 1) {
        if (curState === CELL_EMPTY) dragAction = "paintX";
        else if (curState === CELL_MANUAL_X || curState === CELL_AUTO_X) dragAction = "eraseX";
      }

      game.dragState = {
        pointerId: e.pointerId,
        startIdx: hit.idx,
        startR: hit.r,
        startC: hit.c,
        isRight: isRight,
        dragged: false,
        action: dragAction,
        snapshot: game.cells.slice()
      };
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });

    canvas.addEventListener("pointermove", function (e) {
      var hit = cellFromClientCoords(e.clientX, e.clientY);
      var newHR = hit ? hit.r : -1;
      var newHC = hit ? hit.c : -1;
      if (newHR !== game.hoverR || newHC !== game.hoverC) {
        game.hoverR = newHR;
        game.hoverC = newHC;
        if (!game.dragState) drawBoard();
      }

      if (!game.dragState || e.pointerId !== game.dragState.pointerId || !hit) return;
      if (hit.idx !== game.dragState.startIdx && game.dragState.action) {
        if (!game.dragState.dragged) {
          game.dragState.dragged = true;
          pushUndoSnapshot(game.dragState.snapshot);
          // Apply sweep to starting cell first
          if (game.dragState.action === "paintX" && game.cells[game.dragState.startIdx] === CELL_EMPTY) {
            game.cells[game.dragState.startIdx] = CELL_MANUAL_X;
          } else if (game.dragState.action === "eraseX" && (game.cells[game.dragState.startIdx] === CELL_MANUAL_X || game.cells[game.dragState.startIdx] === CELL_AUTO_X)) {
            game.cells[game.dragState.startIdx] = CELL_EMPTY;
          }
        }
        // Apply sweep to hovered cell (never overwriting placed animals!)
        var changed = false;
        if (game.dragState.action === "paintX" && game.cells[hit.idx] === CELL_EMPTY) {
          game.cells[hit.idx] = CELL_MANUAL_X;
          changed = true;
        } else if (game.dragState.action === "eraseX" && (game.cells[hit.idx] === CELL_MANUAL_X || game.cells[hit.idx] === CELL_AUTO_X)) {
          game.cells[hit.idx] = CELL_EMPTY;
          changed = true;
        }
        if (changed) {
          updateAuxButtonsAndStatus();
          drawBoard();
        }
      }
    });

    function finishPointer(e) {
      if (!game.dragState || e.pointerId !== game.dragState.pointerId) return;
      var st = game.dragState;
      game.dragState = null;
      if (st.dragged) {
        afterBoardStateChange(false);
      } else {
        if (st.isRight) {
          applyCellTap(st.startR, st.startC, 2);
        } else {
          applyCellTap(st.startR, st.startC);
        }
      }
    }

    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", function () { game.dragState = null; });
    canvas.addEventListener("pointerleave", function () {
      if (game.hoverR !== -1) {
        game.hoverR = -1;
        game.hoverC = -1;
        drawBoard();
      }
    });

    canvas.addEventListener("keydown", function (e) {
      var k = e.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Enter", "Backspace", "Delete"].indexOf(k) !== -1) {
        e.preventDefault();
      }
      handleKeyAction(k === " " ? "Spacebar" : k);
    });
  }

  function handleKeyAction(keyStr) {
    var N = game.N;
    if (keyStr === "ArrowUp") { game.showCursor = true; game.cursorR = (game.cursorR + N - 1) % N; drawBoard(); return true; }
    if (keyStr === "ArrowDown") { game.showCursor = true; game.cursorR = (game.cursorR + 1) % N; drawBoard(); return true; }
    if (keyStr === "ArrowLeft") { game.showCursor = true; game.cursorC = (game.cursorC + N - 1) % N; drawBoard(); return true; }
    if (keyStr === "ArrowRight") { game.showCursor = true; game.cursorC = (game.cursorC + 1) % N; drawBoard(); return true; }
    if (keyStr === "Home") { game.showCursor = true; game.cursorR = Math.max(0, game.cursorR - 1); game.cursorC = Math.max(0, game.cursorC - 1); drawBoard(); return true; }
    if (keyStr === "PageUp") { game.showCursor = true; game.cursorR = Math.max(0, game.cursorR - 1); game.cursorC = Math.min(N - 1, game.cursorC + 1); drawBoard(); return true; }
    if (keyStr === "End") { game.showCursor = true; game.cursorR = Math.min(N - 1, game.cursorR + 1); game.cursorC = Math.max(0, game.cursorC - 1); drawBoard(); return true; }
    if (keyStr === "PageDown") { game.showCursor = true; game.cursorR = Math.min(N - 1, game.cursorR + 1); game.cursorC = Math.min(N - 1, game.cursorC + 1); drawBoard(); return true; }

    if (keyStr === "Enter") {
      game.showCursor = true;
      applyCellTap(game.cursorR, game.cursorC, 1); // Place/toggle animal directly
      return true;
    }
    if (keyStr === "Spacebar" || keyStr === "x" || keyStr === "X") {
      game.showCursor = true;
      applyCellTap(game.cursorR, game.cursorC, 2); // Toggle X elimination
      return true;
    }
    if (keyStr === "Backspace" || keyStr === "Delete") {
      var idx = game.cursorR * N + game.cursorC;
      if (game.cells[idx] !== CELL_EMPTY) {
        pushUndoSnapshot();
        game.cells[idx] = CELL_EMPTY;
        afterBoardStateChange(true);
      }
      return true;
    }
    if (keyStr === "a" || keyStr === "A") {
      window.sweepZoodokuAutoX();
      return true;
    }
    if (keyStr === "h" || keyStr === "H") {
      window.requestZoodokuHint();
      return true;
    }
    if (keyStr === "m" || keyStr === "M") {
      window.cycleZoodokuMascot();
      return true;
    }
    if (keyStr === "z" || keyStr === "Z" || keyStr === "u" || keyStr === "U") {
      var uBtn = document.getElementById("undo");
      if (uBtn) uBtn.click();
      return true;
    }
    if (keyStr === "y" || keyStr === "Y" || keyStr === "r" || keyStr === "R") {
      var rBtn = document.getElementById("redo");
      if (rBtn) rBtn.click();
      return true;
    }
    return false;
  }

  function bindToolbarButtons() {
    var newBtn = document.getElementById("new");
    if (newBtn) {
      newBtn.addEventListener("click", function () {
        startNewGame();
      });
    }

    var restartBtn = document.getElementById("restart");
    if (restartBtn) {
      restartBtn.addEventListener("click", function () {
        pushUndoSnapshot();
        game.cells.fill(CELL_EMPTY);
        game.undoStack = [];
        game.redoStack = [];
        game.activeHint = null;
        afterBoardStateChange(true);
      });
    }

    var undoBtn = document.getElementById("undo");
    if (undoBtn) {
      undoBtn.addEventListener("click", function () {
        if (game.undoStack.length === 0) return;
        game.redoStack.push(game.cells.slice());
        game.cells = game.undoStack.pop();
        game.activeHint = null;
        afterBoardStateChange(true);
      });
    }

    var redoBtn = document.getElementById("redo");
    if (redoBtn) {
      redoBtn.addEventListener("click", function () {
        if (game.redoStack.length === 0) return;
        game.undoStack.push(game.cells.slice());
        game.cells = game.redoStack.pop();
        game.activeHint = null;
        afterBoardStateChange(true);
      });
    }

    var solveBtn = document.getElementById("solve");
    if (solveBtn) {
      solveBtn.addEventListener("click", function () {
        pushUndoSnapshot();
        var N = game.N;
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            game.cells[r * N + c] = (game.solution[r] === c) ? CELL_ANIMAL : CELL_MANUAL_X;
          }
        }
        game.activeHint = null;
        updateAuxButtonsAndStatus();
        drawBoard();
        if (window.__edugatesOnStatus) window.__edugatesOnStatus("COMPLETED!");
      });
    }

    var specBtn = document.getElementById("specific");
    if (specBtn) {
      specBtn.addEventListener("click", function () {
        var promptMsg = isAr()
          ? "أدخل معرّف لغز زودوكو (Game ID):"
          : "Enter ZooDoku Game ID (e.g. 8:0011...):";
        var val = window.prompt(promptMsg, game.gameId);
        if (!val) return;
        var parsed = decodeGameId(val);
        if (parsed) {
          loadBoardData(parsed, game.presetIndex);
        } else {
          window.alert(isAr() ? "معرّف اللغز غير صالح!" : "Invalid ZooDoku Game ID!");
        }
      });
    }

    var randBtn = document.getElementById("random");
    if (randBtn) {
      randBtn.addEventListener("click", function () {
        var promptMsg = isAr()
          ? "أدخل بذرة المسابقة العشوائية (Seed):"
          : "Enter Competition Random Seed:";
        var val = window.prompt(promptMsg, game.seed);
        if (val) startNewGame(val.trim());
      });
    }

    var prefsBtn = document.getElementById("prefs");
    if (prefsBtn) {
      prefsBtn.addEventListener("click", function () {
        window.cycleZoodokuMascot();
      });
    }

    var saveBtn = document.getElementById("save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var payload = JSON.stringify({
          puzzle: "zoodoku",
          v: 1,
          presetIndex: game.presetIndex,
          N: game.N,
          regions: game.regions,
          solution: game.solution,
          cells: game.cells,
          seed: game.seed
        });
        var blob = new Blob([payload], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "zoodoku-" + game.N + "x" + game.N + ".json";
        a.click();
      });
    }

    var loadBtn = document.getElementById("load");
    if (loadBtn) {
      loadBtn.addEventListener("click", function () {
        var inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".json,application/json";
        inp.onchange = function () {
          var file = inp.files && inp.files[0];
          if (!file) return;
          var reader = new FileReader();
          reader.onload = function () {
            try {
              var obj = JSON.parse(String(reader.result));
              if (obj && obj.N && Array.isArray(obj.regions) && Array.isArray(obj.solution)) {
                loadBoardData(obj, obj.presetIndex || 0);
                if (Array.isArray(obj.cells) && obj.cells.length === obj.N * obj.N) {
                  game.cells = obj.cells.slice();
                  afterBoardStateChange(true);
                }
              }
            } catch (e) {}
          };
          reader.readAsText(file);
        };
        inp.click();
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 10. MODULE BRIDGE FOR EDUGATES SMARTBOARD ENGINE & INITIALIZATION
  // ---------------------------------------------------------------------------
  window.Module = {
    _resize_puzzle: function (physW, physH) {
      var canvas = document.getElementById("puzzlecanvas");
      if (!canvas) return;
      var dpr = window.__EDUGATES_DPR__ || window.devicePixelRatio || 1;
      var side = Math.max(260, Math.min(physW / dpr, physH / dpr));
      var cssSide = Math.floor(side);
      game.canvasCssW = cssSide;
      game.canvasCssH = cssSide;
      canvas.width = Math.floor(cssSide * dpr);
      canvas.height = Math.floor(cssSide * dpr);
      canvas.style.width = cssSide + "px";
      canvas.style.height = cssSide + "px";
      var resDiv = document.getElementById("resizable");
      if (resDiv) {
        resDiv.style.width = cssSide + "px";
      }
      drawBoard();
    },
    _rescale_puzzle: function () {
      drawBoard();
    },
    _command: function () {},
    cwrap: function (fnName) {
      if (fnName === "key") {
        return function (keyCode, keyStr) {
          return handleKeyAction(keyStr);
        };
      }
      return function () {};
    }
  };

  function initZoodoku() {
    try {
      game.autoXMode = localStorage.getItem("edugates_zoodoku_autox") === "1";
    } catch (e) {}

    var apology = document.getElementById("apology");
    if (apology) apology.style.display = "none";

    populateHiddenPresetMenu();
    bindCanvasInteractions();
    bindToolbarButtons();

    // Check URL hash for shared Game ID or Seed
    var hash = (window.location.hash || "").replace(/^#/, "");
    var loadedFromHash = false;
    if (hash) {
      if (hash.indexOf("seed=") === 0) {
        var params = new URLSearchParams(hash);
        var pIdx = parseInt(params.get("p") || "0", 10);
        if (!isNaN(pIdx) && PRESETS[pIdx]) game.presetIndex = pIdx;
        var sd = params.get("seed");
        if (sd) {
          startNewGame(sd);
          loadedFromHash = true;
        }
      } else {
        var decoded = decodeGameId(decodeURIComponent(hash));
        if (decoded) {
          loadBoardData(decoded, game.presetIndex);
          loadedFromHash = true;
        }
      }
    }

    if (!loadedFromHash) {
      startNewGame();
    }

    // Re-sync localized strings whenever language or theme toggles
    var obs = new MutationObserver(function () {
      populateHiddenPresetMenu();
      var sel = document.getElementById("sb-preset-select");
      if (sel && sel.options.length === PRESETS.length) {
        for (var i = 0; i < PRESETS.length; i++) {
          sel.options[i].textContent = isAr() ? PRESETS[i].labelAr : PRESETS[i].labelEn;
        }
      }
      updateAuxButtonsAndStatus();
      drawBoard();
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["lang", "data-theme"] });

    if (typeof window.__edugatesPostInit === "function") {
      window.__edugatesPostInit();
    } else {
      window.Module._resize_puzzle(540, 540);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initZoodoku);
  } else {
    initZoodoku();
  }
})();
