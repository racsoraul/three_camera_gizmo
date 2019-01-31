import React, { Component } from "react";
import "./App.css";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import { Vector3 } from "three";

interface IProps {}

class App extends Component<IProps> {
  private containerRef = React.createRef<HTMLDivElement>();
  private renderer: THREE.Renderer;
  private scene: THREE.Scene;
  private camera!: THREE.Camera;
  private controls!: THREE.OrbitControls;
  private frameId: number;

  constructor(props: IProps) {
    super(props);
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      devicePixelRatio: window.devicePixelRatio
    });
    this.scene = new THREE.Scene();
    this.frameId = 0;
  }

  public componentDidMount() {
    if (this.containerRef.current) {
      const containerWidth = this.containerRef.current.clientWidth;
      const containerHeight = this.containerRef.current.clientHeight;
      const aspect = containerWidth / containerHeight;
      const range = 50;

      this.renderer.setSize(containerWidth, containerHeight);

      this.containerRef.current.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
      this.camera.position.set(0, 0, range * 2);
      this.camera.lookAt(new Vector3(0, 0, 0));

      this.controls = new OrbitControls(this.camera, this.containerRef.current);
      this.controls.enableKeys = false;

      this.scene.add(this.createSimpleCube(0x000000));

      // Start
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
          Object Picking - Test to get the <span>gizmo</span> right
        </h1>
        <div id="gizmo" ref={this.containerRef} />
      </div>
    );
  }

  private animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  };

  private stop() {
    window.cancelAnimationFrame(this.frameId);
  }

  /**
   * Returns cube of the specified color. Dimensions are:
   * `width = 10`
   * `height = 10`
   * `depth = 10`
   * @param color hex number.
   */
  private createSimpleCube(color: number = 0xffffff): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(10, 10, 10);
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
}

export default App;
