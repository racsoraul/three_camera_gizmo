import {
  Vector3,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  PerspectiveCamera,
  EdgesGeometry,
  LineBasicMaterial,
  LineSegments,
  Scene,
  WebGLRenderer
} from "three";

/** How far from the origin the camera will be. */
export const CAMERA_DISTANCE = 6;
/** Where the camera must keep looking at. */
export const CAMERA_FOCUS_POINT = new Vector3(0, 0, 0);

/**
 * Generic function type.
 */
export type GenericFunction<R = any> = (...args: any) => R;
/**
 * Re-renders the gizmo scene on every frame.
 */
export type AnimateGizmo = () => void;

export enum COMMANDS {
  CHANGE_VIEW_TO_TOP,
  CHANGE_VIEW_TO_BOTTOM,
  CHANGE_VIEW_TO_LEFT,
  CHANGE_VIEW_TO_RIGHT,
  CHANGE_VIEW_TO_FRONT,
  CHANGE_VIEW_TO_BACK
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
 * Returns cube of the specified color. Default dimensions are:
 * `width = 1`
 * `height = 1`
 * `depth = 1`
 * @param color hex number.
 */
export function createCube(
  color: number = 0xffffff,
  width: number = 1,
  height: number = 1,
  depth: number = 1
): Mesh {
  //TODO: change to BufferGeometry
  const geometry = new BoxGeometry(width, height, depth);
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
 * @param camera camera to rotate around.
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
  const rightRedCube = createCube(0x9c4c4c);
  rightRedCube.position.x += 1;
  rightRedCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_RIGHT };

  const leftRedCube = createCube(0x926d6d);
  leftRedCube.position.x -= 1;
  leftRedCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_LEFT };

  const frontBlueCube = createCube(0x0000ff);
  frontBlueCube.position.z += 1;
  frontBlueCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_FRONT };

  const backBlueCube = createCube(0x4c74c5);
  backBlueCube.position.z -= 1;
  backBlueCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_BACK };

  const topGreenCube = createCube(0x00ff00);
  topGreenCube.position.y += 1;
  topGreenCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_TOP };

  const bottomGreenCube = createCube(0xc6f5c6);
  bottomGreenCube.position.y -= 1;
  bottomGreenCube.userData = { command: COMMANDS.CHANGE_VIEW_TO_BOTTOM };

  scene.add(rightRedCube);
  scene.add(leftRedCube);
  scene.add(frontBlueCube);
  scene.add(backBlueCube);
  scene.add(topGreenCube);
  scene.add(bottomGreenCube);
}

/**
 * Triggers defined actions according to the command.
 * @param camera camera to react to actions.
 * @param command action to execute.
 */
export const gizmoAction: (
  camera: PerspectiveCamera,
  command: COMMANDS
) => void = debounce(100, (camera, command) => {
  switch (command) {
    case COMMANDS.CHANGE_VIEW_TO_TOP:
      rotateCamera(camera, 0);
      rotateCamera(camera, Math.PI / 2, Axes.X);
      break;
    case COMMANDS.CHANGE_VIEW_TO_BOTTOM:
      rotateCamera(camera, 0);
      rotateCamera(camera, -Math.PI / 2, Axes.X);
      break;
    case COMMANDS.CHANGE_VIEW_TO_RIGHT:
      rotateCamera(camera, Math.PI / 2);
      break;
    case COMMANDS.CHANGE_VIEW_TO_LEFT:
      rotateCamera(camera, -Math.PI / 2);
      break;
    case COMMANDS.CHANGE_VIEW_TO_FRONT:
      rotateCamera(camera, 0);
      break;
    case COMMANDS.CHANGE_VIEW_TO_BACK:
      rotateCamera(camera, Math.PI);
      break;
  }
});

export function setupCameraGizmo(
  sceneContainer: HTMLDivElement,
  sceneCamera: PerspectiveCamera,
  cameraLength: number = 5
): AnimateGizmo {
  const parentNode = sceneContainer.parentNode;
  if (parentNode) {
    const sceneRect = sceneContainer.getBoundingClientRect();

    const gizmoContainer = document.createElement("div");
    gizmoContainer.id = "gizmo";
    gizmoContainer.style.position = "absolute";
    gizmoContainer.style.width = "10%";
    gizmoContainer.style.height = "10%";
    gizmoContainer.style.top = `${sceneRect.top}px`;
    gizmoContainer.style.left = `${sceneRect.left}px`;

    parentNode.appendChild(gizmoContainer);

    const gizmoRenderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });
    const gizmoRect = gizmoContainer.getBoundingClientRect();
    const aspect = gizmoRect.width / gizmoRect.height;
    gizmoRenderer.setSize(gizmoRect.width, gizmoRect.height);
    gizmoContainer.appendChild(gizmoRenderer.domElement);

    const gizmoScene = new Scene();
    addCameraGizmo(gizmoScene);

    const gizmoCamera = new PerspectiveCamera(45, aspect, 1, 100);
    gizmoCamera.up = sceneCamera.up;

    return animateGizmo(gizmoRenderer, gizmoScene, gizmoCamera, sceneCamera);
  } else {
    throw Error("There isn't a valid parent node for the gizmo container.");
  }
}

/**
 * Updates the gizmo on each frame to follow the new position of the scene camera.
 * @param gizmoRenderer WebGLRender for the gizmo.
 * @param gizmoScene scene to show the gizmo.
 * @param gizmoCamera gizmo camera.
 * @param sceneCamera scene camera to track.
 * @param focusPoint focus point of the gizmo camera. Default (0, 0, 0).
 * @returns function that executes the re-rendering logic.
 */
function animateGizmo(
  gizmoRenderer: WebGLRenderer,
  gizmoScene: Scene,
  gizmoCamera: PerspectiveCamera,
  sceneCamera: PerspectiveCamera,
  focusPoint: Vector3 = CAMERA_FOCUS_POINT
) {
  return () => {
    gizmoCamera.position.copy(sceneCamera.position);
    gizmoCamera.position.setLength(5);

    gizmoCamera.lookAt(focusPoint);
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  };
}
