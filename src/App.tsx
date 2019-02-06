import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import {
  CAMERA_DISTANCE,
  CAMERA_FOCUS_POINT,
  debounce,
  addCameraGizmo,
  gizmoAction,
  createCube
} from "./utils";

interface IProps {}

class App extends Component<IProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: THREE.OrbitControls;
  private frameId: number;

  private gizmoRef = React.createRef<HTMLDivElement>();
  private gizmoRenderer: THREE.WebGLRenderer;
  private gizmoScene: THREE.Scene;
  private gizmoCamera!: THREE.PerspectiveCamera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isMouseDown: boolean;

  constructor(props: IProps) {
    super(props);
    window.addEventListener("resize", this.onWindowsResize, false);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });
    this.scene = new THREE.Scene();
    this.frameId = 0;
    this.raycaster = new THREE.Raycaster();

    this.gizmoRenderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });
    this.gizmoScene = new THREE.Scene();
    this.mouse = new THREE.Vector2(-1, -1);
    this.isMouseDown = false;
  }

  public render() {
    return (
      <div className="App">
        <h1>
          Object Picking - Test to get the <span>gizmo</span> working
        </h1>
        <div id="scene" ref={this.containerRef} />
        <div id="gizmo" ref={this.gizmoRef} />
      </div>
    );
  }

  public componentDidMount() {
    if (this.containerRef.current && this.gizmoRef.current) {
      this.containerRef.current.addEventListener("mousemove", this.onMouseMove);
      this.containerRef.current.addEventListener(
        "mousedown",
        this.onMouseDown,
        false
      );
      this.containerRef.current.addEventListener(
        "mouseup",
        this.onMouseUp,
        false
      );
      const containerWidth = this.containerRef.current.clientWidth;
      const containerHeight = this.containerRef.current.clientHeight;
      const aspect = containerWidth / containerHeight;

      this.renderer.setSize(containerWidth, containerHeight);
      this.renderer.setClearColor(0x101010);

      this.containerRef.current.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
      this.camera.position.set(0, 0, CAMERA_DISTANCE);
      this.camera.lookAt(CAMERA_FOCUS_POINT);

      this.controls = new OrbitControls(this.camera, this.containerRef.current);
      this.controls.enableKeys = false;

      const rect = this.containerRef.current.getBoundingClientRect();
      this.gizmoRef.current.style.top = `${rect.top + 3}px`;
      this.gizmoRef.current.style.left = `${rect.left + 3}px`;

      this.gizmoRenderer.setSize(
        this.gizmoRef.current.clientWidth,
        this.gizmoRef.current.clientHeight
      );
      this.gizmoRef.current.appendChild(this.gizmoRenderer.domElement);

      this.gizmoCamera = new THREE.PerspectiveCamera(45, aspect, 1, 100);
      this.gizmoCamera.up = this.camera.up;

      addCameraGizmo(this.gizmoScene);

      const cube = createCube(0xa25b5b);
      this.scene.add(cube);

      this.animate();
    }
  }

  public componentWillUnmount() {
    window.cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.onWindowsResize, false);
    if (this.containerRef.current) {
      this.containerRef.current.removeEventListener(
        "mousedown",
        this.onMouseDown,
        false
      );
      this.containerRef.current.removeEventListener(
        "mouseup",
        this.onMouseUp,
        false
      );
    }
  }

  /**
   * Start rendering the scene.
   */
  private animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (typeof intersects[0] !== "undefined" && this.isMouseDown) {
      gizmoAction(this.camera, intersects[0].object.userData.command);
    }

    this.gizmoCamera.position.copy(this.camera.position);
    this.gizmoCamera.position.sub(this.controls.target);
    this.gizmoCamera.position.setLength(5);

    this.gizmoCamera.lookAt(this.scene.position);

    this.renderer.render(this.scene, this.camera);
    this.gizmoRenderer.render(this.gizmoScene, this.gizmoCamera);
  };

  /**
   * Adjust canvas size on windows resizing.
   */
  private onWindowsResize = debounce(50, () => {
    if (this.containerRef.current) {
      const containerWidth = this.containerRef.current.clientWidth;
      const containerHeight = this.containerRef.current.clientHeight;

      this.camera.aspect = containerWidth / containerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(containerWidth, containerHeight);
    }
  });

  private onMouseMove = (event: MouseEvent) => {
    /**
     * Calculate mouse position in normalized device coordinates
     * (-1 to +1) for both components.
     */
    if (this.containerRef.current) {
      const rect = this.containerRef.current.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
  };

  private onMouseDown = () => {
    this.isMouseDown = true;
  };

  private onMouseUp = () => {
    this.isMouseDown = false;
  };
}

export default App;
