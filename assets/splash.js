/* Neuro Longevity Care — first-visit splash.
   Loaded as the first thing inside <body> on every page. Plays once per
   browser session (sessionStorage), skips for prefers-reduced-motion, and
   any click / key / the Skip button jumps straight to the exit.
   Add ?splash to a URL to replay it. */
(function(){
  var KEY = 'nl-splash-seen';
  /* Playback speed: every duration and delay below is authored at 1x and
     scaled by this (0.5 = twice as fast, 0.7 = current). */
  var SPEED = 0.7;
  function T(ms){ return Math.round(ms * SPEED); }
  function scaleTimes(str){
    return str.replace(/(\d*\.?\d+)(ms|s)(?![a-z-])/g, function(_, n, u){
      return +(n * SPEED).toFixed(3) + u;
    });
  }
  var force = /[?&]splash\b/.test(location.search);
  try { if (!force && sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) {}
  if (!force && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- Logo pieces (cut from the primary logo artwork) ---------- */
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');
  /* Points inside logo-mark.webp, as fractions of its width / height */
  var SOMA = [.3225, .498];
  var AXON = [[.3225, .498], [.43, .58], [.57, .7], [.74, .855]];
  /* Where the olive "o" sits inside splash-wordmark.webp: left, top, width, height */
  var OLIVE = [.4795, .1484, .0685, .3709];

  var mark =
    '<div class="nlsp-art">' +
      '<img class="nlsp-img" src="' + BASE + 'logo-mark.webp" alt="" width="480" height="324">' +
      '<span class="nlsp-glow nlsp-soma" style="left:' + SOMA[0]*100 + '%;top:' + SOMA[1]*100 + '%"></span>' +
      '<span class="nlsp-glow nlsp-pulse"></span>' +
    '</div>';

  var word =
    '<div class="nlsp-word">' +
      '<img class="nlsp-img" src="' + BASE + 'splash-wordmark.webp" alt="" width="1200" height="272">' +
      '<span class="nlsp-o" style="left:' + OLIVE[0]*100 + '%;top:' + OLIVE[1]*100 + '%;width:' + OLIVE[2]*100 + '%;height:' + OLIVE[3]*100 + '%">' +
        '<img src="' + BASE + 'splash-olive.webp" alt="" width="160" height="196"></span>' +
    '</div>';

  var css =
  '#nlsp{position:fixed;inset:0;z-index:2147483000;background:#F6F1E7;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;' +
    'transition:transform 1s cubic-bezier(.77,0,.18,1);will-change:transform}' +
  '#nlsp::before{content:"";position:absolute;inset:-20%;background:radial-gradient(closest-side,rgba(201,211,188,.55),rgba(246,241,231,0) 70%) 50% 46%/70% 70% no-repeat;opacity:0;transform:scale(.7);transition:opacity 1.6s ease,transform 2.4s cubic-bezier(.16,1,.3,1)}' +
  '#nlsp.nlsp-a::before{opacity:1;transform:none}' +
  'html.nlsp-lock,html.nlsp-lock body{overflow:hidden}' +
  '#nlsp .nlsp-stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:clamp(14px,2.6vh,24px);padding:0 16px;transition:opacity .5s ease,transform 1s cubic-bezier(.77,0,.18,1)}' +
  '#nlsp.nlsp-out .nlsp-stage{opacity:0;transform:translateY(-6vh)}' +
  '#nlsp .nlsp-mark{width:min(460px,80vw,52vh);transform:translateY(var(--dy,0)) scale(1.16);transition:transform 1.05s cubic-bezier(.65,0,.2,1)}' +
  '#nlsp.nlsp-b .nlsp-mark{transform:none}' +
  '#nlsp .nlsp-net{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}' +
  '#nlsp .nlsp-img{display:block;width:100%;height:auto;max-width:none}' +
  /* the neuron grows out from the soma */
  '#nlsp .nlsp-art{position:relative}' +
  '#nlsp .nlsp-art .nlsp-img{clip-path:circle(0% at 32.25% 49.8%);filter:blur(6px);opacity:.4}' +
  '#nlsp.nlsp-a .nlsp-art .nlsp-img{animation:nlsp-grow 1.7s cubic-bezier(.45,0,.2,1) .15s forwards}' +
  '@keyframes nlsp-grow{55%{filter:blur(0);opacity:1}100%{clip-path:circle(80% at 32.25% 49.8%);filter:blur(0);opacity:1}}' +
  /* glows: the soma fires, then a signal runs down the axon */
  '#nlsp .nlsp-glow{position:absolute;width:13%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%) scale(0);opacity:0;pointer-events:none;mix-blend-mode:multiply;background:radial-gradient(closest-side,rgba(255,246,216,.95),rgba(233,201,138,.75) 40%,rgba(201,122,96,0))}' +
  '#nlsp .nlsp-soma{mix-blend-mode:normal;background:radial-gradient(closest-side,rgba(255,246,216,.85),rgba(233,201,138,.45) 45%,rgba(233,201,138,0))}' +
  '#nlsp.nlsp-a .nlsp-soma{animation:nlsp-fire 1s ease-out 1.1s}' +
  '@keyframes nlsp-fire{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}35%{opacity:1;transform:translate(-50%,-50%) scale(1.5)}100%{opacity:0;transform:translate(-50%,-50%) scale(2.2)}}' +
  '#nlsp .nlsp-pulse{width:7%;mix-blend-mode:normal}' +
  /* wordmark: wipes into focus left to right, then the olive "o" drops in */
  '#nlsp .nlsp-text{display:flex;flex-direction:column;align-items:center;gap:clamp(12px,2vh,20px);width:min(620px,86vw)}' +
  '#nlsp .nlsp-word{position:relative;width:100%}' +
  '#nlsp .nlsp-word .nlsp-img{-webkit-mask:linear-gradient(90deg,#000 40%,transparent 60%) 100% 0/250% 100% no-repeat;mask:linear-gradient(90deg,#000 40%,transparent 60%) 100% 0/250% 100% no-repeat;filter:blur(8px);opacity:.2;transform:translateY(.3em)}' +
  '#nlsp.nlsp-b .nlsp-word .nlsp-img{animation:nlsp-wipe 1.15s cubic-bezier(.2,.8,.2,1) .25s forwards}' +
  '@keyframes nlsp-wipe{70%{filter:blur(0)}100%{-webkit-mask-position:0 0;mask-position:0 0;filter:blur(0);opacity:1;transform:none}}' +
  '#nlsp .nlsp-o{position:absolute;opacity:0;transform:translateY(-140%) rotate(-70deg);transform-origin:50% 70%}' +
  '#nlsp .nlsp-o img{display:block;width:100%;height:100%;max-width:none}' +
  '#nlsp.nlsp-b .nlsp-o{animation:nlsp-drop .95s cubic-bezier(.3,1.55,.45,1) .75s forwards}' +
  '@keyframes nlsp-drop{0%{opacity:0;transform:translateY(-140%) rotate(-70deg)}25%{opacity:1}100%{opacity:1;transform:none}}' +
  '#nlsp .nlsp-tag{width:94%;opacity:0;transform:translateY(8px)}' +
  '#nlsp.nlsp-b .nlsp-tag{animation:nlsp-up .8s cubic-bezier(.2,.8,.2,1) 1.25s forwards}' +
  '@keyframes nlsp-up{to{opacity:1;transform:none}}' +
  /* stitched hem along the bottom edge — it leads the curtain on the way out */
  '#nlsp .nlsp-hem{position:absolute;left:0;right:0;bottom:0;height:24px;background:#EFE6D2;transform:translateY(100%);transition:transform .8s cubic-bezier(.2,.8,.2,1) .2s}' +
  '#nlsp.nlsp-a .nlsp-hem{transform:none}' +
  '#nlsp .nlsp-hem svg{display:block;width:100%;height:24px}' +
  '#nlsp .nlsp-skip{position:absolute;right:max(16px,env(safe-area-inset-right));bottom:44px;font:500 12px/1 "DM Sans",system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#55604A;background:none;border:0;padding:10px 12px;opacity:0;transition:opacity .6s ease .9s,color .2s}' +
  '#nlsp.nlsp-a .nlsp-skip{opacity:.75}#nlsp .nlsp-skip:hover{color:#A84E37;opacity:1}' +
  '#nlsp.nlsp-out{transform:translateY(-100%)}' +
  '#nlsp.nlsp-out .nlsp-skip{opacity:0;transition-delay:0s}';

  var HEM = '<svg aria-hidden="true"><defs><pattern id="nlsp-hp" width="28" height="24" patternUnits="userSpaceOnUse"><g fill="#C97A60"><rect x="12" y="3" width="3" height="3"/><rect x="9" y="6" width="3" height="3"/><rect x="15" y="6" width="3" height="3"/><rect x="6" y="9" width="3" height="3"/><rect x="18" y="9" width="3" height="3"/><rect x="9" y="12" width="3" height="3"/><rect x="15" y="12" width="3" height="3"/><rect x="12" y="15" width="3" height="3"/></g><rect x="12" y="9" width="3" height="3" fill="#4F6340"/><g fill="#6B8F6B"><rect x="0" y="9" width="3" height="3"/><rect x="25" y="9" width="3" height="3"/></g></pattern></defs><rect width="100%" height="24" fill="url(#nlsp-hp)"/></svg>';

  var style = document.createElement('style');
  style.textContent = scaleTimes(css);
  document.head.appendChild(style);

  var el = document.createElement('div');
  el.id = 'nlsp';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = scaleTimes(
    '<canvas class="nlsp-net"></canvas>' +
    '<div class="nlsp-stage">' +
      '<div class="nlsp-mark">' + mark + '</div>' +
      '<div class="nlsp-text">' + word +
        '<img class="nlsp-img nlsp-tag" src="' + BASE + 'splash-tagline.webp" alt="" width="1200" height="36">' +
      '</div>' +
    '</div>' +
    '<button class="nlsp-skip" type="button" tabindex="-1">Skip</button>' +
    '<div class="nlsp-hem">' + HEM + '</div>');

  var root = document.documentElement;
  root.classList.add('nlsp-lock');
  (document.body || root).insertBefore(el, (document.body || root).firstChild);

  /* Start the mark centred on screen; it glides up to make room for the name */
  var markEl = el.querySelector('.nlsp-mark');
  function centre(){
    /* offset* ignores transforms, so this is the mark's resting position */
    var stage = markEl.parentNode;
    markEl.style.setProperty('--dy', (stage.offsetHeight / 2 - (markEl.offsetTop + markEl.offsetHeight / 2)).toFixed(1) + 'px');
  }
  centre();

  /* Brain pulse: once the neuron fires, a wave spreads from the soma across
     the whole screen, lighting a hidden mesh of stitched nodes. Nodes light
     when the wavefront reaches them and the signal visibly runs along each
     connection; everything then settles to a faint network. */
  function pulse(){
    var cv = el.querySelector('.nlsp-net'), ctx = cv.getContext && cv.getContext('2d');
    if (!ctx) return;
    el.classList.add('nlsp-fire');
    var W = innerWidth, H = innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var r = el.querySelector('.nlsp-art').getBoundingClientRect();
    var ox = r.left + SOMA[0] * r.width, oy = r.top + SOMA[1] * r.height;
    /* keep the mesh out from behind the lockup: an oval clearing around it
       with a soft edge, so the network feathers in rather than boxing it */
    var st = el.querySelector('.nlsp-stage').getBoundingClientRect();
    var cx = st.left + st.width / 2, cy = st.top + st.height / 2, rx = st.width / 2 + 40, ry = st.height / 2 + 40;
    function weight(x, y){
      var e = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (e < 1) return 0;
      var k = Math.min(1, (e - 1) / .55);
      return k * k * (3 - 2 * k);
    }

    var gap = W < 600 ? 62 : 86, cols = Math.ceil(W / gap) + 1, rows = Math.ceil(H / gap) + 1;
    var maxD = Math.max(Math.hypot(ox, oy), Math.hypot(W - ox, oy), Math.hypot(ox, H - oy), Math.hypot(W - ox, H - oy));
    var speed = maxD / T(2200), grid = [], nodes = [], edges = [];
    for (var gy = 0; gy < rows; gy++) for (var gx = 0; gx < cols; gx++) {
      var x = gx * gap + (Math.random() - .5) * gap * .7, y = gy * gap + (Math.random() - .5) * gap * .7, n = null, w = weight(x, y);
      if (w > 0) {
        n = { x: x, y: y, w: w, hit: Math.hypot(x - ox, y - oy) / speed + Math.random() * T(160) };
        nodes.push(n);
      }
      grid.push(n);
    }
    function at2(gx, gy){ return gx < cols && gy < rows ? grid[gy * cols + gx] : null; }
    for (gy = 0; gy < rows; gy++) for (gx = 0; gx < cols; gx++) {
      var a = at2(gx, gy); if (!a) continue;
      [at2(gx + 1, gy), at2(gx, gy + 1), Math.random() < .5 ? at2(gx + 1, gy + 1) : null].forEach(function(b){
        if (b) edges.push(a.hit <= b.hit ? [a, b] : [b, a]);
      });
    }
    var last = nodes.reduce(function(m, n){ return Math.max(m, n.hit); }, 0), FADE = T(1500);
    function lit(n, t){ return t < n.hit ? -1 : Math.exp(-(t - n.hit) / FADE); }

    var t0 = performance.now();
    (function frame(now){
      if (!el.parentNode) return;
      var t = now - t0;
      ctx.clearRect(0, 0, W, H);

      /* the wavefront: two soft rings */
      [0, T(320)].forEach(function(lag, k){
        var R = (t - lag) * speed;
        if (R <= 0 || R > maxD) return;
        var a = (k ? .16 : .32) * (1 - R / maxD);
        ctx.lineWidth = k ? 1 : 1.6;
        ctx.strokeStyle = 'rgba(107,143,107,' + a + ')';
        ctx.beginPath(); ctx.arc(ox, oy, R, 0, Math.PI * 2); ctx.stroke();
      });

      /* connections: the signal travels from the earlier node to the later one */
      ctx.lineWidth = 1;
      edges.forEach(function(e){
        var a = e[0], b = e[1];
        if (t < a.hit) return;
        var p = b.hit > a.hit ? Math.min(1, (t - a.hit) / (b.hit - a.hit)) : 1;
        var l = Math.max(lit(a, t), lit(b, t), 0);
        ctx.strokeStyle = 'rgba(79,99,64,' + Math.min(a.w, b.w) * (.045 + .45 * l) + ')';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p); ctx.stroke();
      });

      /* nodes: tiny stitched crosses that flash terracotta as the wave hits */
      nodes.forEach(function(n){
        var l = lit(n, t);
        if (l < 0) return;
        var s = 2.2 * (1 + .7 * l), h = s / 2;
        if (l > .3) {
          var g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 14 * l);
          g.addColorStop(0, 'rgba(233,201,138,' + .55 * l * n.w + ')'); g.addColorStop(1, 'rgba(233,201,138,0)');
          ctx.fillStyle = g; ctx.fillRect(n.x - 14, n.y - 14, 28, 28);
        }
        ctx.fillStyle = 'rgba(107,143,107,' + n.w * (.16 + .66 * l) + ')';
        ctx.fillRect(n.x - h, n.y - h - s, s, s * 3); ctx.fillRect(n.x - h - s, n.y - h, s * 3, s);
        if (l > .25) {
          ctx.fillStyle = 'rgba(201,122,96,' + n.w * l * l + ')';
          ctx.fillRect(n.x - h, n.y - h, s, s);
        }
      });

      if (t < last + FADE * 2.5) requestAnimationFrame(frame);
    })(t0);
  }

  var timers = [], done = false;
  function at(ms, fn){ timers.push(setTimeout(fn, ms)); }

  function finish(){
    if (done) return; done = true;
    timers.forEach(clearTimeout);
    el.classList.add('nlsp-a', 'nlsp-b', 'nlsp-out');
    root.classList.remove('nlsp-lock');
    var remove = function(){ if (el.parentNode) el.parentNode.removeChild(el); style.remove && style.remove(); };
    el.addEventListener('transitionend', function(e){ if (e.target === el) remove(); });
    setTimeout(remove, T(1400));
    document.removeEventListener('keydown', finish, true);
  }

  /* Hold the wordmark until its images have loaded (max 3s) so nothing
     pops in half-drawn. */
  var imgsReady = Promise.all([].map.call(el.querySelectorAll('img'), function(img){
    return img.decode ? img.decode().catch(function(){}) : null;
  }));
  var fontReady = Promise.race([imgsReady, new Promise(function(res){ setTimeout(res, 3000); })]);

  /* The axon signal: a glow that runs from the soma to the axon terminal */
  function runAxon(){
    var p = el.querySelector('.nlsp-pulse');
    if (!p.animate) return;
    p.animate(AXON.map(function(pt, i){
      var edge = i === 0 || i === AXON.length - 1;
      return { left: pt[0]*100 + '%', top: pt[1]*100 + '%', opacity: edge ? 0 : 1,
               transform: 'translate(-50%,-50%) scale(' + (edge ? .4 : 1) + ')' };
    }), { duration: T(700), easing: 'cubic-bezier(.5,0,.6,1)', fill: 'forwards' });
  }

  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    el.classList.add('nlsp-a');
    at(T(1350), runAxon);
    at(T(1950), pulse);
    at(T(2050), function(){
      fontReady.then(function(){
        if (done) return;
        centre();
        el.classList.add('nlsp-b');
        at(T(2350), finish);
      });
    });
  }); });

  el.addEventListener('click', finish);
  document.addEventListener('keydown', finish, true);
  window.addEventListener('resize', function(){ if (!el.classList.contains('nlsp-b')) centre(); });
})();
