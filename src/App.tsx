import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { debounce } from "./utils";
import { Vector3 } from "three";

interface IProps {}
enum ViewRotation {
  TOP,
  BOTTOM,
  LEFT,
  RIGHT,
  FRONT,
  BACK
}

enum Axes {
  X,
  Y,
  Z
}

const RANGE = 40;
const ORIGIN = new Vector3(0, 0, 0);

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
      this.camera.position.set(0, 0, RANGE * 2);
      this.camera.lookAt(ORIGIN);

      this.controls = new OrbitControls(this.camera, this.containerRef.current);
      this.controls.enableKeys = false;

      const rightRedCube = this.createSimpleCube(0x9c4c4c);
      rightRedCube.position.x += 15;
      rightRedCube.userData = { command: ViewRotation.RIGHT };

      const leftRedCube = this.createSimpleCube(0x926d6d);
      leftRedCube.position.x -= 15;
      leftRedCube.userData = { command: ViewRotation.LEFT };

      const frontBlueCube = this.createSimpleCube(0x0000ff);
      frontBlueCube.position.z += 15;
      frontBlueCube.userData = { command: ViewRotation.FRONT };

      const topGreenCube = this.createSimpleCube(0x00ff00);
      topGreenCube.position.y += 15;
      topGreenCube.userData = { command: ViewRotation.TOP };

      this.scene.add(rightRedCube);
      this.scene.add(leftRedCube);
      this.scene.add(topGreenCube);
      this.scene.add(frontBlueCube);

      const axesHelper = new THREE.AxesHelper(40);
      this.scene.add(axesHelper);

      this.animate();
    }
  }

  public componentWillUnmount() {
    this.stop();
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

  /**
   * Rotates the camera around the specified `axis` the amount
   * of degrees specified.
   * @param angle Degrees to rotate.
   * @param axis Axis to rotate around. Default `Axes.Y`.
   */
  private rotateCamera(angle: number, axis: Axes = Axes.Y) {
    this.camera.position.y = 0;
    let z = 2 * RANGE,
      y = 0,
      x = 0;

    switch (axis) {
      case Axes.X:
        this.camera.position.y = y * Math.cos(angle) + z * Math.sin(angle);
        this.camera.position.z = z * Math.cos(angle) - y * Math.sin(angle);
        break;
      case Axes.Y:
        this.camera.position.x = x * Math.cos(angle) + z * Math.sin(angle);
        this.camera.position.z = z * Math.cos(angle) - x * Math.sin(angle);
        break;
      case Axes.Z:
        throw Error(
          "Unsupported rotation. Currently there's no reason to rotate around the Z axis."
        );
    }

    this.camera.lookAt(ORIGIN);
  }

  /**
   * Stop rendering.
   */
  private stop() {
    window.cancelAnimationFrame(this.frameId);
  }

  /**
   * Returns cube of the specified color. Dimensions are:
   * `width = 15`
   * `height = 15`
   * `depth = 15`
   * @param color hex number.
   */
  private createSimpleCube(color: number = 0xffffff): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(15, 15, 15);
    const material = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);

    // Add wireframe
    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0xababab,
      linewidth: 2.5
    });
    const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    return mesh.add(edgesMesh);
  }

  private gizmoAction = debounce(100, (command: ViewRotation) => {
    switch (command) {
      case ViewRotation.TOP:
        this.rotateCamera(Math.PI / 2, Axes.X);
      case ViewRotation.BOTTOM:
        console.log("ROTATE BOTTOM");
        break;
      case ViewRotation.RIGHT:
        this.rotateCamera(Math.PI / 2);
        break;
      case ViewRotation.LEFT:
        this.rotateCamera(-Math.PI / 2);
        break;
      case ViewRotation.FRONT:
        this.rotateCamera(0);
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
