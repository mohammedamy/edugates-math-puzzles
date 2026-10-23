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
    bridges: {
      titleEn: "🌉 Bridges (Hashi)", titleAr: "🌉 الجسور (هاشي)",
      domainEn: "Graph Theory", domainAr: "نظرية البيانات ودرجات الرؤوس",
      descEn: "Connect islands using vertex degree invariants and planar graph connectivity.",
      descAr: "اربط الجزر بجسور مفردة أو مزدوجة وفق درجات الرؤوس دون تقاطع أي جسرين.",
      leftAr: "مد جسر / قفل", rightAr: "علامة عدم وجود جسر", middleAr: "تمييز الجزيرة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> نظرية البيانات المستوية وتوازن درجات الرؤوس.</p><p>اربط جميع الجزر في شبكة متصلة واحدة باستخدام جسور أفقية أو رأسية، بحيث يطابق عدد الجسور المتصلة بكل جزيرة الرقم المكتوب بداخلها.</p><p>• لا يمكن وضع أكثر من جسرين بين نفس الجزيرتين.<br>• لا يُسمح بتقاطع الجسور مع بعضها.<br>• اسحب بين جزيرتين لمد جسر أو إزالته.</p>"
    },
    towers: {
      titleEn: "🏙️ Towers (Skyscrapers)", titleAr: "🏙️ الأبراج (ناطحات السحاب)",
      domainEn: "Latin Squares & Spatial Logic", domainAr: "المربعات اللاتينية والمنطق الفراغي",
      descEn: "Determine 3D skyscraper heights from orthogonal perspective sightlines.",
      descAr: "استنتج ارتفاعات الأبراج ثلاثية الأبعاد من عدد الأبراج المرئية على حواف الشبكة.",
      leftAr: "تحديد المربع", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح المربع",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المربعات اللاتينية وخطوط الرؤية المتعامدة ثلاثية الأبعاد.</p><p>املأ الشبكة بأبراج تتراوح ارتفاعاتها من 1 إلى حجم الشبكة، بحيث يظهر كل ارتفاع مرة واحدة فقط في كل صف وعمود.</p><p>• الأرقام على الحواف تمثل عدد الأبراج المرئية عند النظر من ذلك الاتجاه (الأبراج الأطول تحجب الأبراج الأقصر خلفها).<br>• انقر على مربع ثم اختر رقماً من لوحة اللمس لوضع برج، أو استخدم وضع القلم لتسجيل الاحتمالات.</p>"
    },
    lightup: {
      titleEn: "💡 Light Up (Akari)", titleAr: "💡 الإضاءة (أكاري)",
      domainEn: "Ray-Casting & Coordinate Geometry", domainAr: "تتبع الأشعة والهندسة الإحداثية",
      descEn: "Place light emitters to illuminate every orthogonal grid ray without conflict.",
      descAr: "ضع المصابيح لإضاءة جميع الممرات المتعامدة دون أن يضيء مصباحان بعضهما.",
      leftAr: "💡 وضع مصباح", rightAr: "⚫ علامة نقطة (لا مصباح)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> انتشار الأشعة المتعامدة والقيود المنطقية المحلية.</p><p>ضع مصابيح ضوئية في المربعات البيضاء بحيث تُضاء جميع المربعات البيضاء في الشبكة.</p><p>• ينشر المصباح الضوء أفقياً ورأسياً حتى يصطدم بجدار أسود.<br>• لا يجوز أن يسلط مصباحان الضوء على بعضهما مباشرة.<br>• الأرقام داخل الجدران السوداء تحدد عدد المصابيح المجاورة لها أفقياً ورأسياً.</p>"
    },
    slant: {
      titleEn: "📐 Slant (Gokigen)", titleAr: "📐 الخطوط المائلة (غوكيغن)",
      domainEn: "Combinatorics & Acyclic Trees", domainAr: "التوافقيات والأشجار اللا دورية",
      descEn: "Draw diagonal line segments matching vertex degrees while avoiding cycles.",
      descAr: "ارسم أقطاراً مائلة في كل خلية لتحقيق أرقام التقاطعات دون تكوين أي حلقة مغلقة.",
      leftAr: "╱ قطر مائل (/)", rightAr: "╲ قطر مائل (\\)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الأشجار الخالية من الدورات ودرجات رؤوس الشبكة.</p><p>ارسم خطاً قطرياً (╱ أو ╲) في كل مربع من مربعات الشبكة.</p><p>• يجب أن يساوي عدد الخطوط الملتقية عند كل دائرة مرقمة الرقم المكتوب فيها.<br>• يُمنع منعاً باتاً تكوين أي مسار مغلق (حلقة) من الخطوط القطرية.</p>"
    },
    net: {
      titleEn: "⚡ Net (Network)", titleAr: "⚡ الشبكة الكهربائية (نت)",
      domainEn: "Spanning Trees & Networks", domainAr: "الأشجار الممتدة وترابط الشبكات",
      descEn: "Rotate network tiles to link every terminal into a single connected spanning tree.",
      descAr: "قم بتدوير قطع الشبكة لتوصيل جميع الأطراف بالمصدر المركزي في شجرة متصلة واحدة.",
      leftAr: "↺ تدوير لليسار", rightAr: "↻ تدوير لليمين", middleAr: "🔒 قفل القطعة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الأشجار الممتدة (Spanning Trees) والاتصال الطوبولوجي.</p><p>قم بتدوير مربعات الأسلاك حتى تتصل جميع الأجهزة الطرفية بمصدر الطاقة المركزي.</p><p>• يجب أن تشكل الشبكة شجرة متصلة كاملة بدون أطراف سائبة أو حلقات مغلقة.<br>• يمكنك قفل المربعات المؤكدة بالنقر الأوسط أو زر القفل.</p>"
    },
    loopy: {
      titleEn: "➰ Slitherlink (Loopy)", titleAr: "➰ المسار المغلق (سليذرلينك)",
      domainEn: "Jordan Curve Theorem & Topology", domainAr: "مبرهنة منحنى جوردان والطوبولوجيا",
      descEn: "Connect grid vertices into a single continuous non-intersecting closed loop.",
      descAr: "اربط نقاط الشبكة لتكوين مسار مغلق واحد متصل دون تقاطعات أو تفرعات.",
      leftAr: "➰ رسم ضلع المسار", rightAr: "✖️ علامة استبعاد (X)", middleAr: "مسح الضلع",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> مبرهنة منحنى جوردان والدورات البسيطة في البيانات.</p><p>ارسم حلقة مغلقة واحدة متصلة عبر أضلاع الشبكة.</p><p>• الرقم داخل أي خلية يحدد عدد أضلاعها المشمولة في الحلقة.<br>• لا يجوز أن تتقاطع الحلقة مع نفسها أو تتفرع.</p>"
    },
    solo: {
      titleEn: "🔢 Solo (Sudoku & Killer)", titleAr: "🔢 سولو (سودوكو وكيلر)",
      domainEn: "Latin Squares & Combinatorics", domainAr: "المربعات اللاتينية والتوافقيات",
      descEn: "Complete bijective Latin square sub-blocks with optional cage sum constraints.",
      descAr: "أكمل المربعات اللاتينية الفرعية دون تكرار أي رقم في الصف أو العمود أو القطاع.",
      leftAr: "تحديد الخلية", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التقابل في المربعات اللاتينية وتجزئة المجموعات.</p><p>املأ الشبكة بالأرقام بحيث يحتوي كل صف، وكل عمود، وكل قطاع محدد على جميع الأرقام دون تكرار.</p>"
    },
    keen: {
      titleEn: "➗ Keen (KenKen)", titleAr: "➗ كين (مربعات الحساب - كين كين)",
      domainEn: "Number Theory & Arithmetic Logic", domainAr: "نظرية الأعداد والمنطق الحسابي",
      descEn: "Solve Latin squares governed by arithmetic (+, −, ×, ÷) cage equations.",
      descAr: "حل المربع اللاتيني بتحقيق المعادلات الحسابية (+، −، ×، ÷) داخل الأقفاص المحددة.",
      leftAr: "تحديد الخلية", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التحليل إلى عوامل والعمليات الحسابية على المربعات اللاتينية.</p><p>املأ الشبكة كـمربع لاتيني (بدون تكرار في أي صف أو عمود)، بحيث تنتج الأرقام داخل كل قفص القيمة والعملية الحسابية المكتوبة في زاويته.</p>"
    },
    unequal: {
      titleEn: "⚖️ Unequal (Futoshiki)", titleAr: "⚖️ المتباينات (فوتوشيكي)",
      domainEn: "Order Relations & Inequalities", domainAr: "علاقات الترتيب والمتباينات",
      descEn: "Order permutations in a Latin square satisfying strict inequality (<, >) chains.",
      descAr: "رتب الأرقام في مربع لاتيني مع تحقيق إشارات التباين الصارمة (<، >) بين الخلايا.",
      leftAr: "تحديد الخلية", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الترتيب الجزئي وسلاسل المتباينات في المربعات اللاتينية.</p><p>ضع الأرقام من 1 إلى حجم الشبكة دون تكرار في أي صف أو عمود، مع الالتزام بجميع علامات الأكبر والأصغر (&lt; ، &gt;) المرسومة بين الخلايا المتجاورة.</p>"
    },
    group: {
      titleEn: "🧮 Group (Cayley Tables)", titleAr: "🧮 الزمر الرياضية (جداول كايلي)",
      domainEn: "Abstract Algebra & Group Axioms", domainAr: "الجبر المجرد وبديهيات الزمر",
      descEn: "Reconstruct finite group Cayley tables using associativity, identity, and inverses.",
      descAr: "أكمل جدول كايلي لزمرة منتهية بتطبيق خاصية التجميع والعنصر المحايد والمعكوس.",
      leftAr: "تحديد الخلية", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> نظرية الزمر المنتهية، العنصر المحايد، والمعكوسات، وخاصية التجميع $(ab)c = a(bc)$.</p><p>أكمل جدول ضرب الزمرة (جدول كايلي) بالأحرف بحيث يحقق جميع بديهيات الزمرة الرياضية.</p>"
    },
    singles: {
      titleEn: "🎯 Singles (Hitori)", titleAr: "🎯 المفردات (هيتوري)",
      domainEn: "Set Uniqueness & Graph Connectivity", domainAr: "تفرد العناصر وترابط الشبكة",
      descEn: "Eliminate duplicate numbers while keeping remaining cells orthogonally connected.",
      descAr: "ظلل الأرقام المكررة بحيث لا تتجاور خليتان مظللتان وتبقى الخلايا البيضاء متصلة.",
      leftAr: "⬛ تظليل الخلية", rightAr: "⭕ وضع دائرة (إبقاء)", middleAr: "مسح العلامة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> حذف التكرار مع الحفاظ على الاتصال الطوبولوجي للمكونات البيضاء.</p><p>ظلل بعض المربعات بحيث:<br>• لا يتكرر أي رقم في صف أو عمود بين المربعات غير المظللة.<br>• لا تتجاور خليتان مظللتان أفقياً أو رأسياً.<br>• تبقى جميع الخلايا البيضاء متصلة ببعضها في منطقة واحدة.</p>"
    },
    blackbox: {
      titleEn: "🔬 Black Box (Laser Optics)", titleAr: "🔬 الصندوق الأسود (بصريات الليزر)",
      domainEn: "Ray Reflection & Wave Scattering", domainAr: "انعكاس الأشعة وتشتت الموجات",
      descEn: "Deduce hidden atomic positions by firing laser beams and analyzing reflection paths.",
      descAr: "استنتج مواقع الكرات المخفية بإطلاق أشعة الليزر وتحليل مسارات الانعكاس والامتصاص.",
      leftAr: "🔴 وضع كرة / إطلاق ليزر", rightAr: "✖️ علامة خلية فارغة", middleAr: "قفل الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> البصريات الهندسية والاستنتاج العكسي من تشتت الأشعة.</p><p>أطلق أشعة الليزر من حواف الصندوق وراقب أين تخرج (أو تُمتص `H` أو تنعكس `R`)، ثم حدد مواقع الكرات المخفية واضغط إظهار للتحقق.</p>"
    },
    undead: {
      titleEn: "🪞 Undead (Mirror Optics)", titleAr: "🪞 المرايا المنطقية (أنديد)",
      domainEn: "Geometric Optics & Sightline Algebra", domainAr: "البصريات الهندسية وجبر خطوط الرؤية",
      descEn: "Trace mirror reflection paths to place spectral entities matching sightline counts.",
      descAr: "تتبع انعكاسات المرايا لتوزيع الكائنات الثلاثة وفق أعداد الرؤية المباشرة والمنعكسة.",
      leftAr: "تحديد الخلية", rightAr: "وضع الملاحظات (قلم)", middleAr: "مسح الخلية",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> قانون الانعكاس الضوئي وحساب المشاهدات على المسارات المنكسرة.</p><p>ضع في كل خلية فارغة: شبحاً (G) لا يُرى إلا في المرايا، أو مصاص دماء (V) يُرى مباشرة فقط ولا يظهر في المرايا، أو زومبي (Z) يُرى في الحالتين، لتحقيق الأعداد المطلوبة.</p>"
    },
    magnets: {
      titleEn: "🧲 Magnets (Polarity)", titleAr: "🧲 المغناطيسات (القطبية)",
      domainEn: "Electromagnetism & Dipole Balance", domainAr: "الكهرومغناطيسية وتوازن الأقطاب",
      descEn: "Place +/- magnetic dipoles satisfying pole tallies without orthogonal repulsion.",
      descAr: "ضع ثنائيات الأقطاب (+ / −) لتحقيق أعداد الأقطاب دون تجاور قطبين متماثلين.",
      leftAr: "➕ وضع مغناطيس (+/-)", rightAr: "✖️ تحديد كقطعة محايدة", middleAr: "مسح القطعة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> ثنائيات الأقطاب المغناطيسية وشرط التنافر المتعامد.</p><p>كل مستطيل إما أن يحتوي على مغناطيس بقطبين (+ و −) أو يبقى محايداً فارغاً.<br>• لا يجوز تجاور قطبين موجبين (+) أو قطبين سالبين (−) أفقياً أو رأسياً.<br>• يجب مطابقة أعداد الأقطاب + و − المكتوبة على حواف الصفوف والأعمدة.</p>"
    },
    inertia: {
      titleEn: "💎 Inertia (Kinematics)", titleAr: "💎 القصور الذاتي (إنيرشيا)",
      domainEn: "Newtonian Frictionless Vectors", domainAr: "الحركة النيوتونية عديمة الاحتكاك",
      descEn: "Navigate frictionless vector trajectories to collect all gems without hitting mines.",
      descAr: "حرك الكرة على مسارات عديمة الاحتكاك لجمع كل الجواهر دون الاصطدام بالألغام.",
      leftAr: "💎 دحرجة الكرة", rightAr: "دحرجة الكرة", middleAr: "دحرجة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> القانون الأول لنيوتن (القصور الذاتي) على الشبكات المتقطعة.</p><p>حرك الكرة في أي من الاتجاهات الثمانية؛ ستستمر في الانزلاق حتى تصطدم بجدار أو تتوقف على دائرة توقف منقطة. اجمع كل الجواهر وتجنب الألغام!</p>"
    },
    cube: {
      titleEn: "🧊 Cube (3D Polyhedra)", titleAr: "🧊 المكعب المتدحرج (متعددات الوجوه)",
      domainEn: "3D Rotation Groups & Net Topology", domainAr: "زمر الدوران ثلاثية الأبعاد والفضاء",
      descEn: "Roll a 3D polyhedron across a plane to map every grid face onto the solid.",
      descAr: "دحرج المجسم ثلاثي الأبعاد على الشبكة لجمع جميع المربعات الملونة على أوجهه.",
      leftAr: "🧊 دحرجة المجسم", rightAr: "دحرجة المجسم", middleAr: "دحرجة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> زمر دوران المجسمات الأفلاطونية وإسقاط الأوجه.</p><p>استخدم الأسهم أو النقر لدحرجة المكعب (أو المجسم) فوق المربعات الزرقاء لتنتقل إلى أوجهه حتى تتلون جميع أوجه المجسم في آن واحد.</p>"
    },
    galaxies: {
      titleEn: "🌌 Galaxies (Symmetry)", titleAr: "🌌 المجرات (التماثل الدوراني)",
      domainEn: "180° Rotational Point Symmetry", domainAr: "التماثل النقطي الدوراني 180°",
      descEn: "Partition the grid into 180-degree rotationally symmetric polyomino regions.",
      descAr: "قسّم الشبكة إلى مناطق متماثلة دورانياً بزاوية 180 درجة حول مراكز المجرات.",
      leftAr: "🌌 رسم / إزالة حد", rightAr: "ربط بمركز مجرة", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التماثل الدوراني الثنائي ($C_2$) وتجزئة المستوى.</p><p>قسّم الشبكة عبر رسم الحدود بحيث تحتوي كل منطقة (مجرة) على دائرة مركزية واحدة فقط، وتكون متماثلة تماماً عند تدويرها 180 درجة حول ذلك المركز.</p>"
    },
    untangle: {
      titleEn: "🕸️ Untangle (Planar Graphs)", titleAr: "🕸️ فك التشابك (البيانات المستوية)",
      domainEn: "Kuratowski's Theorem & Planarity", domainAr: "مبرهنة كوراتوفسكي والبيانات المستوية",
      descEn: "Reposition graph vertices in Euclidean space until zero edge intersections remain.",
      descAr: "اسحب رؤوس الشبكة وأعد ترتيبها في المستوى حتى لا يتقاطع أي خطين معاً.",
      leftAr: "🕸️ سحب الرأس", rightAr: "سحب الرأس", middleAr: "سحب",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التضمين المستوي للبيانات (Planar Graph Embedding).</p><p>اسحب النقاط (الرؤوس) إلى مواقع جديدة بحيث لا يتقاطع أي ضلعين مستقيمين مع بعضهما البعض.</p>"
    },
    map: {
      titleEn: "🗺️ Map (Four-Color Theorem)", titleAr: "🗺️ تلوين الخريطة (مبرهنة الألوان الأربعة)",
      domainEn: "Four-Color Theorem & Dual Graphs", domainAr: "مبرهنة الألوان الأربعة وتلوين البيانات",
      descEn: "Color planar regions using at most four colors so no adjacent regions share a color.",
      descAr: "لوّن أقاليم الخريطة بأربعة ألوان فقط بحيث لا يتجاور إقليمان بنفس اللون.",
      leftAr: "🎨 سحب اللون للإقليم", rightAr: "✏️ علامة تنقيط", middleAr: "مسح اللون",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> مبرهنة الألوان الأربعة لتلوين البيانات المستوية.</p><p>لوّن جميع مناطق الخريطة باستخدام الألوان الأربعة بحيث لا تشترك منطقتان متجاورتان عبر حد مشترك في نفس اللون. اسحب اللون من منطقة ملونة إلى منطقة فارغة لتلوينها.</p>"
    },
    pearl: {
      titleEn: "⚪ Pearl (Masyu)", titleAr: "⚪ اللؤلؤ (ماسيو)",
      domainEn: "Hamiltonian Cycles & Curvature Rules", domainAr: "الدورات الهاملتونية وقواعد الانحناء",
      descEn: "Draw a closed loop obeying geometric turn constraints through black and white pearls.",
      descAr: "ارسم مساراً مغلقاً يمر بجميع اللآلئ البيضاء والسوداء وفق شروط الاستقامة والانعطاف.",
      leftAr: "⚪ رسم مسار الحلقة", rightAr: "✖️ علامة استبعاد", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المسارات المغلقة المقيدة بالانحناء المحلي.</p><p>ارسم حلقة مغلقة واحدة تمر عبر جميع اللآلئ:<br>• في اللؤلؤة البيضاء: يجب أن يمر المسار مستقيماً عبرها، وينعطف مباشرة في إحدى الخليتين المجاورتين.<br>• في اللؤلؤة السوداء: يجب أن ينعطف المسار بزاوية قائمة داخلها، ويمتد مستقيماً لمربعين على الأقل في كلا الاتجاهين.</p>"
    },
    tracks: {
      titleEn: "🛤️ Tracks (Railway Paths)", titleAr: "🛤️ مسار القطار (تراكس)",
      domainEn: "Hamiltonian Paths & Tomography", domainAr: "المسارات المتصلة وإسقاط الصفوف",
      descEn: "Reconstruct a continuous railway path from orthogonal row and column projection counts.",
      descAr: "أكمل مسار سكة الحديد من نقطة A إلى B بالاعتماد على أعداد القطع في كل صف وعمود.",
      leftAr: "🛤️ مد السكة", rightAr: "✖️ استبعاد الخلية", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> إعادة بناء المسار المتصل من مجاميع الإسقاطات المتعامدة.</p><p>ارسم مسار سكة حديد متصل بدون تقاطع من A إلى B بحيث يطابق عدد مربعات السكة في كل صف وعمود الأرقام المكتوبة على الحواف.</p>"
    },
    signpost: {
      titleEn: "🧭 Signpost (Vector Chains)", titleAr: "🧭 أسهم الطريق (ساين بوست)",
      domainEn: "Directed Graphs & Hamiltonian Paths", domainAr: "البيانات الموجهة والمسارات الهاملتونية",
      descEn: "Link directed vector arrows into a complete Hamiltonian sequence from 1 to N².",
      descAr: "اربط المربعات في سلسلة متصلة من 1 إلى N² باتباع اتجاهات الأسهم المرسومة.",
      leftAr: "🔗 سحب للربط", rightAr: "✂️ فك الربط", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المسار الهاملتوني في بيان موجه بالمتجهات.</p><p>اربط جميع المربعات بترتيب متسلسل من 1 إلى النهاية، بحيث يقع كل مربع تالٍ في الاتجاه الذي يشير إليه سهم المربع السابق. اسحب من مربع إلى آخر للربط بينهما.</p>"
    },
    netslide: {
      titleEn: "🔄 Netslide (Toroidal Net)", titleAr: "🔄 الشبكة المنزلقة (نت سلايد)",
      domainEn: "Toroidal Permutations & Spanning Trees", domainAr: "التباديل الحلقية والأشجار الممتدة",
      descEn: "Slide rows and columns cyclically to assemble a fully connected network tree.",
      descAr: "أزح الصفوف والأعمدة دورياً لتجميع شبكة كهربائية متصلة بالكامل.",
      leftAr: "🔄 إزاحة صف / عمود", rightAr: "🔒 قفل القطعة", middleAr: "قفل",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التباديل الدورية على الشبكة وتوصيل الأشجار الممتدة.</p><p>انقر على أسهم الحواف لإزاحة صف أو عمود كامل حتى تتصل جميع قطع الشبكة بالمصدر المركزي.</p>"
    },
    pattern: {
      titleEn: "🏁 Pattern (Nonogram)", titleAr: "🏁 النقش المنطقي (نونوغرام)",
      domainEn: "Discrete Tomography & Run-Length Logic", domainAr: "التصوير المقطعي المتقطع وأطوال الكتل",
      descEn: "Reconstruct binary pixel matrices from orthogonal run-length projection sequences.",
      descAr: "استنتج الصورة الثنائية بتظليل الخلايا وفق أطوال الكتل المتتالية في كل صف وعمود.",
      leftAr: "⬛ تظليل بالأسود", rightAr: "⬜ تعليم كفارغ (أبيض)", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التصوير المقطعي المتقطع (Discrete Tomography).</p><p>الأرقام على جانب كل صف وأعلى كل عمود تحدد أطوال الكتل السوداء المتتالية وترتيبها، مع وجود مربع أبيض واحد على الأقل يفصل بين كل كتلتين.</p>"
    },
    mines: {
      titleEn: "💣 Mines (Zero-Guess Logic)", titleAr: "💣 الألغام المنطقية (بدون تخمين)",
      domainEn: "Boolean Constraint Satisfaction", domainAr: "إرضاء القيود البوليانية والاستنتاج الصارم",
      descEn: "Clear the minefield using guaranteed pure logical deduction with zero guessing.",
      descAr: "اكشف جميع الخلايا الآمنة وحدد مواقع الألغام بالاستنتاج المنطقي الخالص دون أي تخمين.",
      leftAr: "⛏️ كشف الخلية", rightAr: "🚩 وضع علم لغم", middleAr: "كشف المجاور",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الاستنتاج البولياني الحتمي (مولد خالٍ تماماً من الحاجة للتخمين).</p><p>يمثل الرقم في كل خلية مكشوفة عدد الألغام في الخلايا الثماني المجاورة لها. استخدم وضع العلم 🚩 لتحديد الألغام المؤكدة.</p>"
    },
    dominosa: {
      titleEn: "🁣 Dominosa (Domino Tiling)", titleAr: "🁣 الدومينو (تبليط الدومينو)",
      domainEn: "Combinatorial Tiling & Bijections", domainAr: "التبليط التوافقي والتقابل الثنائي",
      descEn: "Tile the number grid so every unordered domino pair [a, b] appears exactly once.",
      descAr: "غطِّ شبكة الأرقام بقطع الدومينو بحيث يظهر كل زوج أرقام مرة واحدة فقط دون تكرار.",
      leftAr: "🁣 وضع قطعة دومينو", rightAr: "حاجز فاصل بين خليتين", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التبليط الثنائي للمجموعات التوافقية.</p><p>اربط كل رقمين متجاورين بقطعة دومينو بحيث تتكون المجموعة الكاملة لقطع الدومينو دون تكرار أي زوج أرقام.</p>"
    },
    rect: {
      titleEn: "▭ Rectangles (Shikaku)", titleAr: "▭ المستطيلات (شيكاكو)",
      domainEn: "Area Factorization & Dissection", domainAr: "تحليل المساحات وتجزئة الشبكة",
      descEn: "Partition the grid into non-overlapping rectangles matching internal area clues.",
      descAr: "قسّم الشبكة إلى مستطيلات غير متداخلة بحيث يضم كل مستطيل رقماً واحداً يساوي مساحته.",
      leftAr: "📐 سحب لرسم مستطيل", rightAr: "مسح الحدود", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التحليل إلى عوامل (العرض × الارتفاع) وتجزئة المساحات.</p><p>اسحب لتحديد مستطيلات تغطي الشبكة بالكامل بحيث يحتوي كل مستطيل على رقم واحد فقط يساوي عدد المربعات بداخله.</p>"
    },
    palisade: {
      titleEn: "🧱 Palisade (Five Cells)", titleAr: "🧱 الأسوار (تقسيم المناطق)",
      domainEn: "Polyomino Partitioning & Boundary Clues", domainAr: "تجزئة متعددات المربعات والحدود",
      descEn: "Divide the board into equal-sized polyomino regions using interior border counts.",
      descAr: "قسّم اللوحة إلى مناطق متساوية المساحة بالاعتماد على عدد الحدود المرسومة حول كل رقم.",
      leftAr: "🧱 رسم حد فاصل", rightAr: "✖️ منع الحد", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> تجزئة البوليومينو المتساوي الحجم وقيود المحيط.</p><p>ارسم حدوداً لتقسيم الشبكة إلى مناطق مترابطة متساوية المساحة، بحيث يساوي الرقم داخل أي خلية عدد أضلاعها الأربعة التي تمثل حدوداً فاصلة.</p>"
    },
    filling: {
      titleEn: "🧩 Filling (Fillomino)", titleAr: "🧩 ملء المناطق (فيلومينو)",
      domainEn: "Connected Component Area Logic", domainAr: "منطق مساحات المكونات المتصلة",
      descEn: "Fill cells with numbers so each connected polyomino of N has area exactly N.",
      descAr: "املأ المربعات بالأرقام بحيث تشكل كل مجموعة متصلة من الرقم N منطقة مساحتها N بالضبط.",
      leftAr: "تحديد / سحب الخلية", rightAr: "مسح الخلية", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المكونات المتصلة وتطابق القيمة مع المساحة.</p><p>اكتب رقماً في كل مربع بحيث تتكون مناطق متصلة من الأرقام المتماثلة، ويكون عدد المربعات في كل منطقة مساوياً للرقم المكتوب بداخلها.</p>"
    },
    range: {
      titleEn: "🔭 Range (Kuromasu)", titleAr: "🔭 مدى الرؤية (كوروماسو)",
      domainEn: "Orthogonal Visibility Bounds", domainAr: "حدود الرؤية المتعامدة والاتصال",
      descEn: "Place black blocker cells to bound orthogonal white-cell visibility counts.",
      descAr: "ضع خلايا سوداء لضبط مدى المربعات البيضاء المرئية أفقياً ورأسياً من كل رقم.",
      leftAr: "⬛ تظليل بالأسود", rightAr: "⬜ نقطة (خلية بيضاء)", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> قيود مدى الرؤية المتعامدة واتصال الشبكة.</p><p>يمثل كل رقم مجموع المربعات البيضاء المرئية منه في الاتجاهات الأربعة (بما في ذلك مربع الرقم نفسه) حتى يصطدم بمربع أسود أو حافة اللوحة.<br>• لا تتجاور خليتان سوداوان، ويجب أن تظل الخلايا البيضاء متصلة.</p>"
    },
    tents: {
      titleEn: "⛺ Tents (Matching)", titleAr: "⛺ الخيام والأشجار (المطابقة الثنائية)",
      domainEn: "Bipartite Matching & Hall's Theorem", domainAr: "المطابقة الثنائية ومبرهنة هول",
      descEn: "Pair every tree with an adjacent tent without any two tents touching.",
      descAr: "اربط كل شجرة بخيمة مجاورة لها مع مطابقة أعداد الصفوف والأعمدة دون تلامس الخيام.",
      leftAr: "⛺ نصب خيمة", rightAr: "🌿 تعليم كعشب فارغ", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المطابقة التامة في البيانات الثنائية (Bipartite Matching).</p><p>ضع خيمة بجوار كل شجرة أفقياً أو رأسياً (خيمة واحدة لكل شجرة).<br>• لا يجوز أن تتلامس خيمتان حتى قطرياً.<br>• الأرقام خارج الشبكة تحدد عدد الخيام في كل صف وعمود.</p>"
    },
    mosaic: {
      titleEn: "🔳 Mosaic (3×3 Kernel)", titleAr: "🔳 الفسيفساء (مصفوفة 3×3)",
      domainEn: "2D Cellular Convolution Logic", domainAr: "منطق الجوار المحلي (3×3)",
      descEn: "Reconstruct a binary grid where each clue counts black cells in its 3×3 neighborhood.",
      descAr: "ظلل الخلايا بحيث يساوي كل رقم عدد المربعات السوداء في منطقته 3×3 (بما فيها الخلية نفسها).",
      leftAr: "⬛ تظليل بالأسود", rightAr: "⬜ تعليم كأبيض", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الالتفاف الثنائي (2D Convolution) على جوار مور $3\\times 3$.</p><p>كل رقم يحدد عدد الخلايا السوداء في المربع $3\\times 3$ المحيط به (بما في ذلك الخلية التي تحتوي على الرقم نفسه).</p>"
    },
    unruly: {
      titleEn: "⚖️ Unruly (Binairo)", titleAr: "⚖️ التوازن الثنائي (بينيرو)",
      domainEn: "Binary Parity & Run-Length Constraints", domainAr: "التكافؤ الثنائي وتوازن الصفوف",
      descEn: "Balance black and white squares in every row and column with no three-in-a-row.",
      descAr: "وازن بين المربعات السوداء والبيضاء في كل صف وعمود دون تكرار ثلاثة ألوان متتالية.",
      leftAr: "⬛ تلوين بالأسود", rightAr: "⬜ تلوين بالأبيض", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التوازن الثنائي ومنع التكرار الثلاثي المتتالي.</p><p>لوّن كل خلية بالأسود أو الأبيض بحيث:<br>• لا توجد 3 خلايا متجاورة بنفس اللون أفقياً أو رأسياً.<br>• يتساوى عدد الخلايا السوداء والبيضاء في كل صف وفي كل عمود.</p>"
    },
    flip: {
      titleEn: "💡 Flip (Lights Out / GF(2))", titleAr: "💡 قلب الإضاءة (جبر GF(2))",
      domainEn: "Linear Algebra over GF(2)", domainAr: "الجبر الخطي على الحقل الثنائي GF(2)",
      descEn: "Invert coupled matrix neighborhoods over the binary field GF(2) to unify the board.",
      descAr: "اقلب حالة الخلايا المترابطة وفق الجبر الثنائي GF(2) حتى تصبح جميع المربعات مضاءة.",
      leftAr: "💡 قلب مجموعة الخلايا", rightAr: "قلب الخلايا", middleAr: "قلب",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> أنظمة المعادلات الخطية على الحقل الثنائي $\\mathbb{F}_2$.</p><p>النقر على أي مربع يقلب لونه ولون المربعات المرتبطة به وفق المخطط المرسوم بداخله. الهدف هو جعل الشبكة كلها بيضاء موحدة.</p>"
    },
    guess: {
      titleEn: "🔐 Guess (Mastermind)", titleAr: "🔐 استنتاج الشفرة (ماسترمايند)",
      domainEn: "Information Theory & Entropy Reduction", domainAr: "نظرية المعلومات وتقليص الاحتمالات",
      descEn: "Crack the secret color permutation by minimizing Shannon entropy per query.",
      descAr: "اكشف شفرة الألوان السرية بأقل عدد من المحاولات عبر تحليل دبابيس التطابق.",
      leftAr: "🎨 وضع لون", rightAr: "🔒 تثبيت اللون", middleAr: "مسح",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> نظرية المعلومات وتقليص فضاء الاحتمالات.</p><p>اختر صفاً من الألوان واضغط إرسال:<br>• الدبوس الأسود يعني لوناً صحيحاً في المكان الصحيح.<br>• الدبوس الأبيض يعني لوناً صحيحاً في المكان الخاطئ.</p>"
    },
    flood: {
      titleEn: "🌊 Flood (Percolation)", titleAr: "🌊 الفيضان اللوني (الترشيح البياني)",
      domainEn: "Graph Percolation & Greedy Search", domainAr: "الترشيح البياني وأقصر مسار لوني",
      descEn: "Unify the entire grid into a single color component within the minimum step bound.",
      descAr: "وحّد الشبكة بأكملها إلى لون واحد خلال الحد الأقصى المسموح به من الخطوات.",
      leftAr: "🎨 غمر باللون المختار", rightAr: "غمر لوني", middleAr: "غمر",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> توسيع المكونات المتصلة والترشيح على الشبكات.</p><p>انقر على أي لون لتغيير لون منطقة الزاوية العليا اليسرى وضم جميع الخلايا المجاورة التي تحمل نفس اللون، حتى تتوحد اللوحة بلون واحد قبل انتهاء العدد المسموح من الحركات.</p>"
    },
    fifteen: {
      titleEn: "🔢 Fifteen (Sliding Parity)", titleAr: "🔢 لغز الـ 15 (التباديل الزوجية)",
      domainEn: "Alternating Group A₁₅ & Parity", domainAr: "الزمرة المتناوبة والتكافؤ التبديلي",
      descEn: "Order the sliding permutation matrix using even permutation cycles.",
      descAr: "رتب الأرقام تصاعدياً من 1 إلى 15 عبر تحريك القطع نحو الفراغ.",
      leftAr: "🔢 تحريك القطعة", rightAr: "تحريك القطعة", middleAr: "تحريك",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> الزمرة المتناوبة $A_{15}$ وتكافؤ التباديل.</p><p>انقر على أي قطعة في نفس صف أو عمود المربع الفارغ لإزاحتها، حتى تترتب الأرقام بالتسلسل من 1 إلى 15.</p>"
    },
    sixteen: {
      titleEn: "🔄 Sixteen (Toroidal Shift)", titleAr: "🔄 الإزاحة الحلقية (الـ 16)",
      domainEn: "Cyclic Permutations & Commutators", domainAr: "التباديل الدورية والمبدلات الجبرية",
      descEn: "Restore matrix order using cyclic row and column permutations without a blank space.",
      descAr: "رتب مصفوفة الأرقام عبر الإزاحة الدورية للصفوف والأعمدة دون وجود مربع فارغ.",
      leftAr: "🔄 إزاحة الصف / العمود", rightAr: "إزاحة عكسية", middleAr: "إزاحة",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> المبدلات الجبرية $[A, B] = ABA^{-1}B^{-1}$ في زمر التباديل.</p><p>انقر على أسهم الحواف لإزاحة صف أو عمود كامل بشكل دائري حتى تعود الأرقام إلى ترتيبها الصحيح.</p>"
    },
    twiddle: {
      titleEn: "🌀 Twiddle (Block Rotations)", titleAr: "🌀 تدوير الكتل (تويدل)",
      domainEn: "Rotation Groups & Matrix Sorting", domainAr: "زمر الدوران وترتيب المصفوفات",
      descEn: "Sort a numerical matrix by rotating overlapping k×k sub-matrices.",
      descAr: "رتب مصفوفة الأرقام تصاعدياً عبر تدوير المربعات الفرعية المتداخلة.",
      leftAr: "↺ تدوير الكتلة لليسار", rightAr: "↻ تدوير الكتلة لليمين", middleAr: "تدوير",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> زمر التباديل المتولدة من دورانات المصفوفات الفرعية.</p><p>انقر لتدوير كتلة مربعة من الأرقام عكس عقارب الساعة (أو مع عقارب الساعة بالنقر الأيمن) حتى تترتب الأرقام تصاعدياً.</p>"
    },
    pegs: {
      titleEn: "📍 Pegs (Peg Solitaire)", titleAr: "📍 سوليتير الأوتاد (بيغز)",
      domainEn: "Resource Invariants & Backtracking", domainAr: "اللامتغيرات الرياضية والتراجع",
      descEn: "Jump pegs orthogonally to reduce the board to a single remaining peg.",
      descAr: "اقفز بالأوتاد فوق بعضها أفقياً أو رأسياً لإزالتها حتى يتبقى وتد واحد فقط.",
      leftAr: "📍 سحب الوتد للقفز", rightAr: "تحديد الوتد", middleAr: "قفز",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> دوال الباغودا (Pagoda Invariants) وحساب التكافؤ.</p><p>اسحب أي وتد للقفز فوق وتد مجاور إلى حفرة فارغة خلفه مباشرة، مما يزيل الوتد المقفوز فوقه. الهدف هو إبقاء وتد واحد فقط على اللوحة!</p>"
    },
    samegame: {
      titleEn: "🧱 Same Game (Cluster Clear)", titleAr: "🧱 تصفية المجموعات (سيم جيم)",
      domainEn: "Connected Components & Optimization", domainAr: "المكونات المتصلة وتعظيم النقاط",
      descEn: "Clear monochromatic connected components to maximize quadratic cluster scoring.",
      descAr: "احذف المجموعات اللونية المتصلة لتفريغ الشبكة وتحقيق أعلى مجموع تربيعي للنقاط.",
      leftAr: "🧱 تحديد / حذف المجموعة", rightAr: "تحديد المجموعة", middleAr: "حذف",
      rulesAr: "<p><strong>المفهوم الرياضي:</strong> التحسين التوافقي ودالة النقاط التربيعية $(n-2)^2$.</p><p>انقر على أي كتلة مكونة من مربعين متجاورين أو أكثر من نفس اللون لإزالتها، فتهبط الكتل العلوية وتندمج الأعمدة.</p>"
    }
  };
  window.__EDUGATES_PUZZLE_I18N__ = PUZZLE_I18N;

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
      btn.textContent = soundEnabled ? (isAr() ? "🔊 الصوت" : "🔊 Sound") : (isAr() ? "🔇 صامت" : "🔇 Muted");
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
    if (totalStars >= 90) { rankTitle = isAr() ? "أستاذ بوابات التعليم الأعظم" : "Edugates Grandmaster"; nextThreshold = 123; }
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

  var lastVictoryResult = null;
  function renderVictoryBannerContent(res) {
    var banner = document.getElementById("sb-victory-banner");
    if (!banner || !res) return;
    var starsStr = "";
    for (var i = 0; i < 3; i++) {
      starsStr += (i < res.stars) ? "★" : "☆";
    }
    var activeTeam = teamsState.teams[teamsState.activeIdx] || teamsState.teams[0];
    var dispTeam = getTeamDisplayName(activeTeam);
    var recBadge = res.isNewRecord
      ? (' <span style="color:#10b981;font-size:0.72rem">' + (isAr() ? '🔥 رقم قياسي!' : '🔥 RECORD!') + '</span>')
      : '';
    banner.innerHTML =
      '<div class="sb-victory-stars">' + starsStr + '</div>' +
      '<div class="sb-victory-title">' + (isAr() ? '🎉 استنتاج رياضي رائع!' : '🎉 Excellent Deduction!') + '</div>' +
      '<div style="font-size:0.86rem;color:var(--text-muted)">' + (isAr() ? 'اكتمل مختبر فريق الرياضيات والعلوم — مدارس بوابات التعليم العالمية' : 'Edugates Math-Science Team Workbench Completed') + '</div>' +
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
        triggerVictoryConfetti();
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
      btn.textContent = next === "day"
        ? (isAr() ? "🌙 الوضع الداكن" : "🌙 Dark Board")
        : (isAr() ? "☀️ الوضع الفاتح" : "☀️ Light Board");
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
    }
    var penToggleBtn = document.getElementById("sb-pen-toggle");
    if (penToggleBtn) {
      penToggleBtn.textContent = isAr() ? "🖊️ القلم" : "🖊️ Pen";
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
      soundBtn.textContent = soundEnabled ? (isAr() ? "🔊 الصوت" : "🔊 Sound") : (isAr() ? "🔇 صامت" : "🔇 Muted");
      soundBtn.title = "Toggle Smartboard Sound Effects";
      soundBtn.onclick = window.toggleEdugatesSound;
      topActions.insertBefore(soundBtn, topActions.firstChild);
    }
    ensureLangToggleBtn();

    var timerPill = document.querySelector(".sb-timer-pill");
    if (timerPill && timerPill.parentNode) {
      if (!document.getElementById("sb-moves-display")) {
        var movesPill = document.createElement("div");
        movesPill.className = "sb-moves-pill";
        movesPill.innerHTML = '<span id="sb-moves-label">' + (isAr() ? '🎯 الحركات:' : '🎯 Moves:') + '</span><span id="sb-moves-display">0</span>';
        timerPill.parentNode.appendChild(movesPill);
      }
      if (!document.getElementById("sb-best-display")) {
        var bestPill = document.createElement("div");
        bestPill.className = "sb-best-pill";
        bestPill.title = "Personal / Class Best Solve Time";
        bestPill.innerHTML = '<span id="sb-best-label">' + (isAr() ? '🏆 الأفضل:' : '🏆 Best:') + '</span><span id="sb-best-display">—</span>';
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
        if (zoomGroup) zoomGroup.insertBefore(palBar, zoomGroup.firstChild);
      }

      // Inject Team Scoreboard Toggle & Dock Swap Button
      if (zoomGroup) {
        var teamToggle = document.createElement("button");
        teamToggle.type = "button";
        teamToggle.id = "sb-team-toggle-btn";
        teamToggle.className = "eis-btn" + (teamsState.open ? " is-active" : "");
        teamToggle.textContent = isAr() ? "🏆 الفرق" : "🏆 Teams";
        teamToggle.title = "Toggle Classroom 4-Team Scoreboard";
        teamToggle.onclick = window.toggleClassroomTeamBar;
        zoomGroup.appendChild(teamToggle);

        var dockSwap = document.createElement("button");
        dockSwap.type = "button";
        dockSwap.id = "sb-dock-swap-btn";
        dockSwap.className = "eis-btn";
        dockSwap.textContent = currentDockSide === "left"
          ? (isAr() ? "➡️ اللوحة يميناً" : "➡️ Dock Right")
          : (isAr() ? "⬅️ اللوحة يساراً" : "⬅️ Dock Left");
        dockSwap.title = "Move Control Dock to Left or Right Side of Smartboard";
        dockSwap.onclick = window.toggleDockSide;
        zoomGroup.appendChild(dockSwap);

        // Build 🛠️ More Tools Popover
        var moreWrap = document.createElement("div");
        moreWrap.id = "sb-more-wrap";
        moreWrap.className = "sb-more-wrap";

        var moreBtn = document.createElement("button");
        moreBtn.type = "button";
        moreBtn.id = "sb-more-btn";
        moreBtn.className = "eis-btn";
        moreBtn.textContent = isAr() ? "🛠️ أدوات ▾" : "🛠️ Tools ▾";
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
          presetLabel.title = isAr() ? "حجم الشبكة ومستوى الصعوبة" : "Size / Difficulty Preset";
        }

        // Move secondary buttons + Manual link into popover so topbars fit on 1 row
        var manualLink = topActions ? topActions.querySelector("a[href^='doc/']") : null;
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
        zoomGroup.appendChild(moreWrap);
      }

      // 3. Safe Solve Confirmation Guard
      var solveBtn = document.getElementById("solve");
      if (solveBtn) {
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
        if (descEl) descEl.textContent = isAr() ? pDict.descAr : pDict.descEn;
        if (domEl) domEl.textContent = isAr() ? pDict.domainAr : pDict.domainEn;
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
      {
        icon: "🌟",
        title: isAr() ? "البديهية الأولى" : "First Axiom",
        desc: isAr() ? "أكمل أول مختبر ألغاز لفريق الرياضيات والعلوم." : "Complete your first Math-Science puzzle workbench.",
        unlocked: summary.solvedPuzzlesCount >= 1
      },
      {
        icon: "⚡",
        title: isAr() ? "تكتيكي السرعة" : "Speed Tactician",
        desc: isAr() ? "حل أي مختبر في أقل من 60 ثانية." : "Solve any workbench in under 60 seconds.",
        unlocked: hasFastSolve
      },
      {
        icon: "🌉",
        title: isAr() ? "عالم نظرية البيانات" : "Graph Theorist",
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في نظرية البيانات والطوبولوجيا." : "Master 3+ Graph Theory & Topology workbenches.",
        unlocked: countSolvedInList(["bridges","slant","net","loopy","untangle","map","pearl","tracks","signpost","netslide"]) >= 3
      },
      {
        icon: "🔢",
        title: isAr() ? "بارع الجبر والمربعات" : "Algebra Virtuoso",
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في المربعات اللاتينية والجبر المجرد." : "Master 3+ Latin Squares & Abstract Algebra labs.",
        unlocked: countSolvedInList(["towers","solo","keen","unequal","group","singles"]) >= 3
      },
      {
        icon: "🔬",
        title: isAr() ? "فيزيائي البصريات والكم" : "Quantum Physicist",
        desc: isAr() ? "أتقن 3 مختبرات أو أكثر في البصريات والقطبية والهندسة الفراغية." : "Master 3+ Ray Optics, Polarity & 3D Geometry labs.",
        unlocked: countSolvedInList(["lightup","blackbox","undead","magnets","inertia","cube","galaxies"]) >= 3
      },
      {
        icon: "🧮",
        title: isAr() ? "خبير التوافقيات" : "Combinatorialist",
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
        title: isAr() ? "الأستاذ الأعظم للأولمبياد" : "Olympiad Grandmaster",
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
      schoolNameEl.textContent = isAr() ? "مدارس بوابات التعليم العالمية" : "Edugates International School";
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
      soundBtn.textContent = soundEnabled ? (isAr() ? "🔊 الصوت" : "🔊 Sound") : (isAr() ? "🔇 صامت" : "🔇 Muted");
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
      themeBtn.textContent = isDay
        ? (isAr() ? "🌙 الوضع الداكن" : "🌙 Dark Board")
        : (isAr() ? "☀️ الوضع الفاتح" : "☀️ Light Board");
    }
    var hubManualLink = document.querySelector(".eis-topbar-actions a[href='doc/index.html']");
    if (hubManualLink) {
      hubManualLink.textContent = isAr() ? "📖 الدليل" : "📖 Manual";
    }
    var fsBtn = document.querySelector("button[onclick*='toggleSmartboardFullscreen']");
    if (fsBtn) {
      fsBtn.textContent = isAr() ? "⛶ ملء الشاشة" : "⛶ Fullscreen";
    }

    // 2. Portal Hub (index.html) Localization
    var grid = document.getElementById("puzzleGrid");
    if (grid) {
      var goldPill = document.querySelector(".hub-hero-badges .hub-pill-gold");
      var tealPill = document.querySelector(".hub-hero-badges .hub-pill-teal");
      if (goldPill) {
        goldPill.textContent = isAr()
          ? "مدارس بوابات التعليم العالمية • فريق الرياضيات والعلوم"
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
          ? "<strong>مدارس بوابات التعليم العالمية — فريق الرياضيات والعلوم</strong> • بوابة المنطق والرياضيات المتقطعة للسبورة الذكية • مصممة لشاشات الفصول التفاعلية"
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
      document.title = (isAr() ? pDict.titleAr : pDict.titleEn) + " | " + (isAr() ? "مدارس بوابات التعليم العالمية" : "Edugates International School Math-Science Team");

      var homeLink = document.querySelector(".eis-topbar a[href='index.html'].eis-btn");
      if (homeLink) homeLink.textContent = isAr() ? "🏠 الرئيسية" : "🏠 Hub";

      var labSelect = document.getElementById("sb-quick-lab-select");
      if (labSelect) populateQuickLabSwitcher(labSelect, puzzleId);

      var movesLbl = document.querySelector(".sb-moves-pill span:first-child");
      if (movesLbl) movesLbl.textContent = isAr() ? "🎯 الحركات:" : "🎯 Moves:";
      var bestLbl = document.querySelector(".sb-best-pill span:first-child");
      if (bestLbl) bestLbl.textContent = isAr() ? "🏆 الأفضل:" : "🏆 Best:";
      var penBtn = document.getElementById("sb-pen-toggle");
      if (penBtn) penBtn.textContent = isAr() ? "🖊️ القلم" : "🖊️ Pen";

      // Secondary Actionbar Buttons
      var actMap = {
        "new": { en: "🆕 New Game", ar: "🆕 لعبة جديدة" },
        "restart": { en: "🔄 Restart", ar: "🔄 إعادة البدء" },
        "undo": { en: "↩️ Undo", ar: "↩️ تراجع" },
        "redo": { en: "↪️ Redo", ar: "↪️ إعادة" },
        "solve": { en: "💡 Solve", ar: "💡 الحل" },
        "specific": { en: "🎯 Enter Game ID", ar: "🎯 إدخال رقم اللغز (ID)" },
        "random": { en: "🎲 Enter Random Seed", ar: "🎲 إدخال بذرة عشوائية (Seed)" },
        "prefs": { en: "⚙️ Puzzle Preferences", ar: "⚙️ إعدادات اللغز" },
        "save": { en: "💾 Download Save File", ar: "💾 حفظ التقدم في ملف" },
        "load": { en: "📂 Upload Save File", ar: "📂 تحميل ملف محفوظ" },
        "sb-team-toggle-btn": { en: "🏆 Teams", ar: "🏆 الفرق" },
        "sb-more-btn": { en: "🛠️ Tools ▾", ar: "🛠️ أدوات ▾" },
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

  document.addEventListener("DOMContentLoaded", function () {
    if (document.body && document.body.classList.contains("puzzle-page")) {
      upgradePuzzleWorkspaceUI();
    } else {
      initHubPortalEnhancements();
    }
    applyEdugatesLanguage();
  });
})();
