// ─────────────────────────────────────────────────────────────────────────────
//  KLARTEXT · Das Feld – lebender Hintergrund (WebGL2, ohne Abhängigkeiten).
//  Eigene Umsetzung der Idee hinter ShapeWaves (React Bits): Jede 24-px-Zelle trägt eine Form
//  (Quadrat · Kreis · Dreieck), gewählt von einem langsam fließenden Rauschfeld. Leuchten nur im
//  dunklen Theme. Reagiert nur auf Ereignisse (puls, front), nie als Deko auf die Maus.
// ─────────────────────────────────────────────────────────────────────────────

// Pegel bewusst zurückhaltend (Rückmeldung aus der Praxis): Das Feld darf beim Lesen nicht den
// Blick ziehen – dunkel, klein, langsam; hinter Text fast ganz aus.
const PEGEL = {
  laut: { level: 0.4, speed: 0.22, glow: 0.15 },
  leise: { level: 0.14, speed: 0.09, glow: 0.08 },
  aus: { level: 0, speed: 0, glow: 0 },
};
const QUIET = 0.06; // Ruhezone hinter Textblöcken: praktisch leer
const DOT = 0.5; // Formgröße relativ zur Zelle
/** Modus für Zuschauer (z. B. per Taste umschaltbar): ruhig (Standard) → still (keine Bewegung, Pulse bleiben) → aus. */
export const MODI = ['ruhig', 'still', 'aus'];
const CELL = 24;
const INTRO_END = 1.66;

const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform vec2 uRes, uGrid; uniform float uCell, uTime, uNoise, uDot, uLevel, uQuietLvl, uIntro, uIntroMode, uMaskAmt, uGlow;
uniform vec3 uBg, uCol, uHi; uniform sampler2D uMask, uCharge, uQuiet;
out vec4 o;
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+10.)*x);}
vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}
vec3 fd(vec3 t){return t*t*t*(t*(t*6.-15.)+10.);}
float cnoise(vec3 P){
  vec3 Pi0=floor(P), Pi1=Pi0+vec3(1.); Pi0=mod289(Pi0); Pi1=mod289(Pi1);
  vec3 Pf0=fract(P), Pf1=Pf0-vec3(1.);
  vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x), iy=vec4(Pi0.yy,Pi1.yy), iz0=Pi0.zzzz, iz1=Pi1.zzzz;
  vec4 ixy=permute(permute(ix)+iy), ixy0=permute(ixy+iz0), ixy1=permute(ixy+iz1);
  vec4 gx0=ixy0*(1./7.), gy0=fract(floor(gx0)*(1./7.))-.5; gx0=fract(gx0);
  vec4 gz0=vec4(.5)-abs(gx0)-abs(gy0), sz0=step(gz0,vec4(0.));
  gx0-=sz0*(step(0.,gx0)-.5); gy0-=sz0*(step(0.,gy0)-.5);
  vec4 gx1=ixy1*(1./7.), gy1=fract(floor(gx1)*(1./7.))-.5; gx1=fract(gx1);
  vec4 gz1=vec4(.5)-abs(gx1)-abs(gy1), sz1=step(gz1,vec4(0.));
  gx1-=sz1*(step(0.,gx1)-.5); gy1-=sz1*(step(0.,gy1)-.5);
  vec3 g000=vec3(gx0.x,gy0.x,gz0.x), g100=vec3(gx0.y,gy0.y,gz0.y), g010=vec3(gx0.z,gy0.z,gz0.z), g110=vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001=vec3(gx1.x,gy1.x,gz1.x), g101=vec3(gx1.y,gy1.y,gz1.y), g011=vec3(gx1.z,gy1.z,gz1.z), g111=vec3(gx1.w,gy1.w,gz1.w);
  vec4 n0=tis(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110))); g000*=n0.x; g010*=n0.y; g100*=n0.z; g110*=n0.w;
  vec4 n1=tis(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111))); g001*=n1.x; g011*=n1.y; g101*=n1.z; g111*=n1.w;
  float n000=dot(g000,Pf0), n100=dot(g100,vec3(Pf1.x,Pf0.yz)), n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z)), n110=dot(g110,vec3(Pf1.xy,Pf0.z));
  float n001=dot(g001,vec3(Pf0.xy,Pf1.z)), n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z)), n011=dot(g011,vec3(Pf0.x,Pf1.yz)), n111=dot(g111,Pf1);
  vec3 f=fd(Pf0); vec4 nz=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),f.z); vec2 ny=mix(nz.xy,nz.zw,f.y);
  return 2.2*mix(ny.x,ny.y,f.x);
}
float fbm(vec3 p){ return (cnoise(p)+.5*cnoise(p*2.))/1.5; }
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float sdTri(vec2 p, vec2 q){ p.x=abs(p.x); vec2 a=p-q*clamp(dot(p,q)/dot(q,q),0.,1.); vec2 b=p-q*vec2(clamp(p.x/q.x,0.,1.),1.);
  float s=-sign(q.y); vec2 d=min(vec2(dot(a,a),s*(p.x*q.y-p.y*q.x)),vec2(dot(b,b),s*(p.y-q.y))); return -sqrt(d.x)*sign(d.y); }
float shapeD(vec2 p, int sh, float c){ if(sh==0) return max(abs(p.x),abs(p.y))-c; if(sh==1) return length(p)-c; return sdTri(vec2(p.x,p.y+c),vec2(c,2.*c)); }
void main(){
  float A0=uGlow>.5?0.:1.; // mit Leuchten: Alpha = Leuchtanteil fürs Bloom
  vec2 px=vec2(gl_FragCoord.x, uRes.y-gl_FragCoord.y);
  vec2 cell=floor(px/uCell);
  if(cell.x>=uGrid.x||cell.y>=uGrid.y){ o=vec4(uBg,A0); return; }
  vec2 c=(cell+.5)*uCell, lp=(px-c)/(uCell*.5), cuv=c/uRes;
  if(texture(uMask,cuv).r > 1.-uMaskAmt*.5){ o=vec4(uBg,A0); return; }
  vec2 q=abs(cuv*2.-1.); float r=pow(pow(q.x,2.5)+pow(q.y,2.5),.4)/pow(2.,.4);
  float lvl=1.-smoothstep(.45,1.,r);
  lvl*=mix(1.,uQuietLvl,texelFetch(uQuiet,ivec2(cell),0).r);
  float tone=clamp((fbm(vec3(c/uNoise+vec2(12.9898,78.233),uTime))*.5+.5-.54)*2.8+.5,0.,1.);
  int band=int(min(tone,.999)*3.);
  float ch=texelFetch(uCharge,ivec2(cell),0).r;
  int sh=2-(band+int(clamp(ch,0.,.999)*3.))%3; float size=uDot, front=0.;
  if(uIntro<${INTRO_END.toFixed(2)}){
    float spread = uIntroMode<.5 ? length((c-uRes*.5)/(uRes*.5))*.7071 : (uIntroMode<1.5 ? cuv.x : 1.-cuv.x);
    spread += cnoise(vec3(cuv*vec2(3.2,2.4)+vec2(12.9898,78.233),4.7))*.3 + hash(cell)*.16 + .3;
    float bw=.2*(.6+.8*hash(cell+vec2(17.,9.))), t=clamp((uIntro-spread)/bw,0.,1.);
    if(t<=0.){ o=vec4(uBg,A0); return; }
    float bk=t-1.; size=max(size*(1.+2.70158*bk*bk*bk+1.70158*bk*bk),.02);
    front=1.-smoothstep(0.,1.,abs(uIntro-spread)/bw);
  }
  float aa=2./uCell, cov=smoothstep(aa,-aa,shapeD(lp,sh,size));
  float hot=max(smoothstep(.15,.85,ch),front*.5);
  vec3 tint=mix(uCol,uHi,hot);
  float a=cov*lvl*mix(uLevel,1.,hot*step(.001,uLevel+hot));
  float g=max(0.,(dot(tint,vec3(.2126,.7152,.0722))-.6)/.4)*a;
  o=vec4(mix(uBg,tint,a), uGlow>.5?g:1.);
}`;

// Bloom wie im Original: Leuchtanteil halb aufgelöst weichzeichnen (x, dann y), dann addieren
const BLUR = `#version 300 es
precision highp float;
uniform sampler2D uSrc; uniform vec2 uDir, uSize; uniform float uSigma, uPremul; out vec4 o;
void main(){ vec2 uv=gl_FragCoord.xy/uSize; vec3 s=vec3(0.); float w=0.;
  for(int i=-12;i<=12;i++){ float f=float(i); if(abs(f)>ceil(3.*uSigma)) continue; float k=exp(-(f*f)/(2.*uSigma*uSigma));
    vec4 t=texture(uSrc,uv+f*uDir); s+=(uPremul>.5?t.rgb*t.a:t.rgb)*k; w+=k; }
  o=vec4(s/w,1.); }`;

const COMP = `#version 300 es
precision highp float;
uniform sampler2D uScene, uGlowT; uniform vec2 uRes; uniform float uStr; out vec4 o;
void main(){ vec2 uv=gl_FragCoord.xy/uRes; o=vec4(texture(uScene,uv).rgb+texture(uGlowT,uv).rgb*uStr,1.); }`;

const hex3 = (h) => {
  h = String(h).trim().replace('#', '');
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/** Textblöcke, hinter denen das Feld zur Ruhe kommt (Standard für ruhe: true). */
const RUHE_STANDARD = 'h1,h2,h3,h4,p,li,blockquote,table,.card,.frame,.node,.badge,.stat,.statement,.label-mono,.kt-meta,[data-ruhe]';

/**
 * Das Feld als eigenständiger Baustein für jede Seite.
 *   const feld = new Feld(document.querySelector('.hero'), { pegel: 'laut', maske: { text: '</>', x: 0.3, y: 0.4, size: 0.4 } });
 *   feld.puls(x, y)          – Ringwelle (Koordinaten in CSS-px relativ zum Container)
 *   feld.front(+1 | -1)      – Aufbau als Front von links (bzw. rechts), z. B. beim Seiten-/Abschnittswechsel
 *   feld.maskAmount = 0…1    – Glyphe auflösen (mit GSAP tweenbar)
 *   feld.set({ pegel, maske, ruhe }) · feld.measure() nach Layout-Änderungen · feld.destroy()
 * Der Container bekommt data-feld-host (für motion.js) und muss position: relative/absolute haben.
 * Farben kommen aus den CSS-Variablen --bg, --f-dot, --f-hi des Containers (klartext.css) – Theme-Wechsel
 * über data-theme werden automatisch übernommen. Ohne WebGL2 wirft der Konstruktor; dann .kt-raster nutzen.
 */
export class Feld {
  constructor(host, { pegel = 'leise', maske = null, ruhe = true, intro = true, reduced = matchMedia('(prefers-reduced-motion: reduce)').matches } = {}) {
    this.host = host;
    this.reduced = reduced;
    this.opts = { pegel, maske, ruhe };
    this.time = Math.random() * 20;
    this.intro = INTRO_END;
    this.introMode = 0;
    this.active = false;
    this.maskAmount = 1;
    this.modus = 'ruhig';
    this.cols = 1;
    this.rows = 1;
    const cv = (this.cv = document.createElement('canvas'));
    cv.className = 'feld';
    cv.setAttribute('aria-hidden', 'true');
    Object.assign(cv.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', pointerEvents: 'none', zIndex: '0' });
    const gl = (this.gl = cv.getContext('webgl2', { antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' }));
    if (!gl) throw new Error('WebGL2 nicht verfügbar');
    const sh = (t, s) => {
      const x = gl.createShader(t);
      gl.shaderSource(x, s);
      gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x));
      return x;
    };
    const link = (fs, names) => {
      const pr = gl.createProgram();
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(pr, 0, 'p');
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(pr));
      const u = {};
      names.forEach((n) => (u[n] = gl.getUniformLocation(pr, n)));
      return { pr, u };
    };
    this.main = link(FS, ['uRes', 'uGrid', 'uCell', 'uTime', 'uNoise', 'uDot', 'uLevel', 'uQuietLvl', 'uIntro', 'uIntroMode', 'uMaskAmt', 'uGlow', 'uBg', 'uCol', 'uHi', 'uMask', 'uCharge', 'uQuiet']);
    this.blur = link(BLUR, ['uSrc', 'uDir', 'uSize', 'uSigma', 'uPremul']);
    this.comp = link(COMP, ['uScene', 'uGlowT', 'uRes', 'uStr']);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    this.texMask = this.tex(0, gl.LINEAR);
    this.texCh = this.tex(1, gl.NEAREST);
    this.texQ = this.tex(4, gl.NEAREST);
    this.mc = document.createElement('canvas');

    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.setAttribute('data-feld-host', '');
    host.insertBefore(cv, host.firstChild);
    this.loop = this.loop.bind(this);
    this.cur = { level: 0, speed: 0.35, glow: 0.35 };
    this.readColors(true);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.mo = new MutationObserver(() => this.readColors(true));
    this.mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    cv.addEventListener('webglcontextlost', (e) => (e.preventDefault(), (this.lost = true)));
    this.resize();
    this.set({ pegel, maske, ruhe });
    document.fonts?.ready.then(() => (this.drawMask(true), this.measure()));
    if (intro && !reduced) this.play(0, 1.6);
  }

  tex(unit, filter) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  upload(unit, t, data) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, this.cols, this.rows, 0, gl.RED, gl.UNSIGNED_BYTE, data);
  }
  target(w, h) {
    const gl = this.gl;
    const t = this.tex(2, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { t, fb, w, h };
  }

  /** Layout-Größe des Containers (CSS-px, ohne Skalierung) und Skalierung auf dem Bildschirm. */
  size() {
    const r = this.host.getBoundingClientRect();
    const w = this.host.offsetWidth || r.width;
    const h = this.host.offsetHeight || r.height;
    return { w, h, k: r.width / (w || 1) || 1 };
  }

  resize() {
    const { w: cw, h: ch, k } = this.size();
    if (!cw || !ch) return;
    const q = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.max(48, Math.round(cw * k * q));
    const H = Math.max(48, Math.round(ch * k * q));
    if (W === this.cv.width && H === this.cv.height && this.rt) return;
    if (this.rt) Object.values(this.rt).forEach((r) => (this.gl.deleteTexture(r.t), this.gl.deleteFramebuffer(r.fb)));
    this.cv.width = W;
    this.cv.height = H;
    this.css = { w: cw, h: ch };
    this.cols = Math.max(1, Math.round(cw / CELL));
    this.cell = W / this.cols;
    this.rows = Math.max(1, Math.ceil(H / this.cell));
    const n = this.cols * this.rows;
    this.h0 = new Float32Array(n);
    this.h1 = new Float32Array(n);
    this.ch = new Uint8Array(n);
    this.q = new Float32Array(n);
    this.q8 = new Uint8Array(n);
    this.active = false;
    this.upload(1, this.texCh, this.ch);
    this.rt = { scene: this.target(W, H), a: this.target(Math.ceil(W / 2), Math.ceil(H / 2)), b: this.target(Math.ceil(W / 2), Math.ceil(H / 2)) };
    this.drawMask(true);
    this.measure();
  }

  /** Pegel, Maske, Ruhezonen ändern. pegel: 'laut' | 'leise' | 'aus'. ruhe: true | false | CSS-Selektor. */
  set(o = {}) {
    Object.assign(this.opts, o);
    let p = PEGEL[this.opts.pegel] || PEGEL.leise;
    if (this.modus === 'aus') p = PEGEL.aus;
    else if (this.modus === 'still') p = { ...p, speed: 0 };
    this.goal = { level: p.level, speed: p.speed, glow: p.glow };
    if (this.reduced) Object.assign(this.cur, this.goal);
    if ('maske' in o) this.drawMask(true);
    if ('ruhe' in o) this.measure();
    this.wake();
  }

  /** Modus umschalten: 'ruhig' | 'still' | 'aus' (gleitet weich hinüber). */
  setModus(m) {
    if (!MODI.includes(m)) return;
    this.modus = m;
    if (m === 'aus' && this.h0) this.h0.fill(0), this.h1.fill(0), this.ch.fill(0), (this.active = false), (this.intro = INTRO_END);
    this.set();
  }

  drawMask(force = false) {
    const m = this.opts.maske;
    const key = m && this.opts.pegel !== 'aus' ? JSON.stringify(m) : '';
    if (key === this.maskKey && !force) return;
    this.maskKey = key;
    const w = 960;
    const h = Math.max(1, Math.round(w * ((this.css?.h || 540) / (this.css?.w || 960))));
    this.mc.width = w;
    this.mc.height = h;
    const x = this.mc.getContext('2d');
    x.fillStyle = '#000';
    x.fillRect(0, 0, w, h);
    if (key) {
      const { text = '</>', x: mx = 0.5, y: my = 0.45, size = 0.5 } = typeof m === 'string' ? { text: m } : m;
      x.fillStyle = '#fff';
      x.font = `700 ${size * h}px "Martian Mono", ui-monospace, monospace`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.globalAlpha = 0.18;
      for (let r = 10; r >= 2; r -= 4) for (let a = 0; a < 8; a++) x.fillText(text, mx * w + r * Math.cos(a), my * h + r * Math.sin(a));
      x.globalAlpha = 1;
      x.fillText(text, mx * w, my * h);
    }
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texMask);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.mc);
    this.wake();
  }

  /** Ruhezonen neu messen (nach Layout-Änderungen aufrufen). */
  measure() {
    if (!this.q) return;
    const q = new Float32Array(this.cols * this.rows);
    const sel = this.opts.ruhe === true ? RUHE_STANDARD : this.opts.ruhe;
    if (sel) {
      const base = this.host.getBoundingClientRect();
      const { k } = this.size();
      this.host.querySelectorAll(sel).forEach((e) => {
        if (e === this.cv || e.closest('svg')) return;
        const r = e.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const pad = 12;
        const x0 = Math.max(0, Math.floor(((r.left - base.left) / k - pad) / CELL));
        const x1 = Math.min(this.cols - 1, Math.floor(((r.right - base.left) / k + pad) / CELL));
        const y0 = Math.max(0, Math.floor(((r.top - base.top) / k - pad) / CELL));
        const y1 = Math.min(this.rows - 1, Math.floor(((r.bottom - base.top) / k + pad) / CELL));
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) q[y * this.cols + x] = 1;
      });
    }
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        let s = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy < 0 || xx < 0 || yy >= this.rows || xx >= this.cols) continue;
            s += q[yy * this.cols + xx];
            n += 1;
          }
        const i = y * this.cols + x;
        this.q8[i] = Math.max(q[i], s / n) * 255;
      }
    this.upload(4, this.texQ, this.q8);
    this.wake();
  }

  readColors(now = false) {
    const cs = getComputedStyle(this.host);
    const get = (n, d) => hex3(cs.getPropertyValue(n).trim() || d);
    this.colGoal = { bg: get('--bg', '#0b0b0c'), dot: get('--f-dot', '#7c7c80'), hi: get('--f-hi', '#f2f1ec') };
    if (now || !this.cur.bg) Object.assign(this.cur, { bg: [...this.colGoal.bg], dot: [...this.colGoal.dot], hi: [...this.colGoal.hi] });
    this.dark = this.colGoal.bg[0] * 0.2126 + this.colGoal.bg[1] * 0.7152 + this.colGoal.bg[2] * 0.0722 < 0.5;
    this.wake();
  }

  /** Aufbau als Front: dir +1 von links, -1 von rechts, 0 radial aus der Mitte. */
  front(dir = 1) {
    if (this.reduced || this.modus === 'aus') return;
    this.play(dir > 0 ? 1 : dir < 0 ? 2 : 0, dir ? 0.9 : 1.6);
  }
  play(mode, dur) {
    this.introMode = mode;
    this.introDur = dur;
    this.intro = 0;
    this.t0 = performance.now();
    this.wake();
  }

  /** Ringwelle an (x, y) in CSS-px relativ zum Container. */
  puls(x, y, strength = 1, radius = 70) {
    if (this.reduced || this.lost || !this.h0 || this.modus === 'aus') return;
    const sig = Math.max(0.5, (radius / CELL) * 0.5);
    const reach = Math.ceil(sig * 2.5);
    const cc = x / CELL - 0.5;
    const cr = y / CELL - 0.5;
    for (let r = Math.max(0, Math.floor(cr - reach)); r <= Math.min(this.rows - 1, Math.ceil(cr + reach)); r++)
      for (let c = Math.max(0, Math.floor(cc - reach)); c <= Math.min(this.cols - 1, Math.ceil(cc + reach)); c++) {
        const i = r * this.cols + c;
        this.h0[i] = Math.min(1.2, this.h0[i] + strength * Math.exp(-((c - cc) ** 2 + (r - cr) ** 2) / (2 * sig * sig)));
      }
    this.active = true;
    this.wake();
  }

  step() {
    const { cols, rows } = this;
    let peak = 0;
    const H = this.h0;
    const P = this.h1;
    for (let r = 0; r < rows; r++) {
      const up = (r ? r - 1 : r) * cols;
      const dn = (r === rows - 1 ? r : r + 1) * cols;
      const b = r * cols;
      for (let c = 0; c < cols; c++) {
        const i = b + c;
        const h = H[i];
        const lap = H[b + (c ? c - 1 : c)] + H[b + (c === cols - 1 ? c : c + 1)] + H[up + c] + H[dn + c] - 4 * h;
        const nx = (h + (h - P[i]) * 0.94 + 0.42 * lap) * 0.972;
        P[i] = nx;
        const v = nx < 0 ? 0 : nx > 1 ? 1 : nx;
        this.ch[i] = v * 255;
        if (v > peak) peak = v;
      }
    }
    this.h0 = P;
    this.h1 = H;
    if (peak < 0.01) {
      this.h0.fill(0);
      this.h1.fill(0);
      this.ch.fill(0);
      this.active = false;
    }
  }

  ease(dt) {
    const k = 1 - Math.exp(-dt * 9);
    const c = this.cur;
    let moving = false;
    ['level', 'speed', 'glow'].forEach((key) => {
      const d = this.goal[key] - c[key];
      if (Math.abs(d) > 0.002) (c[key] += d * k), (moving = true);
      else c[key] = this.goal[key];
    });
    ['bg', 'dot', 'hi'].forEach((key) => {
      for (let i = 0; i < 3; i++) {
        const d = this.colGoal[key][i] - c[key][i];
        if (Math.abs(d) > 0.002) (c[key][i] += d * k), (moving = true);
        else c[key][i] = this.colGoal[key][i];
      }
    });
    return moving;
  }

  wake() {
    if (!this.raf && !this.lost && !this.dead) this.raf = requestAnimationFrame(this.loop);
  }
  loop(now) {
    this.raf = 0;
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    if (this.render(now, dt)) this.wake();
    else this.last = 0;
  }

  render(now, dt) {
    if (!this.rt || this.lost || !this.goal) return false;
    const gl = this.gl;
    const c = this.cur;
    const easing = this.ease(this.reduced ? 1 : dt);
    const moving = !this.reduced && c.level > 0.001 && c.speed > 0.001;
    if (moving) this.time += dt * 0.1 * c.speed;
    if (this.active) {
      this.acc = Math.min((this.acc || 0) + dt, 4 / 60);
      while (this.acc >= 1 / 60) {
        this.acc -= 1 / 60;
        this.step();
      }
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.texCh);
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.cols, this.rows, gl.RED, gl.UNSIGNED_BYTE, this.ch);
    }
    if (this.intro < INTRO_END) this.intro = Math.min(INTRO_END, ((now - this.t0) / 1000 / this.introDur) * INTRO_END);
    const maskAmt = this.maskKey ? Math.max(0, Math.min(1, this.maskAmount)) : 0;
    const { pr, u } = this.main;
    gl.useProgram(pr);
    const W = this.cv.width;
    const H = this.cv.height;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texMask);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.texCh);
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_2D, this.texQ);
    gl.uniform1i(u.uMask, 0);
    gl.uniform1i(u.uCharge, 1);
    gl.uniform1i(u.uQuiet, 4);
    gl.uniform2f(u.uRes, W, H);
    gl.uniform2f(u.uGrid, this.cols, this.rows);
    gl.uniform1f(u.uCell, this.cell);
    gl.uniform1f(u.uTime, this.time);
    gl.uniform1f(u.uNoise, 32 * this.cell);
    gl.uniform1f(u.uDot, DOT);
    gl.uniform1f(u.uLevel, c.level);
    gl.uniform1f(u.uQuietLvl, QUIET);
    gl.uniform1f(u.uIntro, this.intro);
    gl.uniform1f(u.uIntroMode, this.introMode);
    gl.uniform1f(u.uMaskAmt, maskAmt);
    gl.uniform3f(u.uBg, ...c.bg);
    gl.uniform3f(u.uCol, ...c.dot);
    gl.uniform3f(u.uHi, ...c.hi);
    const glow = c.glow > 0.01 && this.dark;
    gl.uniform1f(u.uGlow, glow ? 1 : 0);
    const { scene, a, b } = this.rt;
    const pass = (fb, w, h) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, w, h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    if (!glow) pass(null, W, H);
    else {
      pass(scene.fb, W, H);
      const B = this.blur;
      gl.useProgram(B.pr);
      gl.activeTexture(gl.TEXTURE2);
      gl.uniform1i(B.u.uSrc, 2);
      gl.uniform1f(B.u.uSigma, 4);
      gl.uniform2f(B.u.uSize, a.w, a.h);
      gl.bindTexture(gl.TEXTURE_2D, scene.t);
      gl.uniform2f(B.u.uDir, 1 / a.w, 0);
      gl.uniform1f(B.u.uPremul, 1);
      pass(a.fb, a.w, a.h);
      gl.bindTexture(gl.TEXTURE_2D, a.t);
      gl.uniform2f(B.u.uDir, 0, 1 / a.h);
      gl.uniform1f(B.u.uPremul, 0);
      pass(b.fb, b.w, b.h);
      const C = this.comp;
      gl.useProgram(C.pr);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, scene.t);
      gl.activeTexture(gl.TEXTURE3);
      gl.bindTexture(gl.TEXTURE_2D, b.t);
      gl.uniform1i(C.u.uScene, 2);
      gl.uniform1i(C.u.uGlowT, 3);
      gl.uniform2f(C.u.uRes, W, H);
      gl.uniform1f(C.u.uStr, 2 * c.glow);
      pass(null, W, H);
    }
    return moving || this.active || this.intro < INTRO_END || easing || (this.maskKey && maskAmt > 0 && maskAmt < 1);
  }

  destroy() {
    this.dead = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.mo.disconnect();
    this.cv.remove();
    this.host.removeAttribute('data-feld-host');
  }
}

/** Feld anlegen – liefert null statt Fehler, wenn WebGL2 fehlt (dann bleibt .kt-raster als Rückfall). */
export function createFeld(host, opts) {
  try {
    return new Feld(host, opts);
  } catch (e) {
    console.warn('Feld: Rückfall auf statisches Punktraster –', e.message);
    host.classList.add('kt-raster');
    return null;
  }
}
