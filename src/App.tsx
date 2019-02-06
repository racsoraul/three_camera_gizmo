import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import {
  CAMERA_DISTANCE,
  CAMERA_FOCUS_POINT,
  debounce,
  rotateCamera,
  ViewRotation,
  Axes,
  addCameraGizmo
} from "./utils";

interface IProps {}

class App extends Component<IProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: THREE.OrbitControls;
  private frameId: number;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private isMouseDown: boolean;

  constructor(props: IProps) {
    super(props);
    window.addEventListener("resize", this.onWindowsResize, false);
    window.addEventListener("mousedown", this.onMouseDown, false);
    window.addEventListener("mouseup", this.onMouseUp, false);

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });
    this.scene = new THREE.Scene();
    this.frameId = 0;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-1, -1);
    this.isMouseDown = false;
  }

  public render() {
    return (
      <div className="App">
        <h1>
          Object Picking - Test to get the <span>gizmo</span> working
        </h1>
        <div id="gizmo" ref={this.containerRef} />
      </div>
    );
  }

  public componentDidMount() {
    if (this.containerRef.current) {
      this.containerRef.current.addEventListener("mousemove", this.onMouseMove);
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

      addCameraGizmo(this.scene);

      this.animate();
    }
  }

  public componentWillUnmount() {
    window.cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.onWindowsResize, false);
    window.removeEventListener("mousedown", this.onMouseDown, false);
    window.removeEventListener("mouseup", this.onMouseUp, false);
  }

  /**
   * Start rendering the scene.
   */
  private animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children);

    if (typeof intersects[0] !== "undefined" && this.isMouseDown) {
      this.gizmoAction(intersects[0].object.userData.command);
    }

    this.renderer.render(this.scene, this.camera);
  };

  private gizmoAction = debounce(100, (command: ViewRotation) => {
    switch (command) {
      case ViewRotation.TOP:
        rotateCamera(this.camera, 0);
        rotateCamera(this.camera, Math.PI / 2, Axes.X);
        break;
      case ViewRotation.BOTTOM:
        rotateCamera(this.camera, 0);
        rotateCamera(this.camera, -Math.PI / 2, Axes.X);
        break;
      case ViewRotation.RIGHT:
        rotateCamera(this.camera, Math.PI / 2);
        break;
      case ViewRotation.LEFT:
        rotateCamera(this.camera, -Math.PI / 2);
        break;
      case ViewRotation.FRONT:
        rotateCamera(this.camera, 0);
        break;
      case ViewRotation.BACK:
        rotateCamera(this.camera, Math.PI);
        break;
    }
  });

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

  private onMouseDown = (event: MouseEvent) => {
    this.isMouseDown = true;
  };

  private onMouseUp = (event: MouseEvent) => {
    this.isMouseDown = false;
  };
}

export default App;
