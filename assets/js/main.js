/* ==========================================================================
   Limitless Speech & Language Therapy — one-page interactions
   ========================================================================== */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Masthead state ---------- */
  var masthead = document.querySelector(".masthead");

  function onScroll() {
    if (masthead) masthead.classList.toggle("is-stuck", window.scrollY > 40);
  }
  var pending = false;
  window.addEventListener("scroll", function () {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () {
      onScroll();
      pending = false;
    });
  }, { passive: true });
  onScroll();

  /* ---------- Mobile sheet ---------- */
  var burger = document.querySelector(".burger");
  var sheet = document.querySelector(".sheet");

  if (burger && sheet) {
    var sheetLinks = sheet.querySelectorAll("a");

    var setSheet = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      sheet.classList.toggle("is-open", open);
      sheet.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("no-scroll", open);
      sheet.querySelectorAll("ul a").forEach(function (a, i) {
        a.style.transitionDelay = open ? 100 + i * 70 + "ms" : "0ms";
      });
    };

    setSheet(false);
    burger.addEventListener("click", function () {
      setSheet(burger.getAttribute("aria-expanded") !== "true");
    });
    sheetLinks.forEach(function (a) {
      a.addEventListener("click", function () { setSheet(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setSheet(false);
        burger.focus();
      }
    });
  }

  /* ---------- Word-by-word mask reveal ----------
     Splits text nodes into <span class="w"><i>word</i></span> while keeping
     any inline markup (e.g. <em>) intact. */
  function splitWords(root, counter) {
    var nodes = Array.prototype.slice.call(root.childNodes);
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        // Split on whitespace but keep it, so punctuation that follows an
        // inline element (e.g. "<em>word</em>,") doesn't gain a stray space.
        var parts = node.textContent.split(/(\s+)/).filter(function (p) { return p !== ""; });
        if (!parts.length) return;
        var frag = document.createDocumentFragment();
        parts.forEach(function (part) {
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          // Punctuation stranded after an inline element (e.g. "</em>,") stays
          // plain text — an inline-block would let the line break before it.
          if (/^[.,;:!?)\]}'"’”]+$/.test(part)) {
            frag.appendChild(document.createTextNode(part));
            return;
          }
          var span = document.createElement("span");
          span.className = "w";
          var inner = document.createElement("i");
          inner.textContent = part;
          inner.style.setProperty("--wd", counter.i * 42 + "ms");
          counter.i += 1;
          span.appendChild(inner);
          frag.appendChild(span);
        });
        root.replaceChild(frag, node);
      } else if (node.nodeType === 1) {
        splitWords(node, counter);
      }
    });
  }

  if (!reduce) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      splitWords(el, { i: 0 });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll("[data-rise], .split");

  if (!("IntersectionObserver" in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });

    revealables.forEach(function (el) { io.observe(el); });
  }

  /* Stagger direct children of [data-stagger] */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    var step = parseInt(group.getAttribute("data-stagger"), 10) || 100;
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (child.hasAttribute("data-rise")) {
        child.style.setProperty("--d", i * step + "ms");
      }
    });
  });

  /* ---------- Hero scene parallax ---------- */
  var layers = document.querySelectorAll(".hero-scene .layer");
  var heroLogo = document.querySelector(".hero-logo");

  if (layers.length && !reduce) {
    var raf = false;
    window.addEventListener("scroll", function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          layers.forEach(function (layer) {
            var depth = parseFloat(layer.getAttribute("data-depth")) || 0.1;
            layer.setAttribute("transform", "translate(0," + (-y * depth).toFixed(2) + ")");
          });
          if (heroLogo) {
            heroLogo.style.transform = "translate3d(0," + (y * 0.16).toFixed(2) + "px,0)";
            heroLogo.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.75)));
          }
        }
        raf = false;
      });
    }, { passive: true });
  }

  /* ---------- Seamless ticker ---------- */
  document.querySelectorAll(".ticker-track").forEach(function (track) {
    if (reduce) return;
    track.innerHTML += track.innerHTML;
  });

  /* ---------- Active section in the nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".mainnav a[href^='#']"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");

    form.addEventListener("submit", function (e) {
      // No server endpoint is configured yet, so the message is handed to the
      // visitor's email client. Add a real `action` (Formspree, Netlify Forms,
      // etc.) to the <form> and this handler steps aside automatically.
      if (form.getAttribute("action")) return;

      e.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var first = String(data.get("firstName") || "").trim();
      var last = String(data.get("lastName") || "").trim();
      var email = String(data.get("email") || "").trim();
      var message = String(data.get("message") || "").trim();

      var subject = "Website inquiry from " + first + " " + last;
      var body = "Name: " + first + " " + last + "\nEmail: " + email + "\n\n" + message;

      window.location.href =
        "mailto:Alyssa.LimitlessSLP@gmail.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      if (status) {
        status.textContent =
          "Opening your email app with the message ready to send. If nothing happens, email Alyssa.LimitlessSLP@gmail.com directly.";
      }
    });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
