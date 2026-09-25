(function () {
  'use strict';

  var root = document.documentElement;
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ease = 'cubic-bezier(.2,.7,.2,1)';

  /* Theme */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function themeLabel() {
    if (themeBtn) themeBtn.setAttribute('aria-label', root.dataset.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  themeLabel();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('ajor-landing-theme', root.dataset.theme); } catch (e) {}
      themeLabel();
    });
  }

  /* Mobile drawer */
  var drawer = document.querySelector('[data-drawer]');
  function setMenu(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    try { document.body.style.overflow = open ? 'hidden' : ''; } catch (e) {}
  }
  var openBtn = document.querySelector('[data-menu-open]');
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  document.querySelectorAll('[data-menu-close]').forEach(function (el) {
    el.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  // The drawer only exists below 760px, so widening the window must close it.
  window.addEventListener('resize', function () { if (window.innerWidth >= 760) setMenu(false); });

  /* Staggered entrance */
  document.querySelectorAll('[data-enter]').forEach(function (el) {
    var d = el.getAttribute('data-enter');
    var rise = el.hasAttribute('data-rise');
    el.style.transition = reduced ? 'opacity .4s ease'
      : 'opacity ' + (rise ? '.8s' : '.7s') + ' ease ' + d + 'ms, transform ' + (rise ? '1s' : '.8s') + ' ' + ease + ' ' + d + 'ms';
  });
  // Reflow rather than requestAnimationFrame: rAF is throttled in a background
  // tab, which would leave the page invisible until it is focused.
  void document.body.offsetWidth;
  document.body.classList.add('entered');

  /* Scroll reveal for the sections below the hero */
  document.querySelectorAll('[data-r]').forEach(function (el) {
    var d = el.getAttribute('data-r');
    el.style.transition = reduced ? 'opacity .4s ease'
      : 'opacity .7s ease ' + d + 'ms, transform .8s ' + ease + ' ' + d + 'ms';
  });
  var blocks = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (!('IntersectionObserver' in window) || reduced) {
    blocks.forEach(function (b) { b.classList.add('is-seen'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-seen');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    blocks.forEach(function (b) { io.observe(b); });
  }

  /* Bars inside revealed sections fill once, when the section appears */
  document.querySelectorAll('[data-reveal] .fill').forEach(function (f) {
    var section = f.closest('[data-reveal]');
    var fillIt = function () {
      f.style.transition = reduced ? 'none' : 'width 1.2s ' + ease + ' 300ms';
      f.style.width = f.getAttribute('data-bar') + '%';
    };
    if (section.classList.contains('is-seen')) { fillIt(); return; }
    var mo = new MutationObserver(function () {
      if (section.classList.contains('is-seen')) { fillIt(); mo.disconnect(); }
    });
    mo.observe(section, { attributes: true, attributeFilter: ['class'] });
  });

  /* FAQ accordion - one open at a time, matching the design */
  var faqButtons = [].slice.call(document.querySelectorAll('[data-faq]'));
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wasOpen = btn.getAttribute('aria-expanded') === 'true';
      faqButtons.forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
      btn.setAttribute('aria-expanded', wasOpen ? 'false' : 'true');
    });
  });

  /* Rotating demo */
  var screens = [].slice.call(document.querySelectorAll('[data-screen]'));
  var tabs = [].slice.call(document.querySelectorAll('[data-tab]'));
  var floats = [].slice.call(document.querySelectorAll('[data-float]'));
  if (!screens.length) return;

  var durations = [6500, 4500, 4500];
  var timer, raf;

  function countTo(el, target) {
    if (!el) return;
    if (reduced) { el.textContent = target; return; }
    var t0 = performance.now(), delay = 250, dur = 1100;
    (function step(now) {
      var x = Math.min(1, Math.max(0, ((now || performance.now()) - t0 - delay) / dur));
      el.textContent = Math.round(target * (1 - Math.pow(1 - x, 3)));
      if (x < 1) raf = requestAnimationFrame(step);
    })(t0);
  }

  function reset(screen) {
    screen.querySelectorAll('.fill').forEach(function (f) { f.style.transition = 'none'; f.style.width = '0%'; });
    screen.querySelectorAll('.seg').forEach(function (s) { s.style.transition = 'none'; s.style.background = ''; });
  }

  function animate(i) {
    var screen = screens[i];
    void screen.offsetWidth;

    screen.querySelectorAll('.fill').forEach(function (f, n) {
      f.style.transition = reduced ? 'none' : 'width 1.2s ' + ease + ' ' + (250 + n * 600) + 'ms';
      f.style.width = f.getAttribute('data-bar') + '%';
    });

    if (i === 0) {
      screen.querySelectorAll('.seg').forEach(function (s, n) {
        s.style.transition = reduced ? 'none' : 'background .35s ease ' + (250 + n * 110) + 'ms';
        s.style.background = n < 4 ? 'var(--paid)' : n === 4 ? 'var(--fill)' : 'var(--track)';
      });
      countTo(screen.querySelector('[data-count-week]'), 5);
    }
    if (i === 1) countTo(screen.querySelector('[data-count-pct]'), 74);
    if (i === 2) countTo(screen.querySelector('[data-count-in]'), 12);

    floats.forEach(function (f) {
      var mine = Number(f.getAttribute('data-float')) === i;
      var d = f.getAttribute('data-delay');
      f.style.transition = mine && !reduced
        ? 'opacity .45s ease ' + d + 'ms, transform .55s cubic-bezier(.3,1.4,.5,1) ' + d + 'ms'
        : 'opacity .25s ease';
      f.classList.toggle('is-on', mine);
    });
  }

  function show(i) {
    clearTimeout(timer);
    cancelAnimationFrame(raf);

    screens.forEach(function (s, n) {
      s.classList.toggle('is-active', n === i);
      if (n !== i) reset(s);
    });
    tabs.forEach(function (t, n) { t.classList.toggle('is-active', n === i); });

    reset(screens[i]);
    animate(i);

    tabs.forEach(function (t, n) {
      var bar = t.querySelector('.tab-bar');
      if (!bar) return;
      bar.style.transition = 'none';
      bar.style.width = '0%';
      if (n === i && !reduced) {
        void bar.offsetWidth;
        bar.style.transition = 'width ' + durations[i] + 'ms linear';
        bar.style.width = '100%';
      }
    });

    timer = setTimeout(function () { show((i + 1) % screens.length); }, durations[i]);
  }

  tabs.forEach(function (t, n) { t.addEventListener('click', function () { show(n); }); });
  show(0);
})();
