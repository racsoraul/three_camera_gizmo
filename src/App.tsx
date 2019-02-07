import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import {
  CAMERA_DISTANCE,
  CAMERA_FOCUS_POINT,
  debounce,
  createCube,
  setupCameraGizmo,
  IGizmoManager
} from "./utils";

interface IProps {}

class App extends Component<IProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: THREE.OrbitControls;
  private frameId: number;
  private gizmoManager!: IGizmoManager;

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
  }

  public render() {
    return (
      <div className="App">
        <h1>
          Usage of the <span>camera gizmo</span> with a simple scene.
        </h1>
        <div id="scene" ref={this.containerRef} />
      </div>
    );
  }

  public componentDidMount() {
    if (this.containerRef.current) {
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

      const cube = createCube(0x000000);
      const axes = new THREE.AxesHelper(2);
      this.scene.add(cube);
      this.scene.add(axes);

      this.gizmoManager = setupCameraGizmo(
        this.containerRef.current,
        this.camera
      );

      this.animate();
    }
  }

  public componentWillUnmount() {
    window.cancelAnimationFrame(this.frameId);
    window.removeEventListener("resize", this.onWindowsResize, false);
    this.gizmoManager.destroyCameraGizmo();
  }

  /**
   * Start rendering the scene.
   */
  private animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
    this.gizmoManager.renderCameraGizmo();
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
}

export default App;
