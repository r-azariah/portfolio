// app.jsx — tilted 3D planetary orbit hero for Rahmani (AZARIAH) Malabre

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mood": "void",
  "typeface": "space",
  "nameTreatment": "azariah",
  "orbitSpeed": 26,
  "orbitTilt": 32,
  "logoScale": 100,
  "showRing": true,
  "showGrain": true,
  "reactToMouse": true
} /*EDITMODE-END*/;

const MOODS = {
  void: { bg: '#000000', fgRgb: '244 244 245', ringRgb: '255 255 255' },
  graphite: { bg: '#0a0908', fgRgb: '243 240 234', ringRgb: '255 248 236' },
  blueprint: { bg: '#040608', fgRgb: '232 238 244', ringRgb: '196 222 255' }
};

const TYPEFACES = {
  space: "'Space Mono', monospace",
  jet: "'JetBrains Mono', monospace",
  ibm: "'IBM Plex Mono', monospace",
  spline: "'Spline Sans Mono', monospace"
};

// ── Orbit scene (pure-CSS 3D billboarded orbit) ──────────────────────────────
// A tilted ring spins; each logo counter-spins to stay upright & camera-facing,
// while CSS perspective handles the front/back depth scaling. GPU-driven, so it
// keeps animating even when requestAnimationFrame is throttled.
function OrbitScene({ tweaks }) {
  const t = tweaks;
  const sceneRef = React.useRef(null);
  const n = LOGOS.length;

  // speed 0..100 → 64s..9s per revolution; tilt 14..50 → rotateX 54°..78°
  const durSec = (64 - t.orbitSpeed / 100 * 55).toFixed(1);
  const tiltDeg = (46 + t.orbitTilt * 0.64).toFixed(1);

  // mouse parallax — event-driven (no rAF), sets a CSS var the scene reads
  React.useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const onMove = (e) => {
      if (!t.reactToMouse) {el.style.setProperty('--mrot', '0deg');return;}
      const mx = e.clientX / window.innerWidth - 0.5; // -0.5..0.5
      el.style.setProperty('--mrot', (mx * 16).toFixed(2) + 'deg');
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [t.reactToMouse]);

  return (
    <div className="scene" ref={sceneRef} aria-hidden="true"
    style={{
      '--dur': durSec + 's',
      '--tilt': tiltDeg + 'deg',
      '--logo': (t.logoScale / 100).toFixed(3),
      '--R': 'clamp(285px, 36vw, 460px)'
    }}>
      <div className="orbit3d">
        <div className="ring-path" data-show={t.showRing ? '1' : '0'} />
        <div className="spinner">
          {LOGOS.map((l, i) =>
          <div className="planet" key={l.id}
          style={{ '--a': i * (360 / n) + 'deg' }}>
              <div className="billboard">
                <div className="tiltfix">
                  <div className="node-disc">
                    <l.Glyph className="node-glyph" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// ── Custom cursor ────────────────────────────────────────────────────────────
function Cursor() {
  const ring = React.useRef(null);
  const dot = React.useRef(null);
  React.useEffect(() => {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const rp = { ...pos };
    let hovering = false,raf;
    // dot tracks the raw pointer stream for minimal latency (no smoothing)
    const onDot = (e) => {
      if (dot.current) dot.current.style.transform =
      `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    };
    const onMove = (e) => {
      pos.x = e.clientX;pos.y = e.clientY;
      const interactive = e.target.closest('a, button, [data-hover]');
      hovering = !!interactive;
    };
    const loop = () => {
      rp.x += (pos.x - rp.x) * 0.18;
      rp.y += (pos.y - rp.y) * 0.18;
      if (ring.current) {
        ring.current.style.transform =
        `translate(${rp.x}px,${rp.y}px) translate(-50%,-50%) scale(${hovering ? 1.9 : 1})`;
        ring.current.style.opacity = hovering ? '1' : '0.7';
      }
      raf = requestAnimationFrame(loop);
    };
    const rawEvt = ('onpointerrawupdate' in window) ? 'pointerrawupdate' : 'pointermove';
    window.addEventListener(rawEvt, onDot, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener(rawEvt, onDot);
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </>);

}

// ── [A] personal monogram + meteor easter egg ────────────────────────────────
function AMark({ className }) {
  return (
    <span className={'amark ' + (className || '')}>
      <span className="amark-b">[</span><span className="amark-a">A</span><span className="amark-rest">ZARIAH</span><span className="amark-b">]</span>
    </span>);

}

// Meteors stream across the page — a small burst on load, then one every few
// seconds. Random angle/position each time so it never feels canned.
function Meteor() {
  const [shots, setShots] = React.useState([]);
  React.useEffect(() => {
    let nextId = 0;
    const timers = [];
    const spawn = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      const sy = vh * (-0.06 + Math.random() * 0.5);
      const angle = (10 + Math.random() * 32) * Math.PI / 180;
      const sx = vw + 140;
      const dist = vw + 560;
      const ex = sx - dist * Math.cos(angle);
      const ey = sy + dist * Math.sin(angle);
      const ma = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
      const dur = (0.9 + Math.random() * 0.6).toFixed(2);
      const id = ++nextId;
      setShots((prev) => [...prev, { id, sx, sy, ex, ey, ma, dur }]);
    };
    // initial burst: two meteors within the first ~2.5s
    timers.push(setTimeout(spawn, 350 + Math.random() * 500));
    timers.push(setTimeout(spawn, 1700 + Math.random() * 800));
    // then keep spawning every 3–7s, indefinitely
    const schedule = () => {
      const t = setTimeout(() => { spawn(); schedule(); }, 3000 + Math.random() * 4200);
      timers.push(t);
    };
    timers.push(setTimeout(schedule, 5200));
    return () => timers.forEach(clearTimeout);
  }, []);
  const remove = (id) => setShots((prev) => prev.filter((s) => s.id !== id));
  return (
    <>
      {shots.map((s) =>
      <div className="meteor" key={s.id} aria-hidden="true"
      style={{
        '--sx': s.sx + 'px', '--sy': s.sy + 'px',
        '--ex': s.ex + 'px', '--ey': s.ey + 'px',
        '--dur': s.dur + 's'
      }}
      onAnimationEnd={() => remove(s.id)}>
          <div className="streak" style={{ '--ma': s.ma + 'deg' }}>
            <div className="meteor-tail" />
            <div className="meteor-head"><AMark className="amark--meteor" /></div>
          </div>
        </div>
      )}
    </>);

}

// ── Name treatments ──────────────────────────────────────────────────────────
function HeroName({ treatment }) {
  if (treatment === 'inline') {
    return (
      <h1 className="name name--inline">
        RAHMANI <span className="mid">(AZARIAH)</span> MALABRE
      </h1>);

  }
  if (treatment === 'mono') {
    return (
      <h1 className="name name--mono">
        <span>RAHMANI</span><span className="mid">AZARIAH</span><span>MALABRE</span>
      </h1>);

  }
  return (
    <h1 className="name name--azariah">
      <span className="paren">(azariah)</span>
      <span className="full">RAHMANI&nbsp;MALABRE</span>
    </h1>);

}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const mood = MOODS[t.mood] || MOODS.void;

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--bg', mood.bg);
    r.setProperty('--fg-rgb', mood.fgRgb);
    r.setProperty('--ring-rgb', mood.ringRgb);
    r.setProperty('--font', TYPEFACES[t.typeface] || TYPEFACES.space);
    document.body.style.background = mood.bg;
  }, [t.mood, t.typeface]);

  return (
    <div className="root" data-grain={t.showGrain ? '1' : '0'}>
      <OrbitScene tweaks={t} />

      <header className="frame">
        <div className="corner tl">
          <AMark className="amark--brand" />
          <span className="mono-xs dimmed">Portfolio — Index</span>
        </div>
        <div className="corner tr">
          <span className="mono-sm">©2026</span>
          <span className="mono-xs dimmed">Applied&nbsp;AI</span>
        </div>
        <div className="corner bl">
          <span className="mono-xs dimmed" style={{ textAlign: "center" }}>BOSTON, MA · REMOTE</span>
          <span className="mono-xs status" style={{ textAlign: "center" }}><i className="pulse" /> Open to work</span>
        </div>
        <nav className="corner br links">
          <a href="CV.html">CV →</a>
          <a href="https://www.linkedin.com/in/rahmanim/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/r-azariah" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <main className="hero">
        <p className="eyebrow">
          Applied Artificial Intelligence <span className="x">×</span> Data Science
        </p>
        <HeroName treatment={t.nameTreatment} />
        <p className="sub">
          Designing &amp; building with frontier models — research, systems, interfaces.
        </p>
      </main>

      <Cursor />
      <Meteor />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Mood" />
        <TweakRadio label="Palette" value={t.mood}
        options={[{ value: 'void', label: 'Void' }, { value: 'graphite', label: 'Graphite' }, { value: 'blueprint', label: 'Blueprint' }]}
        onChange={(v) => setTweak('mood', v)} />
        <TweakToggle label="Film grain" value={t.showGrain} onChange={(v) => setTweak('showGrain', v)} />

        <TweakSection label="Type" />
        <TweakSelect label="Typeface" value={t.typeface}
        options={[{ value: 'space', label: 'Space Mono' }, { value: 'jet', label: 'JetBrains Mono' }, { value: 'ibm', label: 'IBM Plex Mono' }, { value: 'spline', label: 'Spline Sans Mono' }]}
        onChange={(v) => setTweak('typeface', v)} />
        <TweakSelect label="Name layout" value={t.nameTreatment}
        options={[{ value: 'azariah', label: 'Parenthetical above' }, { value: 'inline', label: 'Inline parenthetical' }, { value: 'mono', label: 'Tracked monospace' }]}
        onChange={(v) => setTweak('nameTreatment', v)} />

        <TweakSection label="Orbit" />
        <TweakSlider label="Speed" value={t.orbitSpeed} min={0} max={100} onChange={(v) => setTweak('orbitSpeed', v)} />
        <TweakSlider label="Tilt" value={t.orbitTilt} min={14} max={50} onChange={(v) => setTweak('orbitTilt', v)} />
        <TweakSlider label="Logo size" value={t.logoScale} min={60} max={150} unit="%" onChange={(v) => setTweak('logoScale', v)} />
        <TweakToggle label="Orbit path" value={t.showRing} onChange={(v) => setTweak('showRing', v)} />
        <TweakToggle label="React to mouse" value={t.reactToMouse} onChange={(v) => setTweak('reactToMouse', v)} />
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);