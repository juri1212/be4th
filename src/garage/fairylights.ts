import {
  AdditiveBlending,
  BufferGeometry,
  CanvasTexture,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PointLight,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  SphereGeometry,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Bike, Winding } from './bike';
import { loft, type Station } from './loft';
import { lerp } from './timeline';

// The Christmas theme: a string of warm white fairy lights wound around the bike's frame and fork. Nothing else in the
// garage changes, apart from the glow the string throws on what is around it.

export interface FairyLights {
  // `on` fades the string in from nothing (0) to lit (1). By day (`night` 0) it glows less than in the dark.
  glow(on: number, night: number): void;
}

const WARM = new Color(0xffb45a);
// The wire's thickness, and the wire between one bulb and the next.
const WIRE = 0.0018;
const SPACING = 0.062;
// How far a bulb stands off the wire, and its radius.
const STEM = 0.007;
const BULB = 0.0026;

// A point on a tube's surface, `share` of the way along it and `turns` around it, and which way is out there.
function onTube(tube: BufferGeometry, share: number, turns: number): { at: Vector3; out: Vector3 } {
  const { rings, stride } = tube.userData as { rings: number; stride: number };
  const position = tube.getAttribute('position');
  const normal = tube.getAttribute('normal');
  const along = tube.getAttribute('uv');
  const length = along.getY((rings - 1) * stride);
  let ring = 0;
  while (ring < rings - 2 && along.getY((ring + 1) * stride) < share * length) ring++;
  const start = along.getY(ring * stride);
  const r = (share * length - start) / (along.getY((ring + 1) * stride) - start);
  const around = (turns - Math.floor(turns)) * (stride - 1);
  const j = Math.min(stride - 2, Math.floor(around));
  const a = new Vector3();
  const b = new Vector3();
  const read = (attribute: typeof position) => {
    const edge = (i: number, into: Vector3) => into.fromBufferAttribute(attribute, i * stride + j).lerp(new Vector3().fromBufferAttribute(attribute, i * stride + j + 1), around - j);
    return edge(ring, a).lerp(edge(ring + 1, b), r).clone();
  };
  return { at: read(position), out: read(normal).normalize() };
}

// What a bulb looks like to a camera: a hot centre in a soft glow, with short rays.
function glint(): CanvasTexture {
  const size = 256;
  const half = size / 2;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const disc = (radius: number, stops: [number, number][]) => {
    const fill = context.createRadialGradient(0, 0, 0, 0, 0, radius);
    for (const [at, alpha] of stops) fill.addColorStop(at, `rgb(255 255 255 / ${alpha})`);
    context.fillStyle = fill;
    context.beginPath();
    context.arc(0, 0, radius, 0, Math.PI * 2);
    context.fill();
  };
  context.translate(half, half);
  context.globalCompositeOperation = 'lighter';
  disc(half, [[0, 0.5], [0.12, 0.27], [0.3, 0.1], [0.6, 0.025], [1, 0]]);
  disc(half * 0.16, [[0, 1], [0.45, 0.9], [1, 0]]);
  for (let ray = 0; ray < 4; ray++) {
    context.save();
    context.rotate((ray * Math.PI) / 4 + 0.2);
    context.scale(ray % 2 ? 0.42 : 0.62, 0.032);
    disc(half, [[0, 0.75], [0.35, 0.3], [1, 0]]);
    context.restore();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function buildFairyLights(bike: Bike): FairyLights {
  // A fixed seed, so the string hangs the same on every visit.
  let seed = 24;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  const wire = new MeshStandardMaterial({ color: 0x15201a, roughness: 0.7, transparent: true });
  wire.name = 'fairy-wire';
  const bulb = new MeshBasicMaterial({ transparent: true });
  bulb.name = 'fairy-bulb';
  const halo = new PointsMaterial({ map: glint(), color: WARM, size: 0.34, vertexColors: true, blending: AdditiveBlending, transparent: true, depthWrite: false, fog: false });
  halo.name = 'fairy-halo';
  halo.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      // Towards the camera by half a tube, so that a bulb's glow spills over the tube it is on.
      gl_Position = projectionMatrix * vec4( mvPosition.xyz * ( 1.0 - 0.022 / length( mvPosition.xyz ) ), 1.0 );
      // Further away the glow shrinks less than the bike does, or it would be gone on a small screen. At 4 m it is true.
      mvPosition.z = - 1.516 * pow( - mvPosition.z, 0.7 );`,
    );
  };

  const groups: Group[] = [];
  function string(windings: Winding[], onto: Group) {
    const wires: BufferGeometry[] = [];
    const bulbs: BufferGeometry[] = [];
    const glows: number[] = [];
    const shades: number[] = [];
    for (const { tube, from, to, pitch } of windings) {
      const { rings, stride } = tube.userData as { rings: number; stride: number };
      const length = tube.getAttribute('uv').getY((rings - 1) * stride);
      const steps = Math.ceil((((to - from) * length) / pitch) * 26);
      const phase = random();
      // Wound by hand: some turns sit closer together than others.
      const sway = random() * Math.PI * 2;
      const path: Station[] = [];
      let due = SPACING * (0.2 + random() * 0.6);
      for (let i = 0; i <= steps; i++) {
        const share = lerp(from, to, i / steps);
        const turns = phase + (share * length) / pitch + Math.sin(share * length * 17 + sway) * 0.16;
        const { at, out } = onTube(tube, share, turns);
        at.addScaledVector(out, WIRE * 0.7);
        const last = path.at(-1);
        path.push({ at, width: WIRE, depth: WIRE });
        if (!last) continue;
        due -= at.distanceTo(last.at);
        if (due > 0) continue;
        due += SPACING * (0.72 + random() * 0.56);
        const lean = new Vector3(random() - 0.5, random() - 0.5, random() - 0.5);
        const centre = at.clone().addScaledVector(out.clone().add(lean).normalize(), STEM * (0.7 + random() * 0.6));
        wires.push(loft([{ at, width: WIRE, depth: WIRE }, { at: centre, width: WIRE * 0.8, depth: WIRE * 0.8 }], { around: 4, power: 2 }));
        bulbs.push(new SphereGeometry(BULB, 8, 6).translate(centre.x, centre.y, centre.z));
        glows.push(...centre);
        const shade = 0.62 + random() * 0.38;
        shades.push(shade, shade, shade);
      }
      wires.push(loft(path, { around: 4, power: 2 }));
    }
    const points = new BufferGeometry();
    points.setAttribute('position', new Float32BufferAttribute(glows, 3));
    points.setAttribute('color', new Float32BufferAttribute(shades, 3));
    const group = new Group();
    group.name = 'fairy-lights';
    const glow = new Points(points, halo);
    // After the car's glass, which doesn't hide what is drawn before it.
    glow.renderOrder = 3;
    group.add(new Mesh(mergeGeometries(wires), wire), new Mesh(mergeGeometries(bulbs), bulb), glow);
    onto.add(group);
    groups.push(group);
  }
  string(bike.windings.frame, bike.root);
  string(bike.windings.fork, bike.parts.fork.group);

  // What all the bulbs together throw on the bike and the floor. Like the car's lamps it is always in the scene, so
  // switching the string on doesn't rebuild every material's shader. It stands for a hundred small lights rather than one,
  // so it falls off slowly and leaves no hot spot on the nearest tube; and it ends before it reaches far onto the car.
  const spill = new PointLight(WARM, 0, 1.35, 1);
  spill.position.set(0, 0.6, 0.06);
  bike.root.add(spill);

  return {
    glow(on, night) {
      for (const group of groups) group.visible = on > 0.001;
      wire.opacity = on;
      bulb.opacity = on;
      // Brighter than white, so a bulb's middle clips the way it does in a photo.
      bulb.color.copy(WARM).multiplyScalar(lerp(0.3, 2.6, on));
      halo.opacity = on * lerp(0.72, 1, night);
      spill.intensity = on * lerp(0.7, 1.15, night);
    },
  };
}
