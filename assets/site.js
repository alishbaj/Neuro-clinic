(function(){
  var S = window.SITE || {links:{}, fallback:'contact.html'};

  /* 1. Wire every [data-link] element to the configured URL, or the
        Contact page when the URL has not been filled in yet. */
  document.querySelectorAll('[data-link]').forEach(function(el){
    var key = el.getAttribute('data-link');
    var url = (S.links && S.links[key]) || '';
    if (url) {
      el.setAttribute('href', url);
      if (/^https?:/i.test(url)) { el.setAttribute('target','_blank'); el.setAttribute('rel','noopener'); }
    } else {
      el.setAttribute('href', S.fallback || 'contact.html');
      el.setAttribute('data-unconfigured','');
    }
  });

  /* 2. Contact details */
  document.querySelectorAll('[data-phone]').forEach(function(el){
    if (S.phone) { el.textContent = S.phone; el.setAttribute('href','tel:' + S.phone.replace(/[^\d+]/g,'')); }
    else if (el.closest('[data-optional]')) el.closest('[data-optional]').hidden = true;
  });
  document.querySelectorAll('[data-email]').forEach(function(el){
    if (S.email) { el.textContent = S.email; el.setAttribute('href','mailto:' + S.email); }
    else if (el.closest('[data-optional]')) el.closest('[data-optional]').hidden = true;
  });

  /* 3. Mobile nav + dropdown menus */
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle'), nav = document.querySelector('.nav');
  var desktop = window.matchMedia('(min-width:1081px)'), hover = window.matchMedia('(hover:hover) and (pointer:fine)');
  function setDrawer(open){
    if (!toggle || !nav) return;
    if (open && header) nav.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    nav.classList.toggle('open', open);
    document.documentElement.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && nav) toggle.addEventListener('click', function(){ setDrawer(!nav.classList.contains('open')); });
  (desktop.addEventListener ? desktop.addEventListener.bind(desktop, 'change') : desktop.addListener.bind(desktop))(function(){ setDrawer(false); closeMenus(); });

  function setMenu(li, open){
    li.classList.toggle('open', open);
    li.querySelector('button').setAttribute('aria-expanded', open);
  }
  function closeMenus(except){
    document.querySelectorAll('.has-menu.open').forEach(function(o){ if (o !== except) setMenu(o, false); });
  }
  document.querySelectorAll('.has-menu').forEach(function(li){
    var btn = li.querySelector('button'), timer;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      closeMenus(li);
      setMenu(li, !li.classList.contains('open'));
    });
    /* desktop: open on hover, with a short grace period when leaving */
    li.addEventListener('mouseenter', function(){
      if (!desktop.matches || !hover.matches) return;
      clearTimeout(timer); closeMenus(li); setMenu(li, true);
    });
    li.addEventListener('mouseleave', function(){
      if (!desktop.matches || !hover.matches) return;
      timer = setTimeout(function(){ setMenu(li, false); }, 180);
    });
    li.addEventListener('focusout', function(e){
      if (desktop.matches && !li.contains(e.relatedTarget)) setMenu(li, false);
    });
  });
  document.addEventListener('click', function(e){ if (!e.target.closest('.has-menu')) closeMenus(); });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Escape') return;
    var open = document.querySelector('.has-menu.open');
    if (open) { setMenu(open, false); open.querySelector('button').focus(); }
    else if (nav && nav.classList.contains('open')) { setDrawer(false); toggle.focus(); }
  });

  /* Header gains a shadow and compacts once the page scrolls */
  if (header) {
    var onScroll = function(){ header.classList.toggle('scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 4. Mark the current page in the nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href]').forEach(function(a){
    if (a.getAttribute('href').split('#')[0] !== here || a.hasAttribute('data-link')) return;
    if (a.closest('.menu')) {
      /* only the first matching item, so brain-health.html doesn't mark the Blueprint anchor too */
      var li = a.closest('.has-menu');
      if (li.classList.contains('current')) return;
      li.classList.add('current');
    }
    a.setAttribute('aria-current','page');
  });

  /* 5. Footer year */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
