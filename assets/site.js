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
  var toggle = document.querySelector('.nav-toggle'), nav = document.querySelector('.nav');
  if (toggle && nav) toggle.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.textContent = open ? 'Close' : 'Menu';
  });
  document.querySelectorAll('.has-menu > button').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var li = btn.parentElement, open = li.classList.toggle('open');
      document.querySelectorAll('.has-menu.open').forEach(function(o){ if (o !== li) { o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded','false'); } });
      btn.setAttribute('aria-expanded', open);
    });
  });
  document.addEventListener('click', function(){
    document.querySelectorAll('.has-menu.open').forEach(function(o){ o.classList.remove('open'); o.querySelector('button').setAttribute('aria-expanded','false'); });
  });

  /* 4. Mark the current page in the nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a[href]').forEach(function(a){
    if (a.getAttribute('href').split('#')[0] === here) a.setAttribute('aria-current','page');
  });

  /* 5. Hero animation: paint the still photo first, then fade in the
        animated sky once the page has finished loading. */
  var hero = document.querySelector('.hero iframe[data-src]');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('load', function(){
      hero.addEventListener('load', function(){ hero.classList.add('ready'); });
      hero.src = hero.getAttribute('data-src');
    });
  }

  /* 6. Footer year */
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });
})();
