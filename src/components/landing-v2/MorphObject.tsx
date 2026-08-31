'use client';

import { useEffect, useImperativeHandle, useRef, forwardRef } from 'react';
import * as THREE from 'three';

/**
 * A single 12-part composition that morphs between three states:
 *
 *   0 FOLDER (wat er is)  ->  1 DOCUMENT MET REGELS (hoe het werkt)  ->  2 MECHANISME (wat het doet)
 *
 * Every part is a unit box, so the morph is a pure position/rotation/scale/colour
 * lerp — no geometry swaps, fully continuous. Drive it with `setProgress(0..1)`.
 *
 * Ported from design_handoff_website_2026/design/morph3d.js. Client-only: it
 * touches WebGLRenderer, ResizeObserver, IntersectionObserver and matchMedia.
 */

const C = {
  slab: 0x1e1e25,
  accent: 0xff7014,
  paper: 0xece7dd,
  deep: 0x121216,
};

type Part = {
  p: [number, number, number];
  r: [number, number, number];
  s: [number, number, number];
  c: number;
};

function P(
  x: number, y: number, z: number,
  rx: number, ry: number, rz: number,
  sx: number, sy: number, sz: number,
  col: number
): Part {
  return { p: [x, y, z], r: [rx, ry, rz], s: [sx, sy, sz], c: col };
}

/* state 0: three fanned folders with sheets peeking out */
const FOLDER: Part[] = [
  P(-0.1, -0.95, -0.42, -0.2, 0, 0.05, 2.7, 1.85, 0.075, C.slab),
  P(-0.98, 0.02, -0.42, -0.2, 0, 0.05, 0.94, 0.27, 0.075, C.slab),
  P(0.06, -0.2, 0.0, -0.11, 0, 0.03, 2.7, 1.85, 0.075, C.deep),
  P(-0.82, 0.78, 0.0, -0.11, 0, 0.03, 0.94, 0.27, 0.075, C.deep),
  P(0.22, 0.56, 0.42, -0.03, 0, 0.0, 2.7, 1.85, 0.075, C.accent),
  P(-0.66, 1.55, 0.42, -0.03, 0, 0.0, 0.94, 0.27, 0.075, C.accent),
  P(0.34, 1.62, 0.12, 0, 0, 0.02, 1.5, 0.05, 0.05, C.paper),
  P(0.5, 1.78, 0.06, 0, 0, -0.03, 1.15, 0.05, 0.05, C.paper),
  P(0.2, 1.47, 0.18, 0, 0, 0.04, 1.8, 0.05, 0.05, C.paper),
  P(-1.16, -0.95, 0.44, 0, 0, 0, 0.07, 1.8, 0.07, C.accent),
  P(1.56, 0.56, 0.44, 0, 0, 0, 0.07, 1.8, 0.07, C.slab),
  P(0.22, -0.4, 0.44, 0, 0, 0, 2.7, 0.06, 0.075, C.slab),
];

/* state 1: one readable document — a title, rules, a bullet */
const RULES = [1.55, 1.78, 1.22, 1.62, 1.02, 1.74, 1.36];
const DOC: Part[] = [
  P(0, 0, 0, 0, 0, 0, 2.3, 3.1, 0.09, C.paper),
  P(-0.44, 1.14, 0.08, 0, 0, 0, 1.2, 0.16, 0.04, C.accent),
  ...RULES.map((w, i) => P(-0.92 + w / 2, 0.66 - i * 0.26, 0.08, 0, 0, 0, w, 0.08, 0.04, C.slab)),
  P(-1.0, -0.34, 0.08, 0, 0, 0, 0.12, 0.12, 0.04, C.accent),
  P(-0.5, -1.3, 0.08, 0, 0, 0, 0.9, 0.11, 0.04, C.slab),
  P(0.14, -0.1, -0.09, 0, 0, 0, 2.3, 3.1, 0.04, C.deep),
];

/* state 2: a mechanism — hub, spokes, guard rails, axle */
const HUB: Part[] = [
  P(0, 0, 0, 0, 0, 0, 0.95, 0.95, 0.55, C.accent),
  ...Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return P(Math.cos(a) * 1.4, Math.sin(a) * 1.4, 0, 0, 0, a, 1.35, 0.25, 0.36, C.slab);
  }),
  P(0, 2.0, 0, 0, 0, 0, 1.9, 0.18, 0.34, C.paper),
  P(0, -2.0, 0, 0, 0, 0, 1.9, 0.18, 0.34, C.paper),
  P(0, 0, 0.75, 0, 0, 0, 0.42, 0.42, 1.5, C.paper),
];

const STATES = [FOLDER, DOC, HUB];
const N = 12;
const STATE_ROT: [number, number, number][] = [
  [-0.16, -0.42, 0.03],
  [-0.05, 0.3, -0.02],
  [-0.26, -0.18, 0.0],
];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface MorphObjectHandle {
  setProgress: (p: number) => void;
}

export interface MorphObjectProps {
  /** `ambient` holds state 0 and drifts; `morph` takes scroll progress. */
  variant?: 'morph' | 'ambient';
  className?: string;
  style?: React.CSSProperties;
}

export const MorphObject = forwardRef<MorphObjectHandle, MorphObjectProps>(function MorphObject(
  { variant = 'morph', className, style },
  ref
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useImperativeHandle(ref, () => ({
    setProgress: (p: number) => {
      progressRef.current = Math.max(0, Math.min(1, p));
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const ambient = variant === 'ambient';

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0, ambient ? 9.8 : 8.4);

    scene.add(new THREE.HemisphereLight(0xbfc4d6, 0x0a0a0b, 1.05));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(3.4, 5, 5.5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8fa2c8, 0.75);
    fill.position.set(-5, -1.5, 3);
    scene.add(fill);
    const rim = new THREE.PointLight(0xff7014, ambient ? 14 : 22, 22);
    rim.position.set(-3.2, 2.4, -3.4);
    scene.add(rim);

    const group = new THREE.Group();
    scene.add(group);

    const box = new THREE.BoxGeometry(1, 1, 1);
    const edgeGeo = new THREE.EdgesGeometry(box);
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: ambient ? 0.14 : 0.2,
    });

    const parts: {
      mesh: THREE.Mesh;
      mat: THREE.MeshStandardMaterial;
      dir: THREE.Vector3;
      spin: number;
    }[] = [];
    for (let i = 0; i < N; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(C.slab),
        roughness: 0.52,
        metalness: 0.14,
      });
      const mesh = new THREE.Mesh(box, mat);
      mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));
      group.add(mesh);
      parts.push({ mesh, mat, dir: new THREE.Vector3(), spin: (i % 5) - 2 });
    }

    const cageGeo = new THREE.WireframeGeometry(
      new THREE.IcosahedronGeometry(ambient ? 3.4 : 3.15, 1)
    );
    const cageMat = new THREE.LineBasicMaterial({
      color: 0xff7014,
      transparent: true,
      opacity: ambient ? 0.16 : 0.1,
    });
    const cage = new THREE.LineSegments(cageGeo, cageMat);
    scene.add(cage);

    let baseRot: [number, number, number] = STATE_ROT[0];
    const tmpColor = new THREE.Color();

    function apply(s: number) {
      const i0 = Math.min(1, Math.floor(s));
      const raw = Math.max(0, Math.min(1, s - i0));
      const t = ease(raw);
      const burst = Math.sin(Math.PI * raw);
      const A = STATES[i0];
      const B = STATES[i0 + 1];

      for (let i = 0; i < N; i++) {
        const a = A[i];
        const b = B[i];
        const { mesh, mat, dir, spin } = parts[i];
        const x = lerp(a.p[0], b.p[0], t);
        const y = lerp(a.p[1], b.p[1], t);
        const z = lerp(a.p[2], b.p[2], t);
        dir.set(x, y, z);
        if (dir.lengthSq() < 0.0001) dir.set(0, 0, 1);
        dir.normalize();
        const push = burst * 0.62;
        mesh.position.set(x + dir.x * push, y + dir.y * push, z + dir.z * push);
        mesh.rotation.set(
          lerp(a.r[0], b.r[0], t) + burst * 0.5 * spin * 0.34,
          lerp(a.r[1], b.r[1], t) + burst * 0.7 * spin * 0.22,
          lerp(a.r[2], b.r[2], t) + burst * 0.4 * spin * 0.3
        );
        const shrink = 1 - burst * 0.14;
        mesh.scale.set(
          lerp(a.s[0], b.s[0], t) * shrink,
          lerp(a.s[1], b.s[1], t) * shrink,
          lerp(a.s[2], b.s[2], t) * shrink
        );
        mat.color.set(a.c).lerp(tmpColor.set(b.c), t);
      }

      const r0 = STATE_ROT[i0];
      const r1 = STATE_ROT[i0 + 1];
      baseRot = [lerp(r0[0], r1[0], t), lerp(r0[1], r1[1], t), lerp(r0[2], r1[2], t)];
    }

    apply(0);

    function resize() {
      const w = host!.clientWidth || 1;
      const h = host!.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const narrow = Math.min(1, w / 560);
      camera.position.z = (ambient ? 9.8 : 8.4) / Math.max(0.7, narrow);
      camera.updateProjectionMatrix();
    }
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, {
      rootMargin: '120px',
    });
    io.observe(host);

    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      const r = host!.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let shown = 0;
    let raf = 0;

    function loop() {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      const time = (performance.now() - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.055;
      mouse.y += (mouse.ty - mouse.y) * 0.055;

      const target = ambient ? 0 : progressRef.current * 2;
      shown += (target - shown) * 0.09;
      apply(shown);

      // Reduced motion stops the idle drift but keeps the object rendered.
      const idle = reducedMotion ? 0 : 1;
      group.rotation.x = baseRot[0] + mouse.y * 0.12 + Math.sin(time * 0.34) * 0.035 * idle;
      group.rotation.y =
        baseRot[1] +
        mouse.x * -0.24 +
        (ambient ? time * 0.075 * idle : shown * 0.5 + Math.sin(time * 0.22) * 0.06 * idle);
      group.rotation.z = baseRot[2] + Math.sin(time * 0.19) * 0.018 * idle;
      group.position.y = Math.sin(time * 0.5) * 0.09 * idle;

      cage.rotation.y = -time * 0.045 * idle + mouse.x * 0.08;
      cage.rotation.x = time * 0.028 * idle + mouse.y * 0.06;

      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      parts.forEach((p) => p.mat.dispose());
      box.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      cageGeo.dispose();
      cageMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [variant]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ display: 'block', position: 'relative', width: '100%', height: '100%', ...style }}
      aria-hidden
    />
  );
});

export default MorphObject;
