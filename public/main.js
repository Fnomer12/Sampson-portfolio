// =====================
// Basic UI
// =====================
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

menuBtn?.addEventListener("click", () => mobileMenu.classList.toggle("open"));
mobileMenu?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => mobileMenu.classList.remove("open"));
});

// Contact (front-end only)
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (formStatus) formStatus.textContent = "✅ Message prepared. (I can wire this to a real Node email endpoint.)";
  contactForm.reset();
});

// CV link stub
document.getElementById("downloadCV")?.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Add /public/cv.pdf then link it here (example: window.open('/cv.pdf')).");
});

// =====================
// GSAP: Hero + Reveals
// =====================
gsap.registerPlugin(ScrollTrigger);

const hero = document.getElementById("scrollHero");
const portraitWrap = document.getElementById("portraitWrap");
const portrait = document.getElementById("portrait");
const badge = document.getElementById("portraitBadge");
const navAvatar = document.getElementById("navAvatar");

if (hero && portraitWrap && portrait) {
  const chip = document.querySelector(".heroCopy .chip");
  const title = document.querySelector(".heroCopy .heroTitle");
  const sub = document.querySelector(".heroCopy .heroSub");
  const cta = document.querySelector(".heroCopy .ctaRow");
  const meta = document.querySelector(".heroCopy .metaRow");
  const stats = document.querySelector(".heroCopy .quickStats");

  // start hidden + blur
  gsap.set([chip, title, sub, cta, meta, stats], {
    opacity: 0,
    y: 18,
    filter: "blur(8px)"
  });
  if (badge) gsap.set(badge, { opacity: 0, y: 10, filter: "blur(6px)" });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "+=1500",
      scrub: 0.9,
      pin: true,
      anticipatePin: 1
    }
  });

  // portrait: cinematic -> “engineer profile”
  tl.to(portrait, { scale: 1.03, duration: 1.0, ease: "power2.out" }, 0);
  tl.to(
    portraitWrap,
    { x: -120, y: 20, rotate: -3, scale: 0.78, duration: 1.0, ease: "power3.out" },
    0
  );
  tl.to(portrait, { filter: "saturate(1.07) contrast(1.06)", duration: 1.0 }, 0.05);

  // reveal copy: blur -> sharp
  tl.to(chip,  { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, 0.12);
  tl.to(title, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }, 0.20);
  tl.to(sub,   { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, ease: "power2.out" }, 0.30);
  tl.to(cta,   { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, 0.42);
  tl.to(meta,  { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, 0.56);
  tl.to(stats, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, 0.66);

  if (badge) {
    tl.to(badge, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, 0.20);
    tl.to(badge, { x: 10, duration: 0.8, ease: "sine.out" }, 0.70);
  }

  // show navbar avatar after scroll begins
  ScrollTrigger.create({
    trigger: hero,
    start: "top top+=80",
    end: "bottom top",
    onEnter: () => {
      if (!navAvatar) return;
      navAvatar.style.display = "block";
      gsap.fromTo(navAvatar, { opacity: 0, y: -8, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.22, ease: "power2.out" });
    },
    onLeaveBack: () => {
      if (!navAvatar) return;
      gsap.to(navAvatar, { opacity: 0, y: -8, scale: 0.92, duration: 0.18, onComplete: () => (navAvatar.style.display = "none") });
    }
  });

  // section reveals
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 22, filter: "blur(8px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 86%",
          toggleActions: "play none none reverse"
        }
      }
    );
  });
}

// =====================
// Coverflow (3D swipe like your screenshot)
// =====================
(() => {
  const track = document.getElementById("cfTrack");
  if (!track) return;

  const cards = Array.from(track.querySelectorAll(".cfCard"));
  const btnPrev = document.getElementById("cfPrev");
  const btnNext = document.getElementById("cfNext");
  const idxEl = document.getElementById("cfIndex");
  const totalEl = document.getElementById("cfTotal");

  let index = 0;
  let dragStartX = 0;
  let isDragging = false;
  let dragDX = 0;

  if (totalEl) totalEl.textContent = String(cards.length);

  function clampIndex(i) {
    const n = cards.length;
    return (i % n + n) % n;
  }

  function render(extraOffset = 0) {
    const n = cards.length;
    const center = index;

    if (idxEl) idxEl.textContent = String(center + 1);

    cards.forEach((card, i) => {
      let d = i - center;
      if (d > n / 2) d -= n;
      if (d < -n / 2) d += n;

      const d2 = d + extraOffset;

      // tuning knobs (match your sample look)
      const x = d2 * 260;
      const z = -Math.abs(d2) * 260;
      const rotY = d2 * -22;
      const scale = 1 - Math.min(Math.abs(d2) * 0.10, 0.28);
      const y = Math.min(Math.abs(d2) * 16, 34);

      const opacity = 1 - Math.min(Math.abs(d2) * 0.22, 0.75);
      const blur = Math.min(Math.abs(d2) * 2.2, 6);

      card.style.opacity = String(opacity);
      card.style.filter = `blur(${blur}px)`;
      card.style.pointerEvents = Math.abs(d2) < 0.6 ? "auto" : "none";
      card.style.zIndex = String(1000 - Math.round(Math.abs(d2) * 10));

      card.style.transform =
        `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) rotateY(${rotY}deg) rotateZ(${d2 * 1.2}deg) scale(${scale}) translateY(${y}px)`;
    });
  }

  function goNext() {
    index = clampIndex(index + 1);
    render(0);
  }

  function goPrev() {
    index = clampIndex(index - 1);
    render(0);
  }

  btnNext?.addEventListener("click", goNext);
  btnPrev?.addEventListener("click", goPrev);

  const viewport = document.getElementById("cfViewport");

  function onDown(clientX) {
    isDragging = true;
    dragStartX = clientX;
    dragDX = 0;
  }

  function onMove(clientX) {
    if (!isDragging) return;
    dragDX = clientX - dragStartX;
    const offset = dragDX / 260; // matches x spacing
    render(-offset);
  }

  function onUp() {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 90;
    if (dragDX < -threshold) goNext();
    else if (dragDX > threshold) goPrev();
    else render(0);
  }

  viewport?.addEventListener("mousedown", (e) => onDown(e.clientX));
  window.addEventListener("mousemove", (e) => onMove(e.clientX));
  window.addEventListener("mouseup", onUp);

  viewport?.addEventListener("touchstart", (e) => onDown(e.touches[0].clientX), { passive: true });
  viewport?.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX), { passive: true });
  viewport?.addEventListener("touchend", onUp);

  viewport?.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") goNext();
    if (e.key === "ArrowLeft") goPrev();
  });

  render(0);
})();




// =========================
// Social Dock: macOS magnify + scroll entrance (STATIC icons)
// =========================
(() => {
    const viewport = document.getElementById("socialDockViewport");
    const track = document.getElementById("socialDockTrack");
    if (!viewport || !track) return;
  
    const items = Array.from(track.querySelectorAll(".dockItem"));
    const imgs = items.map((a) => a.querySelector("img")).filter(Boolean);
  
    // magnify like macOS Dock
    viewport.addEventListener("mousemove", (e) => {
      const rect = viewport.getBoundingClientRect();
      const mx = e.clientX - rect.left;
  
      items.forEach((item) => {
        const r = item.getBoundingClientRect();
        const cx = (r.left - rect.left) + r.width / 2;
  
        const dist = Math.abs(mx - cx);
        const influence = Math.max(0, 1 - dist / 220); // range of effect
        const scale = 1 + influence * 0.95;            // max ~1.95
  
        const img = item.querySelector("img");
        if (img) img.style.transform = `scale(${scale.toFixed(3)})`;
      });
    });
  
    viewport.addEventListener("mouseleave", () => {
      imgs.forEach((img) => (img.style.transform = "scale(1)"));
    });
  
    // scroll entrance animation
    const wrap = document.querySelector(".socialDockWrap");
    if (wrap) {
      gsap.fromTo(
        wrap,
        { opacity: 0, y: 18, filter: "blur(10px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }
  })();