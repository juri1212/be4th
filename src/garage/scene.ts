import {
  ACESFilmicToneMapping,
  CatmullRomCurve3,
  Euler,
  Mesh,
  PCFSoftShadowMap,
  PerspectiveCamera,
  Quaternion,
  SRGBColorSpace,
  Scene,
  Sprite,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FRONT_AXLE, REAR_AXLE, WHEEL_RADIUS, bikePose, buildBike } from './bike';
import { loadCar } from './car';
import { buildRack } from './rack';
import { buildStudio, studioEnvironment } from './studio';
import { DURATION, MOVES, ease, easeInOut, easeOut, lerp, span, stepAt } from './timeline';

export interface GarageEvents {
  onTime(time: number, step: number): void;
  onState(state: { playing: boolean; following: boolean }): void;
}

export interface Garage {
  readonly duration: number;
  play(): void;
  pause(): void;
  seek(time: number): void;
  // Hands the camera back to the sequence after the visitor has moved it.
  follow(): void;
  // Puts the camera somewhere specific and leaves it there.
  view(position: [number, number, number], target: [number, number, number]): void;
  // Night switches the studio's lights off and the car's on. The change fades rather than cuts.
  night(on: boolean): void;
  dispose(): void;
}

// Where the bike stands before it is loaded: beside the driver's door, facing the same way as the car.
const PARKED = new Vector3(1.78, 0, -0.25);
const FORK_LIFT = -3.6 * (Math.PI / 180);
const AXLE_PULL = 0.175;
// Seconds the lights take to change between day and night.
const NIGHTFALL = 1.3;

// The camera's path: where it is and what it looks at, at each moment. Between shots it glides.
interface Shot {
  at: number;
  position: [number, number, number];
  target: [number, number, number];
}

const SHOTS: Shot[] = [
  { at: 0, position: [6.4, 2.5, 6.2], target: [0.45, 0.8, -0.2] },
  { at: 3.0, position: [5.9, 2.3, 5.9], target: [0.45, 0.8, -0.2] },
  { at: 4.3, position: [3.05, 0.68, 1.75], target: [1.84, 0.42, 0.42] },
  { at: 6.4, position: [2.95, 0.64, 1.65], target: [1.84, 0.42, 0.42] },
  { at: 7.8, position: [5.7, 1.65, 4.2], target: [0.95, 0.85, 0.55] },
  { at: 10.6, position: [5.9, 1.7, 4.3], target: [0.9, 0.85, 0.6] },
  { at: 12.4, position: [6.8, 2.05, 4.8], target: [0.65, 1.12, 0.2] },
  { at: 16.0, position: [7.0, 2.1, 4.9], target: [0.6, 1.15, 0.2] },
  { at: 17.2, position: [2.25, 2.0, 1.15], target: [0, 1.47, -0.62] },
  { at: 19.4, position: [2.1, 1.95, 1.0], target: [0, 1.47, -0.64] },
  { at: 20.6, position: [3.3, 1.85, -4.1], target: [0.6, 1.15, -0.9] },
  { at: 21.8, position: [3.5, 1.9, -4.3], target: [0.6, 1.15, -0.9] },
  { at: 23.6, position: [5.3, 2.0, -5.0], target: [0, 0.95, -0.4] },
  { at: 25, position: [5.9, 2.05, -4.3], target: [0, 0.95, -0.4] },
];

export async function createGarage(canvas: HTMLCanvasElement, events: GarageEvents): Promise<Garage> {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.environment = studioEnvironment(renderer);
  const studio = buildStudio(scene);

  const camera = new PerspectiveCamera(30, 1, 0.1, 80);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.2;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI / 2 - 0.03;
  controls.enablePan = false;

  // Lettering on the bike and the plates is drawn with the site's typeface, so wait for it, but not for long.
  await Promise.race([document.fonts.load('700 20px "Archivo Variable"'), new Promise((resolve) => setTimeout(resolve, 1500))]).catch(() => {});

  const car = await loadCar('/models/911.glb');
  scene.add(car.root);
  const rack = buildRack(car);
  scene.add(rack.roof, rack.tail, rack.strap);
  const bike = buildBike();
  scene.add(bike.root);
  // The front wheel leaves the bike, so it lives in the scene and is moved alongside while it is attached.
  scene.add(bike.frontWheel);
  // Its own materials, so it can fade as it goes into the car without the rear wheel fading too.
  const wheelMaterials: Material[] = [];
  bike.frontWheel.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const material = (object.material as Material).clone();
    material.userData.opaque = !material.transparent;
    object.material = material;
    wheelMaterials.push(material);
  });

  // ----- poses the sequence moves between -----
  const rackHome = rack.roof.position.clone();
  const rackUp = new Vector3(0, 1, 0).applyQuaternion(rack.roof.quaternion);
  const tailHome = rack.tail.position.clone();
  const tailUp = new Vector3(0, 1, 0).applyQuaternion(rack.tail.quaternion);
  const frontToRear = REAR_AXLE.clone().sub(FRONT_AXLE);
  const rearAxleParked = PARKED.clone().add(REAR_AXLE);
  // The dropout's position while the rear wheel stays put on the ground and the fork is raised by `pitch`.
  const dropoutOnGround = (pitch: number) => rearAxleParked.clone().sub(frontToRear.clone().applyEuler(new Euler(pitch, 0, 0)));
  const liftFrom = dropoutOnGround(FORK_LIFT);
  const liftPath = new CatmullRomCurve3(
    [
      liftFrom,
      new Vector3(PARKED.x + 0.02, 1.05, liftFrom.z - 0.14),
      new Vector3(1.34, 1.58, rack.mount.z + 0.36),
      new Vector3(0.42, 1.74, rack.mount.z + 0.06),
      new Vector3(0, rack.mount.y + 0.24, rack.mount.z),
      rack.mount.clone(),
    ],
    false,
    'centripetal',
  );
  const wheelParked = PARKED.clone().add(FRONT_AXLE);
  const wheelRolled = wheelParked.clone().add(new Vector3(0, 0, 0.6));
  const stowPath = new CatmullRomCurve3([wheelRolled, new Vector3(1.62, 0.95, 0.62), new Vector3(1.2, 1.12, 0.22), new Vector3(0.74, 1.03, -0.02)], false, 'centripetal');
  const spin = new Quaternion();
  const turn = new Quaternion();
  const X = new Vector3(1, 0, 0);
  const Y = new Vector3(0, 1, 0);

  function pose(time: number) {
    // Rack and the fifth cup settle onto the car.
    const rackDown = easeOut(span(time, ...MOVES.rack));
    rack.roof.position.copy(rackHome).addScaledVector(rackUp, (1 - rackDown) * 0.85);
    const tailDown = easeOut(span(time, ...MOVES.tailCup));
    rack.tail.position.copy(tailHome).addScaledVector(tailUp, (1 - tailDown) * 0.7);

    // The bike: on the ground, fork raised, then along the path to the mount.
    const forkUp = ease(span(time, ...MOVES.forkUp));
    const lift = easeInOut(span(time, ...MOVES.lift));
    const pitch = lift > 0 ? lerp(FORK_LIFT, rack.pitch, ease(span(lift, 0.08, 0.72))) : FORK_LIFT * forkUp;
    const dropout = lift > 0 ? liftPath.getPointAt(lift) : dropoutOnGround(pitch);
    const { position, quaternion } = bikePose(dropout, pitch);
    bike.root.position.copy(position);
    bike.root.quaternion.copy(quaternion);

    // The thru-axle unscrews and slides out to the left, waits, then goes back in through fork and mount.
    const out = span(time, ...MOVES.axleOut);
    const back = span(time, ...MOVES.axleIn);
    const pulled = ease(span(out, 0.3, 1)) - ease(span(back, 0, 0.7));
    bike.axle.position.copy(FRONT_AXLE).addScaledVector(X, pulled * AXLE_PULL);
    bike.axle.rotation.x = ease(span(out, 0, 0.55)) * Math.PI * 5 - ease(span(back, 0.35, 1)) * Math.PI * 5;
    rack.lever.rotation.x = lerp(-1.25, 0.12, ease(span(time, ...MOVES.lever)));

    // The front wheel: with the bike, then rolled clear, then lifted into the car.
    const roll = easeInOut(span(time, ...MOVES.wheelRoll));
    const stow = easeInOut(span(time, ...MOVES.wheelStow));
    const wheel = bike.frontWheel;
    if (forkUp === 0) {
      wheel.position.copy(FRONT_AXLE).applyQuaternion(quaternion).add(position);
      wheel.quaternion.copy(quaternion);
    } else {
      const rolled = wheelParked.clone().lerp(wheelRolled, roll);
      wheel.position.copy(stow > 0 ? stowPath.getPointAt(stow) : rolled);
      spin.setFromAxisAngle(X, (rolled.z - wheelParked.z) / WHEEL_RADIUS + stow * 1.2);
      turn.setFromAxisAngle(Y, -stow * 1.15);
      wheel.quaternion.copy(turn).multiply(spin);
    }
    const fade = 1 - ease(span(stow, 0.72, 1));
    wheel.visible = fade > 0.001;
    wheel.scale.setScalar(lerp(0.86, 1, fade));
    for (const material of wheelMaterials) {
      material.opacity = fade;
      if (material.userData.opaque && material.transparent !== fade < 1) {
        material.transparent = fade < 1;
        material.needsUpdate = true;
      }
    }

    const strap = ease(span(time, ...MOVES.strap));
    rack.strap.visible = strap > 0.001;
    (rack.strap.material as Material).opacity = strap;
  }

  // ----- day and night -----
  // The room goes dark first and the car's lights come up as it does; on the way back it is the other way round.
  function light(night: number) {
    studio.dim(ease(span(night, 0, 0.75)));
    car.lights(ease(span(night, 0.4, 1)));
  }
  light(0);

  // ----- camera -----
  const shotPosition = new Vector3();
  const shotTarget = new Vector3();
  const from = new Vector3();
  const to = new Vector3();
  function shot(time: number) {
    const next = Math.max(1, SHOTS.findIndex((candidate) => candidate.at >= time));
    const a = SHOTS[(next === -1 ? SHOTS.length : next) - 1]!;
    const b = SHOTS[next === -1 ? SHOTS.length - 1 : next]!;
    const t = a === b ? 0 : easeInOut(span(time, a.at, b.at));
    shotTarget.copy(from.fromArray(a.target)).lerp(to.fromArray(b.target), t);
    shotPosition.copy(from.fromArray(a.position)).lerp(to.fromArray(b.position), t);
    // A narrow canvas sees less to the sides, so step back.
    const back = Math.min(2.2, Math.max(1, 1.38 / camera.aspect));
    shotPosition.sub(shotTarget).multiplyScalar(back).add(shotTarget);
  }

  // ----- state and loop -----
  let time = 0;
  let playing = false;
  let following = true;
  // 0 right after the visitor hands the camera back, rising to 1 as it rejoins the sequence.
  let rejoin = 1;
  // 0 by day, 1 at night, and in between while the lights change.
  let night = 0;
  let nightGoal = 0;
  let dirty = true;
  let frame = 0;
  let last = 0;
  let disposed = false;

  const emitState = () => events.onState({ playing, following });

  function resize() {
    const { clientWidth, clientHeight } = canvas;
    if (clientWidth === 0 || clientHeight === 0) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    // On a wide stage the headline and caption sit over the left and the bottom, so frame the scene up and to the right.
    if (camera.aspect > 1.25) camera.setViewOffset(clientWidth, clientHeight, -0.09 * clientWidth, 0.07 * clientHeight, clientWidth, clientHeight);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  controls.addEventListener('start', () => {
    if (following) {
      following = false;
      emitState();
    }
  });
  controls.addEventListener('change', () => {
    dirty = true;
  });

  function render() {
    pose(time);
    if (following) {
      shot(time);
      if (rejoin < 1) {
        camera.position.lerp(shotPosition, ease(rejoin));
        controls.target.lerp(shotTarget, ease(rejoin));
      } else {
        camera.position.copy(shotPosition);
        controls.target.copy(shotTarget);
      }
      camera.lookAt(controls.target);
    }
    renderer.render(scene, camera);
  }

  function tick(now: number) {
    if (disposed) return;
    frame = requestAnimationFrame(tick);
    const delta = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (playing) {
      time = Math.min(DURATION, time + delta);
      if (time >= DURATION) {
        playing = false;
        emitState();
      }
      events.onTime(time, stepAt(time));
      dirty = true;
    }
    if (following && rejoin < 1) {
      rejoin = Math.min(1, rejoin + delta / 0.9);
      dirty = true;
    }
    if (night !== nightGoal) {
      const step = delta / NIGHTFALL;
      night = nightGoal > night ? Math.min(nightGoal, night + step) : Math.max(nightGoal, night - step);
      light(night);
      dirty = true;
    }
    // While the visitor holds the camera, the controls keep it gliding after they let go.
    if (!following && controls.update()) dirty = true;
    if (!dirty) return;
    dirty = false;
    render();
  }
  frame = requestAnimationFrame((now) => {
    last = now;
    tick(now);
  });

  return {
    duration: DURATION,
    play() {
      if (time >= DURATION) time = 0;
      playing = true;
      emitState();
    },
    pause() {
      playing = false;
      emitState();
    },
    seek(next) {
      time = Math.min(DURATION, Math.max(0, next));
      events.onTime(time, stepAt(time));
      dirty = true;
    },
    follow() {
      following = true;
      rejoin = 0;
      dirty = true;
      emitState();
    },
    view(position, target) {
      following = false;
      camera.position.fromArray(position);
      controls.target.fromArray(target);
      controls.update();
      dirty = true;
      emitState();
    },
    night(on) {
      nightGoal = on ? 1 : 0;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof Mesh || object instanceof Sprite)) return;
        object.geometry.dispose();
        for (const material of [object.material].flat() as Material[]) {
          for (const value of Object.values(material)) if (value && typeof value === 'object' && 'isTexture' in value) value.dispose();
          material.dispose();
        }
      });
      scene.environment?.dispose();
      renderer.dispose();
    },
  };
}
