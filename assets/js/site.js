(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var body = document.body;
  var page = body.getAttribute("data-page") || "";

  /* ---------- header ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- active nav ---------- */
  document.querySelectorAll("[data-nav]").forEach(function (link) {
    if (link.getAttribute("data-nav") === page) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  /* ---------- mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var menuClose = document.getElementById("menuClose");
  var lastFocus = null;

  function setPageInert(on) {
    [document.querySelector(".site-header"), document.querySelector("main"), document.querySelector(".site-footer")].forEach(function (el) {
      if (el) el.inert = on;
    });
  }

  function openMenu() {
    if (!mobileMenu) return;
    lastFocus = document.activeElement;
    body.classList.add("menu-open");
    mobileMenu.setAttribute("aria-hidden", "false");
    setPageInert(true);
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
    if (menuClose) menuClose.focus();
  }
  function closeMenu() {
    if (!mobileMenu) return;
    body.classList.remove("menu-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    setPageInert(false);
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      if (body.classList.contains("menu-open")) closeMenu();
      else openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener("click", closeMenu);
  if (mobileMenu) {
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(); });
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("menu-open")) closeMenu();
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) closeLightbox();
  });

  /* ---------- page transition ---------- */
  document.querySelectorAll("a[href]").forEach(function (a) {
    var href = a.getAttribute("href");
    if (!href || href.charAt(0) === "#" || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (a.target === "_blank" || a.hasAttribute("download")) return;
    if (!/\.html(\?|#|$)/.test(href)) return;
    a.addEventListener("click", function (e) {
      if (reduce || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var url = new URL(href, location.href);
      if (url.pathname === location.pathname && url.hash) return;
      e.preventDefault();
      body.classList.add("is-leaving");
      window.setTimeout(function () { location.href = href; }, 260);
    });
  });
  window.addEventListener("pageshow", function () { body.classList.remove("is-leaving"); });

  /* ---------- reveal ---------- */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        countUpWithin(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
    document.querySelectorAll("[data-count]").forEach(function (el) {
      el.textContent = formatCount(el.getAttribute("data-count"), el.getAttribute("data-decimals"));
    });
  }

  function formatCount(value, decimals) {
    var d = parseInt(decimals || "0", 10);
    var n = parseFloat(value);
    if (isNaN(n)) return value;
    return n.toFixed(d);
  }
  function countUpWithin(scope) {
    if (reduce) return;
    scope.querySelectorAll("[data-count]").forEach(function (el) {
      if (el.dataset.done) return;
      el.dataset.done = "1";
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (isNaN(target)) return;
      var start = performance.now();
      var dur = 1100;
      function frame(now) {
        var t = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = target.toFixed(decimals);
      }
      requestAnimationFrame(frame);
    });
  }

  /* ---------- hero parallax ---------- */
  var hero = document.querySelector(".hero");
  if (hero && finePointer && !reduce) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      var py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      hero.style.setProperty("--px", px.toFixed(3));
      hero.style.setProperty("--py", py.toFixed(3));
    });
    hero.addEventListener("mouseleave", function () {
      hero.style.setProperty("--px", "0");
      hero.style.setProperty("--py", "0");
    });
  }

  /* ---------- flavor switcher ---------- */
  var flavors = {
    jasmine: {
      en: "JASMINE", name: "茉莉花茶", img: "assets/img/bottle_jasmine.png",
      accent: "#DCCDB8", note: "花香清扬，入口清爽。茉莉的香气先到，茶味随后，尾段回甘干净。",
      aroma: "茉莉花香，清扬不腻", taste: "入口清爽，回甘快", pair: "清淡点心、水果", occasion: "上午 / 办公桌边",
      meters: [90, 20, 62]
    },
    osmanthus: {
      en: "OSMANTHUS", name: "桂花乌龙", img: "assets/img/bottle_osmanthus.png",
      accent: "#C7A15A", note: "焙火打底，桂花不压茶。桂花的甜润在中段浮出来，尾段仍有乌龙的厚度。",
      aroma: "桂花甜润，焙火托底", taste: "焙火香明显，涩感低", pair: "坚果、烘焙点心", occasion: "午后 / 午饭之后",
      meters: [68, 58, 74]
    },
    oolong: {
      en: "OOLONG", name: "乌龙茶", img: "assets/img/bottle_oolong.png",
      accent: "#9A6544", note: "醇厚回甘，涩感可控。没有花香抢戏，只有茶叶本身的焙火与回甘。",
      aroma: "焙火与熟果香", taste: "醇厚，回甘慢而长", pair: "油脂料理、家常菜", occasion: "佐餐 / 傍晚",
      meters: [22, 80, 82]
    }
  };

  var flavorStage = document.getElementById("flavorStage");
  if (flavorStage) {
    var bottle = document.getElementById("flavorBottle");
    var enEl = document.getElementById("flavorEn");
    var nameEl = document.getElementById("flavorName");
    var noteEl = document.getElementById("flavorNote");
    var aromaEl = document.getElementById("flavorAroma");
    var tasteEl = document.getElementById("flavorTaste");
    var pairEl = document.getElementById("flavorPair");
    var occasionEl = document.getElementById("flavorOccasion");
    var tabs = Array.prototype.slice.call(flavorStage.querySelectorAll(".flavor-tab"));
    var meters = Array.prototype.slice.call(flavorStage.querySelectorAll(".meter"));

    function renderFlavor(key) {
      var f = flavors[key];
      if (!f) return;
      tabs.forEach(function (t) {
        t.setAttribute("aria-selected", t.getAttribute("data-flavor") === key ? "true" : "false");
      });
      flavorStage.style.setProperty("--accent", f.accent);
      bottle.classList.add("is-swapping");
      window.setTimeout(function () {
        bottle.src = f.img;
        bottle.alt = f.name + "瓶身";
        bottle.classList.remove("is-swapping");
      }, reduce ? 0 : 160);
      enEl.textContent = f.en;
      nameEl.textContent = f.name;
      noteEl.textContent = f.note;
      aromaEl.textContent = f.aroma;
      tasteEl.textContent = f.taste;
      pairEl.textContent = f.pair;
      occasionEl.textContent = f.occasion;
      meters.forEach(function (m, i) {
        m.style.setProperty("--w", f.meters[i] + "%");
        var value = m.querySelector(".meter__value");
        if (value) value.textContent = f.meters[i];
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { renderFlavor(tab.getAttribute("data-flavor")); });
      tab.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var idx = tabs.indexOf(tab);
        var next = e.key === "ArrowRight" ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        renderFlavor(tabs[next].getAttribute("data-flavor"));
      });
    });

    var hash = (location.hash || "").replace("#", "");
    if (flavors[hash]) renderFlavor(hash);
  }

  /* ---------- curve toggle ---------- */
  document.querySelectorAll(".curve-panel").forEach(function (panel) {
    var buttons = Array.prototype.slice.call(panel.querySelectorAll(".curve-btn"));
    var groups = Array.prototype.slice.call(panel.querySelectorAll(".curve-group"));
    var caption = panel.querySelector("[data-curve-caption]");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-curve");
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        groups.forEach(function (g) {
          g.classList.toggle("is-active", g.getAttribute("data-curve") === key);
        });
        if (caption && btn.getAttribute("data-caption")) caption.textContent = btn.getAttribute("data-caption");
      });
    });
  });

  /* ---------- anatomy hotspots ---------- */
  document.querySelectorAll(".hotspot").forEach(function (spot) {
    spot.addEventListener("click", function (e) {
      e.stopPropagation();
      var wasOpen = spot.classList.contains("is-open");
      document.querySelectorAll(".hotspot").forEach(function (s) { s.classList.remove("is-open"); });
      if (!wasOpen) spot.classList.add("is-open");
    });
  });
  document.addEventListener("click", function () {
    document.querySelectorAll(".hotspot").forEach(function (s) { s.classList.remove("is-open"); });
  });

  /* ---------- gallery lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var lightboxCap = lightbox ? lightbox.querySelector("[data-lightbox-caption]") : null;
  var lightboxCount = lightbox ? lightbox.querySelector("[data-lightbox-count]") : null;
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery-item[data-full]"));
  var current = 0;
  var lastTrigger = null;

  function openLightbox(index) {
    if (!lightbox || !items.length) return;
    current = (index + items.length) % items.length;
    var item = items[current];
    lightboxImg.src = item.getAttribute("data-full");
    lightboxImg.alt = item.getAttribute("data-caption") || "品牌视觉";
    if (lightboxCap) lightboxCap.textContent = item.getAttribute("data-caption") || "";
    if (lightboxCount) lightboxCount.textContent = (current + 1) + " / " + items.length;
    lastTrigger = item;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    setPageInert(true);
    document.body.style.overflow = "hidden";
    var close = lightbox.querySelector(".lightbox__close");
    if (close) close.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    setPageInert(false);
    document.body.style.overflow = "";
    if (lastTrigger) lastTrigger.focus();
  }
  function stepLightbox(dir) {
    if (!lightbox || !lightbox.classList.contains("is-open")) return;
    openLightbox(current + dir);
  }
  if (lightbox) {
    items.forEach(function (item, i) {
      item.addEventListener("click", function () { openLightbox(i); });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var lbClose = lightbox.querySelector(".lightbox__close");
    var lbPrev = lightbox.querySelector("[data-lightbox-prev]");
    var lbNext = lightbox.querySelector("[data-lightbox-next]");
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    if (lbPrev) lbPrev.addEventListener("click", function () { stepLightbox(-1); });
    if (lbNext) lbNext.addEventListener("click", function () { stepLightbox(1); });
    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") stepLightbox(-1);
      if (e.key === "ArrowRight") stepLightbox(1);
    });
  }

  /* ---------- booking form ---------- */
  var form = document.getElementById("bookingForm");
  if (form) {
    var success = document.getElementById("formSuccess");
    function fieldWrap(name) { return form.querySelector('[data-field="' + name + '"]'); }
    function setError(name, msg) {
      var wrap = fieldWrap(name);
      if (!wrap) return;
      wrap.classList.add("has-error");
      var input = wrap.querySelector("input, select");
      if (input) input.setAttribute("aria-invalid", "true");
      var err = wrap.querySelector(".error");
      if (err) err.textContent = msg;
    }
    function clearError(name) {
      var wrap = fieldWrap(name);
      if (!wrap) return;
      wrap.classList.remove("has-error");
      var input = wrap.querySelector("input, select");
      if (input) input.removeAttribute("aria-invalid");
    }
    form.querySelectorAll("input, select").forEach(function (el) {
      el.addEventListener("input", function () {
        var wrap = el.closest("[data-field]");
        if (wrap) {
          wrap.classList.remove("has-error");
          el.removeAttribute("aria-invalid");
        }
      });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var city = form.elements.city.value.trim();
      var contact = form.elements.contact.value.trim();
      var flavor = form.elements.flavor.value;
      var ok = true;

      if (name.length < 2) { setError("name", "请填写称呼（至少 2 个字）"); ok = false; }
      else clearError("name");
      if (city.length < 2) { setError("city", "请填写所在城市"); ok = false; }
      else clearError("city");
      var contactOk = /^1[3-9]\d{9}$/.test(contact) || (contact.length >= 4 && contact.length <= 30);
      if (!contactOk) { setError("contact", "请填写 11 位手机号或微信号（至少 4 位）"); ok = false; }
      else clearError("contact");
      if (!flavor) { setError("flavor", "请选择想试的风味"); ok = false; }
      else clearError("flavor");

      if (!ok) {
        var firstError = form.querySelector(".field.has-error input, .field.has-error select");
        if (firstError) firstError.focus();
        return;
      }
      if (success) {
        success.innerHTML = "已登记（演示）：<b>" + escapeHtml(name) + "</b> · " + escapeHtml(city) + " · 想试 <b>" + escapeHtml(flavor) + "</b>。" +
          "<br>这是课程概念演示，表单不会发送或保存到服务器，也不会用于任何商业用途。";
        success.classList.add("is-on");
        success.setAttribute("tabindex", "-1");
        success.focus();
      }
      form.reset();
    });
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (s) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[s];
    });
  }

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
