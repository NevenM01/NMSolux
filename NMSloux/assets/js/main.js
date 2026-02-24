/**
 * NMSloux — main script
 * Header scroll, mobile menu, scroll animations, footer year
 */
(function () {
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector(".nav");
  const animated = document.querySelectorAll("[data-animate]");
  const yearEl = document.querySelector("[data-year]");

  // --- Header: add class on scroll ---
  function onScroll() {
    if (window.scrollY > 20) header?.classList.add("is-scrolled");
    else header?.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // --- Scroll reveal (Intersection Observer) ---
  if (animated.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { rootMargin: "0px 0px -40px 0px", threshold: 0.1 }
    );
    animated.forEach(function (el, i) {
      if (el.closest(".hero")) return; // hero animira se pri učitavanju
      if (i < 8) {
        const delay = i % 6;
        if (delay) el.classList.add("delay-" + delay);
      }
      observer.observe(el);
    });
  }

  // --- Footer year ---
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Hero: reveal on load with stagger ---
  const heroAnimate = document.querySelectorAll(".hero [data-animate]");
  if (heroAnimate.length) {
    heroAnimate.forEach(function (el, i) {
      el.classList.add("delay-" + (i + 1));
      setTimeout(function () {
        el.classList.add("is-visible");
      }, 80 + i * 60);
    });
  }
})();
