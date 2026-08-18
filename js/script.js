// ============================================
// Easter egg for anyone peeking at devtools
// ============================================
console.log(
  "%cstill here? %cthe merged PR is real: github.com/arkorlab/arkor/issues/199",
  "color:#9caf60; font-family:monospace; font-size:14px;",
  "color:#d8cfb4; font-family:monospace; font-size:12px;"
);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================
// INTRO SEQUENCE
// ============================================
(function initIntro() {
  const intro = document.getElementById("intro");
  const typedLine = document.getElementById("typedLine");
  const enterBtn = document.getElementById("enterBtn");
  const message = "thanks for stopping by.";

  function finishIntro() {
    intro.classList.add("hidden");
    document.body.style.overflow = "";
    setTimeout(() => intro.remove(), 900);
  }

  if (prefersReducedMotion) {
    typedLine.textContent = message;
    enterBtn.classList.add("visible");
  } else {
    document.body.style.overflow = "hidden";
    let i = 0;
    function typeChar() {
      if (i < message.length) {
        typedLine.textContent += message.charAt(i);
        i++;
        setTimeout(typeChar, 42);
      } else {
        enterBtn.classList.add("visible");
      }
    }
    setTimeout(typeChar, 500);
  }

  enterBtn.addEventListener("click", finishIntro);

  // allow Enter/Space or scroll to skip
  window.addEventListener(
    "keydown",
    (e) => {
      if (!intro.classList.contains("hidden") && (e.key === "Enter" || e.key === " ")) {
        finishIntro();
      }
    },
    { once: false }
  );

  let skipped = false;
  window.addEventListener(
    "wheel",
    () => {
      if (!skipped && !intro.classList.contains("hidden")) {
        skipped = true;
        finishIntro();
      }
    },
    { passive: true }
  );
})();

// ============================================
// SPINE NAV — active section highlight
// ============================================
(function initSpineNav() {
  const links = document.querySelectorAll(".spine-link");
  const sections = document.querySelectorAll(".section");

  if (!links.length || !sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          links.forEach((link) => {
            link.classList.toggle("active", link.dataset.target === id);
          });
        }
      });
    },
    { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
  );

  sections.forEach((section) => observer.observe(section));
})();

// ============================================
// SCROLL REVEALS
// ============================================
(function initReveals() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (prefersReducedMotion) {
    revealEls.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
})();

// ============================================
// ANIMATED COUNTERS
// ============================================
(function initCounters() {
  const counters = document.querySelectorAll(".number-value");
  if (!counters.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();

// ============================================
// PROJECT CARD EXPAND / COLLAPSE
// ============================================
(function initProjectToggles() {
  const toggles = document.querySelectorAll(".project-toggle");

  toggles.forEach((btn) => {
    const body = document.getElementById(btn.getAttribute("aria-controls"));

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));

      if (isOpen) {
        body.style.maxHeight = null;
      } else {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  // recalc on resize in case text reflows
  window.addEventListener("resize", () => {
    toggles.forEach((btn) => {
      const body = document.getElementById(btn.getAttribute("aria-controls"));
      if (btn.getAttribute("aria-expanded") === "true") {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
})();