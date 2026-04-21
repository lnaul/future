// portfolio-sections.js — cursor, reveals, AI gen, Monaco, contact

(function () {

  // ─── Custom cursor ───────────────────────────────────────────────────────────

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mx = -200, my = -200, rx = -200, ry = -200;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  (function animCursor() {
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animCursor);
  })();

  document.querySelectorAll('a, button, input, textarea, select').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  // ─── Reveal on scroll ────────────────────────────────────────────────────────

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ─── SECTION 2 — AI Generation ───────────────────────────────────────────────

  const aiCanvas   = document.getElementById('ai-canvas');
  const aiStatus   = document.getElementById('ai-status');
  const aiProgress = document.getElementById('ai-progress');
  const aiOutput   = document.getElementById('ai-output');
  const genBtn     = document.getElementById('generate-btn');
  const genBtnTxt  = document.getElementById('gen-btn-text');

  if (aiCanvas && aiOutput) {
    const ac = aiCanvas.getContext('2d');
    let animId = null;
    let generating = false;
    let genTypeIdx = 0;
    let t = 0;

    function resizeAi() {
      const r = aiOutput.getBoundingClientRect();
      if (r.width < 10) return;
      aiCanvas.width  = Math.round(r.width);
      aiCanvas.height = Math.round(r.height);
    }
    setTimeout(resizeAi, 120);
    window.addEventListener('resize', resizeAi);

    // ── Generative outputs ───────────────────────────────────────────────────

    function drawWave(time, W, H) {
      ac.fillStyle = 'rgba(3,3,10,0.18)';
      ac.fillRect(0, 0, W, H);
      for (let l = 0; l < 6; l++) {
        ac.beginPath();
        ac.strokeStyle = `hsla(${180 + l * 18},100%,${52 + l * 7}%,${0.55 - l * 0.07})`;
        ac.lineWidth = 2.2 - l * 0.25;
        for (let x = 0; x < W; x++) {
          const f = 0.022 + l * 0.004;
          const y = H / 2
            + Math.sin(x * f + time * (0.9 + l * 0.28) + l * 1.1) * (H / 4.2 - l * 14)
            + Math.cos(x * f * 2.1 - time * 0.55 + l) * (H / 9);
          x === 0 ? ac.moveTo(x, y) : ac.lineTo(x, y);
        }
        ac.stroke();
      }
    }

    function drawFlow(time, W, H) {
      ac.fillStyle = 'rgba(3,3,10,0.1)';
      ac.fillRect(0, 0, W, H);
      for (let i = 0; i < 90; i++) {
        const ang = Math.sin(i * 0.22 + time * 0.32) * Math.PI + Math.cos(i * 0.17 + time * 0.21) * Math.PI;
        const px = ((Math.sin(i * 0.71 + time * 0.09) + 1) / 2) * W;
        const py = ((Math.cos(i * 0.53 + time * 0.07) + 1) / 2) * H;
        ac.beginPath();
        ac.moveTo(px, py);
        ac.lineTo(px + Math.cos(ang) * 28, py + Math.sin(ang) * 28);
        ac.strokeStyle = `hsla(${195 + i * 1.8},90%,65%,0.42)`;
        ac.lineWidth = 1.5; ac.stroke();
        ac.beginPath();
        ac.arc(px, py, 1.8, 0, Math.PI * 2);
        ac.fillStyle = `hsla(${195 + i * 1.8},90%,70%,0.6)`;
        ac.fill();
      }
    }

    function drawNebula(time, W, H) {
      ac.fillStyle = 'rgba(3,3,10,0.07)';
      ac.fillRect(0, 0, W, H);
      for (let i = 0; i < 240; i++) {
        const px = ((Math.sin(i * 1.71 + time * 0.19) * Math.cos(i * 0.93) + 1) / 2) * W;
        const py = ((Math.cos(i * 1.33 + time * 0.14) * Math.sin(i * 1.07) + 1) / 2) * H;
        const sz = 1.2 + Math.abs(Math.sin(i * 0.5 + time)) * 4.5;
        const hue = (time * 28 + i * 2.8) % 360;
        ac.beginPath();
        ac.arc(px, py, sz, 0, Math.PI * 2);
        ac.fillStyle = `hsla(${hue},80%,72%,0.55)`;
        ac.fill();
      }
    }

    const genFns = [drawWave, drawFlow, drawNebula];
    const statusSets = [
      ['Initializing model…', 'Sampling latent space…', 'Rendering frames…', 'Compositing output…'],
      ['Diffusing noise…',   'Conditioning on prompt…','Upscaling 4×…',     'Finalizing…'],
      ['Loading checkpoint…','Running inference…',     'Decoding tokens…',  'Assembling…'],
    ];

    function startIdleAnimation() {
      const fn = genFns[0];
      let idleT = 0;
      function idleLoop() {
        const W = aiCanvas.width, H = aiCanvas.height;
        if (W > 0) fn(idleT, W, H);
        idleT += 0.025;
        animId = requestAnimationFrame(idleLoop);
        if (generating) return;
      }
      animId = requestAnimationFrame(idleLoop);
    }
    startIdleAnimation();

    genBtn.addEventListener('click', () => {
      if (generating) return;
      generating = true;
      cancelAnimationFrame(animId);
      genBtn.disabled = true;

      genTypeIdx = (genTypeIdx + 1) % genFns.length;
      const msgs = statusSets[genTypeIdx];
      const W = aiCanvas.width, H = aiCanvas.height;

      // Clear
      ac.clearRect(0, 0, W, H);
      ac.fillStyle = '#03030a';
      ac.fillRect(0, 0, W, H);
      aiProgress.style.width = '0%';

      const total = 2600;
      const start = performance.now();
      let scanT = 0;

      // Loading animation
      function loadingLoop() {
        if (!generating) return;
        const elapsed = performance.now() - start;
        const pct = Math.min(1, elapsed / total);
        aiProgress.style.width = (pct * 100) + '%';

        const msgIdx = Math.min(msgs.length - 1, Math.floor(pct * msgs.length));
        aiStatus.textContent = msgs[msgIdx];

        // Scan line
        ac.fillStyle = 'rgba(3,3,10,0.35)';
        ac.fillRect(0, 0, W, H);
        const scanY = (scanT * 180) % H;
        const sg = ac.createLinearGradient(0, scanY - 12, 0, scanY + 12);
        sg.addColorStop(0, 'transparent');
        sg.addColorStop(0.5, 'rgba(0,229,255,0.12)');
        sg.addColorStop(1, 'transparent');
        ac.fillStyle = sg; ac.fillRect(0, scanY - 12, W, 24);

        // Noise dots
        for (let i = 0; i < 40; i++) {
          ac.fillStyle = `rgba(0,229,255,${Math.random() * 0.15})`;
          ac.fillRect(Math.random() * W, Math.random() * H, Math.random() * 3, 1);
        }
        scanT += 0.016;

        if (elapsed >= total) {
          generating = false;
          genBtn.disabled = false;
          genBtnTxt.textContent = '↯ Generate Again';
          aiStatus.textContent = 'OUTPUT READY';

          // Play animation
          t = 0;
          const fn = genFns[genTypeIdx];
          function outLoop() {
            const W2 = aiCanvas.width, H2 = aiCanvas.height;
            if (W2 > 0) fn(t, W2, H2);
            t += 0.028;
            animId = requestAnimationFrame(outLoop);
          }
          animId = requestAnimationFrame(outLoop);
          return;
        }
        requestAnimationFrame(loadingLoop);
      }
      loadingLoop();
    });
  }

  // ─── SECTION 3 — Monaco Editor ───────────────────────────────────────────────

  const INITIAL_CODE = `// ✦ Edit me — preview updates live

function Counter() {
  const [count, setCount] = React.useState(0)
  const [hue, setHue]     = React.useState(185)

  const accent = \`hsl(\${hue}, 100%, 55%)\`

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#03030a',
      fontFamily: "'Space Grotesk', sans-serif", gap: 28
    }}>
      <div style={{
        fontSize: '5.5rem', fontWeight: 700,
        color: accent, lineHeight: 1,
        letterSpacing: '-0.05em',
        textShadow: \`0 0 40px \${accent}55\`
      }}>{count}</div>

      <div style={{ display: 'flex', gap: 12 }}>
        {[['−', -1], ['+', 1]].map(([label, delta]) => (
          <button key={label} onClick={() => setCount(c => c + delta)}
            style={{
              padding: '10px 28px', fontSize: '1.3rem',
              background: delta > 0 ? accent : 'transparent',
              border: \`1.5px solid \${accent}\`,
              color: delta > 0 ? '#03030a' : accent,
              fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all .15s'
            }}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '.72rem', letterSpacing: '.15em', color: '#56567a' }}>
          HUE
        </span>
        <input type="range" min="0" max="360" value={hue}
          onChange={e => setHue(+e.target.value)}
          style={{ width: 180, accentColor: accent }} />
      </div>
    </div>
  )
}

ReactDOM.render(<Counter />, document.getElementById('root'))`;

  let monacoReady = false;
  let editor = null;
  let previewTimer = null;

  function updatePreview(code) {
    const frame = document.getElementById('preview-frame');
    if (!frame) return;
    frame.srcdoc = `<!DOCTYPE html>
<html><head>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#03030a}
  button{font-family:'Space Grotesk',sans-serif;transition:opacity .15s}
  button:hover{opacity:.8}
  input[type=range]{cursor:pointer}
</style>
</head><body>
<div id="root"></div>
<script type="text/babel">${code}<\/script>
</body></html>`;
  }

  function initMonaco() {
    if (monacoReady || typeof require === 'undefined') return;

    require.config({
      paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' }
    });

    require(['vs/editor/editor.main'], () => {
      monacoReady = true;

      monaco.editor.defineTheme('void-dark', {
        base: 'vs-dark', inherit: true,
        rules: [
          { token: 'comment',   foreground: '44446a', fontStyle: 'italic' },
          { token: 'keyword',   foreground: '8855ff' },
          { token: 'string',    foreground: '00d4ee' },
          { token: 'number',    foreground: 'ff6b9d' },
          { token: 'delimiter', foreground: '5566aa' },
        ],
        colors: {
          'editor.background':              '#07071a',
          'editor.foreground':              '#dddde8',
          'editor.lineHighlightBackground': '#0a0a22',
          'editor.selectionBackground':     '#1a1a42',
          'editorCursor.foreground':        '#00e5ff',
          'editorLineNumber.foreground':    '#2e2e52',
          'editorLineNumber.activeForeground': '#00e5ff',
          'editorIndentGuide.background':   '#111130',
          'scrollbarSlider.background':     '#1a1a3a88',
        }
      });

      editor = monaco.editor.create(document.getElementById('monaco-editor'), {
        value: INITIAL_CODE,
        language: 'javascript',
        theme: 'void-dark',
        fontSize: 12.5,
        fontFamily: "'Space Mono', Consolas, monospace",
        lineHeight: 20,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 12, bottom: 16 },
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        automaticLayout: true,
        lineNumbers: 'on',
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 4,
      });

      editor.onDidChangeModelContent(() => {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => updatePreview(editor.getValue()), 700);
      });

      updatePreview(INITIAL_CODE);
    });
  }

  // Lazy-load Monaco when #build enters viewport
  const buildEl = document.getElementById('build');
  if (buildEl) {
    const buildObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { initMonaco(); buildObs.disconnect(); }
    }, { threshold: 0.05 });
    buildObs.observe(buildEl);
  }

  // ─── SECTION 5 — Contact form ─────────────────────────────────────────────────

  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;
      setTimeout(() => {
        form.style.display = 'none';
        success.classList.add('visible');
      }, 1600);
    });
  }

})();
