import * as THREE from "three";
import vertex from "../src/shaders/vertex.glsl";
import fragment from "../src/shaders/fragment.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import t1 from "../src/asset/img/duck/DuckCM.png";
import mask from "../src/asset/img/circle.png";
// init

export default class Sketch {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      3000
    );
    this.camera.position.z = 1000;
    this.container = document.querySelector(".s1");
    this.scene = new THREE.Scene();

    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(mask),
    ];

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    new OrbitControls(this.camera, this.renderer.domElement);

    this.addMesh();
    this.time = 0;
    this.render();
  }
  addMesh() {
    let number = 512 * 512;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
    this.coordinates = new THREE.BufferAttribute(
      new Float32Array(number * 3),
      3
    );
    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: "f", value: 0 },
        t1: { type: "t", value: this.textures[0] },
        mask: { type: "t", value: this.textures[1] },
      },
    });
    let index = 0;
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
        this.coordinates.setXYZ(index, i, j, 0);
        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  render() {
    this.time++;
    // this.mesh.rotation.x += 0.01;
    // this.mesh.rotation.y += 0.02;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
