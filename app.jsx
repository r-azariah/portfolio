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
  "reactToMouse": true,
  "showStars": true,
  "starDensity": 140,
  "showBlackHole": true
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

const PREVIEW_PROJECTS = [
{ num: '01', title: 'VANTA', role: 'Founder · Product & Engineering' },
{ num: '02', title: 'AndroidBot', role: 'Solo project' },
{ num: '03', title: 'Floor Mapping Dashboard', role: 'Analog Devices' },
{ num: '04', title: 'Serraview Audit Parser', role: 'Analog Devices' },
{ num: '05', title: 'rahmanimalabre.dev', role: 'Personal site' },
{ num: '06', title: 'Claude Resume Tailor', role: 'Personal CLI' },
{ num: '07', title: 'Market Console', role: 'Web research tool' },
{ num: '08', title: 'Civil Site Design Portfolio', role: 'Crocker Design Group' }];


// ── Utility: split string into per-character spans ──────────────────────────
// Each .suck-char can be individually animated by the black-hole easter egg.
function splitChars(text) {
  return text.split('').map((ch, i) =>
  React.createElement('span', { key: i, className: 'suck-char' }, ch === ' ' ? '\u00a0' : ch)
  );
}

// ── Black hole suck easter egg ───────────────────────────────────────────────
// Hover the black-hole core for 10 s → hole grows, text shakes → letters get
// sucked in one by one → everything springs back when cursor leaves.
function useBlackHoleSuck(bhRef) {
  React.useEffect(() => {
    const phase = { v: 'idle' }; // idle|charging|growing|releasing
    const orig = { v: null };
    const charge = { timer: null, capTimer: null };
    const anim = { raf: null };
    const scale = { v: 1 };

    const setScale = (s) => {
      scale.v = s;
      if (bhRef.current) bhRef.current.style.setProperty('--bh-scale', s.toFixed(4));
    };

    const resetChars = () => {
      document.querySelectorAll('.suck-char').forEach((el) => {
        el.style.transition = 'transform 1s cubic-bezier(.2,.7,.2,1), opacity 0.8s';
        el.style.transform = '';
        el.style.opacity = '';
      });
      setTimeout(() => {
        document.querySelectorAll('.suck-char').forEach((el) => {el.style.transition = '';});
      }, 1100);
    };

    const startRelease = () => {
      cancelAnimationFrame(anim.raf);
      clearTimeout(charge.capTimer);
      phase.v = 'releasing';
      const from = scale.v;
      const t0 = performance.now();
      const tick = (now) => {
        const t = Math.min((now - t0) / 1400, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        setScale(from + (1 - from) * ease);
        if (t < 1) requestAnimationFrame(tick);else
        {phase.v = 'idle';orig.v = null;setScale(1);}
      };
      requestAnimationFrame(tick);
      resetChars();
    };

    const startGrow = () => {
      if (phase.v !== 'charging') return;
      phase.v = 'growing';

      // wait a beat, then capture every hero letter and pull them into the core
      charge.capTimer = setTimeout(() => {
        if (phase.v !== 'growing') return;
        const charData = Array.from(document.querySelectorAll('.hero .suck-char')).map((el) => {
          const r = el.getBoundingClientRect();
          return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2, seed: Math.random() - 0.5 };
        });
        const t0 = performance.now();
        const DUR = 4400; // ms for the whole drift-and-vanish
        const tick = (now) => {
          if (phase.v !== 'growing') return;
          const t = Math.min((now - t0) / DUR, 1);
          // black hole swells smoothly the whole way through (easeInOut)
          const gEase = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setScale(1 + gEase * 1.7);
          const { x: bx, y: by } = orig.v;
          charData.forEach(({ el, cx, cy, seed }, i) => {
            const stagger = i / charData.length * 0.22;
            const ct = Math.max(0, Math.min((t - stagger) / (1 - stagger), 1));
            const ease = Math.pow(ct, 2.6); // drift slowly, then accelerate inward
            const tx = (bx - cx) * ease;
            const ty = (by - cy) * ease;
            const sc = 1 - ease * 0.92;
            const rot = seed * ease * 200;
            el.style.transform = `translate(${tx}px,${ty}px) scale(${sc}) rotate(${rot}deg)`;
            el.style.opacity = String(Math.max(0, 1 - Math.pow(ct, 4) * 1.5));
          });
          if (t < 1) anim.raf = requestAnimationFrame(tick);else
          setTimeout(() => {if (phase.v === 'growing') startRelease();}, 650);
        };
        anim.raf = requestAnimationFrame(tick);
      }, 700);
    };

    const onMove = (e) => {
      if (!bhRef.current) return;
      const br = bhRef.current.getBoundingClientRect();
      const bx = br.left + br.width / 2;
      const by = br.top + br.height / 2;
      const r = br.width / 2;
      const ref = orig.v || { x: bx, y: by, r };
      const inside = Math.hypot(e.clientX - ref.x, e.clientY - ref.y) < ref.r * 0.25;

      if (inside && phase.v === 'idle') {
        phase.v = 'charging';
        orig.v = { x: bx, y: by, r };
        charge.timer = setTimeout(startGrow, 10000);
      } else if (!inside && phase.v === 'charging') {
        clearTimeout(charge.timer);
        phase.v = 'idle';orig.v = null;
      } else if (!inside && phase.v === 'growing') {
        startRelease();
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      clearTimeout(charge.timer);
      clearTimeout(charge.capTimer);
      cancelAnimationFrame(anim.raf);
    };
  }, []);
}

// ── Starfield ────────────────────────────────────────────────────────────────
function Stars({ density = 140 }) {
  const stars = React.useMemo(() => {
    return Array.from({ length: density }, () => {
      const r = Math.random();
      const size = r < 0.84 ? 1 : r < 0.96 ? 1.6 : 2.4;
      return {
        x: Math.random() * 100, y: Math.random() * 100,
        size, opacity: 0.2 + Math.random() * 0.6,
        glow: size > 1.4 ? 4 : 2,
        delay: -Math.random() * 9, dur: 4 + Math.random() * 7
      };
    });
  }, [density]);
  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s, i) =>
      <span className="star" key={i} style={{
        left: s.x + '%', top: s.y + '%',
        width: s.size + 'px', height: s.size + 'px',
        '--o': s.opacity, '--g': s.glow + 'px',
        '--delay': s.delay + 's', '--dur': s.dur + 's'
      }} />
      )}
    </div>);

}

// ── Black hole ───────────────────────────────────────────────────────────────
// JS pins its vertical center to the .name element; CSS handles centering.
function BlackHole() {
  const bhRef = React.useRef(null);
  useBlackHoleSuck(bhRef);

  React.useLayoutEffect(() => {
    const align = () => {
      // The name scrolls away with the page, so it is only a valid anchor near the
      // top. Once measured, both the hole AND the orbit lock to this same point
      // (--orbit-cy) so the belt converges exactly into the core.
      if (window.scrollY > 4) return;
      const nameEl = document.querySelector('.name .full') || document.querySelector('.name');
      const bh = bhRef.current;
      if (!nameEl || !bh) return;
      const rect = nameEl.getBoundingClientRect();
      document.documentElement.style.setProperty('--orbit-cy', rect.top + rect.height / 2 + 'px');
    };
    align();
    const t1 = setTimeout(align, 150);
    const t2 = setTimeout(align, 600);
    window.addEventListener('resize', align);
    return () => {clearTimeout(t1);clearTimeout(t2);window.removeEventListener('resize', align);};
  }, []);

  return (
    <div className="blackhole" ref={bhRef} aria-hidden="true">
      <div className="bh-glow" />
      <div className="bh-tilt"><div className="bh-disc" /></div>
      <div className="bh-core" />
    </div>);

}

// ── Orbit scene (scroll-animated) ───────────────────────────────────────────
// As you scroll, the whole belt is sucked straight into the black-hole core.
function OrbitScene({ tweaks, paused, onSelect }) {
  const t = tweaks;
  const sceneRef = React.useRef(null);
  const tweakRef = React.useRef(t);
  tweakRef.current = t;
  const n = LOGOS.length;

  // Scroll-driven orbit animation via direct DOM — no React re-render per frame.
  // This is the single biggest perf win: eliminates 5-logo re-render on every scroll.
  React.useEffect(() => {
    let ticking = false;
    const update = () => {
      const tw = tweakRef.current;
      const s = window.scrollY / window.innerHeight;
      const el = sceneRef.current;
      if (!el) return;
      const suckP = Math.max(Math.min(s / 1.1, 1), 0);
      const eased = Math.pow(suckP, 1.5);
      const rMult = 1 - eased * 0.55;
      el.style.setProperty('--dur', ((64 - tw.orbitSpeed / 100 * 55) * (1 - suckP * 0.9)).toFixed(1) + 's');
      el.style.setProperty('--tilt', (46 + tw.orbitTilt * 0.64 + eased * 34).toFixed(1) + 'deg');
      el.style.setProperty('--R', `clamp(${(285 * rMult).toFixed(0)}px,${(36 * rMult).toFixed(1)}vw,${(460 * rMult).toFixed(0)}px)`);
      el.style.opacity = Math.max(0, 1 - Math.max(0, (suckP - 0.72) / 0.28)).toFixed(3);
      el.style.transform = `translate(-50%,-50%) scale(${(1 - eased * 0.96).toFixed(3)})`;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  React.useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const onMove = (e) => {
      if (!t.reactToMouse) {el.style.setProperty('--mrot', '0deg');return;}
      const mx = e.clientX / window.innerWidth - 0.5;
      el.style.setProperty('--mrot', (mx * 16).toFixed(2) + 'deg');
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [t.reactToMouse]);

  return (
    <div className="scene" ref={sceneRef}
    data-paused={paused ? '1' : '0'}
    style={{
      '--logo': (t.logoScale / 100).toFixed(3),
      left: '50%',
      top: 'var(--orbit-cy, 50%)',
    }}>
      <div className="orbit3d">
        <div className="ring-path" data-show={t.showRing ? '1' : '0'} />
        <div className="spinner">
          {LOGOS.map((l, i) =>
          <div className="planet" key={l.id} style={{ '--a': i * (360 / n) + 'deg' }}>
              <div className="billboard">
                <div className="tiltfix">
                  <button type="button" className="node-disc"
                onClick={() => onSelect(l)}
                aria-label={`${l.label} — ${l.category}`}
                data-hover>
                    <l.Glyph className="node-glyph" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

// ── Logo side panel ──────────────────────────────────────────────────────────
function LogoPanel({ logo, onClose }) {
  React.useEffect(() => {
    if (!logo) return;
    const onKey = (e) => {if (e.key === 'Escape') onClose();};
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [logo, onClose]);
  if (!logo) return null;
  return (
    <aside className="logo-panel" role="complementary" aria-label={logo.label + ' info'}>
      <button className="logo-panel-close" onClick={onClose} aria-label="Close" data-hover>×</button>
      <div className="logo-panel-body">
        <div className="logo-panel-disc"><logo.Glyph className="logo-panel-glyph" /></div>
        <div className="logo-panel-cat">{logo.category}</div>
        <div className="logo-panel-name">{logo.label}</div>
        <p className="logo-panel-desc">{logo.description}</p>
        <a className="logo-panel-link" href={logo.url} target="_blank" rel="noreferrer" data-hover>
          Open {logo.label} ↗
        </a>
      </div>
    </aside>);

}

// ── Custom cursor ────────────────────────────────────────────────────────────
function Cursor() {
  const ring = React.useRef(null);
  const dot = React.useRef(null);
  React.useEffect(() => {
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const rp = { ...pos };
    let hovering = false,raf;
    const onDot = (e) => {
      if (dot.current) dot.current.style.transform =
      `translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;
    };
    const onMove = (e) => {
      pos.x = e.clientX;pos.y = e.clientY;
      hovering = !!e.target.closest('a, button, [data-hover]');
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
    const raw = 'onpointerrawupdate' in window ? 'pointerrawupdate' : 'pointermove';
    window.addEventListener(raw, onDot, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener(raw, onDot);
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

// ── [A] monogram ─────────────────────────────────────────────────────────────
// linger=true: mark stays expanded 5 s after mouse leaves
function AMark({ className, linger = false }) {
  const [pinned, setPinned] = React.useState(false);
  const timer = React.useRef(null);
  const onEnter = linger ? () => {clearTimeout(timer.current);setPinned(true);} : undefined;
  const onLeave = linger ? () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setPinned(false), 5000);
  } : undefined;
  React.useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <span
      className={'amark ' + (className || '') + (pinned ? ' amark--pinned' : '')}
      onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <span className="amark-b">[</span>
      <span className="amark-a">A</span>
      <span className="amark-rest">ZARIAH</span>
      <span className="amark-b">]</span>
    </span>);

}

// ── Meteors ──────────────────────────────────────────────────────────────────
function Meteor() {
  const [shots, setShots] = React.useState([]);
  React.useEffect(() => {
    let nextId = 0;
    const timers = [];
    const spawn = () => {
      const vw = window.innerWidth,vh = window.innerHeight;
      const sy = vh * (-0.06 + Math.random() * 0.5);
      const angle = (10 + Math.random() * 32) * Math.PI / 180;
      const sx = vw + 140;
      const dist = vw + 560;
      const ex = sx - dist * Math.cos(angle);
      const ey = sy + dist * Math.sin(angle);
      const ma = Math.atan2(ey - sy, ex - sx) * 180 / Math.PI;
      const dur = (0.9 + Math.random() * 0.6).toFixed(2);
      setShots((prev) => [...prev, { id: ++nextId, sx, sy, ex, ey, ma, dur }]);
    };
    timers.push(setTimeout(spawn, 350 + Math.random() * 500));
    timers.push(setTimeout(spawn, 1700 + Math.random() * 800));
    const schedule = () => {
      const t = setTimeout(() => {spawn();schedule();}, 3000 + Math.random() * 4200);
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
      style={{ '--sx': s.sx + 'px', '--sy': s.sy + 'px', '--ex': s.ex + 'px', '--ey': s.ey + 'px', '--dur': s.dur + 's' }}
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
  if (treatment === 'inline') return (
    <h1 className="name name--inline">
      {splitChars('RAHMANI ')}
      <span className="mid">{splitChars('(AZARIAH)')}</span>
      {splitChars(' MALABRE')}
    </h1>);

  if (treatment === 'mono') return (
    <h1 className="name name--mono">
      <span>{splitChars('RAHMANI')}</span>
      <span className="mid">{splitChars('AZARIAH')}</span>
      <span>{splitChars('MALABRE')}</span>
    </h1>);

  return (
    <h1 className="name name--azariah">
      <span className="paren">{splitChars('[azariah]')}</span>
      <span className="full">{splitChars('RAHMANI\u00a0MALABRE')}</span>
    </h1>);

}

// ── Projects preview (slides up on scroll) ───────────────────────────────────
function ProjectsPreview({ previewRef }) {
  return (
    <div className="proj-preview" ref={previewRef} aria-label="Projects">
      <div className="proj-preview-inner">
        <div className="proj-preview-head">
          <div>
            <h2 className="proj-preview-heading">PROJECTS</h2>
            <p className="proj-preview-sub">Built Alongside AI</p>
          </div>
          <a href="Projects.html" className="proj-preview-all" data-hover>View all ↗</a>
        </div>
        <div className="proj-preview-grid">
          {PREVIEW_PROJECTS.map((p) =>
          <a href="Projects.html" key={p.num} className="proj-preview-row" data-hover>
              <span className="proj-preview-num">{p.num}</span>
              <span className="proj-preview-name">{p.title}</span>
              <span className="proj-preview-role">{p.role}</span>
            </a>
          )}
        </div>
        <div className="proj-connect">
          <span className="proj-connect-label">Connect</span>
          <div className="proj-connect-links">
            <a href="https://www.linkedin.com/in/rahmanim/" target="_blank" rel="noreferrer" data-hover>LinkedIn ↗</a>
            <a href="https://github.com/r-azariah" target="_blank" rel="noreferrer" data-hover>GitHub ↗</a>
            <a href="mailto:rahmalabre@gmail.com" data-hover>Email ↗</a>
            <a href="CV.html" data-hover>CV ↗</a>
          </div>
          <span className="proj-connect-meta">Boston, MA · Open to work</span>
        </div>
      </div>
    </div>);

}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [selected, setSelected] = React.useState(null);
  const previewRef = React.useRef(null);
  const heroRef = React.useRef(null);
  const mood = MOODS[t.mood] || MOODS.void;

  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--bg', mood.bg);
    r.setProperty('--fg-rgb', mood.fgRgb);
    r.setProperty('--ring-rgb', mood.ringRgb);
    r.setProperty('--font', TYPEFACES[t.typeface] || TYPEFACES.space);
    document.body.style.background = mood.bg;
  }, [t.mood, t.typeface]);

  // Hero text scrolls away like normal content; projects panel rises after belt collapses.
  // Uses direct DOM manipulation — no React state, no re-render.
  React.useEffect(() => {
    const onScroll = () => {
      const top = window.scrollY;
      const s = top / window.innerHeight;
      if (heroRef.current) {
        heroRef.current.style.transform = `translate3d(0,${-top}px,0)`;
      }
      const projP = Math.max((s - 0.5) / 0.7, 0);
      const slideT = Math.min(projP, 1);
      const el = previewRef.current;
      if (el) {
        el.style.transform = `translateY(${((1 - slideT) * 105).toFixed(1)}%)`;
        el.style.opacity = Math.min(projP * 1.8, 1).toFixed(3);
        el.style.pointerEvents = projP > 0.2 ? 'auto' : 'none';
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {window.removeEventListener('scroll', onScroll);window.removeEventListener('resize', onScroll);};
  }, []);

  return (
    <div className="root" data-grain={t.showGrain ? '1' : '0'}>
      {t.showStars && <Stars density={t.starDensity} />}
      {t.showBlackHole && <BlackHole />}

      <OrbitScene tweaks={t} paused={!!selected} onSelect={setSelected} />

      <header className="frame">
        <div className="corner tl">
          <AMark className="amark--brand" linger />
        </div>
        <nav className="corner tc">
          <a className="nav-link" href="Projects.html" data-hover>Projects ↗</a>
        </nav>
        <div className="corner tr">
          <a className="nav-link" href="CV.html" data-hover>CV ↗</a>
        </div>
        <div className="corner bl">
          <span className="mono-xs dimmed">BOSTON, MA · OPEN TO REMOTE</span>
          <span className="mono-xs status"><i className="pulse" /> Open to work · In university</span>
        </div>
        <nav className="corner br links">
          <a href="https://www.linkedin.com/in/rahmanim/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/r-azariah" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <main className="hero" ref={heroRef}>
        <p className="eyebrow">
          {splitChars('Applied Artificial Intelligence ')}
          <span className="x">{splitChars('×')}</span>
          {splitChars(' Data Science')}
        </p>
        <HeroName treatment={t.nameTreatment} />
        <p className="hero-tag hero-tag--first">{splitChars('I learn, You ask, I create')}</p>
        <p className="hero-tag hero-tag--sub">{splitChars('Building from scratch, Building faster than ever.')}</p>
      </main>

      <ProjectsPreview previewRef={previewRef} />
      <Cursor />
      <Meteor />
      <LogoPanel logo={selected} onClose={() => setSelected(null)} />

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
        <TweakSection label="Sky" />
        <TweakToggle label="Stars" value={t.showStars} onChange={(v) => setTweak('showStars', v)} />
        <TweakSlider label="Star density" value={t.starDensity} min={40} max={260} onChange={(v) => setTweak('starDensity', v)} />
        <TweakToggle label="Black hole (rough)" value={t.showBlackHole} onChange={(v) => setTweak('showBlackHole', v)} />
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