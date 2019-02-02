import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { debounce } from "./utils";

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
    this.mouse = new THREE.Vector2(-1, -1);
  }

  public componentDidMount() {
    if (this.containerRef.current) {
      this.containerRef.current.addEventListener("mousemove", this.onMouseMove);
      const containerWidth = this.containerRef.current.clientWidth;
      const containerHeight = this.containerRef.current.clientHeight;
      const aspect = containerWidth / containerHeight;
      const RANGE = 50;

      this.renderer.setSize(containerWidth, containerHeight);
      this.renderer.setClearColor(0x101010);

      this.containerRef.current.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
      this.camera.position.set(0, 0, RANGE * 2);
      this.camera.lookAt(new THREE.Vector3(0, 0, 0));

      this.controls = new OrbitControls(this.camera, this.containerRef.current);
      this.controls.enableKeys = false;

      this.scene.add(this.createSimpleCube(0x00000));

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
    for (let index = 0; index < intersects.length; index++) {
      console.log(intersects[index].object.position);
      //console.log(intersects[]);
    }

    this.renderer.render(this.scene, this.camera);
  };

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
      color: 0xa25b5b,
      linewidth: 4
    });
    const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);

    return mesh.add(edgesMesh);
  }

  /**
   * Adjust canvas size on windows resizing.
   */
  private onWindowsResize = debounce(100, () => {
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
      this.mouse.x =
        ((event.clientX - rect.left) / this.containerRef.current.clientWidth) *
          2 -
        1;
      this.mouse.y =
        -((event.clientY - rect.top) / this.containerRef.current.clientHeight) *
          2 +
        1;
    }
  };
}

export default App;
