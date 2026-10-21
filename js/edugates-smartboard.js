/* ==========================================================================
   Edugates International School — Math-Science Team
   Smartboard & Low-Processor Optimization Engine (edugates-smartboard.js)
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

  // Puzzle-specific Touch Control Metadata (Click mode hints & Keypad profiles)
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

  // Detect current puzzle ID from body attribute or script tag
  function getCurrentPuzzleId() {
    var bodyId = document.body.getAttribute("data-puzzle");
    if (bodyId) return bodyId;
    var scripts = document.querySelectorAll("script[src*='js/']");
    for (var i = 0; i < scripts.length; i++) {
      var m = scripts[i].src.match(/js\/([a-z0-9]+)\.js/i);
      if (m && m[1] !== "edugates") return m[1].toLowerCase();
    }
    return "";
  }

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
    var availW = Math.max(260, (viewport.clientWidth - 24) * currentZoomScale);
    var availH = Math.max(260, (viewport.clientHeight - 24) * currentZoomScale);
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
      // Check if inside a nested submenu
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

  // Classroom Stopwatch Timer
  var timerSeconds = 0;
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
      if (victoryTime) victoryTime.textContent = "Solved in " + formatTime(timerSeconds) + "!";
      banner.classList.add("visible");
    } else if (txt && txt.indexOf("COMPLETED") === -1) {
      banner.classList.remove("visible");
    }
  };

  window.__edugatesOnMove = function () {
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

  // Hook into _js_post_init so that as soon as WASM finishes booting, we sync presets & auto-fit the board
  var postInitDone = false;
  window.__edugatesPostInit = function () {
    if (postInitDone) return;
    postInitDone = true;
    syncPresetsDropdown();
    buildSmartboardControls();
    initAnnotationLayer();
    startClassroomTimer();
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
