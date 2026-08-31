/* =============================================================================
   Longevity Neurology Center — site behaviour
   Progressive enhancement: every feature checks for its own markup first and
   the page remains fully usable with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------- Footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* -------------------------------------------- Header sticky elevation */
  (function stickyHeader() {
    var header = $('.site-header');
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle('is-stuck', window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  })();

  /* ------------------------------------------- Mark the current nav item */
  (function markCurrent() {
    var here = window.location.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
    $$('[data-nav] a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || /^(https?:|mailto:|tel:)/.test(href)) return;
      var path = new URL(href, window.location.origin + window.location.pathname)
        .pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
      if (path !== here) return;
      a.setAttribute('aria-current', 'page');
      var item = a.closest('.nav__item, .drawer__nav > li');
      if (item) item.classList.add('is-current');
      var parentItem = a.closest('.nav__submenu, .drawer__sub');
      if (parentItem) {
        var owner = parentItem.closest('.nav__item, .drawer__nav > li');
        if (owner) owner.classList.add('is-current');
      }
    });
  })();

  /* ------------------------------------------------- Desktop dropdown menu */
  (function dropdowns() {
    var items = $$('.nav__item--has-menu');
    if (!items.length) return;

    function close(item) {
      item.classList.remove('is-open');
      var btn = $('.nav__link', item);
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
    function open(item) {
      items.forEach(function (other) { if (other !== item) close(other); });
      item.classList.add('is-open');
      var btn = $('.nav__link', item);
      if (btn) btn.setAttribute('aria-expanded', 'true');
    }

    items.forEach(function (item) {
      var btn = $('.nav__link', item);
      var menu = $('.nav__submenu', item);
      if (!btn || !menu) return;
      var hoverTimer;

      item.addEventListener('mouseenter', function () {
        window.clearTimeout(hoverTimer);
        if (window.matchMedia('(hover: hover)').matches) open(item);
      });
      item.addEventListener('mouseleave', function () {
        hoverTimer = window.setTimeout(function () { close(item); }, 140);
      });

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (item.classList.contains('is-open')) { close(item); } else { open(item); }
      });

      item.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('is-open')) {
          close(item); btn.focus();
        }
        if (e.key === 'ArrowDown' && document.activeElement === btn) {
          e.preventDefault(); open(item);
          var first = $('a', menu); if (first) first.focus();
        }
      });

      item.addEventListener('focusout', function () {
        window.setTimeout(function () {
          if (!item.contains(document.activeElement)) close(item);
        }, 0);
      });
    });

    document.addEventListener('click', function (e) {
      items.forEach(function (item) { if (!item.contains(e.target)) close(item); });
    });
  })();

  /* ---------------------------------------------------- Mobile nav drawer */
  (function drawer() {
    var burger = $('.burger');
    var panel  = $('#site-drawer');
    var scrim  = $('.drawer-scrim');
    if (!burger || !panel || !scrim) return;

    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      panel.classList.add('is-open');
      scrim.classList.add('is-open');
      panel.removeAttribute('inert');
      burger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('is-locked');
      var first = $(FOCUSABLE, panel);
      if (first) window.setTimeout(function () { first.focus(); }, 60);
    }
    function close() {
      panel.classList.remove('is-open');
      scrim.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('is-locked');
      window.setTimeout(function () {
        if (!panel.classList.contains('is-open')) panel.setAttribute('inert', '');
      }, 420);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function isOpen() { return panel.classList.contains('is-open'); }

    panel.setAttribute('inert', '');
    burger.addEventListener('click', function () { isOpen() ? close() : open(); });
    scrim.addEventListener('click', close);
    $$('[data-drawer-close]', panel).forEach(function (el) { el.addEventListener('click', close); });
    $$('a[href]', panel).forEach(function (a) {
      a.addEventListener('click', function () { if (isOpen()) close(); });
    });

    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = $$(FOCUSABLE, panel).filter(function (el) { return el.offsetParent !== null; });
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    window.addEventListener('resize', function () {
      if (isOpen() && window.innerWidth > 1000) close();
    });
  })();

  /* --------------------------- Disclosure toggles (drawer submenu + FAQ) */
  (function disclosures() {
    // A collapsed panel is clipped, not removed, so its links stay focusable.
    // `inert` takes them out of the tab order to match the aria-hidden state.
    function setOpen(panel, open) {
      panel.setAttribute('aria-hidden', String(!open));
      if (open) { panel.removeAttribute('inert'); } else { panel.setAttribute('inert', ''); }
    }

    $$('[data-toggle]').forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute('aria-controls'));
      if (!target) return;
      setOpen(target, btn.getAttribute('aria-expanded') === 'true');
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        // Accordions marked data-toggle="single" close their siblings.
        if (!expanded && btn.getAttribute('data-toggle') === 'single') {
          var group = btn.closest('[data-accordion]');
          if (group) {
            $$('[data-toggle="single"]', group).forEach(function (other) {
              if (other === btn) return;
              other.setAttribute('aria-expanded', 'false');
              var op = document.getElementById(other.getAttribute('aria-controls'));
              if (op) setOpen(op, false);
            });
          }
        }
        btn.setAttribute('aria-expanded', String(!expanded));
        setOpen(target, !expanded);
      });
    });
  })();

  /* -------------------------------------------------- Reveal on scroll */
  (function reveals() {
    var els = $$('[data-reveal]');
    // Without .js-reveal the elements were never hidden, so there is nothing to do.
    if (!els.length || !document.documentElement.classList.contains('js-reveal')) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    els.forEach(function (el, i) {
      var group = el.parentElement;
      var stagger = group && group.hasAttribute('data-reveal-group');
      if (stagger) {
        var index = Array.prototype.indexOf.call(group.children, el);
        el.style.setProperty('--reveal-delay', Math.min(index, 6) * 80 + 'ms');
      }
      io.observe(el);
    });
  })();

  /* ------------------------------------------------------ Counting stats */
  (function counters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function render(el, value) {
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      el.textContent = prefix + value.toLocaleString('en-US') + suffix;
    }
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      if (reduceMotion.matches) { render(el, target); return; }
      var start = null, duration = 1400;
      function tick(now) {
        if (start === null) start = now;
        var p = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(tick);
      }
      window.requestAnimationFrame(tick);
    }

    nums.forEach(function (el) { render(el, 0); });

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* -------------------------------------------------- Testimonial carousel */
  (function carousel() {
    var root = $('[data-carousel]');
    if (!root) return;
    var track = $('.quotes__track', root);
    var slides = $$('.quote', root);
    var dots = $$('.quotes__dot', root);
    var prev = $('[data-carousel-prev]', root);
    var next = $('[data-carousel-next]', root);
    var live = $('[data-carousel-status]', root);
    if (!track || slides.length < 1) return;

    var index = 0;
    var timer = null;
    var DELAY = 7000;
    var paused = false;

    function go(i, announce) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      slides.forEach(function (s, n) {
        s.setAttribute('aria-hidden', String(n !== index));
        $$(FOCUSABLE, s).forEach(function (el) { el.tabIndex = n === index ? 0 : -1; });
      });
      dots.forEach(function (d, n) { d.setAttribute('aria-selected', String(n === index)); });
      if (announce && live) live.textContent = 'Testimonial ' + (index + 1) + ' of ' + slides.length;
    }
    function start() {
      if (reduceMotion.matches || slides.length < 2 || paused) return;
      stop();
      timer = window.setInterval(function () { go(index + 1, false); }, DELAY);
    }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    if (prev) prev.addEventListener('click', function () { go(index - 1, true); start(); });
    if (next) next.addEventListener('click', function () { go(index + 1, true); start(); });
    dots.forEach(function (d, n) { d.addEventListener('click', function () { go(n, true); start(); }); });

    root.addEventListener('mouseenter', function () { paused = true; stop(); });
    root.addEventListener('mouseleave', function () { paused = false; start(); });
    root.addEventListener('focusin',  function () { paused = true; stop(); });
    root.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!root.contains(document.activeElement)) { paused = false; start(); }
      }, 0);
    });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1, true); start(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, true); start(); }
    });

    // Touch swipe
    var startX = null;
    root.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1), true);
      startX = null; start();
    });

    go(0, false);
    start();
  })();

  /* ------------------------------------------------- Contact form validation */
  (function contactForm() {
    var form = $('[data-validate]');
    if (!form) return;
    var status = $('.form__status', form);
    var submit = form.querySelector('[type="submit"]');

    function fieldOf(input) { return input.closest('.field, .check'); }

    function messageFor(input) {
      if (input.validity.valueMissing) {
        return input.type === 'checkbox' ? 'Please check this box to continue.' : 'This field is required.';
      }
      if (input.validity.typeMismatch && input.type === 'email') return 'Enter a valid email address, e.g. name@example.com.';
      if (input.validity.patternMismatch && input.type === 'tel') return 'Enter a valid phone number, e.g. 480-770-0427.';
      if (input.validity.tooShort) return 'Please enter at least ' + input.minLength + ' characters.';
      return input.validationMessage || 'Please check this field.';
    }

    function validate(input, show) {
      var wrap = fieldOf(input);
      if (!wrap) return input.checkValidity();
      var ok = input.checkValidity();
      var err = $('.error', wrap);
      if (!ok && show) {
        wrap.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        if (err) {
          var text = $('.error-text', err);
          (text || err).textContent = messageFor(input);
        }
      } else if (ok) {
        wrap.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
      }
      return ok;
    }

    var inputs = $$('input, textarea, select', form).filter(function (el) { return el.type !== 'submit' && el.type !== 'hidden'; });

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { validate(input, true); });
      input.addEventListener('input', function () {
        var wrap = fieldOf(input);
        if (wrap && wrap.classList.contains('is-invalid')) validate(input, true);
      });
      if (input.type === 'checkbox') input.addEventListener('change', function () { validate(input, true); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      inputs.forEach(function (input) { if (!validate(input, true) && !firstBad) firstBad = input; });

      if (firstBad) {
        if (status) {
          status.className = 'form__status form__status--err is-visible';
          $('.form__status-text', status).textContent =
            'Please correct the highlighted fields and submit again.';
        }
        firstBad.focus();
        if (firstBad.scrollIntoView) firstBad.scrollIntoView({ block: 'center', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        return;
      }

      // No backend is wired up on this static build — hand off to the practice
      // inbox via a prefilled mail draft so the message is never silently lost.
      if (submit) { submit.classList.add('is-loading'); submit.setAttribute('aria-disabled', 'true'); }

      window.setTimeout(function () {
        var data = new FormData(form);
        var body = [
          'Name: ' + (data.get('firstName') || '') + ' ' + (data.get('lastName') || ''),
          'Email: ' + (data.get('email') || ''),
          'Phone: ' + (data.get('phone') || 'Not provided'),
          '',
          'Message:',
          data.get('comment') || '',
          '',
          '— Sent from longevityneurologycenter.com contact form'
        ].join('\n');

        window.location.href = 'mailto:info@longevityneurologycenter.com'
          + '?subject=' + encodeURIComponent('Website enquiry from ' + (data.get('firstName') || 'a visitor'))
          + '&body=' + encodeURIComponent(body);

        if (submit) { submit.classList.remove('is-loading'); submit.removeAttribute('aria-disabled'); }
        if (status) {
          status.className = 'form__status form__status--ok is-visible';
          $('.form__status-text', status).textContent =
            'Thank you — your email app should now be open with your message ready to send. '
            + 'If nothing opened, please email info@longevityneurologycenter.com directly.';
          status.focus();
        }
        form.reset();
        inputs.forEach(function (input) {
          var wrap = fieldOf(input);
          if (wrap) wrap.classList.remove('is-invalid');
          input.removeAttribute('aria-invalid');
        });
      }, 550);
    });
  })();

  /* --------------------------------------------------------- Back to top */
  (function backToTop() {
    var btn = $('.to-top');
    if (!btn) return;
    var ticking = false;
    function update() {
      btn.classList.toggle('is-visible', window.scrollY > 700);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      var skip = $('.skip-link'); if (skip) skip.focus({ preventScroll: true });
    });
    update();
  })();

  /* ----------------------------------------- Lazy-load the map on demand */
  (function lazyMap() {
    $$('[data-map-src]').forEach(function (holder) {
      if (!('IntersectionObserver' in window)) { inject(holder); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          inject(entry.target);
          io.unobserve(entry.target);
        });
      }, { rootMargin: '300px' });
      io.observe(holder);
    });
    function inject(holder) {
      if (holder.dataset.loaded) return;
      holder.dataset.loaded = '1';
      var frame = document.createElement('iframe');
      frame.src = holder.getAttribute('data-map-src');
      frame.title = holder.getAttribute('data-map-title') || 'Map';
      frame.loading = 'lazy';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      holder.appendChild(frame);
    }
  })();
})();
