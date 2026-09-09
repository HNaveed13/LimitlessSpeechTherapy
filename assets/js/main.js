/* ==========================================================================
   Limitless Speech & Language Therapy — interactions
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  var header = document.querySelector(".site-header");
  var tick = false;
  function onScroll() {
    if (header) header.classList.toggle("stuck", window.scrollY > 20);
  }
  window.addEventListener("scroll", function () {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { onScroll(); tick = false; });
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.querySelector(".mobile-menu");
  if (toggle && menu) {
    var links = menu.querySelectorAll("nav a");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.classList.toggle("open", open);
      menu.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("menu-open", open);
      links.forEach(function (a, i) {
        a.style.transitionDelay = open ? 90 + i * 60 + "ms" : "0ms";
      });
    }
    setMenu(false);
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false); toggle.focus();
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* stagger children of [data-stagger] */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 80;
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.hasAttribute("data-reveal")) child.style.setProperty("--d", i * step + "ms");
    });
  });

  /* ---------- Hero sound-field graphic (scroll-reactive) ---------- */
  var art = document.querySelector("[data-hero-art]");
  if (art) {
    var svgns = "http://www.w3.org/2000/svg";
    var waveG = art.querySelector(".ha-wave");
    var rings = art.querySelector(".ha-rings");
    var hero = document.querySelector(".hero");
    var bars = [];
    var N = 26, x0 = 78, span = 304, bw = 4.6, midY = 240;

    for (var b = 0; b < N; b++) {
      var rect = document.createElementNS(svgns, "rect");
      var x = x0 + b * (span / (N - 1));
      rect.setAttribute("x", (x - bw / 2).toFixed(1));
      rect.setAttribute("width", bw);
      rect.setAttribute("rx", (bw / 2).toFixed(1));
      if (b % 5 === 2) rect.setAttribute("class", "accent");
      waveG.appendChild(rect);
      bars.push(rect);
    }

    function setBar(r, h) {
      h = Math.max(4, h);
      r.setAttribute("height", h.toFixed(1));
      r.setAttribute("y", (midY - h / 2).toFixed(1));
    }
    function heroProgress() {
      if (!hero) return 0;
      return Math.min(1, Math.max(0, window.scrollY / (hero.offsetHeight * 0.85)));
    }

    if (reduce) {
      // static, pleasant arc — no motion
      bars.forEach(function (r, i) {
        setBar(r, 12 + 72 * Math.pow(Math.sin((i / (N - 1)) * Math.PI), 1.3));
      });
    } else {
      var running = true;
      function frame(t) {
        var p = heroProgress();
        if (rings) rings.style.transform = "scale(" + (1 + p * 0.16).toFixed(3) + ")";
        art.style.transform = "translateY(" + (p * 30).toFixed(1) + "px)";
        for (var i = 0; i < N; i++) {
          var phase = i * 0.5 + t / 620 + p * 7;
          var env = Math.pow(Math.sin((i / (N - 1)) * Math.PI), 0.6); // taper the ends
          var amp = (14 + (26 + 150 * p) * (0.5 + 0.5 * Math.sin(phase))) * (0.35 + 0.65 * env);
          setBar(bars[i], amp);
        }
        if (running) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
      // pause the loop while the hero is off-screen
      if ("IntersectionObserver" in window && hero) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && !running) { running = true; requestAnimationFrame(frame); }
            else if (!en.isIntersecting) { running = false; }
          });
        }, { threshold: 0 }).observe(hero);
      }
    }
  }

  /* ---------- Active section in nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = "#" + entry.target.id;
        navLinks.forEach(function (a) { a.classList.toggle("current", a.getAttribute("href") === id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function fieldOf(input) { return input.closest(".field"); }
    function setErr(input, on) {
      var f = fieldOf(input);
      if (f) f.classList.toggle("err", on);
      input.setAttribute("aria-invalid", on ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      // No backend configured — hand off to the visitor's email client.
      // Add a real `action` (Formspree / Netlify Forms) and this steps aside.
      if (form.getAttribute("action")) return;
      e.preventDefault();

      var first = form.firstName, last = form.lastName, email = form.email, message = form.message;
      var ok = true;
      [first, last, message].forEach(function (i) {
        var bad = !i.value.trim(); setErr(i, bad); if (bad) ok = false;
      });
      var badEmail = !emailRe.test(email.value.trim()); setErr(email, badEmail); if (badEmail) ok = false;

      if (!ok) {
        var firstErr = form.querySelector(".field.err input, .field.err textarea");
        if (firstErr) firstErr.focus();
        if (status) status.textContent = "Please complete the highlighted fields.";
        return;
      }

      var subject = "Website inquiry from " + first.value.trim() + " " + last.value.trim();
      var body = "Name: " + first.value.trim() + " " + last.value.trim() +
                 "\nEmail: " + email.value.trim() + "\n\n" + message.value.trim();
      window.location.href = "mailto:Alyssa.LimitlessSLP@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (status) status.textContent =
        "Opening your email app with the message ready to send. If nothing happens, email Alyssa.LimitlessSLP@gmail.com directly.";
    });

    // clear error as the user fixes a field
    form.querySelectorAll("input, textarea").forEach(function (i) {
      i.addEventListener("input", function () { setErr(i, false); });
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
