/*!
 * SAMT — Night Sky background (dark mode only)
 * Fixed to the viewport: it never moves with page scroll.
 * Layers: deep-space wash, Milky Way band with dust lanes, nebulae,
 * and three slowly-rotating parallax star fields.
 */
(function () {
  'use strict';
  if (window.__samtSky) return;
  window.__samtSky = true;

  var CSS = `
  .samt-sky{position:fixed;top:0;left:0;right:0;bottom:0;z-index:0;pointer-events:none;
    overflow:hidden;transition:opacity .9s ease;background:#05070F}
  html:not(.dark) .samt-sky{opacity:0}
  html.dark .samt-sky{opacity:1}

  /* the page paints an opaque body background in dark mode, which would
     cover the fixed sky - hand that job to <html> instead */
  html.dark{background-color:#05070F}
  html.dark body{background-color:transparent !important}

  .samt-sky div{position:absolute}

  /* deep space wash */
  .samt-base{top:0;left:0;width:100%;height:100%;
    background:
      radial-gradient(ellipse 80% 55% at 78% 12%, rgba(0,187,249,.10), transparent 62%),
      radial-gradient(ellipse 75% 55% at 12% 85%, rgba(121,40,202,.13), transparent 62%),
      radial-gradient(ellipse 60% 45% at 50% 40%, rgba(0,245,212,.05), transparent 70%),
      linear-gradient(180deg,#05070F 0%,#080B15 45%,#04060D 100%)}

  /* ---- Milky Way ---- */
  .samt-mw{top:50%;left:50%;width:240%;height:56vh;
    transform:translate(-50%,-50%) rotate(-21deg);
    -webkit-mask-image:radial-gradient(ellipse 58% 50% at 50% 50%,#000 30%,rgba(0,0,0,.35) 62%,transparent 80%);
    mask-image:radial-gradient(ellipse 58% 50% at 50% 50%,#000 30%,rgba(0,0,0,.35) 62%,transparent 80%);
    animation:samt-mw 300s linear infinite}
  .samt-mw-glow{top:0;left:0;width:100%;height:100%;filter:blur(26px);
    background:
      radial-gradient(ellipse 46% 46% at 28% 52%, rgba(160,195,255,.17), transparent 72%),
      radial-gradient(ellipse 34% 58% at 60% 46%, rgba(255,224,196,.13), transparent 72%),
      radial-gradient(ellipse 40% 40% at 82% 55%, rgba(190,170,255,.12), transparent 74%),
      radial-gradient(ellipse 70% 34% at 50% 50%, rgba(120,150,255,.10), transparent 78%)}
  .samt-mw-dust{top:0;left:0;width:100%;height:100%;filter:blur(16px);
    background:
      radial-gradient(ellipse 32% 14% at 40% 54%, rgba(4,6,13,.80), transparent 72%),
      radial-gradient(ellipse 24% 10% at 64% 45%, rgba(4,6,13,.70), transparent 72%),
      radial-gradient(ellipse 18% 8%  at 22% 48%, rgba(4,6,13,.60), transparent 72%)}

  /* ---- nebulae ---- */
  .samt-neb{border-radius:50%;filter:blur(70px);opacity:.55;
    animation:samt-neb 46s ease-in-out infinite alternate}
  .samt-neb.n1{width:44vw;height:44vw;top:-10%;right:-8%;
    background:radial-gradient(circle,rgba(0,187,249,.34),transparent 68%);animation-duration:52s}
  .samt-neb.n2{width:40vw;height:40vw;bottom:-14%;left:-10%;
    background:radial-gradient(circle,rgba(121,40,202,.34),transparent 68%);animation-duration:64s;animation-delay:-8s}
  .samt-neb.n3{width:30vw;height:30vw;top:34%;left:30%;
    background:radial-gradient(circle,rgba(0,245,212,.18),transparent 70%);animation-duration:58s;animation-delay:-20s}
  .samt-neb.n4{width:26vw;height:26vw;top:8%;left:8%;
    background:radial-gradient(circle,rgba(255,120,180,.16),transparent 70%);animation-duration:72s;animation-delay:-30s}

  /* ---- star fields ---- */
  .samt-stars{top:50%;left:50%;transform:translate(-50%,-50%)}
  .samt-stars i{position:absolute;top:0;left:0;border-radius:50%;background:transparent}
  .samt-s1{animation:samt-spin 900s linear infinite}
  .samt-s2{animation:samt-spin 1400s linear infinite reverse}
  .samt-s3{animation:samt-spin 2000s linear infinite}
  .samt-tw1{animation:samt-tw 4.5s ease-in-out infinite alternate}
  .samt-tw2{animation:samt-tw 7s   ease-in-out infinite alternate -2s}
  .samt-tw3{animation:samt-tw 3.2s ease-in-out infinite alternate -1s}


  @keyframes samt-mw{
    0%{transform:translate(-50%,-50%) rotate(-21deg) translateX(0)}
    100%{transform:translate(-50%,-50%) rotate(-21deg) translateX(-6%)}}
  @keyframes samt-neb{
    0%{transform:translate(0,0) scale(1);opacity:.40}
    100%{transform:translate(2.5vw,-2vw) scale(1.16);opacity:.68}}
  @keyframes samt-spin{to{transform:translate(-50%,-50%) rotate(360deg)}}
  @keyframes samt-tw{0%{opacity:.45}100%{opacity:1}}

  @media (prefers-reduced-motion: reduce){
    .samt-sky *{animation:none !important}}
  `;

  // Build a box-shadow star field. Returns a CSS box-shadow string.
  function field(count, w, h, band, blur) {
    var out = [], i, x, y, o;
    blur = blur || 0;
    for (i = 0; i < count; i++) {
      x = Math.random() * w;
      if (band) {
        // concentrate near the horizontal centre line (Milky Way)
        y = h / 2 + (Math.random() + Math.random() + Math.random() - 1.5) * (h * 0.22);
      } else {
        y = Math.random() * h;
      }
      o = (0.45 + Math.random() * 0.55).toFixed(2);
      out.push(x.toFixed(0) + 'px ' + y.toFixed(0) + 'px ' + blur + 'px rgba(255,255,255,' + o + ')');
    }
    return out.join(',');
  }

  function dot(size, shadow, cls) {
    var el = document.createElement('i');
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.boxShadow = shadow;
    if (cls) el.className = cls;
    return el;
  }

  // A square big enough that, at ANY rotation angle, it still covers the
  // viewport - otherwise the spinning star field slowly drifts out of view.
  function layer(cls, size, count, D, twinkle, blur) {
    var d = document.createElement('div');
    d.className = 'samt-stars ' + cls;
    d.style.width = D + 'px';
    d.style.height = D + 'px';
    d.appendChild(dot(size, field(count, D, D, false, blur), twinkle));
    return d;
  }

  function build() {
    // remove the old static background if the page still has it
    var old = document.querySelector('.celestial-canvas');
    if (old && old.parentNode) old.parentNode.removeChild(old);
    if (document.querySelector('.samt-sky')) return;

    var style = document.createElement('style');
    style.id = 'samt-sky-style';
    style.textContent = CSS;
    document.head.appendChild(style);

    var vw = Math.max(window.innerWidth, 360);
    var vh = Math.max(window.innerHeight, 480);
    // diagonal * margin => the rotating layers always cover the screen
    var D = Math.ceil(Math.sqrt(vw * vw + vh * vh) * 1.45);

    var sky = document.createElement('div');
    sky.className = 'samt-sky';
    sky.setAttribute('aria-hidden', 'true');

    var base = document.createElement('div');
    base.className = 'samt-base';
    sky.appendChild(base);

    ['n1', 'n2', 'n3', 'n4'].forEach(function (n) {
      var d = document.createElement('div');
      d.className = 'samt-neb ' + n;
      sky.appendChild(d);
    });

    // Milky Way: diffuse light, dense stars along the band, then dust lanes on top
    var mw = document.createElement('div');
    mw.className = 'samt-mw';
    var glow = document.createElement('div');
    glow.className = 'samt-mw-glow';
    mw.appendChild(glow);

    var mwStars = document.createElement('div');
    mwStars.className = 'samt-stars';
    mwStars.style.width = '100%';
    mwStars.style.height = '100%';
    mwStars.style.top = '0';
    mwStars.style.left = '0';
    mwStars.style.transform = 'none';
    var mwW = Math.round(vw * 2.4), mwH = Math.round(vh * 0.56);
    mwStars.style.width = mwW + 'px';
    mwStars.style.height = mwH + 'px';
    mwStars.appendChild(dot(1, field(560, mwW, mwH, true), 'samt-tw3'));
    mw.appendChild(mwStars);

    var dust = document.createElement('div');
    dust.className = 'samt-mw-dust';
    mw.appendChild(dust);
    sky.appendChild(mw);

    // three parallax star fields
    sky.appendChild(layer('samt-s1', 1, 430, D, 'samt-tw1', 0));
    sky.appendChild(layer('samt-s2', 1.6, 180, D, 'samt-tw2', 1));
    sky.appendChild(layer('samt-s3', 2.2, 70, D, 'samt-tw3', 3));

    document.body.insertBefore(sky, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
