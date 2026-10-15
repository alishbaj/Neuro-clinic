/* Neuro Longevity Care — first-visit splash.
   Loaded as the first thing inside <body> on every page. Plays once per
   browser session (sessionStorage), skips for prefers-reduced-motion, and
   any click / key / the Skip button jumps straight to the exit.
   Add ?splash to a URL to replay it. */
(function(){
  var KEY = 'nl-splash-seen';
  /* Playback speed: every duration and delay below is authored at 1x and
     scaled by this (0.5 = twice as fast). */
  var SPEED = 0.5;
  function T(ms){ return Math.round(ms * SPEED); }
  function scaleTimes(str){
    return str.replace(/(\d*\.?\d+)(ms|s)(?![a-z-])/g, function(_, n, u){
      return +(n * SPEED).toFixed(3) + u;
    });
  }
  var force = /[?&]splash\b/.test(location.search);
  try { if (!force && sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) {}
  if (!force && window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- Logo geometry (from the primary logo) ---------- */
  var SOMA = [150, 130];
  var DENDRITES = 'M150 98C148 78 152 60 146 36M149 62C138 55 130 50 122 40M148 48C158 42 164 36 169 26M128 114C110 100 92 94 72 85M92 94C86 82 84 72 86 62M78 89C70 96 62 100 56 100M118 130C100 132 84 136 62 134M86 135C78 146 72 152 64 158M134 148C120 168 112 182 105 202M115 177C102 180 94 184 84 189M150 162C152 180 150 196 156 218M151 192C160 198 168 204 174 211M326 166C340 160 350 150 359 138M326 166C344 168 358 170 372 166M326 166C338 176 346 188 351 200';
  var STAR = {
    'nl-edge': 'M118 128M123 123M123 128M123 133M128 118M128 138M133 113M133 143M138 108M138 148M143 103M143 153M148 98M148 103M148 153M148 158M153 103M153 153M158 108M158 148M163 113M163 143M168 118M168 138M173 123M173 128M173 133M178 128',
    'nl-cream': 'M128 123M128 128M128 133M133 118M133 138M138 113M138 123M138 133M138 143M143 108M143 118M143 138M143 148M148 108M148 148M153 108M153 118M153 138M153 148M158 113M158 123M158 133M158 143M163 118M163 138M168 123M168 128M168 133',
    'nl-gr': 'M133 123M133 128M133 133M138 128M143 113M143 128M143 143M148 113M148 118M148 123M148 133M148 138M148 143M153 113M153 128M153 143M158 128M163 123M163 128M163 133',
    'nl-rd': 'M138 118M138 138M143 123M143 133M148 128M153 123M153 133M158 118M158 138'
  };
  /* Stitched crosses at each dendrite / terminal tip: centre point of each */
  var BUDS = [[146,34],[122,38],[170,24],[70,84],[86,60],[54,100],[60,134],[62,160],[104,204],[82,190],[156,220],[176,214],[360,136],[374,166],[352,202]];
  var LEAVES = [[176,101,-120],[182,95,-22],[194,83,-108],[201,76,-8],[211,67,-48]];

  function pts(d){ var out = [], re = /M(\d+) (\d+)/g, m; while ((m = re.exec(d))) out.push([+m[1], +m[2]]); return out; }
  function dist(a, b){ return Math.hypot(a[0]-b[0], a[1]-b[1]); }
  function sq(x, y, cls, delay){ return '<rect class="'+cls+' nlsp-px" x="'+x+'" y="'+y+'" width="4" height="4" style="--d:'+Math.round(delay)+'ms"/>'; }

  /* Tatreez star: stitches appear from the centre outward */
  var star = '';
  Object.keys(STAR).forEach(function(cls){
    pts(STAR[cls]).forEach(function(p){ star += sq(p[0], p[1], cls, 60 + dist([p[0]+2, p[1]+2], SOMA) * 13); });
  });

  /* Dendrites: a dashed "stitched" stroke revealed by a solid stroke in a mask */
  var dendMask = '', dendTiming = [];
  DENDRITES.split('M').filter(Boolean).forEach(function(seg){
    var s = seg.split(/[ C]/), start = [+s[0], +s[1]];
    var delay = 340 + dist(start, SOMA) * 3.6;
    dendTiming.push(delay);
    dendMask += '<path class="nlsp-draw" pathLength="1" d="M'+seg+'" style="--d:'+Math.round(delay)+'ms;--t:620ms"/>';
  });

  var buds = '';
  BUDS.forEach(function(b, i){
    var d = 760 + dist(b, SOMA) * 2.7, x = b[0]-2, y = b[1]-2;
    buds += '<g class="nlsp-bud'+(b[0] > 300 ? ' nlsp-term' : '')+'" style="--d:'+Math.round(d)+'ms">' +
      sq(x, y-5, 'nl-bud', 0) + sq(x, y+5, 'nl-bud', 0) + sq(x-5, y, 'nl-bud', 0) + sq(x+5, y, 'nl-bud', 0) + '</g>';
  });

  var myelin = '';
  [196, 228, 260, 292].forEach(function(x, i){
    myelin += '<g class="nlsp-pop" style="--d:'+(620 + i*105)+'ms"><rect class="nl-my" x="'+x+'" y="124" width="26" height="12" rx="6"/></g>';
  });

  var leaves = '';
  LEAVES.forEach(function(l, i){
    leaves += '<g transform="translate('+l[0]+' '+l[1]+') rotate('+l[2]+')"><g class="nlsp-leaf" style="--d:'+(1120 + i*85)+'ms">' +
      '<path class="nl-leaf" d="M0 0C8-8 22-8 30 0C22 8 8 8 0 0z"/><path class="nlsp-rib" d="M3 0H27"/></g></g>';
  });

  var mark =
    '<svg class="nlsp-svg" viewBox="40 8 348 226" aria-hidden="true">' +
      '<defs>' +
        '<mask id="nlsp-md" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="260"><g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round">'+dendMask+'</g></mask>' +
        '<mask id="nlsp-ma" maskUnits="userSpaceOnUse" x="0" y="0" width="420" height="260"><path class="nlsp-draw" pathLength="1" d="M182 130H331" fill="none" stroke="#fff" stroke-width="8" style="--d:430ms;--t:760ms"/></mask>' +
        '<radialGradient id="nlsp-glow"><stop offset="0" stop-color="#FFF6D8"/><stop offset=".35" stop-color="#E9C98A" stop-opacity=".9"/><stop offset="1" stop-color="#C97A60" stop-opacity="0"/></radialGradient>' +
      '</defs>' +
      '<path class="nl-st" d="'+DENDRITES+'" mask="url(#nlsp-md)"/>' +
      '<g transform="rotate(14 182 130)">' +
        '<path class="nl-st" d="M182 130H331" mask="url(#nlsp-ma)"/>' + myelin +
        '<circle class="nlsp-pulse" cx="182" cy="130" r="9" fill="url(#nlsp-glow)"/>' +
      '</g>' +
      '<path class="nl-stem nlsp-draw" pathLength="1" d="M166 112C178 98 190 86 214 64" style="--d:880ms;--t:560ms"/>' +
      '<path class="nl-stem nlsp-draw" pathLength="1" d="M188 89C192 96 196 100 198 103" style="--d:1160ms;--t:300ms"/>' +
      '<path class="nl-stem nlsp-draw" pathLength="1" d="M196 82C204 88 210 92 214 95" style="--d:1220ms;--t:300ms"/>' +
      leaves +
      '<g class="nlsp-olive" style="--d:1500ms"><ellipse class="nl-olive" cx="200" cy="112" rx="7" ry="9.5" transform="rotate(-20 200 112)"/><ellipse class="nlsp-hl" cx="198" cy="108" rx="1.8" ry="3" transform="rotate(-20 198 108)"/></g>' +
      '<g class="nlsp-olive" style="--d:1600ms"><ellipse class="nl-olive" cx="217" cy="104" rx="7" ry="9.5" transform="rotate(-35 217 104)"/><ellipse class="nlsp-hl" cx="215" cy="100" rx="1.8" ry="3" transform="rotate(-35 215 100)"/></g>' +
      '<g class="nlsp-soma">' + star + '</g>' +
      buds +
    '</svg>';

  /* Wordmark: letters come into focus one by one; the olive "o" drops in */
  var OLIVE_O = '<svg viewBox="0 0 28 40" aria-hidden="true"><path class="nlsp-o-stem" d="M15 15C15 11 16 8 18 5" fill="none" stroke="#4F6340" stroke-width="1.6" stroke-linecap="round"/><path class="nlsp-o-leaf" d="M17.5 6C20 1 26 0 28 2C26 6 21 8 17.5 6z" fill="#6B8F6B"/><ellipse cx="13.5" cy="26.5" rx="10.5" ry="12.8" transform="rotate(-10 13.5 26.5)" fill="#7E8F3E"/><ellipse cx="9.5" cy="22" rx="2.6" ry="4.6" transform="rotate(-18 9.5 22)" fill="#C3CB8E" opacity=".8"/></svg>';
  var word = '', i = 0;
  'NeuroL*ngevity'.split('').forEach(function(ch){
    if (ch === '*') word += '<span class="nlsp-o" style="--i:'+(i++)+'">'+OLIVE_O+'</span>';
    else word += '<span class="nlsp-ch" style="--i:'+(i++)+'">'+ch+'</span>';
  });

  var css =
  '#nlsp{position:fixed;inset:0;z-index:2147483000;background:#F6F1E7;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;' +
    'transition:transform 1s cubic-bezier(.77,0,.18,1);will-change:transform}' +
  '#nlsp::before{content:"";position:absolute;inset:-20%;background:radial-gradient(closest-side,rgba(201,211,188,.55),rgba(246,241,231,0) 70%) 50% 46%/70% 70% no-repeat;opacity:0;transform:scale(.7);transition:opacity 1.6s ease,transform 2.4s cubic-bezier(.16,1,.3,1)}' +
  '#nlsp.nlsp-a::before{opacity:1;transform:none}' +
  'html.nlsp-lock,html.nlsp-lock body{overflow:hidden}' +
  '#nlsp .nlsp-stage{position:relative;display:flex;flex-direction:column;align-items:center;gap:clamp(14px,2.6vh,24px);padding:0 16px;transition:opacity .5s ease,transform 1s cubic-bezier(.77,0,.18,1)}' +
  '#nlsp.nlsp-out .nlsp-stage{opacity:0;transform:translateY(-6vh)}' +
  '#nlsp .nlsp-mark{width:min(420px,80vw,58vh);transform:translateY(var(--dy,0)) scale(1.16);transition:transform 1.05s cubic-bezier(.65,0,.2,1)}' +
  '#nlsp.nlsp-b .nlsp-mark{transform:none}' +
  '#nlsp .nlsp-svg{display:block;width:100%;height:auto;overflow:visible}' +
  /* generic timed pieces */
  '#nlsp .nlsp-draw{stroke-dasharray:1;stroke-dashoffset:1}' +
  '#nlsp.nlsp-a .nlsp-draw{animation:nlsp-draw var(--t) cubic-bezier(.45,0,.2,1) var(--d) forwards}' +
  '@keyframes nlsp-draw{to{stroke-dashoffset:0}}' +
  '#nlsp .nlsp-px,#nlsp .nlsp-bud,#nlsp .nlsp-pop,#nlsp .nlsp-leaf,#nlsp .nlsp-olive{transform-box:fill-box;transform-origin:50% 50%;transform:scale(0);opacity:0}' +
  '#nlsp.nlsp-a .nlsp-px{animation:nlsp-stitch .42s cubic-bezier(.34,1.7,.5,1) var(--d) forwards}' +
  '@keyframes nlsp-stitch{0%{transform:scale(0) rotate(45deg);opacity:0}60%{opacity:1}100%{transform:none;opacity:1}}' +
  '#nlsp .nlsp-bud .nlsp-px{transform:none;opacity:1;animation:none!important}' +
  '#nlsp.nlsp-a .nlsp-bud{animation:nlsp-pop .5s cubic-bezier(.34,1.8,.5,1) var(--d) forwards}' +
  '#nlsp.nlsp-a .nlsp-pop{animation:nlsp-pop .45s cubic-bezier(.34,1.8,.5,1) var(--d) forwards}' +
  '@keyframes nlsp-pop{0%{transform:scale(0);opacity:0}50%{opacity:1}100%{transform:none;opacity:1}}' +
  '#nlsp.nlsp-a .nlsp-term{animation:nlsp-pop .5s cubic-bezier(.34,1.8,.5,1) var(--d) forwards,nlsp-fire .6s ease-out 1.9s}' +
  '@keyframes nlsp-fire{0%,100%{transform:none}40%{transform:scale(1.55)}}' +
  '#nlsp .nlsp-leaf{transform-origin:0% 50%;transform:scale(0) rotate(-35deg)}' +
  '#nlsp.nlsp-a .nlsp-leaf{animation:nlsp-leaf .7s cubic-bezier(.34,1.5,.5,1) var(--d) forwards}' +
  '@keyframes nlsp-leaf{0%{transform:scale(0) rotate(-35deg);opacity:0}30%{opacity:1}100%{transform:none;opacity:1}}' +
  '#nlsp .nlsp-rib{fill:none;stroke:#3F4A33;stroke-width:1;opacity:.55}' +
  '#nlsp .nlsp-hl{fill:#D3D9A6}' +
  '#nlsp .nlsp-olive{transform-origin:50% 0%;transform:translateY(-14px) scale(.4)}' +
  '#nlsp.nlsp-a .nlsp-olive{animation:nlsp-olive .65s cubic-bezier(.34,1.9,.5,1) var(--d) forwards}' +
  '@keyframes nlsp-olive{0%{transform:translateY(-14px) scale(.4);opacity:0}40%{opacity:1}100%{transform:none;opacity:1}}' +
  /* the signal travelling down the axon */
  '#nlsp .nlsp-pulse{opacity:0;transform-box:view-box}' +
  '#nlsp.nlsp-a .nlsp-pulse{animation:nlsp-pulse .62s cubic-bezier(.5,0,.6,1) 1.32s forwards}' +
  '@keyframes nlsp-pulse{0%{opacity:0;transform:translateX(0)}15%{opacity:1}85%{opacity:1}100%{opacity:0;transform:translateX(150px)}}' +
  /* the soma breathes once as the signal fires */
  '#nlsp .nlsp-soma{transform-box:fill-box;transform-origin:50% 50%}' +
  '#nlsp.nlsp-a .nlsp-soma{animation:nlsp-breathe .7s ease-in-out 1.1s}' +
  '@keyframes nlsp-breathe{0%,100%{transform:none}45%{transform:scale(1.12)}}' +
  /* wordmark */
  '#nlsp .nlsp-text{display:flex;flex-direction:column;align-items:center;gap:clamp(10px,1.6vh,14px);text-align:center}' +
  '#nlsp .nlsp-word{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(40px,9vw,84px);font-weight:600;line-height:.95;color:#2F3E2E;white-space:nowrap}' +
  '#nlsp .nlsp-ch{display:inline-block;opacity:0;transform:translateY(.38em);filter:blur(10px)}' +
  '#nlsp.nlsp-b .nlsp-ch{animation:nlsp-focus .9s cubic-bezier(.2,.8,.2,1) calc(260ms + var(--i) * 48ms) forwards}' +
  '@keyframes nlsp-focus{60%{filter:blur(0)}100%{opacity:1;transform:none;filter:blur(0)}}' +
  '#nlsp .nlsp-o{display:inline-block;width:.47em;height:.66em;vertical-align:-.02em;margin:0 .015em;opacity:0;transform:translateY(-1.1em) rotate(-70deg);transform-origin:50% 70%}' +
  '#nlsp .nlsp-o svg{display:block;width:100%;height:100%;overflow:visible}' +
  '#nlsp.nlsp-b .nlsp-o{animation:nlsp-drop .95s cubic-bezier(.3,1.55,.45,1) calc(380ms + var(--i) * 48ms) forwards}' +
  '@keyframes nlsp-drop{0%{opacity:0;transform:translateY(-1.1em) rotate(-70deg)}25%{opacity:1}100%{opacity:1;transform:none}}' +
  '#nlsp .nlsp-o-leaf{transform-box:fill-box;transform-origin:0% 100%}' +
  '#nlsp.nlsp-b .nlsp-o-leaf{animation:nlsp-flutter 1.1s ease-in-out 1.2s}' +
  '@keyframes nlsp-flutter{0%,100%{transform:none}30%{transform:rotate(-16deg)}65%{transform:rotate(7deg)}}' +
  '#nlsp .nlsp-care{display:flex;align-items:center;gap:clamp(12px,2vw,20px)}' +
  '#nlsp .nlsp-rule{width:clamp(44px,9vw,120px);height:1.5px;background:#6B8F6B;transform:scaleX(0)}' +
  '#nlsp .nlsp-rule:first-child{transform-origin:100% 50%}#nlsp .nlsp-rule:last-child{transform-origin:0 50%}' +
  '#nlsp.nlsp-b .nlsp-rule{animation:nlsp-rule .9s cubic-bezier(.65,0,.2,1) 1s forwards}' +
  '@keyframes nlsp-rule{to{transform:none}}' +
  '#nlsp .nlsp-care span:nth-child(2){font-family:"DM Sans",system-ui,sans-serif;font-size:clamp(17px,2.6vw,28px);letter-spacing:1.1em;padding-left:1.1em;text-transform:uppercase;color:#6B8F6B;opacity:0}' +
  '#nlsp.nlsp-b .nlsp-care span:nth-child(2){animation:nlsp-care 1.1s cubic-bezier(.2,.8,.2,1) 1s forwards}' +
  '@keyframes nlsp-care{to{opacity:1;letter-spacing:.5em;padding-left:.5em}}' +
  '#nlsp .nlsp-tag{font-family:"DM Sans",system-ui,sans-serif;font-size:clamp(10.5px,1.5vw,14px);letter-spacing:.24em;text-transform:uppercase;color:#55604A;margin-top:4px;opacity:0;transform:translateY(8px)}' +
  '#nlsp.nlsp-b .nlsp-tag{animation:nlsp-up .8s cubic-bezier(.2,.8,.2,1) 1.35s forwards}' +
  '#nlsp .nlsp-tag span{white-space:nowrap}' +
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
    '<div class="nlsp-stage">' +
      '<div class="nlsp-mark">' + mark + '</div>' +
      '<div class="nlsp-text">' +
        '<div class="nlsp-word">' + word + '</div>' +
        '<div class="nlsp-care"><span class="nlsp-rule"></span><span>Care</span><span class="nlsp-rule"></span></div>' +
        '<div class="nlsp-tag"><span>Neurology &middot; Brain Health &middot;</span> <span>Healthy Longevity</span></div>' +
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

  /* Hold the wordmark until its font is ready (max ~1s extra) so letters
     never swap typefaces mid-reveal. */
  var fontReady = new Promise(function(res){
    if (!document.fonts || !document.fonts.load) return res();
    document.fonts.load('600 84px "Cormorant Garamond"').then(res, res);
    setTimeout(res, 3000);
  });

  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    el.classList.add('nlsp-a');
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
