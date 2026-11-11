import {
  BackSide,
  BoxGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PMREMGenerator,
  PlaneGeometry,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  type Side,
  type Texture,
  type WebGLRenderer,
} from 'three';

// The site's background, so the floor can fade into the page.
export const BACKDROP = 0x0e131b;

// What the paint reflects: a dark room with one long softbox overhead and a strip light down each side, the way cars
// are lit in a studio. Rendered once into an environment map instead of shipping an HDR photo.
export function studioEnvironment(renderer: WebGLRenderer): Texture {
  const room = new Scene();
  // Colours brighter than white, so the highlights have something to clip from.
  const glow = (color: number, intensity: number, side: Side) => new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side });
  const panel = (width: number, height: number, depth: number, x: number, y: number, z: number, color: number, intensity: number) => {
    const mesh = new Mesh(new BoxGeometry(width, height, depth), glow(color, intensity, DoubleSide));
    mesh.position.set(x, y, z);
    room.add(mesh);
  };
  room.add(new Mesh(new SphereGeometry(40, 32, 16), glow(0x1a2230, 0.55, BackSide)));
  // Floor bounce, so the sills aren't black.
  panel(60, 0.1, 60, 0, -1.5, 0, 0x232a36, 0.5);
  // Overhead: two long tubes that draw a highlight down each shoulder of the car, and a dim panel between them.
  panel(1.1, 0.1, 13, 2.3, 7, 0, 0xfff6ee, 7);
  panel(1.1, 0.1, 13, -2.3, 7, 0, 0xfff6ee, 7);
  panel(3.2, 0.1, 11, 0, 7.4, 0, 0xfff6ee, 1.1);
  // Strip lights: cool on the driver's side, a little of the bike's pink on the other.
  panel(0.1, 1.6, 16, 9, 2.6, 0, 0xeaf2ff, 9);
  panel(0.1, 1.6, 16, -9, 2.6, 0, 0xffe3dc, 6);
  // Ends of the room.
  panel(6, 1.4, 0.1, 0, 4.6, 12, 0xffffff, 0.9);
  panel(6, 1.4, 0.1, 0, 4.6, -12, 0xdfe8ff, 0.9);
  const generator = new PMREMGenerator(renderer);
  const texture = generator.fromScene(room, 0.015).texture;
  generator.dispose();
  room.traverse((object) => {
    if (object instanceof Mesh) {
      object.geometry.dispose();
      object.material.dispose();
    }
  });
  return texture;
}

function gradient(stops: [number, string][], size = 512): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d')!;
  const fill = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) fill.addColorStop(at, color);
  context.fillStyle = fill;
  context.fillRect(0, 0, size, size);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function buildStudio(scene: Scene): { key: DirectionalLight } {
  scene.background = new Color(BACKDROP);
  scene.fog = new Fog(BACKDROP, 9, 24);

  // A floor that is lit under the car and gone by the time it reaches the edge of the view.
  const floor = new Mesh(
    new CircleGeometry(34, 72),
    // No sheen: at this angle a floor mirrors the strip lights into a bright band along the horizon.
    new MeshPhysicalMaterial({ map: gradient([[0, '#566176'], [0.13, '#434d5d'], [0.34, '#222a36'], [0.7, '#0e131b'], [1, '#0e131b']]), roughness: 1, specularIntensity: 0, envMapIntensity: 0.35 }),
  );
  floor.name = 'floor';
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // The soft dark patch under the car that a single shadow map doesn't give.
  const patch = new Mesh(
    new PlaneGeometry(3.3, 6.2),
    new MeshBasicMaterial({ map: gradient([[0, 'rgb(0 0 0 / 0.78)'], [0.55, 'rgb(0 0 0 / 0.5)'], [1, 'rgb(0 0 0 / 0)']]), transparent: true, depthWrite: false }),
  );
  patch.name = 'contact-shadow';
  patch.rotation.x = -Math.PI / 2;
  patch.position.y = 0.004;
  patch.renderOrder = -1;
  scene.add(patch);

  const key = new DirectionalLight(0xfff4ea, 2.4);
  key.position.set(5.5, 9, 6.5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 26;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 5;
  scene.add(key);
  return { key };
}
