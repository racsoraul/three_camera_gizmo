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
  WebGLRenderer,
  Vector2,
  Raycaster
} from "three";

/** How far from the origin the camera will be. */
export const CAMERA_DISTANCE = 6;
/** Where the camera must keep looking at. */
export const CAMERA_FOCUS_POINT = new Vector3(0, 0, 0);

/**
 * Generic function type.
 */
type GenericFunction<R = any> = (...args: any) => R;

type RenderCameraGizmo = () => void;
type DestoyCameraGizmo = () => void;

/**
 * State of the mouse.
 */
interface IMouse {
  coordinates: Vector2;
  isDown: boolean;
}

/**
 * Utilities to handle the lifecycle of the camera gizmo.
 */
export interface IGizmoManager {
  /** Re-renders the gizmo scene on every frame. */
  renderCameraGizmo: RenderCameraGizmo;
  /** Removes the DOM node of the gizmo and removes mouse listeners with it. */
  destroyCameraGizmo: DestoyCameraGizmo;
}

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
 * Returns a cube of the specified color and dimensions.
 * @param color hex number.
 * @param width width of the cube. Default `1`.
 * @param height height of the cube. Default `1`.
 * @param depth depth of the cube. Default `1`.
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
 * Rotates the camera around the given `axis` the amount
 * of degrees specified.
 * @param camera camera to rotate around.
 * @param angle degrees to rotate.
 * @param axis axis to rotate around. Default `Axes.Y`.
 */
function rotateCamera(
  camera: PerspectiveCamera,
  angle: number,
  axis: Axes = Axes.Y
) {
  camera.position.y = 0;
  // TODO: make CAMERA_DISTANCE injected explicitly.
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

  // TODO: make CAMERA_FOCUS_POINT injected explicitly.
  camera.lookAt(CAMERA_FOCUS_POINT);
}

/**
 * Adds gizmo handlers to the specified scene.
 * @param scene scene to add the camera gizmo.
 */
function addGizmoHandler(scene: Scene) {
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
 * Triggers actions according to the command.
 * @param camera camera to react to actions.
 * @param command action to execute.
 */
const gizmoAction: (
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

/**
 * Listener to keep track of the mouse position in the gizmo scene. It
 * converts the mouse coordinates to a normalized device coordinates
 * (-1 to +1).
 * @param mouseCoordinates mouse coordinates relative to the gizmo scene.
 * @param gizmoRect gizmo DOM node dimensions.
 */
function onMouseMove(mouse: IMouse, gizmoRect: ClientRect) {
  return function mouseMovement(event: MouseEvent) {
    /**
     * Calculate mouse position in normalized device coordinates
     * (-1 to +1) for both components.
     */
    mouse.coordinates.x =
      ((event.clientX - gizmoRect.left) / gizmoRect.width) * 2 - 1;
    mouse.coordinates.y =
      -((event.clientY - gizmoRect.top) / gizmoRect.height) * 2 + 1;
  };
}

function onTouchStart(mouse: IMouse) {
  return function touchStart() {
    mouse.isDown = true;
  };
}

function onTouchEnd(mouse: IMouse) {
  return function touchEnd() {
    mouse.isDown = false;
  };
}

function onMouseDown(mouse: IMouse) {
  return function mouseDown() {
    mouse.isDown = true;
  };
}

function onMouseUp(mouse: IMouse) {
  return function mouseUp() {
    mouse.isDown = false;
  };
}

/**
 * Setups the camera gizmo for a given scene container. Returns two functions:
 *  - to re-render the gizmo on every frame.
 *  - to remove the event mouse event listeners attached to the gizmo DOM node.
 * @param sceneContainer DOM node where the scene will be mounted.
 * @param sceneCamera camera of scene to track.
 * @param cameraLength how far the gizmo camera will be. Default `5`.
 */
export function setupCameraGizmo(
  sceneContainer: HTMLDivElement,
  sceneCamera: PerspectiveCamera,
  cameraLength: number = 5
): IGizmoManager {
  const raycaster = new Raycaster();
  const mouse = {
    coordinates: new Vector2(-1, -1),
    isDown: false
  };

  const parentNode = sceneContainer.parentNode;

  if (parentNode) {
    const gizmoRenderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });

    const sceneRect = sceneContainer.getBoundingClientRect();

    const gizmoContainer = document.createElement("div");
    gizmoContainer.id = "gizmo";
    gizmoContainer.style.position = "absolute";
    gizmoContainer.style.width = "10%";
    gizmoContainer.style.height = "10%";
    gizmoContainer.style.margin = "5px";
    gizmoContainer.style.top = `${sceneRect.top}px`;
    gizmoContainer.style.left = `${sceneRect.left}px`;

    parentNode.appendChild(gizmoContainer);

    const gizmoRect = gizmoContainer.getBoundingClientRect();

    const mouseMovement = onMouseMove(mouse, gizmoRect);
    const mouseDown = onMouseDown(mouse);
    const mouseUp = onMouseUp(mouse);
    const touchStart = onTouchStart(mouse);
    const touchEnd = onTouchEnd(mouse);
    gizmoContainer.addEventListener("mousemove", mouseMovement);
    gizmoContainer.addEventListener("mousedown", mouseDown);
    gizmoContainer.addEventListener("mouseup", mouseUp);
    gizmoContainer.addEventListener("touchstart", touchStart);
    gizmoContainer.addEventListener("touchend", touchEnd);

    const aspect = gizmoRect.width / gizmoRect.height;
    gizmoRenderer.setSize(gizmoRect.width, gizmoRect.height);
    gizmoContainer.appendChild(gizmoRenderer.domElement);

    const gizmoScene = new Scene();
    addGizmoHandler(gizmoScene);

    const gizmoCamera = new PerspectiveCamera(45, aspect, 1, 100);
    gizmoCamera.up = sceneCamera.up;

    return {
      renderCameraGizmo: animateGizmo(
        raycaster,
        mouse,
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        sceneCamera,
        cameraLength
      ),
      destroyCameraGizmo: () => gizmoContainer.remove()
    };
  } else {
    throw Error("There isn't a valid parent node for the gizmo container.");
  }
}

/**
 * Updates the gizmo on each frame to follow the new position of the scene camera.
 * @param raycaster ray casted to the gizmo canvas.
 * @param mouse state of the mouse relative to the gizmo canvas.
 * @param gizmoRenderer WebGLRender for the gizmo.
 * @param gizmoScene scene to show the gizmo.
 * @param gizmoCamera gizmo camera.
 * @param sceneCamera scene camera to track.
 * @param length how far the gizmo camera will be.
 * @param focusPoint focus point of the gizmo camera. Default (0, 0, 0).
 * @returns function that executes the re-rendering logic.
 */
function animateGizmo(
  raycaster: Raycaster,
  mouse: IMouse,
  gizmoRenderer: WebGLRenderer,
  gizmoScene: Scene,
  gizmoCamera: PerspectiveCamera,
  sceneCamera: PerspectiveCamera,
  length: number,
  focusPoint: Vector3 = new Vector3(0, 0, 0)
): RenderCameraGizmo {
  return () => {
    raycaster.setFromCamera(mouse.coordinates, gizmoCamera);
    const intersects = raycaster.intersectObjects(gizmoScene.children);

    if (typeof intersects[0] !== "undefined" && mouse.isDown) {
      console.log(mouse.isDown);

      gizmoAction(sceneCamera, intersects[0].object.userData.command);
    }

    gizmoCamera.position.copy(sceneCamera.position);
    gizmoCamera.position.setLength(length);

    gizmoCamera.lookAt(focusPoint);
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  };
}
