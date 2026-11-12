(function () {
  "use strict";

  var form = document.getElementById("registerForm");
  if (!form) return;

  var STORAGE_KEY = "wusheng_member_v1";
  var DEMO_CODE = "246810";
  var state = { step: 1, data: { name: "", phone: "", city: "", flavors: [], scenes: [] } };
  var saved = readMember();

  var panels = Array.prototype.slice.call(document.querySelectorAll("[data-panel]"));
  var steps = Array.prototype.slice.call(document.querySelectorAll(".step"));
  var reviewList = document.getElementById("reviewList");
  var consent = document.getElementById("consent");
  var formError = document.getElementById("formError");
  var success = document.getElementById("memberSuccess");
  var existingBanner = document.getElementById("existingBanner");
  var existingName = document.getElementById("existingName");
  var codeBtn = document.getElementById("codeBtn");
  var codeHint = document.getElementById("codeHint");
  var codeTimer = null;
  var codeLeft = 0;

  function readMember() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      return data && data.name ? data : null;
    } catch (err) {
      return null;
    }
  }
  function saveMember(member) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
      return true;
    } catch (err) {
      return false;
    }
  }
  function clearMember() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) {}
  }
  function formatDate(value) {
    var d = value ? new Date(value) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate());
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function maskPhone(phone) {
    return phone.length === 11 ? phone.slice(0, 3) + "****" + phone.slice(7) : phone;
  }
  function fieldWrap(name) { return form.querySelector('[data-field="' + name + '"]'); }
  function setError(name, msg) {
    var wrap = fieldWrap(name);
    if (!wrap) return;
    wrap.classList.add("has-error");
    var input = wrap.querySelector("input");
    if (input) input.setAttribute("aria-invalid", "true");
    var err = wrap.querySelector(".error");
    if (err) err.textContent = msg;
  }
  function clearError(name) {
    var wrap = fieldWrap(name);
    if (!wrap) return;
    wrap.classList.remove("has-error");
    var input = wrap.querySelector("input");
    if (input) input.removeAttribute("aria-invalid");
    var err = wrap.querySelector(".error");
    if (err) err.textContent = "";
  }
  function clearStepErrors() {
    ["name", "phone", "code", "city"].forEach(clearError);
    document.querySelectorAll(".group-error").forEach(function (el) { el.classList.remove("is-on"); });
    formError.classList.remove("is-on");
    formError.textContent = "";
  }
  function showStep(step, focus) {
    state.step = step;
    panels.forEach(function (p) { p.classList.toggle("is-active", Number(p.getAttribute("data-panel")) === step); });
    steps.forEach(function (s) {
      var n = Number(s.getAttribute("data-step"));
      s.classList.toggle("is-active", n === step);
      s.classList.toggle("is-done", n < step);
      if (n === step) s.setAttribute("aria-current", "step");
      else s.removeAttribute("aria-current");
    });
    if (focus === false) return;
    var active = form.querySelector('[data-panel="' + step + '"]');
    if (active) {
      var first = active.querySelector("input:not([type=checkbox]), input[type=checkbox], button");
      if (first) first.focus();
    }
    if (window.innerWidth < 1020) {
      var card = document.getElementById("authCard");
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
  function syncFields() {
    state.data.name = form.elements.name.value.trim();
    state.data.phone = form.elements.phone.value.trim();
    state.data.city = form.elements.city.value.trim();
  }
  function collectChoices() {
    state.data.flavors = Array.prototype.slice.call(form.querySelectorAll('input[name="flavors"]:checked')).map(function (i) { return i.value; });
    state.data.scenes = Array.prototype.slice.call(form.querySelectorAll('input[name="scenes"]:checked')).map(function (i) { return i.value; });
  }
  function validateStep1() {
    clearStepErrors();
    syncFields();
    var ok = true;
    if (state.data.name.length < 2) { setError("name", "请填写称呼（至少 2 个字）"); ok = false; }
    if (!/^1[3-9]\d{9}$/.test(state.data.phone)) { setError("phone", "请填写 11 位手机号"); ok = false; }
    if (form.elements.code.value.trim() !== DEMO_CODE) { setError("code", "请输入演示验证码 246810"); ok = false; }
    if (state.data.city.length < 2) { setError("city", "请填写所在城市"); ok = false; }
    return ok;
  }
  function validateStep2() {
    clearStepErrors();
    collectChoices();
    var ok = true;
    if (!state.data.flavors.length) {
      document.querySelector('[data-error="flavors"]').classList.add("is-on");
      ok = false;
    }
    if (!state.data.scenes.length) {
      document.querySelector('[data-error="scenes"]').classList.add("is-on");
      ok = false;
    }
    return ok;
  }
  function buildReview() {
    reviewList.innerHTML = "";
    var rows = [
      ["称呼", state.data.name],
      ["手机号", maskPhone(state.data.phone)],
      ["城市", state.data.city],
      ["想试风味", state.data.flavors.join(" / ")],
      ["常喝场景", state.data.scenes.join(" / ")]
    ];
    rows.forEach(function (row) {
      var wrap = document.createElement("div");
      wrap.className = "review-row";
      var dt = document.createElement("dt");
      dt.textContent = row[0];
      var dd = document.createElement("dd");
      dd.textContent = row[1];
      wrap.appendChild(dt);
      wrap.appendChild(dd);
      reviewList.appendChild(wrap);
    });
  }
  function renderMember(member) {
    document.getElementById("memberNo").textContent = member.no;
    document.getElementById("memberName").textContent = member.name;
    document.getElementById("memberCity").textContent = member.city;
    document.getElementById("memberFlavors").textContent = member.flavors.join(" / ");
    document.getElementById("memberScenes").textContent = member.scenes.join(" / ");
    document.getElementById("memberDate").textContent = formatDate(member.date);
    form.style.display = "none";
    success.classList.add("is-on");
    existingBanner.classList.remove("is-on");
    var note = success.querySelector(".success-note");
    if (note) note.textContent = "档案已保存在本机浏览器，不会上传服务器；换浏览器或清除缓存后会丢失。";
    success.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function resetAll() {
    clearMember();
    saved = null;
    state = { step: 1, data: { name: "", phone: "", city: "", flavors: [], scenes: [] } };
    form.reset();
    form.style.display = "";
    success.classList.remove("is-on");
    existingBanner.classList.remove("is-on");
    clearStepErrors();
    codeLeft = 0;
    if (codeTimer) { clearInterval(codeTimer); codeTimer = null; }
    codeBtn.disabled = false;
    codeBtn.textContent = "获取验证码";
    codeHint.innerHTML = "点击「获取验证码」查看演示码；不会真实发送短信。";
    showStep(1);
  }
  function startCodeCountdown() {
    codeLeft = 60;
    codeBtn.disabled = true;
    codeBtn.textContent = "重新获取（60s）";
    codeHint.innerHTML = "演示验证码：<b>" + DEMO_CODE + "</b> · 60 秒内有效；不会真实发送短信。";
    document.getElementById("regCode").focus();
    codeTimer = setInterval(function () {
      codeLeft -= 1;
      if (codeLeft <= 0) {
        clearInterval(codeTimer);
        codeTimer = null;
        codeBtn.disabled = false;
        codeBtn.textContent = "重新获取";
        codeHint.innerHTML = "演示验证码：<b>" + DEMO_CODE + "</b> · 可重新获取。";
      } else {
        codeBtn.textContent = "重新获取（" + codeLeft + "s）";
      }
    }, 1000);
  }

  if (saved) {
    existingName.textContent = saved.name;
    existingBanner.classList.add("is-on");
    form.elements.name.value = saved.name || "";
    form.elements.phone.value = saved.phone || "";
    form.elements.city.value = saved.city || "";
    (saved.flavors || []).forEach(function (value) {
      var input = form.querySelector('input[name="flavors"][value="' + value + '"]');
      if (input) input.checked = true;
    });
    (saved.scenes || []).forEach(function (value) {
      var input = form.querySelector('input[name="scenes"][value="' + value + '"]');
      if (input) input.checked = true;
    });
  }

  if (existingBanner) {
    existingBanner.querySelector("[data-continue]").addEventListener("click", function () {
      if (saved) renderMember(saved);
    });
    existingBanner.querySelector("[data-reset]").addEventListener("click", resetAll);
  }

  codeBtn.addEventListener("click", function () {
    if (codeBtn.disabled) return;
    startCodeCountdown();
  });

  form.querySelectorAll("input").forEach(function (input) {
    input.addEventListener("input", function () {
      var wrap = input.closest("[data-field]");
      if (wrap) {
        wrap.classList.remove("has-error");
        input.removeAttribute("aria-invalid");
      }
      if (input.type === "checkbox") {
        var group = input.closest("[data-group]");
        if (group) {
          var err = document.querySelector('[data-error="' + group.getAttribute("data-group") + '"]');
          if (err) err.classList.remove("is-on");
        }
      }
    });
    input.addEventListener("change", function () {
      if (input.type === "checkbox") {
        var group = input.closest("[data-group]");
        if (group) {
          var err = document.querySelector('[data-error="' + group.getAttribute("data-group") + '"]');
          if (err) err.classList.remove("is-on");
        }
      }
    });
  });

  form.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.step === 1 && validateStep1()) { collectChoices(); showStep(2); }
      else if (state.step === 2 && validateStep2()) { buildReview(); showStep(3); }
    });
  });
  form.querySelectorAll("[data-prev]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (state.step > 1) showStep(state.step - 1);
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (state.step === 1) {
      if (validateStep1()) { collectChoices(); showStep(2); }
      return;
    }
    if (state.step === 2) {
      if (validateStep2()) { buildReview(); showStep(3); }
      return;
    }
    if (!consent.checked) {
      formError.textContent = "请先勾选「我了解这是课程概念演示」。";
      formError.classList.add("is-on");
      consent.focus();
      return;
    }
    formError.classList.remove("is-on");
    collectChoices();
    var member = {
      v: 1,
      no: "WS-2026-" + String(1000 + Math.floor(Math.random() * 9000)),
      name: state.data.name,
      phone: state.data.phone,
      city: state.data.city,
      flavors: state.data.flavors,
      scenes: state.data.scenes,
      date: new Date().toISOString()
    };
    var stored = saveMember(member);
    saved = member;
    renderMember(member);
    if (!stored) {
      var note = success.querySelector(".success-note");
      if (note) note.textContent = "当前浏览器不允许本机保存，档案只在本次页面有效。";
    }
  });

  document.querySelectorAll("[data-edit]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      success.classList.remove("is-on");
      form.style.display = "";
      existingBanner.classList.remove("is-on");
      showStep(1);
    });
  });

  showStep(1, false);
})();
