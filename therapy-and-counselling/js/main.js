/* =====================================================================
   Therapy & Counselling — main.js
   Vanilla JS, progressive enhancement only. The site is fully usable
   without JavaScript: native <details> FAQ, real links, no JS-only nav.
   ===================================================================== */
(function () {
  'use strict';

  /* ---- Sticky header: subtle border once scrolled ---- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Mobile drawer ---- */
  var toggle = document.getElementById('navToggle');
  var drawer = document.getElementById('drawer');
  var overlay = document.getElementById('drawerOverlay');
  var closeBtn = document.getElementById('drawerClose');

  function openDrawer() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // move focus into the drawer for keyboard users
    if (closeBtn) closeBtn.focus();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (toggle) toggle.focus();
  }

  if (toggle && drawer && overlay && closeBtn) {
    toggle.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
    });
  }

  /* ---- FAQ: keep only one item open at a time (progressive over native <details>) ---- */
  var faqItems = document.querySelectorAll('#faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  /* ---- Scroll reveal (respects prefers-reduced-motion) ---- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealables = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- Enquiry form: validate, then POST to the Pages Function (progressive enhancement) ---- */
  var form = document.getElementById('enquiry-form');
  if (form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setStatus(msg, kind) { if (status) { status.textContent = msg; status.className = 'form-status ' + kind; } }
    function busy(on) {
      if (!submitBtn) return;
      if (on) { submitBtn.dataset.label = submitBtn.dataset.label || submitBtn.textContent; submitBtn.textContent = 'Sending\u2026'; submitBtn.setAttribute('aria-busy', 'true'); submitBtn.disabled = true; }
      else { submitBtn.textContent = submitBtn.dataset.label || 'Send enquiry'; submitBtn.removeAttribute('aria-busy'); submitBtn.disabled = false; }
    }

    form.querySelectorAll('[required]').forEach(function (input) {
      input.addEventListener('input', function () { var f = input.closest('.field'); if (f) f.classList.remove('is-invalid'); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var f = input.closest('.field');
        var bad = !input.value.trim() || (input.type === 'email' && !emailRe.test(input.value.trim()));
        if (f) f.classList.toggle('is-invalid', bad);
        if (bad && !firstBad) firstBad = input;
        if (bad) ok = false;
      });
      if (!ok) { setStatus('Please complete the highlighted fields.', 'is-error'); if (firstBad) firstBad.focus(); return; }

      var payload = {};
      new FormData(form).forEach(function (v, k) { payload[k] = v; });

      busy(true);
      setStatus('Sending your message\u2026', 'is-note');

      fetch(form.getAttribute('action'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }).then(function (j) { return { ok: res.ok, body: j }; }); })
        .then(function (r) {
          if (r.ok && r.body && r.body.ok) {
            form.reset();
            busy(false);
            if (submitBtn) submitBtn.textContent = 'Sent';
            setStatus('Thank you \u2014 your message has been sent. We\u2019ll be in touch as soon as we can.', 'is-ok');
          } else {
            throw new Error((r.body && r.body.error) || 'send-failed');
          }
        })
        .catch(function () {
          busy(false);
          setStatus('Sorry \u2014 your message couldn\u2019t be sent just now. Please call 072 202 0901 or email therapyandcounselling4u@gmail.com and we\u2019ll respond as soon as we can.', 'is-error');
        });
    });
  }

  /* ---- Footer year ---- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
