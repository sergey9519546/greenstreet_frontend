/* ============================================================
   Greenstreet Finance — Frontend Controller
   GSAP-powered scroll animations + content injection
   ============================================================ */

(function () {
  const API_BASE = ""; // same-origin
  const state = { stepIndex: 0 };

  // ---------- Helpers ----------
  async function fetchJSON(path) {
    try {
      const res = await fetch(API_BASE + path);
      if (!res.ok) throw new Error("Network response was not ok: " + res.status);
      return await res.json();
    } catch (err) {
      console.warn("[GSF] Fallback for " + path + ":", err.message);
      return null;
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ---------- Data: Bundled fallback (same shape as /api/* responses) ----------
  const bundledLogos = [
    "Cake Mortgage", "Kiavi", "Lima One Capital", "Newfi Wholesale",
    "Angel Oak MS", "A&D Mortgage", "Balance Point", "Visio Lending",
    "CoreVest", "RCN Capital", "AHL Funding", "PeerStreet",
    "LendingOne", "Taberna Capital", "Tactile Lending", "Deephaven",
    "Roc Capital", "Condor Capital", "Aria Capital", "Citadel",
    "Swell Capital", "North Coast", "Pace Equity", "BPS Capital",
    "Verus Mortgage"
  ];
  const bundledTestimonials = [
    {
      quote: "Greenstreet surfaced a 1.42 DSCR pass and matched us to three lenders inside 60 seconds. We stopped running parallel Excel models the same week.",
      author: "Marcos Vela", role: "Managing Partner", company: "Vela Capital"
    },
    {
      quote: "The Dual-Track engine saved a deal I would have killed. Track 1 qualified; Track 2 caught a 12% vacancy I had missed. We repriced and closed.",
      author: "Priya Ramachandran", role: "Director of Underwriting", company: "Northshore Non-QM"
    },
    {
      quote: "I underwrite 40+ DSCR files a month. Greenstreet's STR legality gate and AirDNA integration eliminated an entire manual review pass.",
      author: "Devon Larkin", role: "Head of Originations", company: "Larkin Realty Partners"
    },
    {
      quote: "Lender matching against Cake, Kiavi, Lima One and Newfi in one screen is the productivity unlock our brokers needed. Quotes per loan went from 2 to 5.",
      author: "Sasha Okafor", role: "Broker Owner", company: "Okafor Wholesale"
    },
    {
      quote: "The reserves and DSCR cash-flow stress test are sharper than our internal credit policy. We use Greenstreet as the second pair of eyes.",
      author: "Beatrice Hahn", role: "Chief Credit Officer", company: "Hahn Capital Markets"
    },
    {
      quote: "Foreign national ITIN borrower flow used to take a week. Greenstreet matched us to a specialty lender in under three minutes.",
      author: "Rafael Quintero", role: "Principal", company: "Quintero & Co."
    }
  ];
  const bundledSteps = [
    {
      eyebrow: "Underwriting",
      title: "Dual-Track DSCR, computed correctly",
      body: "Every property runs through Track 1 (Lender Qualification DSCR on PITIA / ITIA, market rent, no vacancy) and Track 2 (Investor Survival DSCR on actual cash flow with vacancy, management fees, and CapEx). The two tracks never blend — what qualifies you is not always what keeps you alive.",
      metric: "1.42"
    },
    {
      eyebrow: "Lender Matching",
      title: "60+ non-QM programs, one matrix",
      body: "Stop running five portals. Greenstreet ingests each lender's matrix and returns ranked matches based on DSCR, FICO, LTV, property type, entity vesting, and reserves. Programs update nightly so your quotes reflect today's pricing, not last quarter's.",
      metric: "60+"
    },
    {
      eyebrow: "Dual-Track DSCR",
      title: "Never blend qualification with survival",
      body: "Track 1 uses the appraiser's market rent with no vacancy deduction. Track 2 applies vacancy, management fees, maintenance, and CapEx to model real-world cash flow. Greenstreet always shows both — a deal that passes Track 1 but fails Track 2 qualifies but doesn't perform.",
      metric: "1.18"
    },
    {
      eyebrow: "Reserves & Assets",
      title: "Full borrower profile, computed automatically",
      body: "Personal liquidity, cross-collateral reserves, business funds, gift funds, seasoned seasoning — every reserve source matched to every lender's matrix. Borrower experience tiers and entity vesting rules (LLC, partnership, layered LLC up to two layers) are computed automatically.",
      metric: "9.6×"
    },
    {
      eyebrow: "Privacy & Security",
      title: "Enterprise-grade, sovereign by default",
      body: "Borrower PII is tokenized at rest, encrypted in transit, and scoped per broker. SOC 2 Type II controls, GLBA-aligned handling, and per-org data isolation — so you can run multiple brokerages without leaking borrowers across books.",
      metric: "SOC 2"
    }
  ];
  const bundledCaseStudies = [
    {
      eyebrow: "Lender · Cake Mortgage",
      title: "Vela Capital scales 4× without adding underwriting headcount",
      text: "Vela Capital needed to pre-screen 120+ DSCR files a month across 8 brokers. Greenstreet's Dual-Track engine + lender matching cut decision time from 25 minutes to 6 minutes per file — without adding headcount.",
color: "mint"
    },
    {
      eyebrow: "Broker · Northshore Non-QM",
      title: "From 2 quotes per loan to 5 — same underwriting team",
      text: "Northshore's brokers now run one file through Greenstreet and see ranked matches across Cake, Kiavi, Lima One, and Newfi. Pipeline visibility went from scattered spreadsheets to a single ledger.",
      color: "lemon"
    },
    {
      eyebrow: "Investor · Quintero & Co.",
      title: "Killed 3 bad deals before appraisal — saved $14,800 in fees",
      text: "Quintero & Co. use Track 2 to surface real cash-flow risk. Three deals that would have failed post-appraisal were walked away from pre-appraisal, saving over $14,800 in hard cost.",
      color: "emerald"
    }
  ];
  const bundledValueItems = [
    { num: "01", title: "Dual-Track DSCR, computed correctly", body: "Track 1 (Lender Qualification) and Track 2 (Investor Survival) — both shown, never blended. See exactly where a deal qualifies versus where it performs." },
    { num: "02", title: "60+ non-QM programs, one matrix", body: "Lender matrices update nightly. DSCR floor, FICO floor, LTV cap, reserve rule, entity policy — matched against your file in seconds." },
    { num: "03", title: "STR legality gate & AirDNA", body: "STR income is gated by legality. AirDNA Rentalizer with a 20% occupancy haircut, 12-month coverage, market score ≥60, 2-per-bedroom occupancy." },
    { num: "04", title: "Foreign national & ITIN flow", body: "Non-QM specialty. Passport + visa/ESTA, OFAC screening, alternative credit (international reports, reference letters, foreign bank statements)." },
    { num: "05", title: "Entity vesting & layered LLCs", body: "U.S. domestic LLC / partnership / corporation. Up to two layered LLCs with 51% guarantor ownership. Full-recourse personal guarantees." },
    { num: "06", title: "Reserves & cross-collateral", body: "6+ months PITIA. Personal liquidity, business funds (with seasoning), cross-collateral from other REOs, gift funds where allowed." }
  ];
  const bundledBlog = [
    {
      eyebrow: "Greenstreet Guidance · Underwriting",
      title: "Why Track 1 vs Track 2 DSCR is the difference between qualifying and performing",
      text: "The two-track doctrine is the only way to model both lender approval and investor survival at once. Here's how we built it.",
      color: "mint"
    },
    {
      eyebrow: "Greenstreet Guidance · Lender Network",
      title: "Cake, Kiavi, Lima One, Newfi: how 4 lenders price the same DSCR deal differently",
      text: "Side-by-side pricing analysis on a real Atlanta duplex. The lender matrix isn't just about DSCR floor — it's about 14 other factors.",
      color: "lemon"
    },
    {
      eyebrow: "Greenstreet Guidance · STR",
      title: "AirDNA + a 20% haircut: how to underwrite STR without the lawsuits",
      text: "STR income is volatile and legally gated. Here's the underwriting approach that survives the regulator's call.",
      color: "emerald"
    }
  ];

  // ---------- Renderers ----------
  function renderTrustedLogos(logos) {
    const target = document.getElementById("trusted-logos");
    if (!target || !logos || !logos.length) return;
    const items = logos.map(l => `<span class="logo-item">${esc(l)}</span>`).join("");
    // Duplicate for seamless marquee
    target.innerHTML = `<div class="marquee-track">${items}</div><div class="marquee-track" aria-hidden="true">${items}</div>`;
  }

  function renderTestimonials(items) {
    const target = document.getElementById("testimonials-list");
    if (!target || !items || !items.length) return;
    target.innerHTML = items.map(t => {
      const initials = (t.author || "?").split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
      return `
        <article class="testimonial-card fade-up">
          <p class="testimonial-quote">"${esc(t.quote)}"</p>
          <div class="testimonial-author">
            <div class="testimonial-avatar">${esc(initials)}</div>
            <div class="testimonial-author-info">
              <div class="testimonial-name">${esc(t.author)}</div>
              <div class="testimonial-role">${esc(t.role)} · ${esc(t.company)}</div>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  function renderStepCards(cards) {
    const target = document.getElementById("step-cards");
    if (!target || !cards || !cards.length) return;
    target.innerHTML = cards.map((c, i) => `
      <article class="step-card fade-up" data-idx="${i}">
        <div class="step-card-visual">
          <span class="step-card-visual-number">${esc(c.metric || "0" + (i+1))}</span>
          <span class="step-card-visual-label">${esc(c.eyebrow)}</span>
        </div>
        <div class="step-card-content">
          <div class="step-card-eyebrow">${esc(c.eyebrow)}</div>
          <h3 class="step-card-title">${esc(c.title)}</h3>
          <p class="step-card-desc">${esc(c.body)}</p>
          <div>
            <a href="#${esc((c.eyebrow || '').toLowerCase().replace(/\W+/g, '-'))}" class="btn_main_wrap btn_secondary">
              <span class="btn_main_text">Learn more</span>
              <span class="btn-arrow-wrap">
                <svg width="16" height="16" viewBox="0 0 24 25" fill="none"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"/></svg>
              </span>
            </a>
          </div>
        </div>
      </article>
    `).join("");
  }

  function renderCaseStudies(items) {
    const target = document.getElementById("cs-grid");
    if (!target || !items || !items.length) return;
    target.innerHTML = items.map((c, i) => `
      <article class="cs-card fade-up" data-delay="${i + 1}">
        <div class="cs-card-visual">
          <div class="cs-card-eyebrow">${esc(c.eyebrow)}</div>
        </div>
        <div class="cs-card-content">
          <h3 class="cs-card-title">${esc(c.title)}</h3>
          <p class="cs-card-text">${esc(c.text)}</p>
          <a href="#case-studies" class="cs-card-link">
            <span>Read the case study</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6.95 1.47L12.82 7.34M6.92 11.82L11.4 7.34M11.95 6.7H0.38" stroke="currentColor" stroke-width="2"/></svg>
          </a>
        </div>
      </article>
    `).join("");
  }

  function renderValueItems(items) {
    const target = document.getElementById("value-list");
    if (!target || !items || !items.length) return;
    target.innerHTML = items.map((v) => `
      <div class="value-item fade-up">
        <div class="value-item-num">${esc(v.num)}</div>
        <div class="value-item-content">
          <h3>${esc(v.title)}</h3>
          <p>${esc(v.body)}</p>
        </div>
        <div class="value-item-visual"></div>
      </div>
    `).join("");
  }

  function renderBlog(items) {
    const target = document.getElementById("blog-list");
    if (!target || !items || !items.length) return;
    target.innerHTML = items.map((b, i) => `
      <article class="blog-card fade-up" data-delay="${i + 1}">
        <div class="blog-card-visual"></div>
        <div class="blog-card-content">
          <div class="blog-card-eyebrow">${esc(b.eyebrow)}</div>
          <h3 class="blog-card-title">${esc(b.title)}</h3>
          <p class="blog-card-text">${esc(b.text)}</p>
          <a href="#blog" class="blog-card-link">
            <span>Read article</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6.95 1.47L12.82 7.34M6.92 11.82L11.4 7.34M11.95 6.7H0.38" stroke="currentColor" stroke-width="2"/></svg>
          </a>
        </div>
      </article>
    `).join("");
  }

  // ---------- Tab interaction ----------
  function bindTabs() {
    const tabs = document.querySelectorAll(".step_tab_link");
    const cards = document.querySelectorAll("#step-cards .step-card");
    tabs.forEach((link) => {
      link.addEventListener("click", () => {
        const idx = Number(link.dataset.step);
        state.stepIndex = idx;
        tabs.forEach((l) => l.classList.remove("is-active"));
        link.classList.add("is-active");
        cards.forEach((c, i) => {
          c.style.opacity = i === idx ? "1" : "0.3";
          c.style.transform = i === idx ? "scale(1)" : "scale(0.98)";
          c.style.transition = "opacity .4s ease, transform .4s ease";
        });
        // Smooth scroll the active card into view
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
      });
    });
  }

  // ---------- Navbar scroll-reveal ----------
  function bindNavScroll() {
    const nav = document.querySelector(".nav_wrap");
    if (!nav) return;
    const update = () => {
      if (window.scrollY > 40) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // ---------- Hero text rotator ----------
  function startHeroRotator() {
    const rotator = document.querySelector(".hero-rotator");
    if (!rotator) return;
    const words = JSON.parse(rotator.dataset.rotator || rotator.dataset.words || "[]");
    if (!words.length) return;
    // Set explicit min-width to longest word for stable layout
    const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");
    rotator.style.minWidth = (longest.length + 1) + "ch";
    let idx = 0;
    rotator.innerHTML = words
      .map((w, i) => `<span class="hero-rotator-word ${i === 0 ? "is-active" : ""}">${esc(w)}</span>`)
      .join("");

    const cycle = () => {
      const all = rotator.querySelectorAll(".hero-rotator-word");
      const leaving = all[idx];
      // Step 1: fade out current word
      leaving.classList.remove("is-active");
      leaving.classList.add("is-leaving");
      // Step 2: after fade-out completes, fade in next word
      setTimeout(() => {
        leaving.classList.remove("is-leaving");
        idx = (idx + 1) % words.length;
        all[idx].classList.add("is-active");
      }, 480); // matches CSS transition duration
    };
    setInterval(cycle, 2400);
  }

  // ---------- SOA popup ----------
  function bindSOAPopup() {
    let popup = document.querySelector(".soa-popup");
    if (!popup) {
      popup = document.createElement("div");
      popup.className = "soa-popup";
      popup.innerHTML = `
        <div class="soa-popup-content">
          <button class="soa-popup-close" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" stroke-width="2"/>
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <div class="u-text-style-h5" style="color: var(--swatch--emerald); margin-bottom: 0.75rem;">SOVEREIGN OS</div>
          <h3>One system of action for the entire DSCR book</h3>
          <p>Greenstreet Finance runs on Sovereign OS — a single, audit-grade platform that pre-screens DSCR, matches non-QM lenders, computes dual-track ratios, and ships a tape-ready loan file. Every borrower, every matrix, every decision — tokenized and traceable.</p>
          <div>
            <a href="#book-demo" class="btn_main_wrap btn_primary" onclick="document.querySelector('.soa-popup').classList.remove('is-open');">
              <span class="btn_main_text">Book a demo</span>
              <span class="btn-arrow-wrap">
                <svg width="16" height="16" viewBox="0 0 24 25" fill="none"><path d="M17 19.5L15.6 18.05L19.15 14.5H7V12.5H19.15L15.6 8.95L17 7.5L23 13.5L17 19.5Z" fill="currentColor"/></svg>
              </span>
            </a>
          </div>
        </div>
      `;
      document.body.appendChild(popup);
}
    const close = () => popup.classList.remove("is-open");
    popup.querySelector(".soa-popup-close").addEventListener("click", close);
    popup.addEventListener("click", (e) => { if (e.target === popup) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    document.querySelectorAll('a[href="#soa"], .home-go-link').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        popup.classList.add("is-open");
      });
    });
  }

  // ---------- Mobile menu burger ----------
  function bindBurger() {
    const burger = document.querySelector(".burger-wrap");
    const menu = document.querySelector(".menu-mobile-wrap");
    if (!burger || !menu) return;
    const navLinks = document.querySelectorAll(".nav_links_wrap > .nav-link, .nav_links_wrap > .nav-btn, .nav_links_wrap > .nav_dropdown_component");
    // Clone the desktop nav into the mobile menu
    const mobileInner = document.createElement("div");
    mobileInner.className = "u-container";
    mobileInner.style.paddingTop = "1.5rem";
    const linksWrap = document.createElement("div");
    linksWrap.style.display = "flex";
    linksWrap.style.flexDirection = "column";
    linksWrap.style.gap = "0.5rem";
    navLinks.forEach((l) => {
      const clone = l.cloneNode(true);
      clone.style.display = "flex";
      linksWrap.appendChild(clone);
    });
    mobileInner.appendChild(linksWrap);
    menu.appendChild(mobileInner);

    burger.addEventListener("click", () => {
      const isOpen = burger.classList.toggle("is-open");
      menu.classList.toggle("is-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      burger.classList.remove("is-open");
      menu.classList.remove("is-open");
      document.body.style.overflow = "";
    }));
  }

  // ---------- Scroll fade-up via IntersectionObserver ----------
  function bindScrollAnimations() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll(".fade-up, .split-line").forEach(el => obs.observe(el));
  }

  // ---------- GSAP: How It Works horizontal pin (if GSAP available) ----------
  function initGSAPPin() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    const wrap = document.querySelector(".step_height");
    const track = document.querySelector(".step-cards-list");
    if (!wrap || !track) return;

    gsap.registerPlugin(ScrollTrigger);

    const cards = track.querySelectorAll(".step-card");
    const totalScroll = () => track.scrollWidth - track.clientWidth + 64;

    // Color transition timeline
    const colorStates = [
      { bg: "#003738", fg: "#ffffff" }, // dark
      { bg: "#4DBD97", fg: "#003738" }, // mint
      { bg: "#D8D958", fg: "#003738" }, // pistachio
      { bg: "#018582", fg: "#ffffff" }, // emerald
      { bg: "#004041", fg: "#ffffff" }  // rain forrest
    ];
    let lastBg = "";
    const scrub = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: () => `+=${totalScroll()}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const segs = colorStates.length - 1;
          const idx = Math.min(Math.floor(p * segs * 1.001), segs - 1);
          const next = Math.min(idx + 1, segs);
          const t = (p * segs) - idx;
          const a = colorStates[idx], b = colorStates[next];
          // Lerp colors
          const lerp = (x, y) => Math.round(x + (y - x) * t);
          const hex = (n) => n.toString(16).padStart(2, "0");
          const bg = "#" + hex(lerp(parseInt(a.bg.slice(1,3),16), parseInt(b.bg.slice(1,3),16)))
                          + hex(lerp(parseInt(a.bg.slice(3,5),16), parseInt(b.bg.slice(3,5),16)))
                          + hex(lerp(parseInt(a.bg.slice(5,7),16), parseInt(b.bg.slice(5,7),16)));
          if (bg !== lastBg) {
            wrap.style.background = bg;
            lastBg = bg;
          }
        }
      }
    });
    scrub.to(track, { x: () => -totalScroll(), ease: "none" });

    // Update active tab on scroll
    ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: () => `+=${totalScroll()}`,
      onUpdate: (self) => {
        const segs = cards.length;
        const idx = Math.min(Math.floor(self.progress * segs * 1.001), segs - 1);
        document.querySelectorAll(".step_tab_link").forEach((l, i) => {
          l.classList.toggle("is-active", i === idx);
        });
      }
    });
  }

  // ---------- GSAP: case study sticky color shifts ----------
  function initCaseStudySticky() {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
    const wrap = document.querySelector(".solution_wrap");
    const cards = document.querySelectorAll(".cs-card");
    if (!wrap || !cards.length) return;
    const bgPalette = [
      "#E8E9BF", // lemon
      "#EEEFD3", // lemon-lime
      "#D8D958"  // pistachio
    ];
    cards.forEach((card, i) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => gsap.to(wrap, { backgroundColor: bgPalette[i % bgPalette.length], duration: 0.6, ease: "power2.out" }),
        onEnterBack: () => gsap.to(wrap, { backgroundColor: bgPalette[i % bgPalette.length], duration: 0.6, ease: "power2.out" })
      });
    });
  }

  // ---------- Testimonial logo → headshot hover ----------
  function initLogoHover() {
    document.querySelectorAll(".testimonial_logo_card, .logo-item").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const name = el.textContent.trim();
        const initials = name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
        // Show a tooltip/headshot
        let tip = el.querySelector(":scope > .logo-headshot");
        if (!tip) {
          tip = document.createElement("span");
          tip.className = "logo-headshot";
          tip.innerHTML = `<span class="logo-headshot-avatar">${esc(initials)}</span><span class="logo-headshot-name">${esc(name)}</span>`;
          el.appendChild(tip);
        }
        tip.classList.add("is-visible");
      });
      el.addEventListener("mouseleave", () => {
        const tip = el.querySelector(":scope > .logo-headshot");
        if (tip) tip.classList.remove("is-visible");
      });
    });
  }

  // ---------- Value item hover reveals ----------
  function initValueHover() {
    // already styled in CSS — no extra work needed beyond fade-up
  }

  // ---------- Form submit ----------
  async function submitDemo(form) {
    const data = Object.fromEntries(new FormData(form).entries());
    const success = document.getElementById("hero-success");
    try {
      await fetch(API_BASE + "/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "website", createdAt: new Date().toISOString() })
      });
    } catch (e) {
      console.warn("[GSF] Lead submit offline:", e.message);
    }
    if (success) {
      success.hidden = false;
      setTimeout(() => (success.hidden = true), 6000);
    }
    form.reset();
  }
  window.GSF = { submitDemo };

  // ---------- Boot ----------
  async function boot() {
    // Footer year
    const y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();

    bindTabs();
    bindNavScroll();
    startHeroRotator();
    bindSOAPopup();
    bindBurger();
    bindScrollAnimations();
    initLogoHover();

    // Try API first, fall back to bundled
    const [logos, testimonials, steps, cases, value, blog] = await Promise.all([
      fetchJSON("/api/logos").catch(() => null),
      fetchJSON("/api/testimonials").catch(() => null),
      fetchJSON("/api/steps").catch(() => null),
      fetchJSON("/api/usecases").catch(() => null),
      fetchJSON("/api/value").catch(() => null),
      fetchJSON("/api/blog").catch(() => null)
    ]);

    renderTrustedLogos(logos || bundledLogos);
    renderTestimonials(testimonials || bundledTestimonials);
    renderStepCards(steps || bundledSteps);
    renderCaseStudies(cases || bundledCaseStudies);
    renderValueItems(value || bundledValueItems);
    renderBlog(blog || bundledBlog);

    // GSAP scroll (after layout settles)
    setTimeout(() => {
      initGSAPPin();
      initCaseStudySticky();
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
