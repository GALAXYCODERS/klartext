// ─────────────────────────────────────────────────────────────────────────────
//  Das Feld – lebender Hintergrund des Design-Systems „Klartext“ (DESIGN_KLARTEXT.md, Abschnitt 5).
//  Eigene Umsetzung der Idee hinter ShapeWaves (React Bits): Die Bühne ist in 24-px-Zellen geteilt,
//  jede Zelle trägt eine Form (Quadrat · Kreis · Dreieck), gewählt von einem langsam fließenden
//  Rauschfeld. WebGL2 mit Leuchten (Bloom) im Nacht-Theme. Ohne WebGL bleibt das statische
//  Punktraster aus base.css stehen (Rückfall), ebenso im Druck.
//
//  Pro Folie (content/slides.js):  feld: 'laut' | 'leise' (Standard) | 'aus'
//                                   maske: '</>'  (Glyphe, die das Feld ausspart; nur bei 'laut')
//  Ruhezonen hinter Textblöcken misst das Feld selbst aus der Folie.
//  Folien steuern es über ihre Timeline: ctx.feldState.mask (0…1) und motion.puls().
// ─────────────────────────────────────────────────────────────────────────────

// Pegel bewusst zurückhaltend (Rückmeldung aus dem Praxiseinsatz, Nov. 2026): Das Feld darf beim Lesen
// nicht den Blick ziehen – dunkler, kleiner, deutlich langsamer; hinter Text fast ganz aus.
const PEGEL = {
  laut: { level: 0.4, speed: 0.22, glow: 0.15 },
  leise: { level: 0.14, speed: 0.09, glow: 0.08 },
  aus: { level: 0, speed: 0, glow: 0 },
};
const QUIET = 0.06; // Ruhezone hinter Textblöcken: praktisch leer
const DOT = 0.5; // Formgröße relativ zur Zelle (vorher 0,62)

/** Hintergrund-Modus, Taste R: ruhig (Standard) → still (keine Bewegung) → aus. */
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
const lerp = (a, b, t) => a + (b - a) * t;

/** Textblöcke einer Folie, hinter denen das Feld zur Ruhe kommt. */
const RUHE_SEL = [
  '.slide-head', '.slide-header h1', '.slide-footer', '.slide p', '.slide h2', '.slide h3', '.slide li',
  '.card', '.frame', '.quote', '.statement', '.ds-table', '.stat', '.legend', '.keys', '.quelle',
  '.badge', '.label-mono', '.team', '.db', '.title-block > *', '.hero-title', '.hero-sub', '[data-ruhe]',
].join(',');

export class Feld {
  /** @param {HTMLElement} stage – die 1920×1080-Bühne des Vortrags */
  constructor(stage, { reduced = false } = {}) {
    this.stage = stage;
    this.reduced = reduced;
    this.cols = 1920 / CELL;
    this.rows = 1080 / CELL;
    this.time = Math.random() * 20;
    this.intro = INTRO_END;
    this.introMode = 0;
    this.active = false;
    this.inst = null;
    this.cur = { level: 0, speed: 0.35, glow: 0.35, quiet: new Float32Array(this.cols * this.rows), bg: null, dot: null, hi: null };
    this.maskKey = '';
    this.modus = 'ruhig';

    const cv = (this.cv = document.createElement('canvas'));
    cv.className = 'feld';
    cv.setAttribute('aria-hidden', 'true');
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
    const n = this.cols * this.rows;
    this.h0 = new Float32Array(n);
    this.h1 = new Float32Array(n);
    this.ch = new Uint8Array(n);
    this.q8 = new Uint8Array(n);
    this.upload(1, this.texCh, this.ch);
    this.upload(4, this.texQ, this.q8);
    this.mc = document.createElement('canvas');
    this.drawMask('');

    stage.insertBefore(cv, stage.firstChild);
    stage.classList.add('has-feld');
    cv.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.lost = true;
      stage.classList.remove('has-feld');
    });
    // Theme-Wechsel (Taste T): Farben neu lesen
    new MutationObserver(() => this.readColors(true)).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    document.fonts?.ready.then(() => this.drawMask(this.maskKey, true));
    this.loop = this.loop.bind(this);
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
  upload(unit, t, data, sub = false) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    if (sub) gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.cols, this.rows, gl.RED, gl.UNSIGNED_BYTE, data);
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, this.cols, this.rows, 0, gl.RED, gl.UNSIGNED_BYTE, data);
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

  /** Bühnen-Skalierung s (aus stage.js): Leinwand in Geräteauflösung, Retina bis ×2. */
  resize(s) {
    const q = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(48, Math.round(1920 * s * q));
    const h = Math.round((w * 1080) / 1920);
    if (w === this.cv.width && this.rt) return;
    if (this.rt) Object.values(this.rt).forEach((r) => (this.gl.deleteTexture(r.t), this.gl.deleteFramebuffer(r.fb)));
    this.cv.width = w;
    this.cv.height = h;
    const hw = Math.ceil(w / 2);
    const hh = Math.ceil(h / 2);
    this.rt = { scene: this.target(w, h), a: this.target(hw, hh), b: this.target(hw, hh) };
    this.wake();
  }

  /** Glyphen-Maske (z. B. „</>“) – weichgezeichnet, damit sie sich beim Ausblenden von außen auflöst. */
  drawMask(key, force = false) {
    if (key === this.maskKey && !force) return;
    this.maskKey = key;
    const [text = '', mx = 0.5, my = 0.45, ms = 0.5] = key ? JSON.parse(key) : [];
    const w = 960;
    const h = 540;
    const m = this.mc;
    m.width = w;
    m.height = h;
    const x = m.getContext('2d');
    x.fillStyle = '#000';
    x.fillRect(0, 0, w, h);
    if (text) {
      x.fillStyle = '#fff';
      x.font = `700 ${ms * h}px "Martian Mono", ui-monospace, monospace`;
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      // weicher Rand ohne ctx.filter (Safari): mehrfach leicht versetzt zeichnen
      x.globalAlpha = 0.18;
      for (let r = 10; r >= 2; r -= 4) for (let a = 0; a < 8; a++) x.fillText(text, mx * w + r * Math.cos(a), my * h + r * Math.sin(a));
      x.globalAlpha = 1;
      x.fillText(text, mx * w, my * h);
    }
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texMask);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, m);
    this.wake();
  }

  /** Ruhezonen einer Folie: Rechtecke der Textblöcke im Endzustand → Zellraster, weichgezeichnet. */
  measureQuiet(inst) {
    const q = new Float32Array(this.cols * this.rows);
    if (inst.s.ruhe === false) return q;
    const scale = this.stage.getBoundingClientRect().width / 1920 || 1;
    const base = this.stage.getBoundingClientRect();
    const t = inst.tl.time();
    inst.tl.seek(inst.tl.duration(), false);
    inst.el.querySelectorAll(RUHE_SEL).forEach((e) => {
      if (e.closest('svg')) return;
      const r = e.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const pad = 12;
      const x0 = Math.max(0, Math.floor(((r.left - base.left) / scale - pad) / CELL));
      const x1 = Math.min(this.cols - 1, Math.floor(((r.right - base.left) / scale + pad) / CELL));
      const y0 = Math.max(0, Math.floor(((r.top - base.top) / scale - pad) / CELL));
      const y1 = Math.min(this.rows - 1, Math.floor(((r.bottom - base.top) / scale + pad) / CELL));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) q[y * this.cols + x] = 1;
    });
    inst.tl.seek(t, false);
    // ein Schritt Weichzeichnen (Ränder der Ruhezonen laufen aus)
    const o = new Float32Array(q.length);
    for (let y = 0; y < this.rows; y++)
      for (let x = 0; x < this.cols; x++) {
        let s = 0;
        let k = 0;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy < 0 || xx < 0 || yy >= this.rows || xx >= this.cols) continue;
            s += q[yy * this.cols + xx];
            k += 1;
          }
        o[y * this.cols + x] = Math.max(q[y * this.cols + x], s / k);
      }
    return o;
  }

  readColors(now = false) {
    if (!this.inst) return;
    const cs = getComputedStyle(this.inst.el);
    const col = { bg: hex3(cs.getPropertyValue('--bg')), dot: hex3(cs.getPropertyValue('--f-dot')), hi: hex3(cs.getPropertyValue('--f-hi')) };
    this.target_ = { ...this.target_, ...col };
    if (now || !this.cur.bg) Object.assign(this.cur, { bg: col.bg, dot: col.dot, hi: col.hi });
    this.dark = col.bg[0] * 0.2126 + col.bg[1] * 0.7152 + col.bg[2] * 0.0722 < 0.5;
    this.wake();
  }

  /** Pegel einer Folie unter Berücksichtigung des Hintergrund-Modus. */
  pegel(inst) {
    const p = PEGEL[inst.s.feld] || PEGEL.leise;
    if (this.modus === 'aus') return PEGEL.aus;
    if (this.modus === 'still') return { ...p, speed: 0 };
    return p;
  }

  /** Hintergrund-Modus umschalten (Taste R); gleitet weich in den neuen Zustand. */
  setModus(m) {
    if (!MODI.includes(m)) return;
    this.modus = m;
    if (!this.inst) return;
    const p = this.pegel(this.inst);
    Object.assign(this.target_, { level: p.level, speed: p.speed, glow: p.glow });
    if (m === 'aus') this.h0.fill(0), this.h1.fill(0), this.ch.fill(0), (this.active = false), (this.intro = INTRO_END);
    this.wake();
  }

  /**
   * Folie wird gezeigt. dir: 0 = Sprung (ohne Front), +1/-1 = Wechsel vorwärts/rückwärts (Front 0,9 s),
   * 'intro' = radialer Aufbau (Start der Präsentation).
   */
  show(inst, dir = 0) {
    this.qDirty = true;
    if (!inst.feldQuiet) inst.feldQuiet = this.measureQuiet(inst); // vor dem Umschalten: Pulse der Messung verpuffen
    this.inst = inst;
    const p = this.pegel(inst);
    this.target_ = { level: p.level, speed: p.speed, glow: p.glow, quiet: inst.feldQuiet };
    const m = inst.s.maske;
    this.drawMask(m && p.level ? JSON.stringify(typeof m === 'string' ? [m, 0.5, 0.45, 0.5] : [m.text, m.x, m.y, m.size]) : '');
    this.readColors(dir === 0);
    if (dir === 0) {
      Object.assign(this.cur, { level: p.level, speed: p.speed, glow: p.glow });
      this.cur.quiet.set(inst.feldQuiet);
    }
    if (this.reduced) {
      Object.assign(this.cur, { level: p.level, speed: p.speed, glow: p.glow, bg: this.target_.bg, dot: this.target_.dot, hi: this.target_.hi });
      this.cur.quiet.set(inst.feldQuiet);
    } else if (this.modus === 'aus') this.intro = INTRO_END;
    else if (dir === 'intro') this.play(0, 1.6);
    else if (dir) this.play(dir > 0 ? 1 : 2, 0.9);
    this.wake();
  }

  play(mode, dur) {
    this.introMode = mode;
    this.introDur = dur;
    this.intro = 0;
    this.t0 = performance.now();
    this.wake();
  }

  /** Ringwelle an Bühnen-Koordinate (x, y). el: auslösendes Element – nur die sichtbare Folie darf pulsen. */
  puls(x, y, strength = 1, radius = 70, el) {
    if (this.reduced || this.lost || !this.allow || this.modus === 'aus') return;
    if (el && (!this.inst || !this.inst.el.contains(el))) return;
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

  /** Wellengleichung (CPU) wie im Original, Ergebnis als 8-Bit-Textur. */
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

  /** Weiche Übergänge zwischen Folien: Pegel, Farben und Ruhezonen gleiten (≈ 0,5 s). */
  ease(dt) {
    const T = this.target_;
    if (!T) return false;
    const k = 1 - Math.exp(-dt * 9);
    const c = this.cur;
    let moving = false;
    const step = (key) => {
      const d = T[key] - c[key];
      if (Math.abs(d) > 0.002) (c[key] += d * k), (moving = true);
      else c[key] = T[key];
    };
    ['level', 'speed', 'glow'].forEach(step);
    ['bg', 'dot', 'hi'].forEach((key) => {
      for (let i = 0; i < 3; i++) {
        const d = T[key][i] - c[key][i];
        if (Math.abs(d) > 0.002) (c[key][i] += d * k), (moving = true);
        else c[key][i] = T[key][i];
      }
    });
    let qd = false;
    for (let i = 0; i < c.quiet.length; i++) {
      const d = T.quiet[i] - c.quiet[i];
      if (Math.abs(d) > 0.004) (c.quiet[i] += d * k), (qd = true);
      else c.quiet[i] = T.quiet[i];
      this.q8[i] = c.quiet[i] * 255;
    }
    if (qd || this.qDirty) this.upload(4, this.texQ, this.q8, true), (this.qDirty = false);
    return moving || qd;
  }

  wake() {
    if (!this.raf && !this.lost) this.raf = requestAnimationFrame(this.loop);
  }

  loop(now) {
    this.raf = 0;
    const dt = this.last ? Math.min(0.1, (now - this.last) / 1000) : 0;
    this.last = now;
    if (this.render(now, dt)) this.wake();
    else this.last = 0;
  }

  render(now, dt) {
    if (!this.rt || !this.inst || this.lost) return false;
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
      this.upload(1, this.texCh, this.ch, true);
    }
    if (this.intro < INTRO_END) this.intro = Math.min(INTRO_END, ((now - this.t0) / 1000 / this.introDur) * INTRO_END);
    const maskAmt = this.maskKey ? Math.max(0, Math.min(1, this.inst.feldState?.mask ?? 1)) : 0;

    const { pr, u } = this.main;
    gl.useProgram(pr);
    const W = this.cv.width;
    const H = this.cv.height;
    const cell = W / this.cols;
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
    gl.uniform1f(u.uCell, cell);
    gl.uniform1f(u.uTime, this.time);
    gl.uniform1f(u.uNoise, 32 * cell);
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
    const maskMoving = this.maskKey && maskAmt > 0 && maskAmt < 1;
    return moving || this.active || this.intro < INTRO_END || easing || maskMoving;
  }
}

// ── Singleton für den Vortrag ────────────────────────────────────────────────
let current = null;

/** Feld auf der Vortragsbühne anlegen. Liefert null, wenn WebGL2 fehlt (dann bleibt das Punktraster). */
export function createFeld(stage, opts) {
  try {
    current = new Feld(stage, opts);
  } catch (e) {
    console.warn('Feld: Rückfall auf statisches Punktraster –', e.message);
    current = null;
  }
  return current;
}

/** Puls von einer Folie aus (motion.js). Ohne Feld (Druck, Vorschau, Übersicht) passiert nichts. */
export function feldPuls(x, y, strength, radius, el) {
  current?.puls(x, y, strength, radius, el);
}
/** Feld neu zeichnen lassen (z. B. wenn eine Folie ihre Maske über die Timeline ändert). */
export function feldWake() {
  current?.wake();
}
