import {
  Vector3,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  PerspectiveCamera,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Scene
} from "three";

/** How far from the origin the camera will be. */
export const CAMERA_DISTANCE = 100;
/** Where the camera must keep looking at. */
export const CAMERA_FOCUS_POINT = new Vector3(0, 0, 0);

/**
 * Generic function type.
 */
export type GenericFunction<R = any> = (...args: any) => R;

export enum ViewRotation {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  FRONT,
  BACK
}

export enum Axes {
  X,
  Y,
  Z
}

/**
 * Returns a function that will be invoked until the timeout is over.
 * This timeout restarts evertime the function gets invoked before
 * the interval stablished.
 *
 * @template R type of return of the function to debounce. Default `any`.
 * @param ms interval of time to wait for next invocation of the function.
 * By default value is `500`.
 * @param fn function, accepting any number of arguments, to debounce.
 */
export const debounce: <R>(
  ms: number,
  fn: GenericFunction<R>
) => (...args: any) => void = (ms = 500, fn) => {
  let inDebounce: number;
  return (...params: any) => {
    window.clearTimeout(inDebounce);
    inDebounce = window.setTimeout(() => fn.apply(null, params), ms);
  };
};

/**
 * Returns cube of the specified color. Dimensions are:
 * `width = 15`
 * `height = 15`
 * `depth = 15`
 * @param color hex number.
 */
export function createSimpleCube(color: number = 0xffffff): Mesh {
  const geometry = new BoxGeometry(15, 15, 15);
  const material = new MeshBasicMaterial({ color });
  const mesh = new Mesh(geometry, material);

  // Add wireframe
  const edgesGeometry = new EdgesGeometry(mesh.geometry);
  const edgesMaterial = new LineBasicMaterial({
    color: 0xababab,
    linewidth: 2.5
  });
  const edgesMesh = new LineSegments(edgesGeometry, edgesMaterial);

  return mesh.add(edgesMesh);
}

/**
 * Rotates the camera around the specified `axis` the amount
 * of degrees specified.
 * @param camera camera to rotate.
 * @param angle degrees to rotate.
 * @param axis axis to rotate around. Default `Axes.Y`.
 */
export function rotateCamera(
  camera: PerspectiveCamera,
  angle: number,
  axis: Axes = Axes.Y
) {
  camera.position.y = 0;
  let z = CAMERA_DISTANCE,
    y = 0,
    x = 0;

  switch (axis) {
    case Axes.X:
      camera.position.y = y * Math.cos(angle) + z * Math.sin(angle);
      camera.position.z = z * Math.cos(angle) - y * Math.sin(angle);
      break;
    case Axes.Y:
      camera.position.x = x * Math.cos(angle) + z * Math.sin(angle);
      camera.position.z = z * Math.cos(angle) - x * Math.sin(angle);
      break;
    case Axes.Z:
      throw Error(
        "Unsupported rotation. Currently there's no reason to rotate around the Z axis."
      );
  }

  camera.lookAt(CAMERA_FOCUS_POINT);
}

/**
 * Adds a camera gizmo to the specified scene.
 * @param scene scene to add the camera gizmo.
 */
export function addCameraGizmo(scene: Scene) {
  const rightRedCube = createSimpleCube(0x9c4c4c);
  rightRedCube.position.x += 15;
  rightRedCube.userData = { command: ViewRotation.RIGHT };

  const leftRedCube = createSimpleCube(0x926d6d);
  leftRedCube.position.x -= 15;
  leftRedCube.userData = { command: ViewRotation.LEFT };

  const frontBlueCube = createSimpleCube(0x0000ff);
  frontBlueCube.position.z += 15;
  frontBlueCube.userData = { command: ViewRotation.FRONT };

  const backBlueCube = createSimpleCube(0x4c74c5);
  backBlueCube.position.z -= 15;
  backBlueCube.userData = { command: ViewRotation.BACK };

  const topGreenCube = createSimpleCube(0x00ff00);
  topGreenCube.position.y += 15;
  topGreenCube.userData = { command: ViewRotation.TOP };

  const bottomGreenCube = createSimpleCube(0xc6f5c6);
  bottomGreenCube.position.y -= 15;
  bottomGreenCube.userData = { command: ViewRotation.BOTTOM };

  scene.add(rightRedCube);
  scene.add(leftRedCube);
  scene.add(frontBlueCube);
  scene.add(backBlueCube);
  scene.add(topGreenCube);
  scene.add(bottomGreenCube);
}
