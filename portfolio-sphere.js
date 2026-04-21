// portfolio-sphere.js — Three.js morphing particle sphere

(function () {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  // Lights
  const ambientLight = new THREE.AmbientLight(0x001133, 3);
  scene.add(ambientLight);

  const keyLight = new THREE.PointLight(0x00e5ff, 6, 25);
  keyLight.position.set(3, 3, 4);
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0x7000ff, 3, 20);
  fillLight.position.set(-4, -2, -3);
  scene.add(fillLight);

  // ─── Shape generators ───────────────────────────────────────────────────────

  const R = 1.5;

  function fibSphere(n, r) {
    const pts = new Float32Array(n * 3);
    const phi = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const rad = Math.sqrt(1 - y * y) * r;
      const theta = phi * i;
      pts[i * 3]     = Math.cos(theta) * rad;
      pts[i * 3 + 1] = y * r;
      pts[i * 3 + 2] = Math.sin(theta) * rad;
    }
    return pts;
  }

  function brainShape(n, r) {
    const base = fibSphere(n, r);
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const len = Math.sqrt(x * x + y * y + z * z) || 0.001;
      const noise =
        Math.sin(x * 5.2 + 1.1) * Math.cos(y * 4.4 + 0.7) * Math.sin(z * 6.8 + 2.0) * 0.3
        + Math.cos(x * 2.9 - 0.5) * Math.sin(y * 3.1 + 1.9) * 0.15;
      const nr = r + noise;
      out[i * 3]     = (x / len) * nr;
      out[i * 3 + 1] = (y / len) * nr;
      out[i * 3 + 2] = (z / len) * nr;
    }
    return out;
  }

  function cubeShape(n, r) {
    const base = fibSphere(n, r);
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const mx = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      out[i * 3]     = (x / mx) * r * 0.88;
      out[i * 3 + 1] = (y / mx) * r * 0.88;
      out[i * 3 + 2] = (z / mx) * r * 0.88;
    }
    return out;
  }

  function crystalShape(n, r) {
    const base = fibSphere(n, r);
    const out = new Float32Array(n * 3);
    const step = r * 0.32;
    for (let i = 0; i < n; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const sx = Math.round(x / step) * step;
      const sy = Math.round(y / step) * step;
      const sz = Math.round(z / step) * step;
      const len = Math.sqrt(sx * sx + sy * sy + sz * sz) || 0.001;
      out[i * 3]     = (sx / len) * r;
      out[i * 3 + 1] = (sy / len) * r;
      out[i * 3 + 2] = (sz / len) * r;
    }
    return out;
  }

  // ─── Main particle cloud ─────────────────────────────────────────────────────

  const N = 2500;

  const shapes = [
    fibSphere(N, R),    // 0: Hero  — sphere
    brainShape(N, R),   // 1: Craft — neural
    cubeShape(N, R),    // 2: Build — cube
    crystalShape(N, R), // 3: Play  — crystal/voxel
    fibSphere(N, R),    // 4: Contact — sphere (full circle)
  ];

  const pGeo = new THREE.BufferGeometry();
  const pPositions = new Float32Array(shapes[0]);
  const pColors = new Float32Array(N * 3);

  for (let i = 0; i < N; i++) {
    const t = i / N;
    // Cyan → violet gradient along point index
    pColors[i * 3]     = t * 0.45;
    pColors[i * 3 + 1] = 0.72 + t * 0.22;
    pColors[i * 3 + 2] = 1.0;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pColors,    3));

  const pMat = new THREE.PointsMaterial({
    size: 0.026,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const particleMesh = new THREE.Points(pGeo, pMat);
  scene.add(particleMesh);

  // ─── Orbit particles (hero only) ─────────────────────────────────────────────

  const ORBIT_N = 130;
  const orbitGeo = new THREE.BufferGeometry();
  const orbitPos = new Float32Array(ORBIT_N * 3);

  const orbitData = Array.from({ length: ORBIT_N }, () => ({
    angle:       Math.random() * Math.PI * 2,
    speed:       0.006 + Math.random() * 0.012,
    radius:      R + 0.55 + Math.random() * 0.85,
    incl:        Math.random() * Math.PI,
    phase:       Math.random() * Math.PI * 2,
  }));

  orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));

  const orbitMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x00e5ff,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const orbitMesh = new THREE.Points(orbitGeo, orbitMat);
  scene.add(orbitMesh);

  // ─── Inner glow sphere ────────────────────────────────────────────────────────

  const innerGeo  = new THREE.SphereGeometry(R * 0.82, 32, 32);
  const innerMat  = new THREE.MeshPhongMaterial({
    color: 0x000d1f, emissive: 0x000814,
    transparent: true, opacity: 0.18, wireframe: false,
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerMesh);

  // ─── Morph state ─────────────────────────────────────────────────────────────

  let fromPositions  = new Float32Array(shapes[0]);
  let targetShapeIdx = 0;
  let morphProgress  = 1;

  function startMorph(idx) {
    if (idx === targetShapeIdx && morphProgress >= 1) return;
    fromPositions  = new Float32Array(pGeo.attributes.position.array);
    targetShapeIdx = Math.max(0, Math.min(shapes.length - 1, idx));
    morphProgress  = 0;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ─── World positions per section ─────────────────────────────────────────────

  const sectionWorldPos = [
    new THREE.Vector3( 0.0,  0.0, 0),  // Hero
    new THREE.Vector3( 1.4,  0.1, 0),  // Craft
    new THREE.Vector3(-1.4,  0.0, 0),  // Build
    new THREE.Vector3( 0.0, -0.2, 0),  // Play
    new THREE.Vector3( 0.0,  0.0, 0),  // Contact
  ];

  const sectionScales = [1.0, 0.78, 0.82, 0.70, 0.92];

  // ─── Scroll tracking ─────────────────────────────────────────────────────────

  let rawScroll    = 0;
  let smoothScroll = 0;
  let prevSection  = 0;
  let rotSpeed     = 0.15;

  window._sphereSetSpeed = (s) => { rotSpeed = s; };

  function getScrollProgress() {
    const total = document.body.scrollHeight - window.innerHeight;
    return total > 0 ? (rawScroll / total) * 4 : 0;
  }

  window.addEventListener('scroll', () => { rawScroll = window.scrollY; }, { passive: true });

  // ─── Animation loop ───────────────────────────────────────────────────────────

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const time = clock.elapsedTime;

    smoothScroll += (getScrollProgress() - smoothScroll) * 0.045;

    const sIdx = Math.max(0, Math.min(3, Math.floor(smoothScroll)));
    const frac = smoothScroll - Math.floor(smoothScroll);
    const nextIdx = Math.min(4, sIdx + 1);

    // Trigger morph when crossing section threshold
    const nearestSection = Math.round(smoothScroll);
    const clampedNearest = Math.max(0, Math.min(4, nearestSection));
    if (clampedNearest !== targetShapeIdx) {
      startMorph(clampedNearest);
    }

    // Advance morph
    if (morphProgress < 1) {
      morphProgress = Math.min(1, morphProgress + dt * 1.1);
      const mt = easeInOut(morphProgress);
      const target = shapes[targetShapeIdx];
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < N * 3; i++) {
        pos[i] = fromPositions[i] + (target[i] - fromPositions[i]) * mt;
      }
      pGeo.attributes.position.needsUpdate = true;
    }

    // Rotation
    particleMesh.rotation.y += dt * rotSpeed;
    particleMesh.rotation.x  = Math.sin(time * 0.055) * 0.12;

    // Position interpolation between section targets
    const pA = sectionWorldPos[sIdx];
    const pB = sectionWorldPos[nextIdx];
    const tx = pA.x + (pB.x - pA.x) * frac;
    const ty = pA.y + (pB.y - pA.y) * frac;

    particleMesh.position.x += (tx - particleMesh.position.x) * 0.055;
    particleMesh.position.y += (ty - particleMesh.position.y) * 0.055;
    innerMesh.position.copy(particleMesh.position);
    orbitMesh.position.copy(particleMesh.position);

    // Scale
    const sA = sectionScales[sIdx];
    const sB = sectionScales[nextIdx];
    const ts = sA + (sB - sA) * frac;
    const cs = particleMesh.scale.x;
    const ns = cs + (ts - cs) * 0.055;
    particleMesh.scale.setScalar(ns);
    innerMesh.scale.setScalar(ns);

    // Orbit particles — present only in hero, sucked in when scrolling
    const heroFade = Math.max(0, 1 - smoothScroll * 2.5);
    orbitMat.opacity = heroFade * 0.9;

    orbitData.forEach((o, i) => {
      o.angle += o.speed;
      const r = o.radius * heroFade;
      const sinIncl = Math.sin(o.incl);
      orbitPos[i * 3]     = r * sinIncl * Math.cos(o.angle);
      orbitPos[i * 3 + 1] = r * Math.cos(o.incl) + Math.sin(time * 0.28 + o.phase) * 0.08;
      orbitPos[i * 3 + 2] = r * sinIncl * Math.sin(o.angle);
    });
    orbitGeo.attributes.position.needsUpdate = true;

    // Animate lights
    keyLight.position.x = Math.sin(time * 0.28) * 4;
    keyLight.position.y = Math.cos(time * 0.21) * 3;
    const lerpT = Math.min(1, smoothScroll / 4);
    keyLight.color.setHSL(0.52 - lerpT * 0.22, 1, 0.6);

    renderer.render(scene, camera);
  }

  animate();

  // ─── Resize ───────────────────────────────────────────────────────────────────

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
