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
 * @param sceneCamera camera to rotate around.
 * @param sceneCameraDistance distance from the focus point of scene.
 * @param angle degrees to rotate.
 * @param axis axis to rotate around. Default `Axes.Y`.
 */
function rotateCamera(
  sceneCamera: PerspectiveCamera,
  sceneCameraDistance: number,
  focusPoint: Vector3,
  angle: number,
  axis: Axes = Axes.Y
) {
  sceneCamera.position.y = 0;
  let z = sceneCameraDistance,
    y = 0,
    x = 0;

  switch (axis) {
    case Axes.X:
      sceneCamera.position.y = y * Math.cos(angle) + z * Math.sin(angle);
      sceneCamera.position.z = z * Math.cos(angle) - y * Math.sin(angle);
      break;
    case Axes.Y:
      sceneCamera.position.x = x * Math.cos(angle) + z * Math.sin(angle);
      sceneCamera.position.z = z * Math.cos(angle) - x * Math.sin(angle);
      break;
    case Axes.Z:
      throw Error(
        "Unsupported rotation. Currently there's no reason to rotate around the Z axis."
      );
  }

  sceneCamera.lookAt(focusPoint);
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
 * @param sceneCamera camera to react to actions.
 * @param sceneCameraDistance distance from the focus point of scene.
 * @param focusPoint focus point of the gizmo camera.
 * @param command action to execute.
 */
const gizmoAction: (
  sceneCamera: PerspectiveCamera,
  sceneCameraDistance: number,
  focusPoint: Vector3,
  command: COMMANDS
) => void = debounce(
  75,
  (
    sceneCamera: PerspectiveCamera,
    sceneCameraDistance: number,
    focusPoint: Vector3,
    command: COMMANDS
  ) => {
    switch (command) {
      case COMMANDS.CHANGE_VIEW_TO_TOP:
        rotateCamera(sceneCamera, sceneCameraDistance, focusPoint, 0);
        rotateCamera(
          sceneCamera,
          sceneCameraDistance,
          focusPoint,
          Math.PI / 2,
          Axes.X
        );
        break;
      case COMMANDS.CHANGE_VIEW_TO_BOTTOM:
        rotateCamera(sceneCamera, sceneCameraDistance, focusPoint, 0);
        rotateCamera(
          sceneCamera,
          sceneCameraDistance,
          focusPoint,
          -Math.PI / 2,
          Axes.X
        );
        break;
      case COMMANDS.CHANGE_VIEW_TO_RIGHT:
        rotateCamera(sceneCamera, sceneCameraDistance, focusPoint, Math.PI / 2);
        break;
      case COMMANDS.CHANGE_VIEW_TO_LEFT:
        rotateCamera(
          sceneCamera,
          sceneCameraDistance,
          focusPoint,
          -Math.PI / 2
        );
        break;
      case COMMANDS.CHANGE_VIEW_TO_FRONT:
        rotateCamera(sceneCamera, sceneCameraDistance, focusPoint, 0);
        break;
      case COMMANDS.CHANGE_VIEW_TO_BACK:
        rotateCamera(sceneCamera, sceneCameraDistance, focusPoint, Math.PI);
        break;
    }
  }
);

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

/**
 * Listener to keep track of the finger position in the gizmo scene. It
 * converts the coordinates to a normalized device coordinates
 * (-1 to +1).
 * @param mouseCoordinates mouse coordinates relative to the gizmo scene.
 * @param gizmoRect gizmo DOM node dimensions.
 */
function onTouchMove(mouse: IMouse, gizmoRect: ClientRect) {
  return function mouseMovement(event: TouchEvent) {
    /**
     * Calculate mouse position in normalized device coordinates
     * (-1 to +1) for both components.
     */
    mouse.coordinates.x =
      ((event.touches[0].clientX - gizmoRect.left) / gizmoRect.width) * 2 - 1;
    mouse.coordinates.y =
      -((event.touches[0].clientY - gizmoRect.top) / gizmoRect.height) * 2 + 1;
  };
}

function onTouchStart(mouse: IMouse, gizmoRect: ClientRect) {
  return function touchStart(event: TouchEvent) {
    /**
     * Update coordinates "before detecting" the touch.
     */
    mouse.coordinates.x =
      ((event.touches[0].clientX - gizmoRect.left) / gizmoRect.width) * 2 - 1;
    mouse.coordinates.y =
      -((event.touches[0].clientY - gizmoRect.top) / gizmoRect.height) * 2 + 1;

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
 * @param sceneCameraDistance distance of camera from the focus point of scene.
 * @param sceneCameraFocusPoint focus point of the camera.
 * @param gizmoCameraDistance How close the gizmo will look like. Default `5`.
 */
export function setupCameraGizmo(
  sceneContainer: HTMLDivElement,
  sceneCamera: PerspectiveCamera,
  sceneCameraDistance: number,
  sceneCameraFocusPoint: Vector3,
  gizmoCameraDistance: number = 5
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
    gizmoContainer.style.width = "20%";
    gizmoContainer.style.height = "20%";
    gizmoContainer.style.margin = "5px";
    gizmoContainer.style.top = `${sceneRect.top}px`;
    gizmoContainer.style.left = `${sceneRect.left}px`;

    parentNode.appendChild(gizmoContainer);

    const gizmoRect = gizmoContainer.getBoundingClientRect();

    const mouseMovement = onMouseMove(mouse, gizmoRect);
    const mouseDown = onMouseDown(mouse);
    const mouseUp = onMouseUp(mouse);
    const touchMove = onTouchMove(mouse, gizmoRect);
    const touchStart = onTouchStart(mouse, gizmoRect);
    const touchEnd = onTouchEnd(mouse);
    gizmoContainer.addEventListener("mousemove", mouseMovement);
    gizmoContainer.addEventListener("mousedown", mouseDown);
    gizmoContainer.addEventListener("mouseup", mouseUp);
    gizmoContainer.addEventListener("touchmove", touchMove);
    gizmoContainer.addEventListener("touchstart", touchStart);
    gizmoContainer.addEventListener("touchend", touchEnd);

    const aspect = gizmoRect.width / gizmoRect.height;
    gizmoRenderer.setSize(gizmoRect.width, gizmoRect.height);
    gizmoContainer.appendChild(gizmoRenderer.domElement);

    const gizmoScene = new Scene();
    addGizmoHandler(gizmoScene);

    const gizmoCamera = new PerspectiveCamera(45, aspect, 1, 100);
    gizmoCamera.up = sceneCamera.up;

    //TODO: return function to trigger on window resizing to adjust gizmo positioning.
    return {
      renderCameraGizmo: animateGizmo(
        raycaster,
        mouse,
        gizmoRenderer,
        gizmoScene,
        gizmoCamera,
        gizmoCameraDistance,
        sceneCamera,
        sceneCameraDistance,
        sceneCameraFocusPoint
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
 * @param gizmoCameraDistance how far the gizmo camera will be.
 * @param sceneCamera scene camera to track.
 * @param sceneCameraDistance distance from the focus point of scene.
 * @param focusPoint focus point of the gizmo camera.
 * @returns function that executes the re-rendering logic.
 */
function animateGizmo(
  raycaster: Raycaster,
  mouse: IMouse,
  gizmoRenderer: WebGLRenderer,
  gizmoScene: Scene,
  gizmoCamera: PerspectiveCamera,
  gizmoCameraDistance: number,
  sceneCamera: PerspectiveCamera,
  sceneCameraDistance: number,
  focusPoint: Vector3
): RenderCameraGizmo {
  return () => {
    raycaster.setFromCamera(mouse.coordinates, gizmoCamera);
    const intersects = raycaster.intersectObjects(gizmoScene.children);

    if (typeof intersects[0] !== "undefined" && mouse.isDown) {
      gizmoAction(
        sceneCamera,
        sceneCameraDistance,
        focusPoint,
        intersects[0].object.userData.command
      );
    }

    gizmoCamera.position.copy(sceneCamera.position);
    gizmoCamera.position.setLength(gizmoCameraDistance);

    gizmoCamera.lookAt(focusPoint);
    gizmoRenderer.render(gizmoScene, gizmoCamera);
  };
}
