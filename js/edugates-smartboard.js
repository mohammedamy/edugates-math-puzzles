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

  var currentLang = localStorage.getItem("edugates_math_lang") || "en";
  if (typeof window !== "undefined" && window.location && window.location.search) {
    if (window.location.search.indexOf("lang=ar") !== -1) {
      currentLang = "ar";
      try { localStorage.setItem("edugates_math_lang", "ar"); } catch (e) {}
    } else if (window.location.search.indexOf("lang=en") !== -1) {
      currentLang = "en";
      try { localStorage.setItem("edugates_math_lang", "en"); } catch (e) {}
    }
  }
  document.documentElement.setAttribute("lang", currentLang);
  document.documentElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");
  window.__EDUGATES_LANG__ = currentLang;

  function isAr() {
    return currentLang === "ar";
  }

  // Bilingual Dictionary for all 41 Mathematical Workbenches
  var PUZZLE_I18N = {
    "bridges": {
        "titleEn": "🌉 Bridges (Hashi)",
        "titleAr": "🌉 الجسور (هاشي)",
        "domainEn": "Graph Theory: $G = (V, E)$, $\\deg(v)$, Planar Connectivity",
        "domainAr": "نظرية البيانات: $G = (V, E)$، درجات الرؤوس $\\deg(v)$ والاتصال المستوي",
        "descEn": "Connect islands using degree invariants $\\sum_{u} w(v, u) = k_v$ without edge intersections.",
        "descAr": "اربط الجزر بجسور مفردة أو مزدوجة لتحقيق شرط الدرجات $\\sum_{u} w(v, u) = k_v$ دون أي تقاطع.",
        "leftAr": "مد جسر / قفل",
        "rightAr": "علامة عدم وجود جسر",
        "middleAr": "تمييز الجزيرة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Planar Graph Degree Sequences and Connectivity ($c(G) = 1$).</p>\n<p>Construct an undirected planar multigraph where vertices represent islands and edges represent bridges ($w(e) \\in \\{1, 2\\}$):</p>\n<div class=\"katex-display\">$$\\deg(v) = \\sum_{u \\in N(v)} w(v, u) = k_v \\quad (k_v \\in \\{1, \\dots, 8\\}), \\qquad \\operatorname{cr}(G) = 0$$</div>\n<p>• Bridges must run purely horizontally or vertically.<br>• At most 2 bridges can link any pair of islands ($w(e) \\le 2$).<br>• No two bridges may cross each other.<br>• All islands must belong to a single connected component ($c(G) = 1$).</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> نظرية البيانات المستوية وتوازن درجات الرؤوس ($c(G) = 1$).</p>\n<p>قم ببناء بيان مستوي متصل يمثل الجزر كرؤوس والجسور كأضلاع ($w(e) \\in \\{1, 2\\}$):</p>\n<div class=\"katex-display\">$$\\deg(v) = \\sum_{u \\in N(v)} w(v, u) = k_v \\quad (k_v \\in \\{1, \\dots, 8\\}), \\qquad \\operatorname{cr}(G) = 0$$</div>\n<p>• تمتد الجسور أفقياً أو رأسياً فقط.<br>• لا يمكن وضع أكثر من جسرين بين نفس الجزيرتين ($w(e) \\le 2$).<br>• لا يُسمح بتقاطع الجسور إطلاقاً.<br>• يجب أن تكون جميع الجزر متصلة في مكون واحد مترابط ($c(G) = 1$).</p>"
    },
    "towers": {
        "titleEn": "🏙️ Towers (Skyscrapers)",
        "titleAr": "🏙️ الأبراج (ناطحات السحاب)",
        "domainEn": "Latin Squares: $L \\in \\{1,\\dots,N\\}^{N\\times N}$, Orthogonal Sightlines",
        "domainAr": "المربعات اللاتينية: $L \\in \\{1,\\dots,N\\}^{N\\times N}$ وخطوط الرؤية المتعامدة",
        "descEn": "Deduce 3D heights from boundary visibility sequences $V(\\mathbf{x}) = |\\{j \\mid \\forall k < j, L_k < L_j\\}|$.",
        "descAr": "استنتج ارتفاعات الأبراج ثلاثية الأبعاد من متتاليات الرؤية الحدية $V(\\mathbf{x}) = |\\{j \\mid \\forall k < j, L_k < L_j\\}|$.",
        "leftAr": "تحديد المربع",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح المربع",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Latin Squares with Monotone Prefix Visibility Constraints.</p>\n<p>Place skyscraper heights $1, \\dots, N$ such that each row and column forms a permutation $\\sigma \\in S_N$:</p>\n<div class=\"katex-display\">$$\\forall i, j: L_{i,j} \\in \\{1, \\dots, N\\}, \\quad \\sum_{k=1}^N L_{ik} = \\frac{N(N+1)}{2}, \\quad V(\\text{ray}) = \\left|\\left\\{j \\,\\middle|\\, \\forall k < j, h_k < h_j\\right\\}\\right|$$</div>\n<p>• Taller buildings completely conceal shorter buildings behind them.<br>• Edge clues dictate the exact count of visible towers along each orthogonal sightline.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المربعات اللاتينية وقيود الرؤية الرتيبة ثلاثية الأبعاد.</p>\n<p>املأ الشبكة بأبراج بارتفاعات $1, \\dots, N$ بحيث يشكل كل صف وكل عمود تبديلة كاملة $\\sigma \\in S_N$:</p>\n<div class=\"katex-display\">$$\\forall i, j: L_{i,j} \\in \\{1, \\dots, N\\}, \\quad \\sum_{k=1}^N L_{ik} = \\frac{N(N+1)}{2}, \\quad V(\\text{ray}) = \\left|\\left\\{j \\,\\middle|\\, \\forall k < j, h_k < h_j\\right\\}\\right|$$</div>\n<p>• الأبراج الأطول تحجب الأبراج الأقصر خلفها تماماً.<br>• الأرقام على الحواف تمثل عدد الأبراج المرئية عند النظر من ذلك الاتجاه على طول خط الرؤية المتعامد.</p>"
    },
    "lightup": {
        "titleEn": "💡 Light Up (Akari)",
        "titleAr": "💡 الإضاءة (أكاري)",
        "domainEn": "Ray-Casting & Vertex Cover: $R_\\theta(x, y)$, Local Constraints",
        "domainAr": "تتبع الأشعة وتغطية الرؤوس: $R_\\theta(x, y)$ والقيود الموضعية",
        "descEn": "Illuminate all white cells $\\forall w \\in W: \\text{lit}(w) = 1$ with zero bulb collisions $B \\cap R(B) = \\emptyset$.",
        "descAr": "أنر جميع الخلايا البيضاء $\\forall w \\in W: \\text{lit}(w) = 1$ دون أن يسلط مصباحان الضوء على بعضهما.",
        "leftAr": "💡 وضع مصباح",
        "rightAr": "⚫ علامة نقطة (لا مصباح)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Orthogonal Ray-Casting & Exact Cell Illumination.</p>\n<p>Place light bulbs $b \\in B$ on white grid cells $W$ such that every cell is covered by at least one ray:</p>\n<div class=\"katex-display\">$$\\forall w \\in W: \\exists b \\in B \\text{ s.t. } w \\in \\operatorname{Ray}(b), \\qquad \\forall b_1 \\neq b_2 \\in B: b_1 \\notin \\operatorname{Ray}(b_2)$$</div>\n<p>• Rays propagate horizontally and vertically until absorbed by black barrier cells.<br>• Numbered black cells enforce local 4-neighborhood degree constraints: $\\sum_{u \\in N_4(cell)} \\mathbb{I}(u \\in B) = c$.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> انتشار الأشعة المتعامدة وتغطية الخلايا بالضوء.</p>\n<p>ضع مصابيح $b \\in B$ في الخلايا البيضاء $W$ بحيث تُضاء جميع الخلايا بشعاع واحد على الأقل دون تقاطع مصباحين:</p>\n<div class=\"katex-display\">$$\\forall w \\in W: \\exists b \\in B \\text{ s.t. } w \\in \\operatorname{Ray}(b), \\qquad \\forall b_1 \\neq b_2 \\in B: b_1 \\notin \\operatorname{Ray}(b_2)$$</div>\n<p>• تنتشر الأشعة أفقياً ورأسياً حتى تصطدم بجدار أسود.<br>• الأرقام داخل الجدران تحدد عدد المصابيح في الجوار المباشر: $\\sum_{u \\in N_4(cell)} \\mathbb{I}(u \\in B) = c$.</p>"
    },
    "slant": {
        "titleEn": "📐 Slant (Gokigen)",
        "titleAr": "📐 الخطوط المائلة (غوكيغن)",
        "domainEn": "Acyclic Trees & Vertex Degrees: $E \\subset V \\times V$, $C_k = \\emptyset$",
        "domainAr": "الأشجار اللا دورية ودرجات الرؤوس: $E \\subset V \\times V$ ومنع الحلقات ($C_k = \\emptyset$)",
        "descEn": "Draw diagonals matching vertex degrees $\\deg(v) = k_v$ with zero cycles $H_1(G, \\mathbb{Z}) = 0$.",
        "descAr": "ارسم خطوطاً قطرية لتحقيق درجات الرؤوس $\\deg(v) = k_v$ دون تكوين أي حلقة مغلقة ($C_k = \\emptyset$).",
        "leftAr": "╱ قطر مائل (/)",
        "rightAr": "╲ قطر مائل (\\)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Acyclic Planar Graphs (Forest Topology) & Vertex Invariants.</p>\n<p>Draw a diagonal line segment (╱ or ╲) in every unit square of the grid:</p>\n<div class=\"katex-display\">$$\\deg(v) = k_v \\in \\{0, 1, 2, 3, 4\\}, \\qquad H_1(G, \\mathbb{Z}) = 0 \\iff \\text{Cycles } C_k = \\emptyset$$</div>\n<p>• The number of diagonal endpoints meeting at each labeled grid vertex must equal the clue $k_v$.<br>• The resulting diagonal graph must remain strictly acyclic (no closed loops permitted).</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> البيانات المستوية الخالية من الدورات (الأشجار) ودرجات الرؤوس.</p>\n<p>ارسم خطاً قطرياً (╱ أو ╲) في كل مربع من مربعات الشبكة:</p>\n<div class=\"katex-display\">$$\\deg(v) = k_v \\in \\{0, 1, 2, 3, 4\\}, \\qquad H_1(G, \\mathbb{Z}) = 0 \\iff \\text{Cycles } C_k = \\emptyset$$</div>\n<p>• يجب أن يساوي عدد أطراف الخطوط القطرية الملتقية عند كل رأس الرقم المكتوب فيه $k_v$.<br>• يُمنع تكوين أي مسار مغلق (حلقة دورية) على الإطلاق في البيان الناتج.</p>"
    },
    "net": {
        "titleEn": "⚡ Net (Network)",
        "titleAr": "⚡ الشبكة الكهربائية (نت)",
        "domainEn": "Spanning Trees & Graph Topology: $T \\subseteq G$, $|E| = |V| - 1$",
        "domainAr": "الأشجار الممتدة وترابط الشبكات: $T \\subseteq G$ و $|E| = |V| - 1$",
        "descEn": "Rotate grid tiles so all terminals join a single connected spanning tree ($c(T) = 1$).",
        "descAr": "أدر قطع الشبكة لربط جميع الأطراف بمصدر الطاقة في شجرة ممتدة متصلة واحدة ($c(T) = 1$).",
        "leftAr": "↺ تدوير لليسار",
        "rightAr": "↻ تدوير لليمين",
        "middleAr": "🔒 قفل القطعة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Spanning Trees ($|E| = |V| - 1$) and Topological Boundary Synchronization.</p>\n<p>Rotate individual wire square tiles to assemble a single connected network spanning tree:</p>\n<div class=\"katex-display\">$$|E| = |V| - 1, \\qquad c(T) = 1 \\quad (\\text{Connected, Acyclic Tree without Dead Ends})$$</div>\n<p>• Every active terminal must possess an unbroken path to the central power generator.<br>• No wire segments may lead to empty walls or unconnected adjacent edges.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الأشجار الممتدة ($|E| = |V| - 1$) والترابط الطوبولوجي للشبكات.</p>\n<p>قم بتدوير قطع الأسلاك المربعة لتوصيل جميع الأجهزة الطرفية بمصدر الطاقة الرئيسي في شجرة متصلة واحدة:</p>\n<div class=\"katex-display\">$$|E| = |V| - 1, \\qquad c(T) = 1 \\quad (\\text{Connected Spanning Tree})$$</div>\n<p>• يجب أن يتصل كل جهاز طرفي بمسار مباشر إلى المولد المركزي.<br>• لا يجوز أن تواجه أي وصلة سلكية جداراً فارغاً أو طرفاً غير متصل.</p>"
    },
    "loopy": {
        "titleEn": "➰ Slitherlink (Loopy)",
        "titleAr": "➰ المسار المغلق (سليذرلينك)",
        "domainEn": "Jordan Curve Theorem: Simple Closed Loops, $\\oint d\\theta = 2\\pi$",
        "domainAr": "مبرهنة منحنى جوردان: المسارات المغلقة البسيطة و $\\oint d\\theta = 2\\pi$",
        "descEn": "Connect lattice edges into a single 2-regular loop matching face degrees $|E(f) \\cap L| = c_f$.",
        "descAr": "اربط أضلاع الشبكة لتكوين مسار مغلق ثنائي الانتظام $\\deg(v) \\in \\{0, 2\\}$ يحقق أرقام الخلايا $c_f$.",
        "leftAr": "➰ رسم ضلع المسار",
        "rightAr": "✖️ علامة استبعاد (X)",
        "middleAr": "مسح الضلع",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> The Jordan Curve Theorem & 2-Regular Eulerian Subgraphs.</p>\n<p>Draw a continuous, simple closed loop traversing grid edge segments:</p>\n<div class=\"katex-display\">$$\\forall v \\in V: \\deg(v) \\in \\{0, 2\\}, \\qquad |E(f) \\cap L| = c_f, \\qquad \\oint_L d\\theta = 2\\pi$$</div>\n<p>• The clue inside a cell indicates the exact number of its 4 boundary edges included in the loop.<br>• The loop must never branch, self-intersect, or fragment into multiple loops.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> مبرهنة منحنى جوردان والبيانات الجزئية ثنائية الانتظام $\\deg(v) \\in \\{0, 2\\}$.</p>\n<p>ارسم مساراً مغلقاً بسيطاً واحداً متصلاً يمر عبر أضلاع الشبكة:</p>\n<div class=\"katex-display\">$$\\forall v \\in V: \\deg(v) \\in \\{0, 2\\}, \\qquad |E(f) \\cap L| = c_f, \\qquad \\oint_L d\\theta = 2\\pi$$</div>\n<p>• يحدد الرقم داخل الخلية عدد أضلاعها الأربعة المشمولة في المسار.<br>• يُمنع تفرع المسار أو تقاطعه مع نفسه أو انقسامه إلى أكثر من حلقة واحدة.</p>"
    },
    "solo": {
        "titleEn": "🔢 Solo (Sudoku & Killer)",
        "titleAr": "🔢 سولو (سودوكو وكيلر)",
        "domainEn": "Latin Squares & Permutations: $\\forall i, j: \\sigma_i \\in S_N, \\sum_{\\text{cage}} = K$",
        "domainAr": "المربعات اللاتينية والتباديل: $\\forall i, j: \\sigma_i \\in S_N$ ومجاميع الأقفاص $\\sum = K$",
        "descEn": "Partition cells into bijective Latin sub-blocks with optional cage sums $\\sum_{c} x_c = K$.",
        "descAr": "أكمل المربعات اللاتينية الفرعية والكتل المتعامدة مع مطابقة مجاميع الأقفاص $\\sum_{c} x_c = K$.",
        "leftAr": "تحديد الخلية",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Bijective Permutation Matrices & Subset Sum Constraints.</p>\n<p>Fill the grid with digits $1, \\dots, N$ such that each row, column, and sub-block is a bijection:</p>\n<div class=\"katex-display\">$$\\sum_{k=1}^N x_{ik} = \\frac{N(N+1)}{2}, \\quad \\prod_{k=1}^N x_{ik} = N!, \\quad \\sum_{c \\in \\text{Cage}} x_c = K$$</div>\n<p>• In Killer variants, numbers within a dashed cage must sum to the cage value $K$ with no duplicates.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> مصفوفات التباديل التقابلية ومجاميع المجموعات الجزئية.</p>\n<p>املأ الشبكة بالأرقام $1, \\dots, N$ بحيث يمثل كل صف وعمود وكتلة تقابلاً تاما:</p>\n<div class=\"katex-display\">$$\\sum_{k=1}^N x_{ik} = \\frac{N(N+1)}{2}, \\quad \\prod_{k=1}^N x_{ik} = N!, \\quad \\sum_{c \\in \\text{Cage}} x_c = K$$</div>\n<p>• في نمط كيلر (Killer)، يجب أن يساوي مجموع أرقام كل قفص القيمة المكتوبة في زاويته دون تكرار أي رقم داخل القفص.</p>"
    },
    "keen": {
        "titleEn": "➗ Keen (KenKen)",
        "titleAr": "➗ كين (مربعات الحساب - كين كين)",
        "domainEn": "Arithmetic Fields & Factorization: $\\prod x_i = k$, $\\sum x_i = s$",
        "domainAr": "الحقول الحسابية والتحليل: $\\prod x_i = k$ و $\\sum x_i = s$",
        "descEn": "Solve Latin square configurations governed by algebraic cage operations $(+, -, \\times, \\div)$.",
        "descAr": "حل المربع اللاتيني بتحقيق العمليات الحسابية داخل الأقفاص المحددة $(+, -, \\times, \\div)$.",
        "leftAr": "تحديد الخلية",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Algebraic Operations over Latin Squares & Prime Factorization.</p>\n<p>Place numbers $1, \\dots, N$ in an $N \\times N$ grid with no repeats in any row or column:</p>\n<div class=\"katex-display\">$$x_{i,j} \\in \\{1, \\dots, N\\}, \\qquad \\operatorname{op}(x_1, \\dots, x_m) = K \\quad (\\operatorname{op} \\in \\{+, -, \\times, \\div\\})$$</div>\n<p>• Cages evaluate commutative operations: $\\sum x_i = K$ or $\\prod x_i = K$.<br>• Two-cell cages with subtraction or division evaluate in magnitude order: $|x_1 - x_2| = K$ or $\\max(x_1, x_2)/\\min(x_1, x_2) = K$.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> العمليات الجبرية على المربعات اللاتينية والتحليل إلى عوامل أولية.</p>\n<p>املأ الشبكة بالأرقام $1, \\dots, N$ كمربع لاتيني دون تكرار في أي صف أو عمود:</p>\n<div class=\"katex-display\">$$x_{i,j} \\in \\{1, \\dots, N\\}, \\qquad \\operatorname{op}(x_1, \\dots, x_m) = K \\quad (\\operatorname{op} \\in \\{+, -, \\times, \\div\\})$$</div>\n<p>• تحقق الأقفاص العمليات الحسابية المعطاة: $\\sum x_i = K$ أو $\\prod x_i = K$.<br>• أقفاص الطرح والقسمة تحسب بالفرق المطلق $|x_1 - x_2| = K$ أو النسبة الأكبر إلى الأصغر.</p>"
    },
    "unequal": {
        "titleEn": "⚖️ Unequal (Futoshiki)",
        "titleAr": "⚖️ المتباينات (فوتوشيكي)",
        "domainEn": "Posets & Strict Inequalities: $x_{i,j} < x_{i',j'}$, Linear Extensions",
        "domainAr": "المجموعات المرتبة جزئياً: $x_{i,j} < x_{i',j'}$ والترتيب التام",
        "descEn": "Solve Latin square permutations satisfying strict partially ordered inequality chains $x_u < x_v$.",
        "descAr": "رتب الأرقام في مربع لاتيني مع الالتزام التام بسلاسل المتباينات الصارمة $x_u < x_v$.",
        "leftAr": "تحديد الخلية",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Partially Ordered Sets (Posets) & Topological Sorting of Latin Squares.</p>\n<p>Assign values $1, \\dots, N$ to an $N \\times N$ grid satisfying Latin conditions and strict order relations:</p>\n<div class=\"katex-display\">$$x_{i,j} \\in \\{1, \\dots, N\\}, \\qquad \\forall (u, v) \\in E_{<}: x_u < x_v, \\qquad |\\{x_{i,1}, \\dots, x_{i,N}\\}| = N$$</div>\n<p>• Transitive inequality chains impose strict upper and lower bounds on intermediate grid cells.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المجموعات المرتبة جزئياً (Posets) والترتيب الطوبولوجي للمربعات اللاتينية.</p>\n<p>عيّن الأرقام $1, \\dots, N$ في شبكة $N \\times N$ مع تحقيق شروط المربع اللاتيني وعلاقات الترتيب الصارمة:</p>\n<div class=\"katex-display\">$$x_{i,j} \\in \\{1, \\dots, N\\}, \\qquad \\forall (u, v) \\in E_{<}: x_u < x_v, \\qquad |\\{x_{i,1}, \\dots, x_{i,N}\\}| = N$$</div>\n<p>• سلاسل المتباينات المتعدية تفرض حدوداً عليا ودنيا صارمة على القيم الممكنة للخلايا.</p>"
    },
    "group": {
        "titleEn": "🧮 Group (Cayley Tables)",
        "titleAr": "🧮 الزمر الرياضية (جداول كايلي)",
        "domainEn": "Abstract Algebra: Cayley Tables, $(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c), a \\cdot e = a$",
        "domainAr": "الجبر المجرد: جداول كايلي، $(a \\cdot b) \\cdot c = a \\cdot (b \\cdot c)$ والمحايد $e$",
        "descEn": "Reconstruct finite group operation tables $(G, \\cdot)$ using associativity, identity $e$, and inverses $a^{-1}$.",
        "descAr": "أكمل جدول عمليات الزمرة $(G, \\cdot)$ بتطبيق خاصية التجميع والعنصر المحايد $e$ والمعكوس $a^{-1}$.",
        "leftAr": "تحديد الخلية",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Group Axioms & Cayley's Theorem over Finite Operational Tables.</p>\n<p>Complete the binary operation table for finite group $(G, \\cdot)$ ensuring all axioms hold:</p>\n<div class=\"katex-display\">$$\\forall a, b, c \\in G: \\ (a \\cdot b) \\cdot c = a \\cdot (b \\cdot c), \\quad \\exists e \\in G: a \\cdot e = a, \\quad \\exists a^{-1} \\in G: a \\cdot a^{-1} = e$$</div>\n<p>• By the Latin square property of groups, each group element appears exactly once per row and column.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> بديهيات الزمر ومبرهنة كايلي على جداول العمليات الثنائية المنتهية.</p>\n<p>أكمل جدول العملية الثنائية للزمرة $(G, \\cdot)$ مع التأكد من تحقق البديهيات الجبرية:</p>\n<div class=\"katex-display\">$$\\forall a, b, c \\in G: \\ (a \\cdot b) \\cdot c = a \\cdot (b \\cdot c), \\quad \\exists e \\in G: a \\cdot e = a, \\quad \\exists a^{-1} \\in G: a \\cdot a^{-1} = e$$</div>\n<p>• وفق خاصية المربع اللاتيني للزمر، يظهر كل عنصر من عناصر الزمرة مرة واحدة بالضبط في كل صف وكل عمود.</p>"
    },
    "singles": {
        "titleEn": "🎯 Singles (Hitori)",
        "titleAr": "🎯 المفردات (هيتوري)",
        "domainEn": "Topological Connectivity & Independent Sets: $\\alpha(G)$, $\\operatorname{dist}(u, v) \\ge 2$",
        "domainAr": "الاتصال الطوبولوجي والمجموعات المستقلة: $\\alpha(G)$ والمسافة $\\ge 2$",
        "descEn": "Shade duplicates so white cells are unique per line and black cells form an independent set.",
        "descAr": "ظلل الأرقام المكررة بحيث لا تتجاور خليتان سوداوان وتبقى الخلايا البيضاء متصلة طوبولوجياً.",
        "leftAr": "⬛ تظليل الخلية",
        "rightAr": "⭕ وضع دائرة (إبقاء)",
        "middleAr": "مسح العلامة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Vertex Independent Sets & Connected Planar Subgraphs.</p>\n<p>Shade grid cells black ($B$) such that unshaded white cells ($W$) contain no duplicate values:</p>\n<div class=\"katex-display\">$$\\forall b_1, b_2 \\in B: \\operatorname{dist}_1(b_1, b_2) > 1, \\qquad c(W) = 1, \\qquad |\\{w \\in W_{\\text{row } i} \\mid \\operatorname{val}(w) = k\\}| \\le 1$$</div>\n<p>• Black cells cannot share an orthogonal edge.<br>• All white cells must remain connected into a single contiguous open space.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المجموعات المستقلة في البيانات والبيانات الجزئية المتصلة.</p>\n<p>ظلل بعض الخلايا بالأسود ($B$) بحيث لا يتكرر أي رقم بين الخلايا البيضاء ($W$):</p>\n<div class=\"katex-display\">$$\\forall b_1, b_2 \\in B: \\operatorname{dist}_1(b_1, b_2) > 1, \\qquad c(W) = 1, \\qquad |\\{w \\in W_{\\text{row } i} \\mid \\operatorname{val}(w) = k\\}| \\le 1$$</div>\n<p>• لا يجوز تجاور خليتين مظللتين أفقياً أو رأسياً (مجموعة مستقلة).<br>• يجب أن تظل جميع الخلايا البيضاء متصلة في منطقة واحدة مترابطة طوبولوجياً.</p>"
    },
    "blackbox": {
        "titleEn": "🔬 Black Box (Laser Optics)",
        "titleAr": "🔬 الصندوق الأسود (بصريات الليزر)",
        "domainEn": "Scattering Optics & Inverse Problems: Path Reflection $\\theta_r = \\theta_i$",
        "domainAr": "بصريات التشتت والمسائل العكسية: مسار الانعكاس $\\theta_r = \\theta_i$",
        "descEn": "Locate hidden atoms by firing ray probes and solving inverse scattering equations.",
        "descAr": "استنتج مواقع الكرات المخفية بإطلاق حزم الليزر وتحليل معادلات التشتت والانعكاس العكسية.",
        "leftAr": "🔴 وضع كرة / إطلاق ليزر",
        "rightAr": "✖️ علامة خلية فارغة",
        "middleAr": "قفل الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Inverse Scattering Problems & Snell-Law Deflection Geometry.</p>\n<p>Trace laser beams propagating through a discrete scattering medium:</p>\n<div class=\"katex-display\">$$\\vec{v}_{\\text{out}} = \\mathbf{R}(\\text{Atoms}) \\vec{v}_{\\text{in}}, \\qquad d(\\text{ray}, \\text{atom}) = 0 \\implies \\text{Absorption (H)}, \\quad d = 1 \\implies \\Delta\\theta = 90^\\circ$$</div>\n<p>• Beams entering adjacent to an atom reflect immediately backwards ($R$).<br>• Deduce the exact coordinates of all hidden scattering centers from boundary entry/exit pairs.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المسائل العكسية في تشتت الموجات وانكسار الأشعة في الأوساط المتقطعة.</p>\n<p>تتبع حزم الليزر المنطلقة عبر الصندوق وحلل تفاعلها مع الكرات المخفية:</p>\n<div class=\"katex-display\">$$\\vec{v}_{\\text{out}} = \\mathbf{R}(\\text{Atoms}) \\vec{v}_{\\text{in}}, \\qquad d(\\text{ray}, \\text{atom}) = 0 \\implies \\text{Absorption (H)}, \\quad d = 1 \\implies \\Delta\\theta = 90^\\circ$$</div>\n<p>• الأشعة التي تصطدم بالكرة تُمتص ($H$)، والأشعة المارة بجوارها تنحرف بزاوية $90^\\circ$، والانعكاس المباشر يعطي ($R$).<br>• حدد مواقع الكرات بدقة من خلال أزواج نقاط الدخول والخروج.</p>"
    },
    "undead": {
        "titleEn": "🪞 Undead (Mirror Optics)",
        "titleAr": "🪞 المرايا المنطقية (أنديد)",
        "domainEn": "Geometric Reflections: Parity of Mirrors, Sightline Algebra $\\sum = K$",
        "domainAr": "الانعكاسات الهندسية: تكافؤ المرايا وجبر خطوط الرؤية $\\sum = K$",
        "descEn": "Solve mirror ray paths to place Ghosts ($G$), Vampires ($V$), and Zombies ($Z$) matching edge tallies.",
        "descAr": "تتبع مسارات انعكاس المرايا لتوزيع الأشباح ($G$) ومصاصي الدماء ($V$) والزومبي ($Z$) بدقة.",
        "leftAr": "تحديد الخلية",
        "rightAr": "وضع الملاحظات (قلم)",
        "middleAr": "مسح الخلية",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Parity of Reflections & Piecewise Linear Sightline Transformations.</p>\n<p>Place entities $\\{G, V, Z\\}$ satisfying the optical properties of mirrors:</p>\n<div class=\"katex-display\">$$\\text{Visibility}(R) = \\sum_{e \\in \\text{Path}(R)} \\chi(e), \\quad \\chi(G) = \\mathbb{I}(\\text{Reflected}), \\quad \\chi(V) = \\mathbb{I}(\\text{Direct}), \\quad \\chi(Z) = 1$$</div>\n<p>• Ghosts are visible only after reflecting in at least one diagonal mirror.<br>• Vampires are visible only along direct unobstructed sightlines before any reflection.<br>• Zombies are universally visible along the entire ray trajectory.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> تكافؤ الانعكاسات والتحويلات الخطية لمسارات الرؤية عبر المرايا.</p>\n<p>وزع الكائنات الثلاثة $\\{G, V, Z\\}$ وفق الخواص البصرية للمرايا:</p>\n<div class=\"katex-display\">$$\\text{Visibility}(R) = \\sum_{e \\in \\text{Path}(R)} \\chi(e), \\quad \\chi(G) = \\mathbb{I}(\\text{Reflected}), \\quad \\chi(V) = \\mathbb{I}(\\text{Direct}), \\quad \\chi(Z) = 1$$</div>\n<p>• الشبح ($G$): لا يُرى إلا بعد الانعكاس في مرآة واحدة على الأقل.<br>• مصاص الدماء ($V$): يُرى في خط الرؤية المباشر فقط ولا يظهر في المرايا.<br>• الزومبي ($Z$): يُرى في جميع الحالات على طول مسار الشعاع.</p>"
    },
    "magnets": {
        "titleEn": "🧲 Magnets (Polarity)",
        "titleAr": "🧲 المغناطيسات (القطبية)",
        "domainEn": "Dipole Physics & Gauss Constraint: $\\sum q_i = 0$, Orthogonal Repulsion",
        "domainAr": "فيزياء ثنائيات الأقطاب وقيد غاوس: $\\sum q_i = 0$ والتنافر المتعامد",
        "descEn": "Place dipoles $q_i \\in \\{+1, -1\\}$ satisfying row/col sums without like-pole contact $q_u q_v \\neq +1$.",
        "descAr": "ضع ثنائيات الأقطاب $q_i \\in \\{+1, -1\\}$ لتحقيق شحنات الصفوف والأعمدة دون تلامس متماثل.",
        "leftAr": "➕ وضع مغناطيس (+/-)",
        "rightAr": "✖️ تحديد كقطعة محايدة",
        "middleAr": "مسح القطعة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Magnetic Dipoles, Gauss Law & Orthogonal Repulsion Constraints.</p>\n<p>Assign charges $q \\in \\{+1, -1, 0\\}$ to dominoes such that every magnetic domino is a dipole:</p>\n<div class=\"katex-display\">$$\\sum_{c \\in \\text{domino}} q_c = 0, \\qquad \\forall (u, v) \\in E_{\\text{ortho}}: q_u \\cdot q_v \\neq +1, \\qquad \\sum_{j=1}^W \\mathbb{I}(q_{i,j} = \\pm 1) = N_i^\\pm$$</div>\n<p>• Like charges ($+$ with $+$ or $-$ with $-$) can never touch across horizontal or vertical borders.<br>• Border numbers give the exact count of $+$ and $-$ poles in each row and column.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> ثنائيات الأقطاب المغناطيسية وقانون غاوس والتنافر المتعامد.</p>\n<p>عيّن الشحنات $q \\in \\{+1, -1, 0\\}$ لقطع الدومينو بحيث يكون كل مغناطيس ثنائي القطب متعادلاً:</p>\n<div class=\"katex-display\">$$\\sum_{c \\in \\text{domino}} q_c = 0, \\qquad \\forall (u, v) \\in E_{\\text{ortho}}: q_u \\cdot q_v \\neq +1, \\qquad \\sum_{j=1}^W \\mathbb{I}(q_{i,j} = \\pm 1) = N_i^\\pm$$</div>\n<p>• يُمنع تلامس قطبين متماثلين ($+$ مع $+$ أو $-$ مع $-$) أفقياً أو رأسياً.<br>• الأرقام على الحواف تحدد عدد الأقطاب الموجبة والسالبة في كل صف وعمود.</p>"
    },
    "inertia": {
        "titleEn": "💎 Inertia (Kinematics)",
        "titleAr": "💎 القصور الذاتي (إنيرشيا)",
        "domainEn": "Frictionless Kinematics: $\\vec{v} = \\text{const}$, Collision Vectors $\\Delta\\vec{p}$",
        "domainAr": "الحركة عديمة الاحتكاك: $\\vec{v} = \\text{const}$ ومتجهات التصادم $\\Delta\\vec{p}$",
        "descEn": "Navigate frictionless trajectories $\\vec{x}(t+1) = \\vec{x}(t) + \\vec{v}$ to collect gems without mine impacts.",
        "descAr": "حرك الكرة على مسارات نيوتونية عديمة الاحتكاك $\\vec{x}(t+1) = \\vec{x}(t) + \\vec{v}$ لجمع كل الجواهر.",
        "leftAr": "💎 دحرجة الكرة",
        "rightAr": "دحرجة الكرة",
        "middleAr": "دحرجة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Newton's First Law of Motion (Inertia) on Discrete 8-Directional Lattices.</p>\n<p>Launch the ball along unit vectors $\\vec{v} \\in \\{-1, 0, 1\\}^2 \\setminus \\{\\mathbf{0}\\}$:</p>\n<div class=\"katex-display\">$$\\vec{x}(t+1) = \\vec{x}(t) + \\vec{v}, \\qquad \\vec{v} \\mapsto \\mathbf{0} \\iff \\vec{x}(t+1) \\in \\text{Walls} \\cup \\text{StopPoints}$$</div>\n<p>• Once set in motion, the ball slides endlessly until halted by a solid obstacle or stop ring.<br>• Collect every gemstone while strictly avoiding hazardous explosive mine coordinates.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> قانون نيوتن الأول (القصور الذاتي) على الشبكات المتقطعة ثمانية الاتجاهات.</p>\n<p>أطلق الكرة بمتجه سرعة $\\vec{v} \\in \\{-1, 0, 1\\}^2 \\setminus \\{\\mathbf{0}\\}$:</p>\n<div class=\"katex-display\">$$\\vec{x}(t+1) = \\vec{x}(t) + \\vec{v}, \\qquad \\vec{v} \\mapsto \\mathbf{0} \\iff \\vec{x}(t+1) \\in \\text{Walls} \\cup \\text{StopPoints}$$</div>\n<p>• تنزلق الكرة بسرعة ثابتة دون توقف حتى تصطدم بجدار أو تستقر على حلقة توقف.<br>• اجمع جميع الجواهر وتجنب تماماً الاصطدام بحقول الألغام المتفجرة.</p>"
    },
    "cube": {
        "titleEn": "🧊 Cube (3D Polyhedra)",
        "titleAr": "🧊 المكعب المتدحرج (متعددات الوجوه)",
        "domainEn": "3D Polyhedral Rotation Groups: $SO(3)$ Symmetries, Euler $\\chi = V - E + F = 2$",
        "domainAr": "زمر دوران المجسمات: تماثلات $SO(3)$ وصيغة أويلر $\\chi = V - E + F = 2$",
        "descEn": "Roll a polyhedron over planar grid faces using 3D rotation group operations $R \\in \\mathcal{O}_h$.",
        "descAr": "دحرج متعدد الوجوه على الشبكة المستوية باستخدام زمرة الدوران الفراغية $R \\in \\mathcal{O}_h$.",
        "leftAr": "🧊 دحرجة المجسم",
        "rightAr": "دحرجة المجسم",
        "middleAr": "دحرجة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Octahedral Rotation Group $\\mathcal{O} \\cong S_4$ & Surface Face Embeddings.</p>\n<p>Roll the 3D solid across the 2D plane to pick up and transfer colored face markers:</p>\n<div class=\"katex-display\">$$\\chi = V - E + F = 2, \\qquad \\mathbf{R} \\in \\mathcal{O} \\subset SO(3), \\quad |\\mathcal{O}| = 24 \\text{ rotational symmetries}$$</div>\n<p>• Rolling over a colored grid tile transfers color to the contacting polyhedron face.<br>• Paint all faces of the solid simultaneously to complete the polyhedral map.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> زمرة دوران المكعب $\\mathcal{O} \\cong S_4$ وإسقاطات شبكات المجسمات المستوية.</p>\n<p>دحرج المجسم ثلاثي الأبعاد على الشبكة المستوية لنقل العلامات الملونة إلى أوجهه:</p>\n<div class=\"katex-display\">$$\\chi = V - E + F = 2, \\qquad \\mathbf{R} \\in \\mathcal{O} \\subset SO(3), \\quad |\\mathcal{O}| = 24 \\text{ Symmetries}$$</div>\n<p>• الدحرجة فوق مربع ملون تنقل اللون إلى وجه المجسم الملامس للشبكة.<br>• لوّن جميع أوجه المجسم في نفس الوقت لإتمام الحل بنجاح.</p>"
    },
    "galaxies": {
        "titleEn": "🌌 Galaxies (Symmetry)",
        "titleAr": "🌌 المجرات (التماثل الدوراني)",
        "domainEn": "Point Symmetry Groups: $C_2$ Inversion $(2x_0 - x, 2y_0 - y)$, Tessellation",
        "domainAr": "زمر التماثل النقطي: تماثل $C_2$ بالانعكاس $(2x_0 - x, 2y_0 - y)$ والتبليط",
        "descEn": "Tessellate the grid into regions with $180^\\circ$ rotational point symmetry around galactic cores.",
        "descAr": "قسّم الشبكة إلى مجرات متماثلة دورانياً بزاوية $180^\\circ$ حول مراكز المجرات النقطية.",
        "leftAr": "🌌 رسم / إزالة حد",
        "rightAr": "ربط بمركز مجرة",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Cyclic Group $C_2$ (Central Inversion) & Planar Dissection.</p>\n<p>Partition the grid into connected regions $R_k$, each possessing a unique central point $(x_k, y_k)$:</p>\n<div class=\"katex-display\">$$\\forall (x, y) \\in R_k \\iff (2x_k - x, 2y_k - y) \\in R_k, \\qquad \\bigcup_{k=1}^m R_k = \\text{Grid}, \\quad R_i \\cap R_j = \\emptyset$$</div>\n<p>• Every region must encompass exactly one galactic core dot.<br>• Every cell in a galaxy must map onto another cell of the same galaxy under $180^\\circ$ rotation.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الزمرة الدائرية $C_2$ (التماثل النقطي الدوراني) وتجزئة المستوى.</p>\n<p>قسّم الشبكة إلى مناطق مترابطة $R_k$ بحيث تمتلك كل منطقة مركزاً نقطياً فريداً $(x_k, y_k)$:</p>\n<div class=\"katex-display\">$$\\forall (x, y) \\in R_k \\iff (2x_k - x, 2y_k - y) \\in R_k, \\qquad \\bigcup_{k=1}^m R_k = \\text{Grid}, \\quad R_i \\cap R_j = \\emptyset$$</div>\n<p>• يجب أن تحتوي كل منطقة على نقطة مركزية واحدة فقط.<br>• كل خلية في المنطقة يجب أن تطابق خلية أخرى في نفس المنطقة عند تدويرها $180^\\circ$ حول المركز.</p>"
    },
    "untangle": {
        "titleEn": "🕸️ Untangle (Planar Graphs)",
        "titleAr": "🕸️ فك التشابك (البيانات المستوية)",
        "domainEn": "Planar Graph Embeddings: Kuratowski's Theorem, Crossings $\\operatorname{cr}(G) = 0$",
        "domainAr": "تضمين البيانات المستوية: مبرهنة كوراتوفسكي والتقاطعات $\\operatorname{cr}(G) = 0$",
        "descEn": "Reposition vertices in $\\mathbb{R}^2$ until edge crossings vanish: $\\operatorname{cr}(G) = 0$.",
        "descAr": "أعد توزيع الرؤوس في المستوى $\\mathbb{R}^2$ حتى تتلاشى جميع تقاطعات الأضلاع تماماً: $\\operatorname{cr}(G) = 0$.",
        "leftAr": "🕸️ سحب الرأس",
        "rightAr": "سحب الرأس",
        "middleAr": "سحب",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Kuratowski's & Wagner's Theorems on Planar Graph Realization.</p>\n<p>Find an isomorphic straight-line embedding of a planar graph $G = (V, E)$ in $\\mathbb{R}^2$:</p>\n<div class=\"katex-display\">$$\\operatorname{cr}(G) = \\sum_{\\{e_1, e_2\\} \\subset E} \\mathbb{I}(e_1 \\cap e_2 \\neq \\emptyset) = 0, \\qquad K_5, K_{3,3} \\not\\le_m G$$</div>\n<p>• Drag vertices across the canvas until no two straight-line edges intersect.<br>• Planar graphs satisfy Euler's formula: $|V| - |E| + |F| = 1 + c(G)$.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> مبرهنتا كوراتوفسكي وفاغنر في التضمين الخطي للبيانات المستوية.</p>\n<p>أعد ترتيب إحداثيات رؤوس البيان $G = (V, E)$ في المستوى $\\mathbb{R}^2$ لتفادي أي تقاطع:</p>\n<div class=\"katex-display\">$$\\operatorname{cr}(G) = \\sum_{\\{e_1, e_2\\} \\subset E} \\mathbb{I}(e_1 \\cap e_2 \\neq \\emptyset) = 0, \\qquad K_5, K_{3,3} \\not\\le_m G$$</div>\n<p>• اسحب الرؤوس على اللوحة اللمسية حتى تصبح جميع الأضلاع خالية من أي تقاطع مشترك.<br>• تحقق البيانات المستوية صيغة أويلر الشهيرة: $|V| - |E| + |F| = 1 + c(G)$.</p>"
    },
    "map": {
        "titleEn": "🗺️ Map (Four-Color Theorem)",
        "titleAr": "🗺️ تلوين الخريطة (مبرهنة الألوان الأربعة)",
        "domainEn": "Four-Color Theorem: Planar Chromatic Number $\\chi(G) \\le 4$, Dual Graphs",
        "domainAr": "مبرهنة الألوان الأربعة: العدد اللوني المستوي $\\chi(G) \\le 4$ والبيان المزدوج",
        "descEn": "Color contiguous territories such that adjacent regions share distinct colors $c(u) \\neq c(v)$.",
        "descAr": "لوّن أقاليم الخريطة بأربعة ألوان فقط بحيث يختلف لون أي إقليمين متجاورين $c(u) \\neq c(v)$.",
        "leftAr": "🎨 سحب اللون للإقليم",
        "rightAr": "✏️ علامة تنقيط",
        "middleAr": "مسح اللون",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Appel-Haken Four-Color Theorem & Dual Graph Vertex Coloring.</p>\n<p>Color every face of a planar map using at most four distinct colors:</p>\n<div class=\"katex-display\">$$\\chi(G^*) \\le 4, \\qquad \\forall (u, v) \\in E(G^*): c(u) \\neq c(v), \\quad c(v) \\in \\{1, 2, 3, 4\\}$$</div>\n<p>• Regions sharing a positive-length common boundary must receive different colors.<br>• Regions meeting solely at a single isolated corner point may share the same color.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> مبرهنة الألوان الأربعة (أبل وهاكن) وتلوين رؤوس البيان المزدوج.</p>\n<p>لوّن أقاليم الخريطة المستوية باستخدام أربعة ألوان كحد أقصى:</p>\n<div class=\"katex-display\">$$\\chi(G^*) \\le 4, \\qquad \\forall (u, v) \\in E(G^*): c(u) \\neq c(v), \\quad c(v) \\in \\{1, 2, 3, 4\\}$$</div>\n<p>• لا يجوز أن يشترك إقليمان متجاوران بحد مشترك في نفس اللون.<br>• الأقاليم التي تلتقي عند نقطة زاوية واحدة فقط يمكن أن تحمل نفس اللون.</p>"
    },
    "pearl": {
        "titleEn": "⚪ Pearl (Masyu)",
        "titleAr": "⚪ اللؤلؤ (ماسيو)",
        "domainEn": "Hamiltonian Loops & Local Curvature: $\\kappa \\in \\{0^\\circ, 90^\\circ\\}$ Geodesics",
        "domainAr": "الحلقات الهاملتونية والانحناء الموضعي: $\\kappa \\in \\{0^\\circ, 90^\\circ\\}$ والمسارات",
        "descEn": "Draw a closed loop obeying turning curvature constraints at white and black pearls.",
        "descAr": "ارسم مساراً مغلقاً يحقق شروط الانحناء الموضعي للزوايا عند اللآلئ البيضاء والسوداء.",
        "leftAr": "⚪ رسم مسار الحلقة",
        "rightAr": "✖️ علامة استبعاد",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Hamiltonian Cycles with Discrete Curvature $\\kappa$ Constraints.</p>\n<p>Construct a single, continuous, non-intersecting closed grid loop traversing all pearl nodes:</p>\n<div class=\"katex-display\">$$\\text{White: } \\kappa_0 = 0^\\circ \\land (\\kappa_{-1} = 90^\\circ \\lor \\kappa_{+1} = 90^\\circ), \\qquad \\text{Black: } \\kappa_0 = 90^\\circ \\land \\text{straight segments } \\ge 2$$</div>\n<p>• White pearls: loop travels straight through the pearl, and must turn in the immediately adjacent cell.<br>• Black pearls: loop must turn $90^\\circ$ inside the pearl, and extend straight for at least 2 cells in both directions.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الدورات الهاملتونية المقيدة بالانحناء المتقطع $\\kappa$.</p>\n<p>ارسم مساراً مغلقاً بسيطاً واحداً متصلاً يمر بجميع اللآلئ في الشبكة:</p>\n<div class=\"katex-display\">$$\\text{White: } \\kappa_0 = 0^\\circ \\land (\\kappa_{-1} = 90^\\circ \\lor \\kappa_{+1} = 90^\\circ), \\qquad \\text{Black: } \\kappa_0 = 90^\\circ \\land \\text{Straight Segments } \\ge 2$$</div>\n<p>• اللؤلؤة البيضاء: يمر الStraight Segmentsاً عبرها، وينعطف بزاوية قائمة في الخلية السابقة أو اللاحقة مباشرة.<br>• اللؤلؤة السوداء: ينعطف المسار $90^\\circ$ داخلها، ويمتد مستقيماً لمربعين على الأقل في كلا الاتجاهين.</p>"
    },
    "tracks": {
        "titleEn": "🛤️ Tracks (Railway Paths)",
        "titleAr": "🛤️ مسار القطار (تراكس)",
        "domainEn": "Hamiltonian Paths & Discrete Tomography: Orthogonal Projections $P_x, P_y$",
        "domainAr": "المسارات الهاملتونية والتصوير المقطعي: الإسقاطات المتعامدة $P_x, P_y$",
        "descEn": "Reconstruct a railway path $A \\rightsquigarrow B$ matching row/column projection tallies.",
        "descAr": "أكمل مسار سكة الحديد المتصل $A \\rightsquigarrow B$ بالاعتماد على مجاميع الإسقاطات المتعامدة.",
        "leftAr": "🛤️ مد السكة",
        "rightAr": "✖️ استبعاد الخلية",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Self-Avoiding Hamiltonian Paths & Orthogonal Tomographic Projections.</p>\n<p>Lay down railway tracks forming a continuous path from terminal $A$ to terminal $B$:</p>\n<div class=\"katex-display\">$$\\sum_{j=1}^W \\mathbb{I}(\\text{track at } (i, j)) = R_i, \\qquad \\sum_{i=1}^H \\mathbb{I}(\\text{track at } (i, j)) = C_j, \\qquad \\operatorname{path}(A \\rightsquigarrow B)$$</div>\n<p>• Tracks cannot branch, terminate prematurely, or create disconnected loops.<br>• Row and column numbers dictate the exact track segment counts.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المسارات المتصلة غير المتقاطعة والتصوير المقطعي المتعامد.</p>\n<p>مد مسار سكة حديد متصل دون انقطاع من المحطة $A$ إلى المحطة $B$:</p>\n<div class=\"katex-display\">$$\\sum_{j=1}^W \\mathbb{I}(\\text{track at } (i, j)) = R_i, \\qquad \\sum_{i=1}^H \\mathbb{I}(\\text{track at } (i, j)) = C_j, \\qquad \\operatorname{path}(A \\rightsquigarrow B)$$</div>\n<p>• لا يجوز تفرع السكة أو تكوين حلقات مغلقة منفصلة.<br>• يطابق عدد قطع السكة في كل صف وعمود الأرقام المعطاة على حواف الشبكة.</p>"
    },
    "signpost": {
        "titleEn": "🧭 Signpost (Vector Chains)",
        "titleAr": "🧭 أسهم الطريق (ساين بوست)",
        "domainEn": "Directed Hamiltonian Paths: Vector Tour $(v_1 \\to v_2 \\to \\dots \\to v_{N^2})$",
        "domainAr": "المسارات الهاملتونية الموجهة: السلسلة المتجهة $(v_1 \\to v_2 \\to \\dots \\to v_{N^2})$",
        "descEn": "Connect arrows into a sequence $1 \\le k \\le N^2$ where $v_{k+1} - v_k = \\lambda \\vec{d}(v_k)$.",
        "descAr": "اربط المربعات في سلسلة متجهة كاملة من $1$ إلى $N^2$ باتباع اتجاهات الأشعة $v_{k+1} - v_k = \\lambda \\vec{d}(v_k)$.",
        "leftAr": "🔗 سحب للربط",
        "rightAr": "✂️ فك الربط",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Directed Hamiltonian Paths on Ray-Constrained Graphs.</p>\n<p>Construct a sequence visiting every square once from $1$ to $N^2$ along directed ray vectors:</p>\n<div class=\"katex-display\">$$v_{k+1} - v_k = \\lambda \\vec{d}(v_k) \\quad (\\lambda \\in \\mathbb{Z}^+), \\qquad \\{v_1, \\dots, v_{N^2}\\} = V$$</div>\n<p>• Each numbered square points along one of 8 compass headings toward its successor.<br>• Step distance $\\lambda$ can span any number of open squares in the indicated direction.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المسارات الهاملتونية الموجهة المقيدة بأشعة الاتجاهات.</p>\n<p>اربط جميع المربعات في سلسلة متصلة تزور كل مربع مرة واحدة من $1$ إلى $N^2$:</p>\n<div class=\"katex-display\">$$v_{k+1} - v_k = \\lambda \\vec{d}(v_k) \\quad (\\lambda \\in \\mathbb{Z}^+), \\qquad \\{v_1, \\dots, v_{N^2}\\} = V$$</div>\n<p>• يشير السهم في كل مربع إلى أحد الاتجاهات الثمانية نحو المربع التالي له في الترتيب.<br>• يمكن للمسافة $\\lambda$ أن تقطع أي عدد من المربعات على طول الخط الموجه.</p>"
    },
    "netslide": {
        "titleEn": "🔄 Netslide (Toroidal Net)",
        "titleAr": "🔄 الشبكة المنزلقة (نت سلايد)",
        "domainEn": "Toroidal Group Actions: Cyclic Shifts $\\mathbb{Z}_W \\times \\mathbb{Z}_H \\times S_n$",
        "domainAr": "أفعال الزمر الحلقية: الإزاحات الدورية $\\mathbb{Z}_W \\times \\mathbb{Z}_H \\times S_n$",
        "descEn": "Apply cyclic row/column permutations on the 2-torus $\\mathbb{T}^2$ to connect the tree.",
        "descAr": "طبق التباديل الدورية للصفوف والأعمدة على السطح الحلقي $\\mathbb{T}^2$ لتوصيل الشجرة.",
        "leftAr": "🔄 إزاحة صف / عمود",
        "rightAr": "🔒 قفل القطعة",
        "middleAr": "قفل",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Toroidal Permutation Groups & Spanning Tree Synthesis.</p>\n<p>Shift rows and columns cyclically across torus $\\mathbb{T}^2 = \\mathbb{R}^2 / \\mathbb{Z}^2$ to form a connected tree:</p>\n<div class=\"katex-display\">$$\\sigma_{x}(x, y) = ((x + \\delta) \\bmod W, y), \\qquad c(T) = 1, \\quad |E| = |V| - 1$$</div>\n<p>• Wrapping rows and columns allows infinite cyclical sliding.<br>• Connect all peripheral nodes back to the center without loops or disconnected branches.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> زمر التباديل الحلقية على السطح الحلقي $\\mathbb{T}^2$ وبناء الأشجار الممتدة.</p>\n<p>أزح الصفوف والأعمدة دورياً على السطح الحلقي لتوصيل الشبكة بالكامل:</p>\n<div class=\"katex-display\">$$\\sigma_{x}(x, y) = ((x + \\delta) \\bmod W, y), \\qquad c(T) = 1, \\quad |E| = |V| - 1$$</div>\n<p>• خروج القطعة من أحد الأطراف يعيدها فوراً من الطرف المقابل.<br>• الهدف هو تشكيل شجرة متصلة واحدة تربط جميع القطع بالمصدر المركزي.</p>"
    },
    "pattern": {
        "titleEn": "🏁 Pattern (Nonogram)",
        "titleAr": "🏁 النقش المنطقي (نونوغرام)",
        "domainEn": "Discrete Tomography: Binary Reconstruction from Projections $\\sum x_{ij} = k$",
        "domainAr": "التصوير المقطعي المتقطع: الاستنتاج الثنائي من الإسقاطات $\\sum x_{ij} = k$",
        "descEn": "Reconstruct binary pixel matrices $\\mathbf{x} \\in \\{0, 1\\}^{H \\times W}$ from run-length clues.",
        "descAr": "استنتج مصفوفة البكسل الثنائية $\\mathbf{x} \\in \\{0, 1\\}^{H \\times W}$ من متتاليات أطوال الكتل المتتالية.",
        "leftAr": "⬛ تظليل بالأسود",
        "rightAr": "⬜ تعليم كفارغ (أبيض)",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Discrete Tomography & Binary Run-Length Decoding.</p>\n<p>Reconstruct binary matrix $\\mathbf{x} \\in \\{0, 1\\}^{H \\times W}$ from 1D projection sequences:</p>\n<div class=\"katex-display\">$$\\operatorname{runs}(\\mathbf{x}_{i,*}) = (r_{i,1}, \\dots, r_{i,k}), \\qquad \\sum r_{i,m} + (k - 1) \\le W$$</div>\n<p>• Sequences specify the exact lengths and order of contiguous black cell runs.<br>• Consecutive runs must be separated by at least one white cell.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> التصوير المقطعي المتقطع وفك شفرة أطوال الكتل الثنائية المتتالية.</p>\n<p>استنتج المصفوفة الثنائية $\\mathbf{x} \\in \\{0, 1\\}^{H \\times W}$ من متتاليات الإسقاطات الأفقية والرأسية:</p>\n<div class=\"katex-display\">$$\\operatorname{runs}(\\mathbf{x}_{i,*}) = (r_{i,1}, \\dots, r_{i,k}), \\qquad \\sum r_{i,m} + (k - 1) \\le W$$</div>\n<p>• تحدد الأرقام أطوال الكتل السوداء المتتالية وترتيب ظهورها بدقة.<br>• يجب أن يفصل مربع أبيض واحد على الأقل بين كل كتلتين سوداوين متتاليتين.</p>"
    },
    "mines": {
        "titleEn": "💣 Mines (Zero-Guess Logic)",
        "titleAr": "💣 الألغام المنطقية (بدون تخمين)",
        "domainEn": "Boolean Satisfiability (SAT): Exact Clue Neighborhoods $\\sum_{k=1}^8 x_k = c$",
        "domainAr": "إرضاء القيود البوليانية: معادلات الجوار المباشر $\\sum_{k=1}^8 x_k = c$",
        "descEn": "Clear mines using deterministic Boolean deduction $\\sum_{u \\in N_8(v)} x_u = c_v$ with zero guessing.",
        "descAr": "اكشف خلايا الألغام بالاستنتاج البولياني الحتمي $\\sum_{u \\in N_8(v)} x_u = c_v$ دون أي تخمين.",
        "leftAr": "⛏️ كشف الخلية",
        "rightAr": "🚩 وضع علم لغم",
        "middleAr": "كشف المجاور",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Boolean Constraint Satisfaction & Linear Systems over Moore Neighborhoods.</p>\n<p>Identify mine locations $x_u \\in \\{0, 1\\}$ satisfying 8-neighborhood linear equations:</p>\n<div class=\"katex-display\">$$\\sum_{u \\in N_8(v)} x_u = c_v, \\qquad \\operatorname{Pr}(\\text{Guessing Required}) = 0$$</div>\n<p>• The board generator mathematically guarantees a unique, pure-deduction solution path.<br>• Flag confirmed mines and safely expose all clear squares.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> إرضاء القيود البوليانية وأنظمة المعادلات على جوار مور ثماني الاتجاهات.</p>\n<p>حدد مواقع الألغام $x_u \\in \\{0, 1\\}$ بحل أنظمة المعادلات الخطية للجوار المباشر:</p>\n<div class=\"katex-display\">$$\\sum_{u \\in N_8(v)} x_u = c_v, \\qquad \\operatorname{Pr}(\\text{Guessing}) = 0$$</div>\n<p>• يضمن المولد الرياضي للغز وجود مسار استنتاجي حتمي خالٍ تماماً من التخمين.<br>• ضع علماً 🚩 على الألغام المؤكدة واكشف المربعات الآمنة باطمئنان.</p>"
    },
    "dominosa": {
        "titleEn": "🁣 Dominosa (Domino Tiling)",
        "titleAr": "🁣 الدومينو (تبليط الدومينو)",
        "domainEn": "Domino Tiling & Bijections: Unordered Pairs $\\{\\{a, b\\} \\mid 0 \\le a \\le b \\le N\\}$",
        "domainAr": "تبليط الدومينو والتقابل: الأزواج غير المرتبة $\\{\\{a, b\\} \\mid 0 \\le a \\le b \\le N\\}$",
        "descEn": "Partition numbers into a bijective set of dominoes $\\frac{(N+1)(N+2)}{2}$ without duplicate pairs.",
        "descAr": "قسّم شبكة الأرقام إلى مجموعة تقابلية كاملة من الدومينو $\\frac{(N+1)(N+2)}{2}$ دون أي تكرار.",
        "leftAr": "🁣 وضع قطعة دومينو",
        "rightAr": "حاجز فاصل بين خليتين",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Combinatorial Pair Partitions & Bijective Domino Tilings.</p>\n<p>Group adjacent cells into dominoes such that every unordered pair appears exactly once:</p>\n<div class=\"katex-display\">$$\\mathcal{D} = \\{\\{a, b\\} \\mid 0 \\le a \\le b \\le N\\}, \\qquad |\\mathcal{D}| = \\frac{(N+1)(N+2)}{2}, \\quad \\text{Bijective Covering}$$</div>\n<p>• Every numbered square must belong to exactly one $1 \\times 2$ domino.<br>• No two dominoes may contain the same pair of values.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> تجزئة الأزواج التوافقية والتبليط التقابلي الكامل لأحجار الدومينو.</p>\n<p>اربط كل خليتين متجاورتين بقطعة دومينو بحيث تظهر جميع الأزواج غير المرتبة مرة واحدة فقط:</p>\n<div class=\"katex-display\">$$\\mathcal{D} = \\{\\{a, b\\} \\mid 0 \\le a \\le b \\le N\\}, \\qquad |\\mathcal{D}| = \\frac{(N+1)(N+2)}{2}, \\quad \\text{Bijective Covering}$$</div>\n<p>• يجب أن تنتمي كل خلية مرقمة إلى قطعة دومينو واحدة فقط بأبعاد $1 \\times 2$.<br>• يُمنع تكرار أي زوج أرقام في قطعتي دومينو مختلفتين.</p>"
    },
    "rect": {
        "titleEn": "▭ Rectangles (Shikaku)",
        "titleAr": "▭ المستطيلات (شيكاكو)",
        "domainEn": "Area Factorization & Dissection: $A = w \\times h$, Non-Overlapping Partitions",
        "domainAr": "التحليل إلى عوامل وتجزئة المساحات: $A = w \\times h$ وتجزئة المستوى",
        "descEn": "Dissect the grid into rectangles where $\\operatorname{Area}(R_k) = w_k \\times h_k = c_k$.",
        "descAr": "قسّم الشبكة إلى مستطيلات غير متداخلة تحقق مساحة كل منها $\\operatorname{Area}(R_k) = w_k \\times h_k = c_k$.",
        "leftAr": "📐 سحب لرسم مستطيل",
        "rightAr": "مسح الحدود",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Integer Factorization Pairs $(w, h)$ & Grid Tessellation.</p>\n<p>Partition the entire grid into non-overlapping rectangles matching clue areas:</p>\n<div class=\"katex-display\">$$\\operatorname{Area}(R_k) = w_k \\times h_k = c_k, \\qquad \\bigcup_{k=1}^m R_k = \\text{Grid}, \\quad R_i \\cap R_j = \\emptyset$$</div>\n<p>• Each rectangle must encompass exactly one numbered cell corresponding to its area $c_k$.<br>• All grid squares must be covered with no overlaps.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> أزواج التحليل إلى عوامل $(w, h)$ وتبليط الشبكة المستوية بالمستطيلات.</p>\n<p>قسّم الشبكة بالكامل إلى مستطيلات غير متداخلة تطابق مساحة كل منها الرقم المكتوب بداخلها:</p>\n<div class=\"katex-display\">$$\\operatorname{Area}(R_k) = w_k \\times h_k = c_k, \\qquad \\bigcup_{k=1}^m R_k = \\text{Grid}, \\quad R_i \\cap R_j = \\emptyset$$</div>\n<p>• يجب أن يضم كل مستطيل رقماً واحداً فقط يساوي مساحته الإجمالية $c_k$.<br>• يجب تغطية جميع مربعات الشبكة دون أي فراغ أو تداخل.</p>"
    },
    "palisade": {
        "titleEn": "🧱 Palisade (Five Cells)",
        "titleAr": "🧱 الأسوار (تقسيم المناطق)",
        "domainEn": "Polyomino Boundary Metrics: Perimeter Clues $\\partial R$, Equal Area $|R| = k$",
        "domainAr": "مقاييس حدود البوليومينو: قيود المحيط $\\partial R$ وتساوي المساحات $|R| = k$",
        "descEn": "Partition into equal-area polyominoes $|R_k| = K$ matching boundary counts $|\\partial c \\cap \\partial R|$.",
        "descAr": "قسّم الشبكة إلى مناطق متساوية المساحة $|R_k| = K$ تطابق عدد أضلاع الحدود المحيطة $|\\partial c \\cap \\partial R|$.",
        "leftAr": "🧱 رسم حد فاصل",
        "rightAr": "✖️ منع الحد",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Equi-Area Polyomino Partitions & Perimeter Boundary Operators.</p>\n<p>Draw interior borders partitioning the grid into equal-area connected polyominoes:</p>\n<div class=\"katex-display\">$$|R_m| = K \\quad (\\forall m), \\qquad |\\partial(\\text{cell}) \\cap \\partial R| = c_{\\text{cell}}$$</div>\n<p>• Clue numbers specify how many of a cell's 4 edges serve as borders between different regions.<br>• Every resulting region must possess identical area $K$ (typically $K = 5$).</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> تجزئة بوليومينو متساوية المساحة ومؤثرات الحدود المحيطية.</p>\n<p>ارسم حدوداً فاصلة لتقسيم الشبكة إلى مناطق متصلة متساوية المساحة تماماً:</p>\n<div class=\"katex-display\">$$|R_m| = K \\quad (\\forall m), \\qquad |\\partial(\\text{cell}) \\cap \\partial R| = c_{\\text{cell}}$$</div>\n<p>• يحدد الرقم داخل الخلية عدد أضلاعها الأربعة التي تمثل حدوداً فاصلة بين منطقتين مختلفتين.<br>• يجب أن تمتلك كل منطقة ناتجة نفس المساحة $K$ (عادة $K = 5$).</p>"
    },
    "filling": {
        "titleEn": "🧩 Filling (Fillomino)",
        "titleAr": "🧩 ملء المناطق (فيلومينو)",
        "domainEn": "Connected Polyomino Partitions: Monochromatic Area $|C_v| = \\operatorname{val}(v)$",
        "domainAr": "تجزئة المكونات المتصلة: مساحة المنطقة $|C_v| = \\operatorname{val}(v)$",
        "descEn": "Fill cells with numbers such that connected components have area $|C_v| = \\operatorname{val}(v)$.",
        "descAr": "املأ الخلايا بأرقام بحيث تشكل كل مجموعة متصلة منطقة مساحتها مساوية لقيمتها $|C_v| = \\operatorname{val}(v)$.",
        "leftAr": "تحديد / سحب الخلية",
        "rightAr": "مسح الخلية",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Connected Component Cardinality & Adjacency Constraints.</p>\n<p>Label cells with positive integers such that every connected component of value $k$ has area $k$:</p>\n<div class=\"katex-display\">$$\\forall v \\in V: |C_v| = \\operatorname{val}(v), \\qquad \\forall C_a \\sim C_b \\implies \\operatorname{val}(C_a) \\neq \\operatorname{val}(C_b)$$</div>\n<p>• Two components of the same size/number can never share an orthogonal edge.<br>• Unlabeled cells may form new components not initially given on the board.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> سعة المكونات المتصلة وشروط تجاور المناطق في البيانات الشبكية.</p>\n<p>اكتب أعداداً صحيحة موجبة بحيث تشكل كل مجموعة متصلة من الرقم $k$ منطقة مساحتها $k$ بالضبط:</p>\n<div class=\"katex-display\">$$\\forall v \\in V: |C_v| = \\operatorname{val}(v), \\qquad \\forall C_a \\sim C_b \\implies \\operatorname{val}(C_a) \\neq \\operatorname{val}(C_b)$$</div>\n<p>• لا يجوز لمنطقتين تحملان نفس الرقم أن تتجاورا عبر ضلع مشترك.<br>• يمكن للخلايا الفارغة أن تشكل مناطق جديدة بأحجام غير معطاة مسبقاً في اللغز.</p>"
    },
    "range": {
        "titleEn": "🔭 Range (Kuromasu)",
        "titleAr": "🔭 مدى الرؤية (كوروماسو)",
        "domainEn": "Orthogonal Visibility Rays: $V(x, y) = 1 + \\sum d_{\\text{dir}} = k$, Connectivity",
        "domainAr": "أشعة الرؤية المتعامدة: $V(x, y) = 1 + \\sum d_{\\text{dir}} = k$ والاتصال",
        "descEn": "Place black blockers so visibility rays match clue values $V(i, j) = k_{i,j}$ and white cells remain connected.",
        "descAr": "ضع خلايا سوداء لضبط أشعة الرؤية $V(i, j) = k_{i,j}$ مع بقاء الخلايا البيضاء متصلة طوبولوجياً.",
        "leftAr": "⬛ تظليل بالأسود",
        "rightAr": "⬜ نقطة (خلية بيضاء)",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Orthogonal Visibility Functions & Connected Manifolds.</p>\n<p>Shade blocker cells black ($B$) to constrain the horizontal and vertical sightlines of clues:</p>\n<div class=\"katex-display\">$$V(i, j) = 1 + \\sum_{\\vec{d} \\in \\{\\uparrow, \\downarrow, \\leftarrow, \\rightarrow\\}} \\operatorname{ray}(i, j, \\vec{d}) = k_{i,j}, \\quad B \\cap N_4(B) = \\emptyset, \\quad c(W) = 1$$</div>\n<p>• Black squares cannot touch orthogonally.<br>• All remaining white squares must form a single connected component.<br>• Clue numbers count all visible white cells in the 4 directions (including the clue cell itself).</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> دوال الرؤية المتعامدة والاتصال الطوبولوجي للخلايا المفتوحة.</p>\n<p>ظلل بعض الخلايا بالأسود ($B$) لضبط مدى الرؤية الأفقي والرأسي لكل رقم معطى:</p>\n<div class=\"katex-display\">$$V(i, j) = 1 + \\sum_{\\vec{d} \\in \\{\\uparrow, \\downarrow, \\leftarrow, \\rightarrow\\}} \\operatorname{ray}(i, j, \\vec{d}) = k_{i,j}, \\quad B \\cap N_4(B) = \\emptyset, \\quad c(W) = 1$$</div>\n<p>• لا يجوز تجاور خليتين سوداوين أفقياً أو رأسياً.<br>• يجب أن تظل جميع الخلايا البيضاء متصلة في مكون طوبولوجي واحد.<br>• يمثل كل رقم مجموع الخلايا البيضاء المرئية منه في الاتجاهات الأربعة مضافاً إليها خلية الرقم نفسه.</p>"
    },
    "tents": {
        "titleEn": "⛺ Tents (Matching)",
        "titleAr": "⛺ الخيام والأشجار (المطابقة الثنائية)",
        "domainEn": "Bipartite Matching & Hall's Marriage Condition: $|N(S)| \\ge |S|$",
        "domainAr": "المطابقة في البيانات الثنائية وشرط هول: $|N(S)| \\ge |S|$",
        "descEn": "Find a perfect bipartite matching between trees and tents with infinity-metric distance $\\operatorname{dist}_\\infty(t_1, t_2) > 1$.",
        "descAr": "أوجد مطابقة تامة في البيان الثنائي بين الأشجار والخيام مع بقاء المسافة $\\operatorname{dist}_\\infty(t_1, t_2) > 1$.",
        "leftAr": "⛺ نصب خيمة",
        "rightAr": "🌿 تعليم كعشب فارغ",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Perfect Bipartite Matchings & Hall's Marriage Theorem.</p>\n<p>Pair each tree $T$ with an orthogonally adjacent tent $t$ under an injective bijection:</p>\n<div class=\"katex-display\">$$\\mathcal{M}: \\text{Trees} \\longleftrightarrow \\text{Tents}, \\quad |\\mathcal{M}| = |\\text{Trees}|, \\quad \\forall t_1 \\neq t_2: \\operatorname{dist}_\\infty(t_1, t_2) > 1$$</div>\n<p>• Tents must never touch each other, even diagonally ($\\|t_1 - t_2\\|_\\infty > 1$).<br>• Row and column numbers dictate the exact tent counts along each line.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> المطابقة التامة في البيانات ثنائية التجزئة ومبرهنة هول للزواج.</p>\n<p>اربط كل شجرة بخيمة مجاورة لها أفقياً أو رأسياً عبر تقابل أحادي تام:</p>\n<div class=\"katex-display\">$$\\mathcal{M}: \\text{Trees} \\longleftrightarrow \\text{Tents}, \\quad |\\mathcal{M}| = |\\text{Trees}|, \\quad \\forall t_1 \\neq t_2: \\operatorname{dist}_\\infty(t_1, t_2) > 1$$</div>\n<p>• لا يجوز أن تتلامس خيمتان على الإطلاق حتى بالزوايا القطرية ($\\|t_1 - t_2\\|_\\infty > 1$).<br>• تطابق أعداد الخيام في كل صف وعمود الأرقام المسجلة على حواف الشبكة.</p>"
    },
    "mosaic": {
        "titleEn": "🔳 Mosaic (3×3 Kernel)",
        "titleAr": "🔳 الفسيفساء (مصفوفة 3×3)",
        "domainEn": "2D Discrete Convolution: Kernel Neighborhood $\\sum_{u=-1}^1 \\sum_{v=-1}^1 x_{i+u, j+v} = c$",
        "domainAr": "الالتفاف المتقطع ثنائي الأبعاد: مصفوفة الجوار $\\sum_{u=-1}^1 \\sum_{v=-1}^1 x_{i+u, j+v} = c$",
        "descEn": "Reconstruct binary image $X$ from discrete 2D box convolution clues $(K * X)_{i,j} = c_{i,j}$.",
        "descAr": "استنتج الصورة الثنائية $X$ من مؤثر الالتفاف ثنائي الأبعاد في جوار المربعات $(K * X)_{i,j} = c_{i,j}$.",
        "leftAr": "⬛ تظليل بالأسود",
        "rightAr": "⬜ تعليم كأبيض",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> 2D Discrete Convolution with Uniform $3 \\times 3$ Box Filters.</p>\n<p>Determine binary cell values $X_{i,j} \\in \\{0, 1\\}$ satisfying local kernel convolution equations:</p>\n<div class=\"katex-display\">$$(K * X)_{i, j} = \\sum_{u=-1}^1 \\sum_{v=-1}^1 X_{i+u, j+v} = c_{i, j}, \\qquad X_{i,j} \\in \\{0, 1\\}$$</div>\n<p>• Each clue specifies the exact count of black cells within its $3 \\times 3$ sub-grid (including itself).<br>• Cells along grid boundaries convolute over truncated $2 \\times 3$ or $2 \\times 2$ neighborhoods.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الالتفاف المتقطع ثنائي الأبعاد باستخدام مرشح الجوار الصندوقي $3 \\times 3$.</p>\n<p>حدد قيم الخلايا الثنائية $X_{i,j} \\in \\{0, 1\\}$ لتحقيق معادلات التفاف الجوار الموضعي:</p>\n<div class=\"katex-display\">$$(K * X)_{i, j} = \\sum_{u=-1}^1 \\sum_{v=-1}^1 X_{i+u, j+v} = c_{i, j}, \\qquad X_{i,j} \\in \\{0, 1\\}$$</div>\n<p>• يحدد كل رقم عدد الخلايا السوداء داخل المربع $3 \\times 3$ المحيط به (بما فيها خلية الرقم نفسه).<br>• تُحسب خلايا حواف وزوايا الشبكة على جوار مقتطع بحجم $2 \\times 3$ أو $2 \\times 2$.</p>"
    },
    "unruly": {
        "titleEn": "⚖️ Unruly (Binairo)",
        "titleAr": "⚖️ التوازن الثنائي (بينيرو)",
        "domainEn": "Binary Parity & Run-Length Constraints: $\\sum x_i = \\frac{N}{2}$, No $3$-Runs",
        "domainAr": "التكافؤ الثنائي وتوازن الصفوف: $\\sum x_i = \\frac{N}{2}$ ومنع التتابع الثلاثي",
        "descEn": "Fill binary grid such that rows and columns balance $\\sum x_i = \\frac{N}{2}$ with no consecutive triples.",
        "descAr": "لوّن الشبكة الثنائية لتحقيق توازن متساوي $\\sum x_i = \\frac{N}{2}$ مع منع تكرار ثلاثة ألوان متتالية.",
        "leftAr": "⬛ تلوين بالأسود",
        "rightAr": "⬜ تلوين بالأبيض",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Binary Hamming Weight Balance & Run-Length Elimination.</p>\n<p>Color every grid square black or white ($x_{i,j} \\in \\{0, 1\\}$) satisfying equal weights and no run of 3:</p>\n<div class=\"katex-display\">$$\\sum_{j=1}^N x_{i,j} = \\frac{N}{2}, \\quad \\sum_{i=1}^N x_{i,j} = \\frac{N}{2}, \\quad x_{i,j} = x_{i,j+1} = x_{i,j+2} \\implies \\text{Forbidden}$$</div>\n<p>• No three consecutive squares in any row or column may share the same color.<br>• Each row and column must contain an equal number of black and white squares.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> توازن وزن هامر الثنائي ومنع التتابع الثلاثي للمتتاليات.</p>\n<p>لوّن كل مربع بالأسود أو الأبيض ($x_{i,j} \\in \\{0, 1\\}$) لتحقيق التوازن التام ومنع التتابع الثلاثي:</p>\n<div class=\"katex-display\">$$\\sum_{j=1}^N x_{i,j} = \\frac{N}{2}, \\quad \\sum_{i=1}^N x_{i,j} = \\frac{N}{2}, \\quad x_{i,j} = x_{i,j+1} = x_{i,j+2} \\implies \\text{Forbidden}$$</div>\n<p>• يُمنع وجود ثلاثة مربعات متتالية من نفس اللون في أي صف أو عمود.<br>• يجب أن يتساوى عدد المربعات السوداء والبيضاء في كل صف وفي كل عمود.</p>"
    },
    "flip": {
        "titleEn": "💡 Flip (Lights Out / GF(2))",
        "titleAr": "💡 قلب الإضاءة (جبر GF(2))",
        "domainEn": "Linear Algebra over $\\mathbb{F}_2$: $A\\mathbf{x} = \\mathbf{b} \\pmod 2$, Matrix Kernel",
        "domainAr": "الجبر الخطي على الحقل الثنائي $\\mathbb{F}_2$: $A\\mathbf{x} = \\mathbf{b} \\pmod 2$",
        "descEn": "Solve system of linear equations $A\\mathbf{s} \\equiv \\mathbf{1} + \\mathbf{s}_0 \\pmod 2$ to unify all cell states.",
        "descAr": "حل نظام المعادلات الخطية على الحقل الثنائي $A\\mathbf{s} \\equiv \\mathbf{1} + \\mathbf{s}_0 \\pmod 2$ لتوحيد الشبكة.",
        "leftAr": "💡 قلب مجموعة الخلايا",
        "rightAr": "قلب الخلايا",
        "middleAr": "قلب",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Linear Algebra over Galois Field $\\mathbb{F}_2$ & Adjacency Matrix Inversion.</p>\n<p>Toggle binary cell vectors $\\mathbf{s} \\in \\mathbb{F}_2^n$ to bring all squares to a uniform state:</p>\n<div class=\"katex-display\">$$A \\mathbf{s} \\equiv \\mathbf{1} + \\mathbf{s}_0 \\pmod 2, \\qquad A_{u,v} = \\mathbb{I}(u = v \\lor u \\sim v)$$</div>\n<p>• Clicking a square inverts its own state and that of its coupled neighbors according to the pattern shown.<br>• Reach the target all-light configuration with optimal moves.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الجبر الخطي على حقل غالوا الثنائي $\\mathbb{F}_2$ ومعكوس مصفوفة المجاورة.</p>\n<p>اقلب متجهات الخلايا الثنائية $\\mathbf{s} \\in \\mathbb{F}_2^n$ للوصول بالشبكة كلها إلى حالة موحدة:</p>\n<div class=\"katex-display\">$$A \\mathbf{s} \\equiv \\mathbf{1} + \\mathbf{s}_0 \\pmod 2, \\qquad A_{u,v} = \\mathbb{I}(u = v \\lor u \\sim v)$$</div>\n<p>• يؤدي النقر على أي مربع إلى قلب حالته وحالة الخلايا المقترنة به وفق المخطط الداخلي له.<br>• الهدف هو جعل جميع المربعات بيضاء موحدة بأقل عدد من الخطوات.</p>"
    },
    "guess": {
        "titleEn": "🔐 Guess (Mastermind)",
        "titleAr": "🔐 استنتاج الشفرة (ماسترمايند)",
        "domainEn": "Information Theory: Shannon Entropy $H(X) = -\\sum p(x)\\log_2 p(x)$ Minimization",
        "domainAr": "نظرية المعلومات: تقليص إنتروبيا شانون $H(X) = -\\sum p(x)\\log_2 p(x)$",
        "descEn": "Crack the hidden color sequence by maximizing information gain $I(X; Y) = H(X) - H(X|Y)$ per query.",
        "descAr": "فك شفرة الألوان السرية بتعظيم كسب المعلومات $I(X; Y) = H(X) - H(X|Y)$ في كل محاولة استنتاج.",
        "leftAr": "🎨 وضع لون",
        "rightAr": "🔒 تثبيت اللون",
        "middleAr": "مسح",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Information Theory, Shannon Entropy & Combinatorial Guessing Strategies.</p>\n<p>Deduce a secret ordered tuple $\\mathbf{c} \\in \\mathcal{C}^k$ by evaluating feedback clues:</p>\n<div class=\"katex-display\">$$\\text{Query } \\mathbf{q}: \\quad B = \\sum_{i=1}^k \\mathbb{I}(q_i = c_i), \\quad B + W = \\sum_{col} \\min(c_{col}^q, c_{col}^c)$$</div>\n<p>• Black pegs indicate correct color in the exact correct position.<br>• White pegs indicate correct color in an incorrect position.<br>• Maximize entropy reduction per guess to deduce the code in minimum steps.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> نظرية المعلومات وإنتروبيا شانون والاستراتيجيات التوافقية لتقليص الاحتمالات.</p>\n<p>استنتج المتتالية السرية $\\mathbf{c} \\in \\mathcal{C}^k$ من خلال مؤشرات التطابق المرتجعة:</p>\n<div class=\"katex-display\">$$\\text{Query } \\mathbf{q}: \\quad B = \\sum_{i=1}^k \\mathbb{I}(q_i = c_i), \\quad B + W = \\sum_{col} \\min(c_{col}^q, c_{col}^c)$$</div>\n<p>• الدبوس الأسود يعني لوناً صحيحاً في الموقع الصحيح تماماً.<br>• الدبوس الأبيض يعني لوناً صحيحاً لكن في موقع خاطئ.<br>• وظف مبدأ تعظيم المعلومات لتقليص فضاء الاحتمالات بأقل عدد من التخمينات.</p>"
    },
    "flood": {
        "titleEn": "🌊 Flood (Percolation)",
        "titleAr": "🌊 الفيضان اللوني (الترشيح البياني)",
        "domainEn": "Graph Percolation & Connected Components: Diameter $\\operatorname{diam}(G)$, Greedy BFS",
        "domainAr": "الترشيح البياني والمكونات المتصلة: قطر البيان $\\operatorname{diam}(G)$ وأقصر مسار",
        "descEn": "Flood connected components to unify the entire grid into one monochromatic cluster within step budget $M$.",
        "descAr": "وحّد مكونات الشبكة المتصلة في كتلة لونية موحدة قبل استنفاد عدد الحركات الأقصى $M$.",
        "leftAr": "🎨 غمر باللون المختار",
        "rightAr": "غمر لوني",
        "middleAr": "غمر",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Grid Percolation & Breadth-First Expansion of Connected Components.</p>\n<p>Expand the connected monochromatic component $C_t$ containing $(0, 0)$ via successive recoloring:</p>\n<div class=\"katex-display\">$$C_{t+1} = C_t \\cup \\left\\{v \\in V \\,\\middle|\\, \\operatorname{color}(v) = c_{\\text{new}} \\land \\operatorname{dist}(v, C_t) = 1\\right\\}, \\qquad |C_T| = |V|$$</div>\n<p>• Clicking a color transforms the origin component and absorbs all matching adjacent cells.<br>• Unify the entire board into a single uniform color within the allocated move bound.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الترشيح على الشبكات وتوسيع المكونات المترابطة بالبحث في اتساع البيان (BFS).</p>\n<p>وسّع المكون المتصل اللوني $C_t$ الذي يضم الخلية العلوية $(0, 0)$ باختيار الألوان المتتالية:</p>\n<div class=\"katex-display\">$$C_{t+1} = C_t \\cup \\left\\{v \\in V \\,\\middle|\\, \\operatorname{color}(v) = c_{\\text{new}} \\land \\operatorname{dist}(v, C_t) = 1\\right\\}, \\qquad |C_T| = |V|$$</div>\n<p>• يؤدي اختيار لون جديد إلى صبغ الكتلة المترابطة وضم جميع الخلايا المجاورة التي تحمل ذلك اللون.<br>• وحّد اللوحة كلها في لون واحد قبل انتهاء عدد الحركات المحدد.</p>"
    },
    "fifteen": {
        "titleEn": "🔢 Fifteen (Sliding Parity)",
        "titleAr": "🔢 لغز الـ 15 (التباديل الزوجية)",
        "domainEn": "Permutation Parity & Alternating Group: $\\operatorname{sgn}(\\sigma) = +1 \\in A_{15}$",
        "domainAr": "تكافؤ التباديل والزمرة المتناوبة: $\\operatorname{sgn}(\\sigma) = +1 \\in A_{15}$",
        "descEn": "Sort permutation $\\sigma \\in S_{16}$ into identity order using parity-preserving tile slides.",
        "descAr": "رتب التبديلة $\\sigma \\in S_{16}$ تصاعدياً عبر إزاحات الفراغ المحافظة على التكافؤ التبديلي الزوجي.",
        "leftAr": "🔢 تحريك القطعة",
        "rightAr": "تحريك القطعة",
        "middleAr": "تحريك",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Permutation Inversion Parity & The Alternating Group $A_{15}$.</p>\n<p>Slide numbered tiles into the empty space to arrange numbers $1, \\dots, 15$ sequentially:</p>\n<div class=\"katex-display\">$$N(\\sigma) + \\operatorname{row}(\\text{blank}) \\equiv \\text{constant} \\pmod 2 \\implies \\sigma \\in A_{15}$$</div>\n<p>• Only permutations with even total parity are solvable from a given configuration.<br>• Slide tiles orthogonally into the adjacent vacant spot until natural ascending order is restored.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> تكافؤ معكوسات التباديل والزمرة المتناوبة $A_{15}$.</p>\n<p>أزح القطع المرقمة نحو المربع الفارغ لترتيب الأرقام بالتسلسل من $1$ إلى $15$:</p>\n<div class=\"katex-display\">$$N(\\sigma) + \\operatorname{row}(\\text{blank}) \\equiv \\text{const} \\pmod 2 \\implies \\sigma \\in A_{15}$$</div>\n<p>• التباديل الزوجية فقط هي القابلة للحل رياضياً للوصول إلى مصفوفة الهوية.<br>• انقر على أي قطعة مجاورة للفراغ لتحريكها حتى يستقر الترتيب التصاعدي الطبيعي.</p>"
    },
    "sixteen": {
        "titleEn": "🔄 Sixteen (Toroidal Shift)",
        "titleAr": "🔄 الإزاحة الحلقية (الـ 16)",
        "domainEn": "Cyclic Permutations & Commutators: $[g, h] = ghg^{-1}h^{-1} \\in S_{16}$",
        "domainAr": "التباديل الدورية والمبدلات: $[g, h] = ghg^{-1}h^{-1} \\in S_{16}$",
        "descEn": "Sort the $4 \\times 4$ permutation matrix using cyclic row and column shift commutators.",
        "descAr": "رتب مصفوفة التباديل $4 \\times 4$ تصاعدياً باستخدام مبدلات الإزاحة الدورية للصفوف والأعمدة.",
        "leftAr": "🔄 إزاحة الصف / العمود",
        "rightAr": "إزاحة عكسية",
        "middleAr": "إزاحة",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Group Commutators $[A, B] = ABA^{-1}B^{-1}$ in Symmetric Group $S_{16}$.</p>\n<p>Restore the $4 \\times 4$ numerical matrix order through toroidal cyclic permutations:</p>\n<div class=\"katex-display\">$$\\tau_{\\text{row}} = (1\\ 2\\ 3\\ 4), \\quad \\tau_{\\text{col}} = (1\\ 5\\ 9\\ 13), \\quad [A, B] = ABA^{-1}B^{-1} \\in A_{16}$$</div>\n<p>• Unlike Fifteen, there is no blank space; every row and column wraps cyclically around the torus.<br>• Combine commutators of row and column shifts to achieve 3-cycles and solve the configuration.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> مبدلات الزمر $[A, B] = ABA^{-1}B^{-1}$ في زمرة التباديل المتناظرة $S_{16}$.</p>\n<p>أعد ترتيب مصفوفة الأرقام $4 \\times 4$ من خلال التباديل الدورية الحلقية:</p>\n<div class=\"katex-display\">$$\\tau_{\\text{row}} = (1\\ 2\\ 3\\ 4), \\quad \\tau_{\\text{col}} = (1\\ 5\\ 9\\ 13), \\quad [A, B] = ABA^{-1}B^{-1} \\in A_{16}$$</div>\n<p>• لا يوجد مربع فارغ؛ كل صف وعمود يلتف بشكل دائري متصل حول السطح الحلقي.<br>• ادمج مبدلات الإزاحات الأفقية والرأسية لتوليد دورات ثلاثية وحل اللغز بالكامل.</p>"
    },
    "twiddle": {
        "titleEn": "🌀 Twiddle (Block Rotations)",
        "titleAr": "🌀 تدوير الكتل (تويدل)",
        "domainEn": "Sub-matrix Rotation Groups: Generators $\\langle r_1, \\dots, r_m \\rangle \\le S_n$",
        "domainAr": "زمر دوران المصفوفات الفرعية: المولدات $\\langle r_1, \\dots, r_m \\rangle \\le S_n$",
        "descEn": "Sort numbers by applying localized $k \\times k$ cyclic block rotations $\\sigma_{\\text{rot}} = (a\\ b\\ d\\ c)$.",
        "descAr": "رتب مصفوفة الأرقام بتطبيق دورانات الكتل المربعة الفرعية $\\sigma_{\\text{rot}} = (a\\ b\\ d\\ c)$.",
        "leftAr": "↺ تدوير الكتلة لليسار",
        "rightAr": "↻ تدوير الكتلة لليمين",
        "middleAr": "تدوير",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Permutation Subgroups Generated by Overlapping $2 \\times 2$ Rotations.</p>\n<p>Sort an $N \\times N$ grid into ascending sequence using local cyclic 4-cycle operations:</p>\n<div class=\"katex-display\">$$r_{i,j} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\mapsto \\begin{pmatrix} c & a \\\\ d & b \\end{pmatrix} = (a\\ b\\ d\\ c) \\in S_n$$</div>\n<p>• Rotate overlapping square blocks clockwise or counter-clockwise.<br>• Synthesize targeted transposition commutators to place every number in its correct home.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> الزمر الجزئية للتباديل المتولدة من دورانات الكتل المربعة المتداخلة $2 \\times 2$.</p>\n<p>رتب شبكة الأرقام تصاعدياً بتطبيق دورانات دائرية رباعية موضعية:</p>\n<div class=\"katex-display\">$$r_{i,j} = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\mapsto \\begin{pmatrix} c & a \\\\ d & b \\end{pmatrix} = (a\\ b\\ d\\ c) \\in S_n$$</div>\n<p>• قم بتدوير المربعات الفرعية المتداخلة مع عقارب الساعة أو عكسها.<br>• وظف مبدلات التبديل الموضعي لنقل كل رقم إلى موضعه التصاعدي الصحيح.</p>"
    },
    "pegs": {
        "titleEn": "📍 Pegs (Peg Solitaire)",
        "titleAr": "📍 سوليتير الأوتاد (بيغز)",
        "domainEn": "Pagoda Resource Invariants: Monovariant Functions $\\Phi(t+1) \\le \\Phi(t)$",
        "domainAr": "لامتغيرات باجودا وحساب الموارد: الدوال الرتيبة $\\Phi(t+1) \\le \\Phi(t)$",
        "descEn": "Reduce board pegs via orthogonal leapfrog eliminations until exactly $|P| = 1$ remains.",
        "descAr": "اقفز بالأوتاد فوق بعضها لإزالتها حتى يتبقى وتد واحد فقط في مركز اللوحة $|P| = 1$.",
        "leftAr": "📍 سحب الوتد للقفز",
        "rightAr": "تحديد الوتد",
        "middleAr": "قفز",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Pagoda Monovariant Invariants & State Transition Graphs.</p>\n<p>Eliminate pegs via orthogonal jumps $(p_1, p_2) \\to p_3$ into empty holes until a single peg survives:</p>\n<div class=\"katex-display\">$$\\Phi(\\text{board}) = \\sum_{p \\in \\text{Pegs}} w(p), \\qquad \\Delta\\Phi = w(p_3) - w(p_1) - w(p_2) \\le 0, \\quad |P_{\\text{final}}| = 1$$</div>\n<p>• Every valid jump removes the jumped-over peg.<br>• Carefully preserve Pagoda invariants to ensure the final solitary peg lands in the center hole.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> دوال باجودا الرتيبة (Pagoda Functions) واللامتغيرات الرياضية في ألعاب القفز.</p>\n<p>اقفز بالأوتاد أفقياً ورأسياً لإزالة الوتد المقفوز فوقه حتى يتبقى وتد أخير واحد فقط:</p>\n<div class=\"katex-display\">$$\\Phi(\\text{board}) = \\sum_{p \\in \\text{Pegs}} w(p), \\qquad \\Delta\\Phi = w(p_3) - w(p_1) - w(p_2) \\le 0, \\quad |P_{\\text{final}}| = 1$$</div>\n<p>• كل قفزة نظامية تزيل الوتد الأوسط المقفوز فوقه.<br>• حافظ على توازن دالة باجودا لضمان استقرار الوتد الأخير في الفجوة المركزية للوحة.</p>"
    },
    "samegame": {
        "titleEn": "🧱 Same Game (Cluster Clear)",
        "titleAr": "🧱 تصفية المجموعات (سيم جيم)",
        "domainEn": "Combinatorial Optimization: Quadratic Scoring function $S = \\sum (n_i - 2)^2$",
        "domainAr": "التحسين التوافقي: دالة النقاط التربيعية $S = \\sum (n_i - 2)^2$",
        "descEn": "Clear monochromatic components $n \\ge 2$ to maximize total quadratic score $S = \\sum (n_k - 2)^2$.",
        "descAr": "احذف المجموعات اللونية المتصلة لتعظيم دالة النقاط التربيعية $S = \\sum (n_k - 2)^2$.",
        "leftAr": "🧱 تحديد / حذف المجموعة",
        "rightAr": "تحديد المجموعة",
        "middleAr": "حذف",
        "rulesEn": "<p><strong>Mathematical Concept:</strong> Dynamic Programming & Combinatorial Convex Optimization.</p>\n<p>Remove connected monochromatic clusters of size $n \\ge 2$ to maximize quadratic score yield:</p>\n<div class=\"katex-display\">$$\\operatorname{Score} = \\sum_{k} (n_k - 2)^2 + \\mathbb{I}(\\text{Full Board Cleared}) \\cdot 1000$$</div>\n<p>• Removing a cluster causes higher blocks to drop under gravity and merges empty vertical columns.<br>• Form larger clusters before clearing to exploit quadratic growth.</p>",
        "rulesAr": "<p><strong>المفهوم الرياضي:</strong> البرمجة الديناميكية والتحسين المحدب التوافقي لدوال المكافأة التربيعية.</p>\n<p>احذف المجموعات المتصلة من نفس اللون بحجم $n \\ge 2$ لتحقيق أعلى عائد من النقاط:</p>\n<div class=\"katex-display\">$$\\operatorname{Score} = \\sum_{k} (n_k - 2)^2 + \\mathbb{I}(\\text{Full Board Cleared}) \\cdot 1000$$</div>\n<p>• حذف أي كتلة يؤدي لسقوط الكتل العلوية بتأثير الجاذبية واندماج الأعمدة الفارغة.<br>• اجمع كتلاً لونية أضخم قبل حذفها للاستفادة من النمو التربيعي السريع للنقاط.</p>"
    }
};
  window.__EDUGATES_PUZZLE_I18N__ = PUZZLE_I18N;

  // ==========================================================================
  // KATEX MATHEMATICAL TYPOGRAPHY ENGINE (Zero CDN, Offline PWA, LTR/RTL Safe)
  // ==========================================================================
  function renderEdugatesMath(container) {
    var root = container || document.body;
    if (!root) return;
    if (typeof window.renderMathInElement === "function" && typeof window.katex !== "undefined") {
      try {
        window.renderMathInElement(root, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            { left: "\\[", right: "\\]", display: true }
          ],
          throwOnError: false,
          errorColor: "#f43f5e"
        });
      } catch (err) {
        console.warn("Edugates KaTeX Auto-Render notice:", err);
      }
    }
  }
  window.renderEdugatesMath = renderEdugatesMath;

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
        // Triumphant Harmonious "Ta-Da!" Fanfare:
        // 1. "Ta-" (Herald upbeat): 2 rapid staccato brass calls + ascending grace
        // 2. "-DAAA!" (Triumphant grand resolution): Multi-octave C-Major chord in rich harmony
        // with brass warmth (filtered saw), crystalline sparkle (sine/bell), and smooth reverberant decay.
        var masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.85, now);
        masterGain.connect(ctx.destination);

        // Lowpass filter for warm acoustic brass resonance
        var brassFilter = ctx.createBiquadFilter();
        brassFilter.type = "lowpass";
        brassFilter.Q.setValueAtTime(2.2, now);
        brassFilter.frequency.setValueAtTime(2800, now);
        brassFilter.frequency.exponentialRampToValueAtTime(4200, now + 0.28);
        brassFilter.frequency.exponentialRampToValueAtTime(1050, now + 1.9);
        brassFilter.connect(masterGain);

        // Play a brass voice (warm sawtooth into filter)
        function playBrass(freq, startTime, duration, peakGain, detuneCents) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, startTime);
          if (detuneCents) osc.detune.setValueAtTime(detuneCents, startTime);

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.016);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(brassFilter);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.03);
        }

        // Play a crystalline bell/chime sparkle voice
        function playChime(freq, startTime, duration, peakGain) {
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + duration + 0.03);
        }

        // --- PART 1: The "Ta-" (Herald Upbeat Fanfare) ---
        // Staccato herald 1: G4 (392Hz) + C5 (523.25Hz)
        playBrass(392.00, now + 0.00, 0.085, 0.15, 0);
        playBrass(523.25, now + 0.00, 0.085, 0.13, 3);
        playChime(1046.50, now + 0.00, 0.09, 0.05);

        // Staccato herald 2: E5 (659.25Hz) + G5 (783.99Hz)
        playBrass(659.25, now + 0.095, 0.095, 0.16, -3);
        playBrass(783.99, now + 0.095, 0.095, 0.14, 3);
        playChime(1318.51, now + 0.095, 0.10, 0.05);

        // Quick grace leap: B5 (987.77Hz)
        playBrass(987.77, now + 0.19, 0.065, 0.12, 0);

        // --- PART 2: The "-DAAA!" (Grand Harmonic Resolution) ---
        var daTime = now + 0.25;
        var chordDuration = 1.95;

        // Sub & Foundation Bass (warm room presence on smartboard speakers)
        var subOsc = ctx.createOscillator();
        var subGain = ctx.createGain();
        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(130.81, daTime); // C3
        subGain.gain.setValueAtTime(0.0001, daTime);
        subGain.gain.linearRampToValueAtTime(0.18, daTime + 0.025);
        subGain.gain.exponentialRampToValueAtTime(0.0001, daTime + 1.5);
        subOsc.connect(subGain);
        subGain.connect(masterGain);
        subOsc.start(daTime);
        subOsc.stop(daTime + 1.55);

        // Rich Multi-Voice C-Major Chord in Full Harmony:
        // C4 (Bass, 261.63Hz)
        playBrass(261.63, daTime, chordDuration, 0.15, 0);
        // G4 (Tenor 5th, 392.00Hz)
        playBrass(392.00, daTime, chordDuration, 0.13, -3);
        // C5 (Lead Root, 523.25Hz) — chorus detuned pair for lush orchestral spread
        playBrass(523.25, daTime, chordDuration, 0.16, -4);
        playBrass(523.25, daTime, chordDuration, 0.16, +4);
        // E5 (Major 3rd, 659.25Hz) — defines triumphant major harmony!
        playBrass(659.25, daTime, chordDuration, 0.16, -2);
        playBrass(659.25, daTime, chordDuration, 0.16, +3);
        // G5 (Upper 5th, 783.99Hz)
        playBrass(783.99, daTime, chordDuration, 0.14, 0);

        // High Golden Chime / Bell Sparkles ringing out over the brass:
        // C6 (High Octave Bell, 1046.50Hz)
        playChime(1046.50, daTime, 1.95, 0.10);
        // E6 (High 3rd Shimmer, 1318.51Hz)
        playChime(1318.51, daTime, 1.75, 0.08);
        // G6 (High 5th Sparkle, 1567.98Hz)
        playChime(1567.98, daTime, 1.45, 0.06);
        // C7 (Celebratory Star Chime, 2093.00Hz)
        playChime(2093.00, daTime, 1.15, 0.04);
      }
    } catch (e) {}
  }
  window.playEdugatesSound = playSound;

  window.toggleEdugatesSound = function () {
    soundEnabled = !soundEnabled;
    localStorage.setItem("edugates_sound_enabled", soundEnabled ? "true" : "false");
    var btn = document.getElementById("eis-sound-btn");
    if (btn) {
      if (document.body.classList.contains("puzzle-page")) {
        btn.textContent = soundEnabled ? "🔊" : "🔇";
        btn.title = soundEnabled ? (isAr() ? "كتم الصوت" : "Mute Sound") : (isAr() ? "تشغيل الصوت" : "Enable Sound");
      } else {
        btn.textContent = soundEnabled ? (isAr() ? "🔊 الصوت" : "🔊 Sound") : (isAr() ? "🔇 صامت" : "🔇 Muted");
      }
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
    var pDict = PUZZLE_I18N[item.id] || {};
    var data = loadMasteryData();
    return {
      date: today,
      id: item.id,
      href: item.href,
      title: isAr() ? (pDict.titleAr || item.title) : item.title,
      domain: isAr() ? (pDict.domainAr || item.domain) : item.domain,
      desc: isAr() ? (pDict.descAr || item.desc) : item.desc,
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

    var rankTitle = isAr() ? "مبتدئ المنطق" : "Logic Initiate";
    var nextThreshold = 5;
    if (totalStars >= 90) { rankTitle = isAr() ? "أستاذ بوابة المعرفة الأعظم" : "Edugates Grandmaster"; nextThreshold = 123; }
    else if (totalStars >= 50) { rankTitle = isAr() ? "زميل أولمبياد STEM" : "STEM Olympiad Fellow"; nextThreshold = 90; }
    else if (totalStars >= 20) { rankTitle = isAr() ? "مهندس البديهيات" : "Axiom Architect"; nextThreshold = 50; }
    else if (totalStars >= 5) { rankTitle = isAr() ? "مستكشف البيانات" : "Graph Explorer"; nextThreshold = 20; }

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

    // Default rectangle fill
    ctx.fillStyle = colStr;
    ctx.fillRect(x, y, w, h);

    // Tactile 3D Bevel Engine for Game Cells / Tiles across all puzzles
    if (w >= 18 && h >= 18 && w <= 240 && h <= 240 && Math.abs(w - h) <= 14) {
      var isDarkTile = (colour === 1 && puzzleId === "flip") || (colStr === "#1e293b" || colStr === "#0f172a" || colStr === "#334155" || colStr === "#475569" || colStr === "#2b374d");
      if (isDarkTile) {
        // Pressed / Active recessed 3D tile bevel (e.g. Flip dark tiles, Unruly black cells)
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(x + 1, y + 1, w - 2, 2);
        ctx.fillRect(x + 1, y + 1, 2, h - 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
        ctx.fillRect(x + 1, y + h - 2, w - 2, 1.5);
        ctx.fillRect(x + w - 2, y + 1, 1.5, h - 2);
      } else {
        // Raised tactile 3D tile bevel (Light tiles, number tiles, game blocks)
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillRect(x + 1, y + 1, w - 2, 1.8);
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(x + 1, y + 1, 1.5, h - 2);
        ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
        ctx.fillRect(x + 1, y + h - 2, w - 2, 1.8);
        ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
        ctx.fillRect(x + w - 2, y + 1, 1.5, h - 2);
      }
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
    { name: "⚡ Euler", nameAr: "⚡ أويلر", color: "#2ABFBF", score: 0 },
    { name: "📐 Gauss", nameAr: "📐 غاوس", color: "#f59e0b", score: 0 },
    { name: "🌌 Noether", nameAr: "🌌 نوثر", color: "#10b981", score: 0 },
    { name: "🔬 Turing", nameAr: "🔬 تورينغ", color: "#f43f5e", score: 0 }
  ];

  var DEFAULT_TEAM_AR_MAP = {
    "⚡ Euler": "⚡ أويلر",
    "📐 Gauss": "📐 غاوس",
    "🌌 Noether": "🌌 نوثر",
    "🔬 Turing": "🔬 تورينغ"
  };

  function getTeamDisplayName(t) {
    if (!t) return "";
    if (isAr() && DEFAULT_TEAM_AR_MAP[t.name]) return DEFAULT_TEAM_AR_MAP[t.name];
    return t.name;
  }

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
        var dispName = getTeamDisplayName(t);
        var chip = document.createElement("div");
        chip.className = "sb-team-chip" + (teamsState.activeIdx === idx ? " active-turn" : "");
        chip.title = isAr()
          ? "انقر لتعيينه كفريق نشط • انقر مرتين على الاسم لتعديله"
          : "Tap to set as Active Team • Double-click name to rename";
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
        nameSpan.textContent = dispName + (teamsState.activeIdx === idx ? " ★" : "");
        nameSpan.ondblclick = function (ev) {
          ev.stopPropagation();
          var nextName = window.prompt(isAr() ? "إعادة تسمية فريق الفصل:" : "Rename Classroom Team:", dispName);
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
        minusBtn.title = isAr() ? "-5 نقاط" : "-5 Points";
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
        plusBtn.title = isAr() ? "+10 نقاط" : "+10 Points";
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
    var dispName = getTeamDisplayName(activeTeam);
    awardBtn.textContent = isAr() ? ("🏅 +10 نقاط لفريق " + dispName) : ("🏅 +10 Pts to " + dispName);
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
    var dispName = getTeamDisplayName(activeTeam);
    activeTeam.score += 10;
    teamsState.activeIdx = (teamsState.activeIdx + 1) % teamsState.teams.length;
    teamsState.open = true;
    saveTeamsState();
    playSound("victory");
    renderTeamBar();
    if (btnEl) {
      btnEl.disabled = true;
      btnEl.textContent = isAr()
        ? ("✅ تمت إضافة +10 نقاط لفريق " + dispName + "!")
        : ("✅ +10 Pts Awarded to " + dispName + "!");
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
    var availW = Math.max(220, (viewport.clientWidth - 50) * currentZoomScale);
    var availH = Math.max(200, (viewport.clientHeight - 75) * currentZoomScale);
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
      btn.textContent = currentDockSide === "left"
        ? (isAr() ? "➡️ اللوحة يميناً" : "➡️ Dock Right")
        : (isAr() ? "⬅️ اللوحة يساراً" : "⬅️ Dock Left");
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

  // ==========================================================================
  // 9. HIGH-ENERGY MULTI-CANNON CONFETTI, STAR SPARKLES & VISUAL CELEBRATION
  // ==========================================================================
  var confettiAnimId = null;

  function triggerVictoryCelebration() {
    // 1. Trigger celebratory golden shockwave on puzzle frame and viewport
    var resizable = document.getElementById("resizable");
    if (resizable) {
      resizable.classList.remove("victory-shockwave");
      void resizable.offsetWidth; // force style re-calculation
      resizable.classList.add("victory-shockwave");
      setTimeout(function () {
        if (resizable) resizable.classList.remove("victory-shockwave");
      }, 3500);
    }
    var viewport = document.querySelector(".sb-canvas-viewport");
    if (viewport) {
      viewport.classList.remove("victory-glow");
      void viewport.offsetWidth;
      viewport.classList.add("victory-glow");
      setTimeout(function () {
        if (viewport) viewport.classList.remove("victory-glow");
      }, 3500);
    }

    // 2. High-energy dual-cannon confetti, ribbons & golden star sparkles
    triggerVictoryConfetti();
  }

  function triggerVictoryConfetti() {
    var stage = document.querySelector(".sb-board-stage");
    if (!stage) return;
    var cCanvas = document.getElementById("sb-confetti-canvas");
    if (!cCanvas) {
      cCanvas = document.createElement("canvas");
      cCanvas.id = "sb-confetti-canvas";
      stage.appendChild(cCanvas);
    }
    var w = stage.clientWidth || 800;
    var h = stage.clientHeight || 550;
    cCanvas.width = w;
    cCanvas.height = h;
    var ctx = cCanvas.getContext("2d");
    if (!ctx) return;

    var isLite = !!window.__EDUGATES_PERF_LITE__;
    var colors = [
      "#f59e0b", "#fbbf24", "#fde047", // Edugates Golds
      "#10b981", "#34d399",             // Emeralds
      "#38bdf8", "#0284c7",             // Sky Blues
      "#a855f7", "#c084fc",             // Amethysts
      "#f43f5e", "#fb7185"              // Crimson / Coral
    ];

    var parts = [];

    // Helper: spawn particles from cannon origin
    function spawnCannon(originX, originY, baseAngleDeg, spreadDeg, count, minSpeed, maxSpeed) {
      for (var i = 0; i < count; i++) {
        var angle = (baseAngleDeg + (Math.random() - 0.5) * spreadDeg) * (Math.PI / 180);
        var speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        var pType = Math.random() < 0.28 ? "star" : (Math.random() < 0.16 ? "circle" : "ribbon");
        parts.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: pType === "star" ? (Math.random() * 6 + 7) : (Math.random() * 7 + 6),
          color: colors[Math.floor(Math.random() * colors.length)],
          type: pType,
          rot: Math.random() * Math.PI * 2,
          vrot: (Math.random() - 0.5) * 0.24,
          tilt: Math.random() * Math.PI,
          vtilt: (Math.random() * 0.15 + 0.08),
          sway: Math.random() * Math.PI * 2,
          opacity: 1
        });
      }
    }

    var cannonCount = isLite ? 22 : 44;
    var centerCount = isLite ? 12 : 26;

    // Cannon 1: Bottom-Left firing up & right (-55 deg)
    spawnCannon(w * 0.08, h * 0.95, -55, 34, cannonCount, 13, 23);
    // Cannon 2: Bottom-Right firing up & left (-125 deg)
    spawnCannon(w * 0.92, h * 0.95, -125, 34, cannonCount, 13, 23);
    // Cannon 3: Center fireworks starburst
    spawnCannon(w * 0.5, h * 0.42, -90, 180, centerCount, 4, 14);

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
    var frames = 0;
    var maxFrames = isLite ? 150 : 210;

    function drawStar(c, cx, cy, spikes, outerRadius, innerRadius, fill) {
      var rot = (Math.PI / 2) * 3;
      var x = cx;
      var y = cy;
      var step = Math.PI / spikes;
      c.beginPath();
      c.moveTo(cx, cy - outerRadius);
      for (var i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        c.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        c.lineTo(x, y);
        rot += step;
      }
      c.lineTo(cx, cy - outerRadius);
      c.closePath();
      c.fillStyle = fill;
      c.fill();
    }

    function step() {
      frames++;
      ctx.clearRect(0, 0, w, h);
      var alive = false;
      var fadeStart = maxFrames - 45;

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.32; // gravity
        p.vx *= 0.985; // air resistance
        p.vy *= 0.985;
        p.rot += p.vrot;
        p.tilt += p.vtilt;
        p.sway += 0.07;
        p.x += Math.sin(p.sway) * 0.8;

        if (frames > fadeStart) {
          p.opacity = Math.max(0, (maxFrames - frames) / 45);
        }

        if (p.y < h + 30 && p.opacity > 0) alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);

        if (p.type === "star") {
          drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45, p.color);
        } else if (p.type === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          // 3D flipping ribbon
          var scaleX = Math.cos(p.tilt);
          ctx.scale(scaleX, 1);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.5, -p.size * 0.28, p.size, p.size * 0.56);
        }
        ctx.restore();
      }

      if (alive && frames < maxFrames) {
        confettiAnimId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, w, h);
        confettiAnimId = null;
      }
    }
    confettiAnimId = requestAnimationFrame(step);
  }

  var lastVictoryResult = null;
  function renderVictoryBannerContent(res) {
    var banner = document.getElementById("sb-victory-banner");
    if (!banner || !res) return;

    var starsHtml = '<div class="sb-vstar-row">';
    for (var i = 0; i < 3; i++) {
      var isFilled = i < res.stars;
      var starClass = "sb-vstar star-" + (i + 1) + (isFilled ? "" : " is-empty");
      starsHtml += '<span class="' + starClass + '">' + (isFilled ? "★" : "☆") + '</span>';
    }
    starsHtml += '</div>';

    var activeTeam = teamsState.teams[teamsState.activeIdx] || teamsState.teams[0];
    var dispTeam = getTeamDisplayName(activeTeam);
    var recBadge = res.isNewRecord
      ? (' <span style="color:#10b981;font-size:0.72rem">' + (isAr() ? '🔥 رقم قياسي!' : '🔥 RECORD!') + '</span>')
      : '';
    var chipText = isAr() ? "🏆 إثبات رياضي مكتمل!" : "🏆 MATHEMATICAL PROOF COMPLETED!";

    banner.innerHTML =
      '<div class="sb-victory-badge">' + chipText + '</div>' +
      starsHtml +
      '<div class="sb-victory-title">' + (isAr() ? '🎉 استنتاج رياضي رائع!' : '🎉 Excellent Deduction!') + '</div>' +
      '<div style="font-size:0.86rem;color:var(--text-muted)">' + (isAr() ? 'اكتمل مختبر فريق الرياضيات والعلوم — مدرسة بوابة المعرفة العالمية' : 'Edugates Math-Science Team Workbench Completed') + '</div>' +
      '<div class="sb-victory-stats">' +
        '<div class="sb-vstat"><div class="sb-vstat-label">' + (isAr() ? '⏱️ زمن الحل' : '⏱️ Solve Time') + '</div><div class="sb-vstat-val">' + formatTime(timerSeconds) + recBadge + '</div></div>' +
        '<div class="sb-vstat"><div class="sb-vstat-label">' + (isAr() ? '🎯 إجمالي الحركات' : '🎯 Total Moves') + '</div><div class="sb-vstat-val">' + moveCount + '</div></div>' +
        '<div class="sb-vstat"><div class="sb-vstat-label">' + (isAr() ? '🏆 أفضل زمن' : '🏆 Class Best') + '</div><div class="sb-vstat-val">' + formatTime(res.bestTime) + '</div></div>' +
      '</div>' +
      '<div class="sb-victory-actions">' +
        '<button type="button" class="eis-btn eis-btn-gold" onclick="document.getElementById(\'new\').click()">' + (isAr() ? '🆕 اللغز التالي ←' : '🆕 Next Puzzle →') + '</button>' +
        '<button type="button" id="sb-victory-award-btn" class="eis-btn eis-btn-green" onclick="awardVictoryPointsToActiveTeam(this)">' + (isAr() ? ('🏅 +10 نقاط لفريق ' + dispTeam) : ('🏅 +10 Pts to ' + dispTeam)) + '</button>' +
        '<button type="button" class="eis-btn" onclick="document.getElementById(\'sb-victory-banner\').classList.remove(\'visible\')">' + (isAr() ? '🔍 فحص اللوحة' : '🔍 Inspect Board') + '</button>' +
      '</div>';
  }

  window.__edugatesOnStatus = function (txt) {
    var banner = document.getElementById("sb-victory-banner");
    if (!banner) return;
    if (txt && txt.indexOf("COMPLETED") !== -1 && txt.indexOf("Auto-solved") === -1 && !wasAutoSolved) {
      if (!timerSolved) {
        timerSolved = true;
        var puzzleId = getCurrentPuzzleId();
        var res = recordPuzzleCompletion(puzzleId, timerSeconds, moveCount);
        lastVictoryResult = res;
        updateBestTimeBadge();
        playSound("victory");
        triggerVictoryCelebration();
        renderVictoryBannerContent(res);
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
    annotCanvas.style.width = w + "px";
    annotCanvas.style.height = h + "px";
    annotCanvas.style.top = (pCanvas.offsetTop || 16) + "px";
    annotCanvas.style.left = (pCanvas.offsetLeft || 16) + "px";
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
    if (btn) {
      if (document.body.classList.contains("puzzle-page")) {
        btn.textContent = next === "day" ? "🌙" : "☀️";
        btn.title = next === "day"
          ? (isAr() ? "تفعيل الوضع الداكن" : "Dark Board Theme")
          : (isAr() ? "تفعيل الوضع الفاتح" : "Light Board Theme");
      } else {
        btn.textContent = next === "day"
          ? (isAr() ? "🌙 الوضع الداكن" : "🌙 Dark Board")
          : (isAr() ? "☀️ الوضع الفاتح" : "☀️ Light Board");
      }
    }
  };

  window.toggleLowCpuTurbo = function () {
    window.__EDUGATES_PERF_LITE__ = !window.__EDUGATES_PERF_LITE__;
    window.__EDUGATES_DPR__ = window.__EDUGATES_PERF_LITE__ ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    localStorage.setItem("edugates_math_lowcpu", window.__EDUGATES_PERF_LITE__ ? "true" : "false");
    playSound("mode");
    var btn = document.getElementById("eis-turbo-btn");
    if (btn) {
      btn.textContent = window.__EDUGATES_PERF_LITE__
        ? (isAr() ? "⚡ معالج خفيف: مفعل" : "⚡ Low-CPU: ON")
        : (isAr() ? "🖥️ وضع الدقة العالية" : "🖥️ HD Mode");
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
  var LAB_GROUPS_DATA = [
    { labelEn: "★ Featured Classics", labelAr: "★ الكلاسيكيات المميزة", items: ["bridges","towers","lightup","slant","net","loopy"] },
    { labelEn: "🕸️ Graph Theory", labelAr: "🕸️ نظرية البيانات", items: ["untangle","map","pearl","tracks","signpost","netslide"] },
    { labelEn: "🔢 Algebra & Squares", labelAr: "🔢 الجبر والمربعات اللاتينية", items: ["solo","keen","unequal","group","singles"] },
    { labelEn: "🔬 Physics & Optics", labelAr: "🔬 الفيزياء والبصريات", items: ["blackbox","undead","magnets","inertia","cube","galaxies"] },
    { labelEn: "🧮 Combinatorics", labelAr: "🧮 التوافقيات", items: ["pattern","mines","dominosa","rect","palisade","filling","range","tents","mosaic","unruly"] },
    { labelEn: "🎯 Algorithmic", labelAr: "🎯 الخوارزميات", items: ["flip","guess","flood","fifteen","sixteen","twiddle","pegs","samegame"] }
  ];

  function populateQuickLabSwitcher(selectEl, puzzleId) {
    if (!selectEl) return;
    selectEl.innerHTML = "";
    selectEl.title = isAr()
      ? "الانتقال السريع إلى أي من مختبرات الرياضيات والعلوم (41 مختبراً)"
      : "Quick-Switch to Any of the 41 Math-Science Workbenches";
    for (var gIdx = 0; gIdx < LAB_GROUPS_DATA.length; gIdx++) {
      var grp = document.createElement("optgroup");
      grp.label = isAr() ? LAB_GROUPS_DATA[gIdx].labelAr : LAB_GROUPS_DATA[gIdx].labelEn;
      var gItems = LAB_GROUPS_DATA[gIdx].items;
      for (var mIdx = 0; mIdx < gItems.length; mIdx++) {
        var id = gItems[mIdx];
        var pInfo = PUZZLE_I18N[id] || {};
        var opt = document.createElement("option");
        opt.value = (id === "loopy") ? "slither.html" : (id + ".html");
        opt.textContent = isAr() ? (pInfo.titleAr || id) : (pInfo.titleEn || id);
        if (id === puzzleId) opt.selected = true;
        grp.appendChild(opt);
      }
      selectEl.appendChild(grp);
    }
  }

  function ensureLangToggleBtn() {
    var topActions = document.querySelector(".eis-topbar-actions");
    if (topActions && !document.getElementById("eis-lang-btn")) {
      var langBtn = document.createElement("button");
      langBtn.type = "button";
      langBtn.id = "eis-lang-btn";
      langBtn.className = "eis-btn eis-btn-lang";
      langBtn.textContent = isAr() ? "🌐 English" : "🌐 العربية";
      langBtn.title = "Switch Language (العربية / English)";
      langBtn.onclick = window.toggleEdugatesLang;
      topActions.insertBefore(langBtn, topActions.firstChild);
    }
  }

  function upgradePuzzleWorkspaceUI() {
    var puzzleId = getCurrentPuzzleId();
    if (!puzzleId) return;

    if (currentDockSide === "left") {
      document.body.classList.add("dock-left");
    }

    // 1. Add Sound Button, Language Button, Quick Lab Switcher & Best Time Pill to Topbar
    var topbar = document.querySelector(".eis-topbar");
    var homeLink = topbar ? topbar.querySelector("a[href='index.html'].eis-btn") : null;
    if (homeLink) {
      homeLink.textContent = isAr() ? "🏠 الرئيسية" : "🏠 Hub";
      homeLink.title = isAr() ? "العودة إلى جميع الألغاز (41 مختبراً)" : "Back to All Puzzles";
    }
    var penToggleBtn = document.getElementById("sb-pen-toggle");
    if (penToggleBtn) {
      penToggleBtn.textContent = isAr() ? "✏️ قلم" : "✏️ Pen";
    }
    if (homeLink && homeLink.parentNode && !document.getElementById("sb-quick-lab-select")) {
      var labSelect = document.createElement("select");
      labSelect.id = "sb-quick-lab-select";
      labSelect.className = "sb-quick-lab-select";
      populateQuickLabSwitcher(labSelect, puzzleId);
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
      soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
      soundBtn.title = soundEnabled ? (isAr() ? "كتم الصوت" : "Mute Sound") : (isAr() ? "تشغيل الصوت" : "Enable Sound");
      soundBtn.onclick = window.toggleEdugatesSound;
      topActions.insertBefore(soundBtn, topActions.firstChild);
    }
    ensureLangToggleBtn();

    var timerPill = document.querySelector(".sb-timer-pill");
    var hudContainer = timerPill ? timerPill.parentNode : null;
    if (hudContainer) {
      hudContainer.className = "sb-hud-bar";
      hudContainer.removeAttribute("style");

      var movesDisplay = document.getElementById("sb-moves-display");
      if (!movesDisplay) {
        var movesPill = document.createElement("div");
        movesPill.className = "sb-moves-pill";
        movesPill.innerHTML = '<span id="sb-moves-label">🎯</span> <span id="sb-moves-display">0</span>';
        hudContainer.appendChild(movesPill);
      } else {
        var movesLabel = document.getElementById("sb-moves-label");
        if (movesLabel) movesLabel.textContent = "🎯";
        var firstSpan = movesDisplay.previousElementSibling;
        if (firstSpan && firstSpan.id !== "sb-moves-display") firstSpan.textContent = "🎯";
      }

      var bestDisplay = document.getElementById("sb-best-display");
      if (!bestDisplay) {
        var bestPill = document.createElement("div");
        bestPill.className = "sb-best-pill";
        bestPill.title = "Personal / Class Best Solve Time";
        bestPill.innerHTML = '<span id="sb-best-label">🏆</span> <span id="sb-best-display">—</span>';
        hudContainer.appendChild(bestPill);
      } else {
        var bestLabel = document.getElementById("sb-best-label");
        if (bestLabel) bestLabel.textContent = "🏆";
        var bFirstSpan = bestDisplay.previousElementSibling;
        if (bFirstSpan && bFirstSpan.id !== "sb-best-display") bFirstSpan.textContent = "🏆";
      }
    }
    updateBestTimeBadge();

    // 2. Consolidate into a Single Ultra-Compact Command Topbar
    var actionBar = document.querySelector(".sb-actionbar");
    if (actionBar && topbar && !topbar.classList.contains("sb-unified-topbar")) {
      topbar.classList.add("sb-unified-topbar");

      // Left cluster
      var leftNav = topbar.firstElementChild;
      if (leftNav) {
        leftNav.classList.add("sb-header-cluster", "sb-cluster-nav");
      }

      // Middle cluster for game action buttons + preset + HUD
      var centerCluster = document.createElement("div");
      centerCluster.className = "sb-header-cluster sb-cluster-actions";

      // Move Primary Action Buttons (#new, #restart, #undo, #redo, #solve)
      var primaryGroup = actionBar.querySelector(".sb-action-group:first-child");
      if (primaryGroup) {
        primaryGroup.className = "sb-btn-group";
        var newB = primaryGroup.querySelector("#new");
        if (newB) {
          newB.textContent = isAr() ? "🆕 جديد" : "🆕 New";
          newB.title = isAr() ? "لعبة جديدة" : "New Game";
        }
        centerCluster.appendChild(primaryGroup);
      }

      // Move Preset Dropdown
      var presetSelect = document.getElementById("sb-preset-select");
      if (presetSelect) {
        var presetWrap = document.createElement("div");
        presetWrap.className = "sb-preset-wrap";
        presetWrap.appendChild(presetSelect);
        centerCluster.appendChild(presetWrap);
      }

      // Move HUD Bar (Timer + Moves + Best)
      if (hudContainer) {
        centerCluster.appendChild(hudContainer);
      }

      // Insert Center Cluster after Left Nav Group
      if (leftNav) {
        topbar.insertBefore(centerCluster, leftNav.nextSibling);
      } else {
        topbar.appendChild(centerCluster);
      }

      // Right Cluster: Tools & Toggles
      if (topActions) {
        topActions.classList.add("sb-header-cluster", "sb-cluster-tools");

        // Add Fit button to topActions if not already present
        if (!document.getElementById("sb-fit-btn")) {
          var fitBtn = document.createElement("button");
          fitBtn.type = "button";
          fitBtn.id = "sb-fit-btn";
          fitBtn.className = "eis-btn eis-btn-compact";
          fitBtn.textContent = isAr() ? "🎯 ملائمة" : "🎯 Fit";
          fitBtn.title = "Auto-Fit Board to Screen";
          fitBtn.onclick = function () { window.zoomBoard(0); };
          topActions.insertBefore(fitBtn, penToggleBtn || topActions.firstChild);
        }

        var themeBtn = document.getElementById("eis-theme-btn");
        if (themeBtn) {
          var isDay = document.documentElement.getAttribute("data-theme") === "day";
          themeBtn.textContent = isDay ? "🌙" : "☀️";
          themeBtn.title = isDay
            ? (isAr() ? "تفعيل الوضع الداكن" : "Dark Board Theme")
            : (isAr() ? "تفعيل الوضع الفاتح" : "Light Board Theme");
        }

        var fsBtn = topActions.querySelector("button[onclick*='toggleSmartboardFullscreen']");
        if (fsBtn) {
          fsBtn.textContent = "⛶";
          fsBtn.title = isAr() ? "ملء الشاشة للسبورة الذكية" : "Toggle Fullscreen";
        }
      }

      // Build 🛠️ More Tools Popover for Secondary Controls
      var moreWrap = document.getElementById("sb-more-wrap");
      if (!moreWrap && topActions) {
        moreWrap = document.createElement("div");
        moreWrap.id = "sb-more-wrap";
        moreWrap.className = "sb-more-wrap";

        var moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.id = "sb-more-btn";
        moreBtn.className = "eis-btn eis-btn-compact";
        moreBtn.textContent = isAr() ? "🛠️ أدوات" : "🛠️ Tools";
        moreBtn.title = "Game ID, Seed, Save/Load, Board Styles & Teams";

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

        // 1. Board Palette Switcher inside popover
        var palHeader = document.createElement("div");
        palHeader.className = "sb-popover-section-title";
        palHeader.textContent = isAr() ? "مظهر اللوحة:" : "Board Style:";
        popover.appendChild(palHeader);

        var palBar = document.createElement("div");
        palBar.id = "sb-palette-bar";
        palBar.className = "sb-palette-bar";
        var styles = [
          { id: "studio", label: isAr() ? "🎨 استوديو" : "🎨 Studio" },
          { id: "parchment", label: isAr() ? "📜 ورق" : "📜 Paper" },
          { id: "blueprint", label: isAr() ? "📐 مخطط" : "📐 Blueprint" }
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
        popover.appendChild(palBar);

        // 2. Team Scoreboard Toggle & Dock Swap Button inside popover
        var toolsRow = document.createElement("div");
        toolsRow.style.display = "flex";
        toolsRow.style.gap = "6px";
        toolsRow.style.margin = "8px 0";

        var teamToggle = document.createElement("button");
        teamToggle.type = "button";
        teamToggle.id = "sb-team-toggle-btn";
        teamToggle.className = "eis-btn" + (teamsState.open ? " is-active" : "");
        teamToggle.textContent = isAr() ? "🏆 الفرق" : "🏆 Teams";
        teamToggle.title = "Toggle Classroom 4-Team Scoreboard";
        teamToggle.onclick = window.toggleClassroomTeamBar;
        toolsRow.appendChild(teamToggle);

        var dockSwap = document.createElement("button");
        dockSwap.type = "button";
        dockSwap.id = "sb-dock-swap-btn";
        dockSwap.className = "eis-btn";
        dockSwap.textContent = currentDockSide === "left"
          ? (isAr() ? "➡️ اللوحة يميناً" : "➡️ Dock Right")
          : (isAr() ? "⬅️ اللوحة يساراً" : "⬅️ Dock Left");
        dockSwap.title = "Move Control Dock to Left or Right Side of Smartboard";
        dockSwap.onclick = window.toggleDockSide;
        toolsRow.appendChild(dockSwap);

        popover.appendChild(toolsRow);

        // 3. Move secondary buttons + Manual link into popover
        var manualLink = topActions.querySelector("a[href^='doc/']");
        if (manualLink) {
          manualLink.id = "sb-manual-popover-link";
          manualLink.textContent = isAr() ? "📖 دليل اللغز الكامل" : "📖 Full Puzzle Manual";
          popover.appendChild(manualLink);
        }

        var secondaryIds = ["specific", "random", "prefs", "save", "load", "eis-turbo-btn"];
        var labelsMapEn = {
          specific: "🎯 Enter Game ID",
          random: "🎲 Enter Random Seed",
          prefs: "⚙️ Puzzle Preferences",
          save: "💾 Download Save File",
          load: "📂 Upload Save File"
        };
        var labelsMapAr = {
          specific: "🎯 إدخال رقم اللغز (ID)",
          random: "🎲 إدخال بذرة عشوائية (Seed)",
          prefs: "⚙️ إعدادات اللغز",
          save: "💾 حفظ التقدم في ملف",
          load: "📂 تحميل ملف محفوظ"
        };
        for (var k = 0; k < secondaryIds.length; k++) {
          var secEl = document.getElementById(secondaryIds[k]);
          if (secEl) {
            var mapToUse = isAr() ? labelsMapAr : labelsMapEn;
            if (mapToUse[secondaryIds[k]]) secEl.textContent = mapToUse[secondaryIds[k]];
            popover.appendChild(secEl);
          }
        }

        moreWrap.appendChild(moreBtn);
        moreWrap.appendChild(popover);
        topActions.insertBefore(moreWrap, topActions.lastElementChild || null);
      }

      // 4. Safe Solve Confirmation Guard attached to document body
      var solveBtn = document.getElementById("solve");
      if (solveBtn && !document.getElementById("sb-solve-confirm")) {
        var confirmBox = document.createElement("div");
        confirmBox.id = "sb-solve-confirm";
        confirmBox.className = "sb-solve-confirm";
        confirmBox.innerHTML =
          '<span id="sb-confirm-solve-msg" style="font-size:0.86rem;font-weight:800;color:var(--brand-gold)">' +
            (isAr() ? '💡 إظهار الحل الكامل؟ (الحل التلقائي لا يمنح نجوم إتقان)' : '💡 Reveal full solution? (Assisted solves do not award stars)') +
          '</span>' +
          '<button type="button" id="sb-confirm-solve-yes" class="eis-btn eis-btn-gold" style="padding:5px 12px;min-height:32px">' +
            (isAr() ? '✅ إظهار الحل' : '✅ Reveal Solution') +
          '</button>' +
          '<button type="button" id="sb-confirm-solve-no" class="eis-btn" style="padding:5px 12px;min-height:32px">' +
            (isAr() ? 'إلغاء' : 'Cancel') +
          '</button>';
        document.body.appendChild(confirmBox);

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

      // 5. Hide old secondary actionbar completely
      actionBar.style.display = "none";
    }

    // 4. Inject Classroom Team Scoreboard Strip right after .sb-actionbar
    if (actionBar && !document.getElementById("sb-team-bar")) {
      var teamBar = document.createElement("div");
      teamBar.id = "sb-team-bar";
      teamBar.className = "sb-team-bar" + (teamsState.open ? " visible" : "");
      teamBar.innerHTML =
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<span id="sb-team-bar-title" style="font-size:0.78rem;font-weight:900;text-transform:uppercase;color:var(--brand-gold)">' +
            (isAr() ? '🏆 فرق الفصل:' : '🏆 Classroom Teams:') +
          '</span>' +
        '</div>' +
        '<div id="sb-teams-list" class="sb-teams-list"></div>' +
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
          '<select id="sb-blitz-select" class="sb-select" style="min-height:30px;padding:3px 8px;font-size:0.78rem" onchange="setBlitzTimerMode(this.value)" title="Stopwatch or Blitz Countdown">' +
            '<option value="0">' + (isAr() ? '⏱️ ساعة إيقاف' : '⏱️ Stopwatch') + '</option>' +
            '<option value="60">' + (isAr() ? '⏳ تحدي 1 د' : '⏳ 1m Blitz') + '</option>' +
            '<option value="120">' + (isAr() ? '⏳ تحدي 2 د' : '⏳ 2m Blitz') + '</option>' +
            '<option value="180">' + (isAr() ? '⏳ تحدي 3 د' : '⏳ 3m Blitz') + '</option>' +
            '<option value="300">' + (isAr() ? '⏳ تحدي 5 د' : '⏳ 5m Blitz') + '</option>' +
          '</select>' +
          '<button type="button" id="sb-team-reset-btn" class="eis-btn" style="min-height:30px;padding:3px 9px;font-size:0.76rem" onclick="resetClassroomTeamScores()">' +
            (isAr() ? '🔄 تصفير النقاط' : '🔄 Reset Pts') +
          '</button>' +
        '</div>';
      actionBar.parentNode.insertBefore(teamBar, actionBar.nextSibling);
      renderTeamBar();
    }

    // 5. Inject Ergonomic Bottom Quick-Action Bar under the Canvas
    var boardStage = document.querySelector(".sb-board-stage");
    if (boardStage && !document.getElementById("sb-bottom-quickbar")) {
      var prof = PUZZLE_PROFILES[puzzleId] || { left: "Primary", right: "Secondary", middle: "Aux" };
      var pI18n = PUZZLE_I18N[puzzleId] || {};
      var quickBar = document.createElement("div");
      quickBar.id = "sb-bottom-quickbar";
      quickBar.className = "sb-bottom-quickbar";
      quickBar.innerHTML =
        '<div class="sb-quickbar-group">' +
          '<span id="sb-quickreach-label" style="font-size:0.74rem;font-weight:800;color:var(--text-muted);text-transform:uppercase">' +
            (isAr() ? '👇 وصول سريع:' : '👇 Quick Reach:') +
          '</span>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn active" data-mode="0" onclick="setClickMode(0)">👆 ' + (isAr() ? (pI18n.leftAr || prof.left) : prof.left) + '</button>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn" data-mode="2" onclick="setClickMode(2)">🚩 ' + (isAr() ? (pI18n.rightAr || prof.right) : prof.right) + '</button>' +
          '<button type="button" class="sb-quick-pill sb-quick-mode-btn" data-mode="1" onclick="setClickMode(1)">🔒 ' + (isAr() ? (pI18n.middleAr || prof.middle) : prof.middle) + '</button>' +
        '</div>' +
        '<div class="sb-quickbar-group">' +
          '<button type="button" id="sb-qb-undo" class="sb-quick-pill" onclick="document.getElementById(\'undo\').click()">' + (isAr() ? '↩️ تراجع' : '↩️ Undo') + '</button>' +
          '<button type="button" id="sb-qb-redo" class="sb-quick-pill" onclick="document.getElementById(\'redo\').click()">' + (isAr() ? '↪️ إعادة' : '↪️ Redo') + '</button>' +
          '<button type="button" id="sb-qb-new" class="sb-quick-pill" onclick="document.getElementById(\'new\').click()">' + (isAr() ? '🆕 جديد' : '🆕 New') + '</button>' +
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
        if (indicator) {
          indicator.textContent = shouldOpen
            ? (isAr() ? "▼ إخفاء" : "▼ Hide")
            : (isAr() ? "▶ إظهار الأسهم" : "▶ Show 8-Way Pad");
        }
        dpadTitle.onclick = function () {
          var isExp = dpadCard.classList.toggle("expanded");
          if (indicator) {
            indicator.textContent = isExp
              ? (isAr() ? "▼ إخفاء" : "▼ Hide")
              : (isAr() ? "▶ إظهار الأسهم" : "▶ Show 8-Way Pad");
          }
          playSound("mode");
        };
      }
    }

    // Enhance Rules Card with 3-Bullet Quick-Start Summary
    var rulesBox = document.querySelector(".sb-rules-box");
    if (rulesBox) {
      if (!rulesBox.hasAttribute("data-orig-en")) {
        rulesBox.setAttribute("data-orig-en", rulesBox.innerHTML);
      }
      if (!document.getElementById("sb-quickstart-list")) {
        var qsDiv = document.createElement("div");
        qsDiv.id = "sb-quickstart-list";
        qsDiv.className = "sb-quickstart-list";
        rulesBox.parentNode.insertBefore(qsDiv, rulesBox);
      }
    }
  }

  var KEY_AR_MAP = {
    "📏 Grid (G)": "📏 الشبكة (G)",
    "🔒 Lock (L)": "🔒 قفل (L)",
    "✏️ Pencil (M)": "✏️ ملاحظات (M)",
    "⌫ Clear": "⌫ مسح",
    "⌫ Erase": "⌫ مسح",
    "💡 Place Bulb": "💡 وضع مصباح",
    "⚫ Mark Dot": "⚫ وضع نقطة",
    "╱ Slant (/)": "╱ قطر (/)",
    "╲ Slant (\\)": "╲ قطر (\\)",
    "↺ CCW (A)": "↺ يسار (A)",
    "↻ CW (D)": "↻ يمين (D)",
    "🔒 Lock (S)": "🔒 قفل (S)",
    "🔀 Jumble (J)": "🔀 خلط (J)",
    "🎯 Center (C)": "🎯 توسيط (C)",
    "➰ Toggle Edge": "➰ تبديل الضلع",
    "✖️ Mark X": "✖️ علامة X",
    "⬛ Fill Black": "⬛ تظليل أسود",
    "⬜ Mark White": "⬜ علامة أبيض",
    "👻 Ghost (G)": "👻 شبح (G)",
    "🧛 Vampire (V)": "🧛 مصاص دماء (V)",
    "🧟 Zombie (Z)": "🧟 زومبي (Z)",
    "⛏️ Uncover": "⛏️ كشف",
    "🚩 Flag Mine": "🚩 علم لغم",
    "⛺ Place Tent": "⛺ نصب خيمة",
    "🌿 Mark Grass": "🌿 عشب فارغ",
    "⬛ Fill": "⬛ تظليل",
    "⬜ Empty": "⬜ فارغ",
    "⬛ Black": "⬛ أسود",
    "⬜ White": "⬜ أبيض",
    "⬛ Black Out": "⬛ تظليل",
    "⭕ Circle": "⭕ دائرة",
    "⬅️ Left (H)": "⬅️ يسار (H)",
    "⬆️ Top (K)": "⬆️ أعلى (K)",
    "⬇️ Bottom (J)": "⬇️ أسفل (J)",
    "➡️ Right (L)": "➡️ يمين (L)",
    "➕ [+ −]": "➕ [+ −]",
    "✖️ Neutral": "✖️ محايد",
    "🔴 Action": "🔴 إجراء",
    "🏁 Reveal / Check": "🏁 كشف / تحقق",
    "🏷️ Labels (L)": "🏷️ أرقام (L)",
    "🎨 Colors (C)": "🎨 ألوان (C)",
    "✅ Submit Guess": "✅ إرسال التخمين",
    "⌫ Unlink Square": "⌫ فك الربط",
    "🌌 Toggle Edge": "🌌 تبديل الحد",
    "⌫ Remove Arrow": "⌫ إزالة السهم",
    "💡 Flip Selected": "💡 قلب المحدد",
    "🧱 Select / Clear": "🧱 تحديد / حذف"
  };

  function buildSmartboardControls() {
    var puzzleId = getCurrentPuzzleId();
    if (!puzzleId) return;
    var prof = PUZZLE_PROFILES[puzzleId] || { left: "Primary Action", right: "Secondary / Mark", middle: "Aux Action", keys: [] };
    var pI18n = PUZZLE_I18N[puzzleId] || {};

    var leftHint = document.getElementById("sb-left-hint");
    var rightHint = document.getElementById("sb-right-hint");
    if (leftHint) leftHint.textContent = isAr() ? (pI18n.leftAr || prof.left) : prof.left;
    if (rightHint) rightHint.textContent = isAr() ? (pI18n.rightAr || prof.right) : prof.right;

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
          var rawLabel = typeof item === "string" ? item.toUpperCase() : item.label;
          var kLabel = (isAr() && KEY_AR_MAP[rawLabel]) ? KEY_AR_MAP[rawLabel] : rawLabel;
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
    if (newBtn && !newBtn.hasAttribute("data-sb-bound")) {
      newBtn.setAttribute("data-sb-bound", "true");
      newBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
        playSound("mode");
      });
    }
    if (restartBtn && !restartBtn.hasAttribute("data-sb-bound")) {
      restartBtn.setAttribute("data-sb-bound", "true");
      restartBtn.addEventListener("click", function () {
        resetTimer();
        window.clearBoardPen();
        playSound("undo");
      });
    }
    if (undoBtn && !undoBtn.hasAttribute("data-sb-bound")) {
      undoBtn.setAttribute("data-sb-bound", "true");
      undoBtn.addEventListener("click", function () {
        playSound("undo");
      });
    }
  }

  // ==========================================================================
  // 11. PORTAL HUB (index.html) GAMIFICATION & DISCOVERY INITIALIZER
  // ==========================================================================
  function initHubPortalEnhancements() {
    ensureLangToggleBtn();
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
    if (solvedEl) {
      solvedEl.textContent = isAr()
        ? ("✅ " + summary.solvedPuzzlesCount + " / 41 مختبر")
        : ("✅ " + summary.solvedPuzzlesCount + " / 41 Labs");
    }
    if (streakEl) {
      streakEl.textContent = isAr()
        ? ("🔥 " + summary.streak + (summary.streak === 1 ? " يوم" : " أيام"))
        : ("🔥 " + summary.streak + (summary.streak === 1 ? " Day" : " Days"));
    }

    var statBoxes = document.querySelectorAll(".hub-mastery-strip .hub-stat-box");
    for (var sbIdx = 0; sbIdx < statBoxes.length; sbIdx++) {
      statBoxes[sbIdx].title = isAr()
        ? "انقر لفتح غرفة الكؤوس وترتيب فرق الفصل"
        : "Tap to Open Classroom Trophy Room & Team Standings";
      statBoxes[sbIdx].onclick = window.openTrophyRoomModal;
    }

    if (window.location.search.indexOf("trophy=1") !== -1 && !window.__trophyAutoOpened) {
      window.__trophyAutoOpened = true;
      setTimeout(function () { window.openTrophyRoomModal(); }, 120);
    }

    // Populate Daily STEM Olympiad Challenge Card if present
    var dailyContainer = document.getElementById("hub-daily-card");
    if (dailyContainer && daily) {
      var dailyTagText = isAr() ? "🏆 تحدي أولمبياد STEM اليومي" : "🏆 Daily STEM Olympiad Challenge";
      var completedText = isAr() ? "✅ مكتمل اليوم!" : "✅ Completed Today!";
      var btnDailyText = daily.completed
        ? (isAr() ? "🔄 العب مجدداً ←" : "🔄 Play Again →")
        : (isAr() ? "🚀 ابدأ تحدي اليوم ←" : "🚀 Launch Daily →");
      dailyContainer.innerHTML =
        '<div class="hub-daily-header">' +
          '<span class="hub-daily-tag">' + dailyTagText + '</span>' +
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
            (daily.completed ? completedText : '⚡ ' + daily.domain) +
          '</span>' +
          '<a href="' + daily.href + '" class="eis-btn eis-btn-gold" style="min-height:34px;padding:6px 14px">' +
            btnDailyText +
          '</a>' +
        '</div>';
    }

    // Enhance all 41 Puzzle Cards with Difficulty Tier, Stars, Best Time & Bilingual Text
    var cards = grid.querySelectorAll(".puzzle-card");
    var diffLabels = {
      starter: { textEn: "🟢 Starter", textAr: "🟢 مبتدئ", cls: "diff-starter" },
      intermediate: { textEn: "🟡 Intermediate", textAr: "🟡 متوسط", cls: "diff-intermediate" },
      olympiad: { textEn: "🔴 Olympiad", textAr: "🔴 أولمبياد", cls: "diff-olympiad" }
    };

    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var href = card.getAttribute("href") || "";
      var pId = href.replace(".html", "").toLowerCase();
      if (pId === "slither") pId = "loopy";

      var pDict = PUZZLE_I18N[pId];
      if (pDict && !card.hasAttribute("data-ar-indexed")) {
        card.setAttribute("data-ar-indexed", "true");
        var curSearch = card.getAttribute("data-search") || "";
        card.setAttribute("data-search", (curSearch + " " + pDict.titleAr + " " + pDict.domainAr + " " + pDict.descAr).toLowerCase());
      }

      var diffKey = PUZZLE_DIFFICULTY[pId] || "intermediate";
      card.setAttribute("data-diff", diffKey);

      var pRec = mastery.puzzles[pId];
      var isSolved = !!(pRec && pRec.solvedCount > 0);
      card.setAttribute("data-solved", isSolved ? "true" : "false");
      card.classList.toggle("is-solved", isSolved);

      var metaRow = card.querySelector(".puzzle-card-meta");
      if (!metaRow) {
        metaRow = document.createElement("div");
        metaRow.className = "puzzle-card-meta";
        var footer = card.querySelector(".puzzle-card-footer");
        if (footer) {
          card.insertBefore(metaRow, footer);
        } else {
          card.appendChild(metaRow);
        }
      }

      var dInfo = diffLabels[diffKey] || diffLabels.intermediate;
      var starCount = (pRec && pRec.stars) || 0;
      var starStr = "";
      for (var s = 0; s < 3; s++) starStr += (s < starCount ? "★" : "☆");

      var timeLabel = isSolved && pRec.bestTime !== null
        ? ((isAr() ? "⏱️ الأفضل " : "⏱️ Best ") + formatTime(pRec.bestTime))
        : (isAr() ? "⏱️ لم يُلعب" : "⏱️ Unplayed");

      metaRow.innerHTML =
        '<span class="diff-badge ' + dInfo.cls + '">' + (isAr() ? dInfo.textAr : dInfo.textEn) + '</span>' +
        '<span class="card-stars" title="Mastery Stars">' + starStr + '</span>' +
        '<span class="card-best-time">' + timeLabel + '</span>';

      // Translate Card Title, Description, Domain & CTA
      if (pDict) {
        var titleEl = card.querySelector(".puzzle-card-title");
        var descEl = card.querySelector(".puzzle-card-desc");
        var domEl = card.querySelector(".math-domain-tag");
        var ctaEl = card.querySelector(".play-now-badge");
        var isFeat = card.getAttribute("data-featured") === "true";

        if (titleEl) {
          var featBadge = isFeat
            ? (' <span class="eis-team-badge" style="font-size:0.65rem">' + (isAr() ? '★ مميز' : '★ Featured') + '</span>')
            : '';
          titleEl.innerHTML = (isAr() ? pDict.titleAr : pDict.titleEn) + featBadge;
        }
        if (descEl) descEl.innerHTML = isAr() ? pDict.descAr : pDict.descEn;
        if (domEl) domEl.innerHTML = isAr() ? pDict.domainAr : pDict.domainEn;
        if (ctaEl) ctaEl.textContent = isAr() ? "ابدأ المختبر ←" : "Launch Lab →";
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

    playSound("start");
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
      {
        icon: "🌟",
        title: isAr() ? 'البديهية الأولى · <span class="badge-math" dir="ltr">$A_0$</span>' : 'First Axiom · <span class="badge-math" dir="ltr">$A_0$</span>',
        desc: isAr() ? "أكمل أول مختبر ألغاز لفريق الرياضيات والعلوم." : "Complete your first Math-Science puzzle workbench.",
        unlocked: summary.solvedPuzzlesCount >= 1
      },
      {
        icon: "⚡",
        title: isAr() ? 'تكتيكي السرعة · <span class="badge-math" dir="ltr">$t < 60\\text{s}$</span>' : 'Speed Tactician · <span class="badge-math" dir="ltr">$t < 60\\text{s}$</span>',
        desc: isAr() ? "حل أي مختبر في زمن $t < 60$ ثانية." : "Solve any workbench in under 60 seconds.",
        unlocked: hasFastSolve
      },
      {
        icon: "🌉",
        title: isAr() ? 'عالم نظرية البيانات · <span class="badge-math" dir="ltr">$G=(V,E)$</span>' : 'Graph Theorist · <span class="badge-math" dir="ltr">$G=(V,E)$</span>',
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في نظرية البيانات والاتصال المستوي." : "Master 3+ Graph Theory & Topology workbenches.",
        unlocked: countSolvedInList(["bridges","slant","net","loopy","untangle","map","pearl","tracks","signpost","netslide"]) >= 3
      },
      {
        icon: "🔢",
        title: isAr() ? 'بارع الجبر والمربعات · <span class="badge-math" dir="ltr">$L \\in S_N$</span>' : 'Algebra Virtuoso · <span class="badge-math" dir="ltr">$L \\in S_N$</span>',
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في المربعات اللاتينية وبديهيات الزمر." : "Master 3+ Latin Squares & Abstract Algebra labs.",
        unlocked: countSolvedInList(["towers","solo","keen","unequal","group","singles"]) >= 3
      },
      {
        icon: "🔬",
        title: isAr() ? 'فيزيائي البصريات والكم · <span class="badge-math" dir="ltr">$\\mathbf{R}^3, \\vec{v}$</span>' : 'Quantum Physicist · <span class="badge-math" dir="ltr">$\\mathbf{R}^3, \\vec{v}$</span>',
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في البصريات والقطبية والهندسة الفراغية." : "Master 3+ Ray Optics, Polarity & 3D Geometry labs.",
        unlocked: countSolvedInList(["lightup","blackbox","undead","magnets","inertia","cube","galaxies"]) >= 3
      },
      {
        icon: "🧮",
        title: isAr() ? 'خبير التوافقيات · <span class="badge-math" dir="ltr">$C(N, k)$</span>' : 'Combinatorialist · <span class="badge-math" dir="ltr">$C(N, k)$</span>',
        desc: isAr() ? "أتقن 5 مختبرات أو أكثر في التوافقيات والاستنتاج الشبكي." : "Master 5+ Combinatorics & Grid Deduction labs.",
        unlocked: countSolvedInList(["pattern","mines","dominosa","rect","palisade","filling","range","tents","mosaic","unruly"]) >= 5
      },
      {
        icon: "📅",
        title: isAr() ? "بطل التحدي اليومي" : "Daily Olympian",
        desc: isAr() ? "أكمل تحدي أولمبياد STEM اليومي." : "Complete a Daily STEM Olympiad Challenge.",
        unlocked: dailyDates.length >= 1
      },
      {
        icon: "👑",
        title: isAr() ? 'أستاذ الأولمبياد الأعظم · <span class="badge-math" dir="ltr">$\\ge 30★$</span>' : 'Olympiad Grandmaster · <span class="badge-math" dir="ltr">$\\ge 30★$</span>', 
        desc: isAr() ? "اجمع 30 نجمة إتقان أو أكثر عبر المختبرات." : "Earn 30+ total Mastery Stars across the lab.",
        unlocked: summary.totalStars >= 30
      }
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
      var dispName = getTeamDisplayName(t);
      teamsHtml +=
        '<div class="sb-team-chip' + (teamsState.activeIdx === tIdx ? ' active-turn' : '') + '" style="flex:1;min-width:165px;justify-content:space-between" onclick="window.__selectModalTeam(' + tIdx + ')">' +
          '<div style="display:flex;align-items:center;gap:6px">' +
            '<span class="sb-team-dot" style="background:' + t.color + '"></span>' +
            '<span class="sb-team-name">' + dispName + '</span>' +
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
      var statusText = b.unlocked
        ? (isAr() ? '✅ مكتسب' : '✅ UNLOCKED')
        : (isAr() ? '🔒 مغلق' : '🔒 LOCKED');
      badgesHtml +=
        '<div class="eis-badge-card' + (b.unlocked ? ' unlocked' : '') + '">' +
          '<div class="eis-badge-icon"><span>' + b.icon + '</span><span style="font-size:0.72rem;font-weight:800;color:' + (b.unlocked ? 'var(--brand-green)' : 'var(--text-muted)') + '">' + statusText + '</span></div>' +
          '<div class="eis-badge-title">' + b.title + '</div>' +
          '<div class="eis-badge-desc">' + b.desc + '</div>' +
        '</div>';
    }

    backdrop.innerHTML =
      '<div class="eis-modal-card">' +
        '<div class="eis-modal-header">' +
          '<h2>' + (isAr() ? '🏆 فريق الرياضيات والعلوم — غرفة الكؤوس وترتيب الفرق' : '🏆 Edugates Math-Science Team — Trophy Room & House Standings') + '</h2>' +
          '<button type="button" class="eis-btn" onclick="document.getElementById(\'eis-trophy-modal\').classList.remove(\'open\')">' + (isAr() ? '✖ إغلاق' : '✖ Close') + '</button>' +
        '</div>' +
        '<div class="hub-mastery-strip" style="border-top:none;padding-top:0">' +
          '<div class="hub-stat-box"><span class="hub-stat-label">' + (isAr() ? 'الرتبة الحالية' : 'Current Rank') + '</span><span class="hub-stat-val gold">🏅 ' + summary.rankTitle + '</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">' + (isAr() ? 'نجوم الإتقان' : 'Mastery Stars') + '</span><span class="hub-stat-val gold">⭐ ' + summary.totalStars + ' / 123</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">' + (isAr() ? 'المختبرات المحلولة' : 'Labs Solved') + '</span><span class="hub-stat-val teal">✅ ' + summary.solvedPuzzlesCount + ' / 41</span></div>' +
          '<div class="hub-stat-box"><span class="hub-stat-label">' + (isAr() ? 'أوسمة الأولمبياد' : 'Olympiad Badges') + '</span><span class="hub-stat-val green">🎖️ ' + unlockedCount + ' / 8</span></div>' +
        '</div>' +
        '<div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
            '<span style="font-size:0.84rem;font-weight:900;text-transform:uppercase;color:var(--brand-teal)">' + (isAr() ? '🏅 ترتيب فرق الفصول الدراسية' : '🏅 Classroom House / Team Standings') + '</span>' +
            '<button type="button" class="eis-btn" style="min-height:28px;padding:3px 10px;font-size:0.75rem" onclick="resetClassroomTeamScores();openTrophyRoomModal()">' + (isAr() ? '🔄 تصفير نقاط الفرق' : '🔄 Reset Team Scores') + '</button>' +
          '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">' + teamsHtml + '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-size:0.84rem;font-weight:900;text-transform:uppercase;color:var(--brand-gold);margin-bottom:8px">' +
            (isAr()
              ? ('🎖️ أوسمة إنجازات أولمبياد STEM (' + unlockedCount + ' / 8 مكتسبة)')
              : ('🎖️ STEM Olympiad Achievement Badges (' + unlockedCount + ' / 8 Unlocked)')) +
          '</div>' +
          '<div class="eis-badges-grid">' + badgesHtml + '</div>' +
        '</div>' +
      '</div>';

    renderEdugatesMath(backdrop);
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
  // 11C. FULL BILINGUAL (ARABIC / ENGLISH) LOCALIZATION ENGINE
  // ==========================================================================
  function applyEdugatesLanguage() {
    document.documentElement.setAttribute("lang", currentLang);
    document.documentElement.setAttribute("dir", isAr() ? "rtl" : "ltr");
    window.__EDUGATES_LANG__ = currentLang;

    var puzzleId = getCurrentPuzzleId();
    var pDict = puzzleId ? (PUZZLE_I18N[puzzleId] || {}) : null;

    // 1. Topbar School & Team Branding
    var schoolNameEl = document.querySelector(".eis-school-name");
    if (schoolNameEl) {
      schoolNameEl.textContent = isAr() ? "مدرسة بوابة المعرفة العالمية" : "Edugates International School";
    }
    var teamNameEl = document.querySelector(".eis-team-name");
    if (teamNameEl) {
      var badgeEl = teamNameEl.querySelector(".eis-team-badge");
      var badgeText = "";
      if (pDict) {
        badgeText = isAr() ? pDict.domainAr : pDict.domainEn;
      } else {
        badgeText = isAr() ? "مختبر المنطق للسبورة الذكية" : "Smartboard Logic Lab";
      }
      teamNameEl.innerHTML =
        (isAr() ? "فريق الرياضيات والعلوم " : "Math-Science Team ") +
        '<span class="eis-team-badge">' + badgeText + '</span>';
    }

    // Topbar buttons
    ensureLangToggleBtn();
    var langBtn = document.getElementById("eis-lang-btn");
    if (langBtn) {
      langBtn.textContent = isAr() ? "🌐 English" : "🌐 العربية";
    }
    var trophyTopBtn = document.querySelector("button[onclick*='openTrophyRoomModal']");
    if (trophyTopBtn) {
      trophyTopBtn.textContent = isAr() ? "🏆 غرفة الكؤوس" : "🏆 Trophy Room";
    }
    var soundBtn = document.getElementById("eis-sound-btn");
    if (soundBtn) {
      if (document.body.classList.contains("puzzle-page")) {
        soundBtn.textContent = soundEnabled ? "🔊" : "🔇";
        soundBtn.title = soundEnabled ? (isAr() ? "كتم الصوت" : "Mute Sound") : (isAr() ? "تشغيل الصوت" : "Enable Sound");
      } else {
        soundBtn.textContent = soundEnabled ? (isAr() ? "🔊 الصوت" : "🔊 Sound") : (isAr() ? "🔇 صامت" : "🔇 Muted");
      }
    }
    var turboBtn = document.getElementById("eis-turbo-btn");
    if (turboBtn) {
      turboBtn.textContent = window.__EDUGATES_PERF_LITE__
        ? (isAr() ? "⚡ معالج خفيف: مفعل" : "⚡ Low-CPU: ON")
        : (isAr() ? "🖥️ وضع الدقة العالية" : "🖥️ HD Mode");
    }
    var themeBtn = document.getElementById("eis-theme-btn");
    if (themeBtn) {
      var isDay = document.documentElement.getAttribute("data-theme") === "day";
      if (document.body.classList.contains("puzzle-page")) {
        themeBtn.textContent = isDay ? "🌙" : "☀️";
        themeBtn.title = isDay
          ? (isAr() ? "تفعيل الوضع الداكن" : "Dark Board Theme")
          : (isAr() ? "تفعيل الوضع الفاتح" : "Light Board Theme");
      } else {
        themeBtn.textContent = isDay
          ? (isAr() ? "🌙 الوضع الداكن" : "🌙 Dark Board")
          : (isAr() ? "☀️ الوضع الفاتح" : "☀️ Light Board");
      }
    }
    var hubManualLink = document.querySelector(".eis-topbar-actions a[href='doc/index.html']");
    if (hubManualLink) {
      hubManualLink.textContent = isAr() ? "📖 الدليل" : "📖 Manual";
    }
    var fsBtn = document.querySelector("button[onclick*='toggleSmartboardFullscreen']");
    if (fsBtn) {
      if (document.body.classList.contains("puzzle-page")) {
        fsBtn.textContent = "⛶";
        fsBtn.title = isAr() ? "ملء الشاشة للسبورة الذكية" : "Toggle Fullscreen";
      } else {
        fsBtn.textContent = isAr() ? "⛶ ملء الشاشة" : "⛶ Fullscreen";
      }
    }

    // 2. Portal Hub (index.html) Localization
    var grid = document.getElementById("puzzleGrid");
    if (grid) {
      var goldPill = document.querySelector(".hub-hero-badges .hub-pill-gold");
      var tealPill = document.querySelector(".hub-hero-badges .hub-pill-teal");
      if (goldPill) {
        goldPill.textContent = isAr()
          ? "مدرسة بوابة المعرفة العالمية • فريق الرياضيات والعلوم"
          : "Edugates International School • Math-Science Team";
      }
      if (tealPill) {
        tealPill.textContent = isAr()
          ? "41 مختبراً تفاعلياً بـ WebAssembly • محرك 60 إطاراً/ث للسبورة الذكية"
          : "41 WebAssembly Workbenches • 60 FPS Smartboard Engine";
      }
      var heroH1 = document.querySelector(".hub-hero-banner h1");
      var heroP = document.querySelector(".hub-hero-banner p");
      if (heroH1) {
        heroH1.textContent = isAr()
          ? "مختبر المنطق والرياضيات المتقطعة للسبورة الذكية"
          : "Smartboard Logic & Discrete Mathematics Lab";
      }
      if (heroP) {
        heroP.textContent = isAr()
          ? "استكشف نظرية البيانات، والمربعات اللاتينية، والجبر المجرد، والبصريات الهندسية، والاستنتاج التوافقي — مصمم خصيصاً للتفاعل اللمسي الفوري والمنافسات الصفية على السبورات الذكية."
          : "Explore Graph Theory, Latin Squares, Abstract Algebra, Geometric Optics, and Combinatorial Deduction — engineered for zero-latency touch interaction and team competition on classroom Smartboards.";
      }

      var statLabels = document.querySelectorAll(".hub-mastery-strip .hub-stat-label");
      var statLabelsAr = ["رتبة الفريق", "نجوم الإتقان", "المختبرات المحلولة", "سلسلة الإنجاز"];
      var statLabelsEn = ["Team Rank", "Mastery Stars", "Workbenches Solved", "Active Streak"];
      for (var sl = 0; sl < statLabels.length && sl < 4; sl++) {
        statLabels[sl].textContent = isAr() ? statLabelsAr[sl] : statLabelsEn[sl];
      }

      // Category Tabs
      var tabMap = {
        all: { en: "🏛️ All Lab Puzzles (41)", ar: "🏛️ جميع المختبرات (41)" },
        featured: { en: "⭐ Featured Classics (6)", ar: "⭐ الكلاسيكيات المميزة (6)" },
        graph: { en: "🕸️ Graph Theory (10)", ar: "🕸️ نظرية البيانات (10)" },
        algebra: { en: "🔢 Algebra & Squares (6)", ar: "🔢 الجبر والمربعات (6)" },
        combinatorics: { en: "🧮 Combinatorics (11)", ar: "🧮 التوافقيات (11)" },
        physics: { en: "🔬 Physics & Optics (6)", ar: "🔬 الفيزياء والبصريات (6)" },
        algorithmic: { en: "🎯 Algorithmic (8)", ar: "🎯 الخوارزميات (8)" }
      };
      var tabs = document.querySelectorAll("#hubTabs .hub-tab");
      for (var ti = 0; ti < tabs.length; ti++) {
        var fKey = tabs[ti].getAttribute("data-filter");
        if (fKey && tabMap[fKey]) {
          tabs[ti].textContent = isAr() ? tabMap[fKey].ar : tabMap[fKey].en;
        }
      }

      // Difficulty Sub-Filters
      var diffWrap = document.getElementById("hubDiffPills");
      if (diffWrap) {
        var levelSpan = diffWrap.querySelector("span");
        if (levelSpan) levelSpan.textContent = isAr() ? "المستوى:" : "Level:";
      }
      var diffMap = {
        all: { en: "All Levels", ar: "جميع المستويات" },
        starter: { en: "🟢 Starter (14)", ar: "🟢 مبتدئ (14)" },
        intermediate: { en: "🟡 Intermediate (16)", ar: "🟡 متوسط (16)" },
        olympiad: { en: "🔴 Olympiad (11)", ar: "🔴 أولمبياد (11)" },
        solved: { en: "✅ Solved", ar: "✅ تم حلها" }
      };
      var dPills = document.querySelectorAll("#hubDiffPills .hub-diff-pill");
      for (var di = 0; di < dPills.length; di++) {
        var dKey = dPills[di].getAttribute("data-diff");
        if (dKey && diffMap[dKey]) {
          dPills[di].textContent = isAr() ? diffMap[dKey].ar : diffMap[dKey].en;
        }
      }

      var searchInput = document.getElementById("hubSearch");
      if (searchInput) {
        searchInput.placeholder = isAr()
          ? "🔍 ابحث عن لغز أو موضوع رياضي (مثل: جسور، أبراج، سودوكو، بصريات)..."
          : "🔍 Search puzzle or math topic (e.g. Graph, Optics, Sudoku)...";
      }
      var surpriseBtn = document.querySelector("button[onclick*='launchRandomPuzzle']");
      if (surpriseBtn) {
        surpriseBtn.textContent = isAr() ? "🎲 اختر لي عشوائياً" : "🎲 Surprise Me";
      }

      var footerEl = document.querySelector(".eis-footer");
      if (footerEl) {
        footerEl.innerHTML = isAr()
          ? "<strong>مدرسة بوابة المعرفة العالمية — فريق الرياضيات والعلوم</strong> • بوابة المنطق والرياضيات المتقطعة للسبورة الذكية • مصممة لشاشات الفصول التفاعلية"
          : "<strong>Edugates International School — Math-Science Team</strong> • Smartboard Logic &amp; Discrete Mathematics Portal • Optimized for Low-Processor Classroom Interactive Displays";
      }

      initHubPortalEnhancements();
      if (typeof window.applySearchAndFilter === "function") {
        window.applySearchAndFilter();
      }
      var activeCatTab = document.querySelector("#hubTabs .hub-tab.active");
      var catKey = activeCatTab ? activeCatTab.getAttribute("data-filter") : "all";
      var catHeading = document.getElementById("hubCategoryHeading");
      var catTitlesAr = {
        all: "🏛️ المجموعة الكاملة لألغاز الرياضيات والعلوم (41 مختبراً)",
        featured: "⭐ كلاسيكيات السبورة الذكية المميزة",
        graph: "🕸️ نظرية البيانات والأشجار الممتدة والمسارات الطوبولوجية",
        algebra: "🔢 المربعات اللاتينية والمتباينات والجبر المجرد",
        combinatorics: "🧮 التوافقيات والتصوير المقطعي المتقطع والاستنتاج الشبكي",
        physics: "🔬 البصريات الهندسية والكهرومغناطيسية والهندسة ثلاثية الأبعاد",
        algorithmic: "🎯 الخوارزميات وجبر المصفوفات GF(2) وزمر التباديل"
      };
      var catTitlesEn = {
        all: "🏛️ Complete Math-Science Puzzle Collection (41 Workbenches)",
        featured: "⭐ Featured Smartboard Classroom Classics",
        graph: "🕸️ Graph Theory, Spanning Trees & Topological Loops",
        algebra: "🔢 Latin Squares, Inequalities & Abstract Algebra",
        combinatorics: "🧮 Combinatorics, Discrete Tomography & Grid Deduction",
        physics: "🔬 Ray Optics, Electromagnetism, Kinematics & 3D Geometry",
        algorithmic: "🎯 Algorithmic State Spaces, GF(2) Matrix Logic & Permutation Groups"
      };
      if (catHeading) {
        catHeading.textContent = isAr() ? (catTitlesAr[catKey] || catTitlesAr.all) : (catTitlesEn[catKey] || catTitlesEn.all);
      }
      var countBadge = document.getElementById("hubCountBadge");
      if (countBadge) {
        var visCount = 0;
        var allCards = grid.querySelectorAll(".puzzle-card");
        for (var ci = 0; ci < allCards.length; ci++) {
          if (allCards[ci].style.display !== "none") visCount++;
        }
        countBadge.textContent = isAr()
          ? ("عرض " + visCount + " مختبراً")
          : ("Showing " + visCount + (visCount === 1 ? " puzzle" : " puzzles"));
      }
    }

    // 3. In-Game Puzzle Workspace Localization
    if (puzzleId && pDict) {
      document.title = (isAr() ? pDict.titleAr : pDict.titleEn) + " | " + (isAr() ? "مدرسة بوابة المعرفة العالمية" : "Edugates International School Math-Science Team");

      var homeLink = document.querySelector(".eis-topbar a[href='index.html'].eis-btn");
      if (homeLink) homeLink.textContent = isAr() ? "🏠 الرئيسية" : "🏠 Hub";

      var labSelect = document.getElementById("sb-quick-lab-select");
      if (labSelect) populateQuickLabSwitcher(labSelect, puzzleId);

      var movesLbl = document.querySelector(".sb-moves-pill span:first-child");
      if (movesLbl) movesLbl.textContent = "🎯";
      var bestLbl = document.querySelector(".sb-best-pill span:first-child");
      if (bestLbl) bestLbl.textContent = "🏆";
      var penBtn = document.getElementById("sb-pen-toggle");
      if (penBtn) penBtn.textContent = isAr() ? "✏️ قلم" : "✏️ Pen";

      // Secondary Actionbar Buttons
      var actMap = {
        "new": { en: "🆕 New", ar: "🆕 جديد" },
        "restart": { en: "🔄 Restart", ar: "🔄 إعادة" },
        "undo": { en: "↩️ Undo", ar: "↩️ تراجع" },
        "redo": { en: "↪️ Redo", ar: "↪️ تقديم" },
        "solve": { en: "💡 Solve", ar: "💡 حل" },
        "specific": { en: "🎯 Enter Game ID", ar: "🎯 إدخال رقم اللغز (ID)" },
        "random": { en: "🎲 Enter Random Seed", ar: "🎲 إدخال بذرة عشوائية (Seed)" },
        "prefs": { en: "⚙️ Puzzle Preferences", ar: "⚙️ إعدادات اللغز" },
        "save": { en: "💾 Download Save File", ar: "💾 حفظ التقدم في ملف" },
        "load": { en: "📂 Upload Save File", ar: "📂 تحميل ملف محفوظ" },
        "sb-team-toggle-btn": { en: "🏆 Teams", ar: "🏆 الفرق" },
        "sb-more-btn": { en: "🛠️ Tools", ar: "🛠️ أدوات" },
        "sb-manual-popover-link": { en: "📖 Full Puzzle Manual", ar: "📖 دليل اللغز الكامل" }
      };
      var actKeys = Object.keys(actMap);
      for (var ak = 0; ak < actKeys.length; ak++) {
        var el = document.getElementById(actKeys[ak]);
        if (el) el.textContent = isAr() ? actMap[actKeys[ak]].ar : actMap[actKeys[ak]].en;
      }

      var dockSwapBtn = document.getElementById("sb-dock-swap-btn");
      if (dockSwapBtn) {
        dockSwapBtn.textContent = currentDockSide === "left"
          ? (isAr() ? "➡️ اللوحة يميناً" : "➡️ Dock Right")
          : (isAr() ? "⬅️ اللوحة يساراً" : "⬅️ Dock Left");
      }

      var fitBtn = document.querySelector("button[onclick='zoomBoard(0)']");
      if (fitBtn) fitBtn.textContent = isAr() ? "🎯 ملائمة" : "🎯 Fit";

      // Palette Pills
      var palPills = document.querySelectorAll(".sb-palette-pill");
      var palLabels = {
        studio: { en: "🎨 Studio", ar: "🎨 استوديو" },
        parchment: { en: "📜 Paper", ar: "📜 ورق" },
        blueprint: { en: "📐 Blueprint", ar: "📐 مخطط" }
      };
      for (var pi = 0; pi < palPills.length; pi++) {
        var stKey = palPills[pi].getAttribute("data-style");
        if (stKey && palLabels[stKey]) {
          palPills[pi].textContent = isAr() ? palLabels[stKey].ar : palLabels[stKey].en;
        }
      }

      // Safe Solve Confirm Box
      var solveMsg = document.getElementById("sb-confirm-solve-msg");
      var solveYes = document.getElementById("sb-confirm-solve-yes");
      var solveNo = document.getElementById("sb-confirm-solve-no");
      if (solveMsg) solveMsg.textContent = isAr() ? "💡 إظهار الحل الكامل؟ (الحل التلقائي لا يمنح نجوم إتقان)" : "💡 Reveal full solution? (Assisted solves do not award stars)";
      if (solveYes) solveYes.textContent = isAr() ? "✅ إظهار الحل" : "✅ Reveal Solution";
      if (solveNo) solveNo.textContent = isAr() ? "إلغاء" : "Cancel";

      // Classroom Team Bar
      var teamBarTitle = document.getElementById("sb-team-bar-title");
      if (teamBarTitle) teamBarTitle.textContent = isAr() ? "🏆 فرق الفصل:" : "🏆 Classroom Teams:";
      var blitzSelect = document.getElementById("sb-blitz-select");
      if (blitzSelect && blitzSelect.options.length >= 5) {
        var blitzOptsAr = ["⏱️ ساعة إيقاف", "⏳ تحدي 1 د", "⏳ تحدي 2 د", "⏳ تحدي 3 د", "⏳ تحدي 5 د"];
        var blitzOptsEn = ["⏱️ Stopwatch", "⏳ 1m Blitz", "⏳ 2m Blitz", "⏳ 3m Blitz", "⏳ 5m Blitz"];
        for (var bi = 0; bi < 5; bi++) {
          blitzSelect.options[bi].textContent = isAr() ? blitzOptsAr[bi] : blitzOptsEn[bi];
        }
      }
      var teamResetBtn = document.getElementById("sb-team-reset-btn");
      if (teamResetBtn) teamResetBtn.textContent = isAr() ? "🔄 تصفير النقاط" : "🔄 Reset Pts";
      renderTeamBar();

      // Permalink Bar
      var permaBar = document.querySelector(".sb-permalink-bar");
      if (permaBar) {
        var firstSpan = permaBar.querySelector("span:first-child");
        if (firstSpan) {
          firstSpan.innerHTML = '<strong>' + (isAr() ? pDict.titleAr : pDict.titleEn) + '</strong> • ' + (isAr() ? 'مشاركة اللغز:' : 'Share Puzzle:');
        }
        var permaDesc = document.getElementById("permalink-desc");
        var permaSeed = document.getElementById("permalink-seed");
        if (permaDesc) permaDesc.textContent = isAr() ? "🔗 برقم اللغز" : "🔗 By Game ID";
        if (permaSeed) permaSeed.textContent = isAr() ? "🎲 بالبذرة العشوائية" : "🎲 By Random Seed";
      }

      // Control Dock Cards
      var prof = PUZZLE_PROFILES[puzzleId] || { left: "Primary Action", right: "Secondary / Mark", middle: "Aux Action", keys: [] };
      var dockCards = document.querySelectorAll(".sb-control-dock .sb-dock-card");
      if (dockCards.length >= 1) {
        var t0 = dockCards[0].querySelector(".sb-dock-title");
        if (t0) {
          var t0Spans = t0.querySelectorAll("span");
          if (t0Spans.length >= 2) {
            t0Spans[0].textContent = isAr() ? "👆 وضع اللمس للسبورة" : "👆 Smartboard Touch Action";
            t0Spans[1].textContent = isAr() ? "نقر / سحب" : "Tap / Drag";
          }
        }
        var mode0Btn = dockCards[0].querySelector(".sb-click-btn[data-mode='0'] > span");
        var mode2Btn = dockCards[0].querySelector(".sb-click-btn[data-mode='2'] > span");
        var mode1Btn = dockCards[0].querySelector(".sb-click-btn[data-mode='1'] > span");
        if (mode0Btn) mode0Btn.textContent = isAr() ? "👆 نقر أيسر (أساسي)" : "👆 Left Click";
        if (mode2Btn) mode2Btn.textContent = isAr() ? "🚩 نقر أيمن (ثانوي)" : "🚩 Right Click";
        if (mode1Btn) mode1Btn.textContent = isAr() ? ("🔒 إجراء إضافي: " + (pDict.middleAr || prof.middle)) : "🔒 Middle / Aux Action";

        var penBar = document.getElementById("sb-pen-bar");
        if (penBar) {
          var inkSpan = penBar.querySelector("span");
          var clearInkBtn = penBar.querySelector("button[onclick*='clearBoardPen']");
          if (inkSpan) inkSpan.textContent = isAr() ? "الحبر:" : "Ink:";
          if (clearInkBtn) clearInkBtn.textContent = isAr() ? "🧹 مسح الحبر" : "🧹 Clear Ink";
        }
      }

      var keypadCard = document.getElementById("sb-keypad-card");
      if (keypadCard) {
        var tkSpans = keypadCard.querySelectorAll(".sb-dock-title span");
        if (tkSpans.length >= 2) {
          tkSpans[0].textContent = isAr() ? "🔢 لوحة المفاتيح اللمسية" : "🔢 Smartboard Touch Keypad";
          tkSpans[1].textContent = isAr() ? "بدون لوحة مفاتيح" : "No Keyboard Needed";
        }
      }

      if (dockCards.length >= 3) {
        var dpadCard = dockCards[2];
        var tdSpans = dpadCard.querySelectorAll(".sb-dock-title span");
        if (tdSpans.length >= 2) {
          tdSpans[0].textContent = isAr() ? "🕹️ أسهم الاتجاهات والمؤشر" : "🕹️ Board Cursor & Direction Pad";
          var isExp = dpadCard.classList.contains("expanded");
          tdSpans[1].textContent = isExp
            ? (isAr() ? "▼ إخفاء" : "▼ Hide")
            : (isAr() ? "▶ إظهار الأسهم" : "▶ Show 8-Way Pad");
        }
        var spaceBtn = dpadCard.querySelector("button[onclick*=\"sendPuzzleKey('Spacebar')\"]");
        if (spaceBtn) {
          spaceBtn.textContent = isAr() ? "␣ مسافة (تحديد / ثانوي)" : "␣ Space (Secondary / Mark)";
        }
      }

      if (dockCards.length >= 4) {
        var rulesCard = dockCards[3];
        var trSpans = rulesCard.querySelectorAll(".sb-dock-title span");
        if (trSpans.length >= 2) {
          trSpans[0].textContent = isAr() ? "📐 القواعد والمفهوم الرياضي" : "📐 Rules & Math Concept";
          trSpans[1].textContent = isAr() ? pDict.domainAr : pDict.domainEn;
        }
      }

      // 3-Bullet Quick-Start Callout & Rules Box
      var qsDiv = document.getElementById("sb-quickstart-list");
      if (qsDiv) {
        var hasKeys = prof.keys && prof.keys.length > 0;
        var keySummary = hasKeys
          ? (isAr() ? "استخدم لوحة اللمس أو النقر على الشبكة" : "Use Touch Keypad or Board Tap")
          : (isAr() ? "النقر أو السحب المباشر على اللوحة" : "Direct Touch / Drag on Board");
        qsDiv.innerHTML =
          '<div class="sb-quickstart-item"><strong>' + (isAr() ? '👆 نقر أيسر:' : '👆 Left Tap:') + '</strong> <span>' + (isAr() ? (pDict.leftAr || prof.left) : prof.left) + '</span></div>' +
          '<div class="sb-quickstart-item"><strong>' + (isAr() ? '🚩 نقر أيمن:' : '🚩 Right Tap:') + '</strong> <span>' + (isAr() ? (pDict.rightAr || prof.right) : prof.right) + '</span></div>' +
          '<div class="sb-quickstart-item"><strong>' + (isAr() ? '⚡ التحكم:' : '⚡ Controls:') + '</strong> <span>' + keySummary + '</span></div>';
      }

      var rulesBox = document.querySelector(".sb-rules-box");
      if (rulesBox) {
        if (!rulesBox.hasAttribute("data-orig-en")) {
          rulesBox.setAttribute("data-orig-en", rulesBox.innerHTML);
        }
        if (isAr() && pDict.rulesAr) {
          rulesBox.innerHTML = pDict.rulesAr;
        } else if (!isAr() && pDict.rulesEn) {
          rulesBox.innerHTML = pDict.rulesEn;
        } else {
          rulesBox.innerHTML = rulesBox.getAttribute("data-orig-en");
        }
      }

      // Bottom Quick-Reach Bar
      var qrLabel = document.getElementById("sb-quickreach-label");
      if (qrLabel) qrLabel.textContent = isAr() ? "👇 وصول سريع:" : "👇 Quick Reach:";
      var qBtns = document.querySelectorAll("#sb-bottom-quickbar .sb-quick-mode-btn");
      for (var qi = 0; qi < qBtns.length; qi++) {
        var qm = parseInt(qBtns[qi].getAttribute("data-mode"), 10);
        if (qm === 0) qBtns[qi].textContent = "👆 " + (isAr() ? (pDict.leftAr || prof.left) : prof.left);
        else if (qm === 2) qBtns[qi].textContent = "🚩 " + (isAr() ? (pDict.rightAr || prof.right) : prof.right);
        else if (qm === 1) qBtns[qi].textContent = "🔒 " + (isAr() ? (pDict.middleAr || prof.middle) : prof.middle);
      }
      var qbUndo = document.getElementById("sb-qb-undo");
      var qbRedo = document.getElementById("sb-qb-redo");
      var qbNew = document.getElementById("sb-qb-new");
      if (qbUndo) qbUndo.textContent = isAr() ? "↩️ تراجع" : "↩️ Undo";
      if (qbRedo) qbRedo.textContent = isAr() ? "↪️ إعادة" : "↪️ Redo";
      if (qbNew) qbNew.textContent = isAr() ? "🆕 جديد" : "🆕 New";

      buildSmartboardControls();

      // Re-render Victory Banner if open
      var vBanner = document.getElementById("sb-victory-banner");
      if (vBanner && vBanner.classList.contains("visible") && lastVictoryResult) {
        renderVictoryBannerContent(lastVictoryResult);
      }
    }

    // Re-render Trophy Modal if open
    var trophyModal = document.getElementById("eis-trophy-modal");
    if (trophyModal && trophyModal.classList.contains("open")) {
      window.openTrophyRoomModal();
    }

    // Render all KaTeX mathematical typography across active view
    renderEdugatesMath(document.body);
  }
  window.applyEdugatesLanguage = applyEdugatesLanguage;

  window.toggleEdugatesLang = function () {
    currentLang = currentLang === "ar" ? "en" : "ar";
    try { localStorage.setItem("edugates_math_lang", currentLang); } catch (e) {}
    playSound("mode");
    applyEdugatesLanguage();
    setTimeout(function () { autoFitBoard(currentZoomScale); }, 40);
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
    applyEdugatesLanguage();
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

  function boot() {
    if (document.body && document.body.classList.contains("puzzle-page")) {
      upgradePuzzleWorkspaceUI();
    } else {
      initHubPortalEnhancements();
    }
    applyEdugatesLanguage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
