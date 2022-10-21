import * as THREE from "three";
import vertex from "../src/shaders/vertex.glsl";
import fragment from "../src/shaders/fragment.glsl";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import t1 from "../src/asset/img/eco.png";
import t2 from "../src/asset/img/loopy.png";
import mask from "../src/asset/img/fox/Texture.png";
import { gsap } from "gsap";
// init

//https://www.youtube.com/watch?v=8K5wJeVgjrM

// 17분34초

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

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.points = new THREE.Vector2();

    this.textures = [
      new THREE.TextureLoader().load(t1),
      new THREE.TextureLoader().load(t2),
    ];
    this.mask = new THREE.TextureLoader().load(mask);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);

    // new OrbitControls(this.camera, this.renderer.domElement);

    this.addMesh();
    this.light();
    this.time = 0;
    this.move = 0;
    this.mouseEffects();
    this.render();
  }
  mouseEffects() {
    this.test = new THREE.Mesh(
      new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
      new THREE.MeshStandardMaterial()
    );
    window.addEventListener("mousedown", (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        // ease: "elastic.out(1,0.3)",
        value: 1,
      });
    });
    window.addEventListener("mouseup", (e) => {
      gsap.to(this.material.uniforms.mousePressed, {
        duration: 1,
        // ease: "elastic.out(1,0.3)",
        value: 0,
      });
    });
    window.addEventListener("mousewheel", (e) => {
      this.move += e.wheelDeltaY / 1000;
    });
    window.addEventListener(
      "mousemove",
      (e) => {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        let intersects = this.raycaster.intersectObjects([this.test]);

        this.points.x = intersects[0].point.x;
        this.points.y = intersects[0].point.y;
      },
      false
    );
  }
  light() {
    this.light = new THREE.DirectionalLight({
      color: 0xffffff,
      intensity: 0.5,
    });
    this.scene.add(this.light);
  }
  addMesh() {
    let number = 512 * 512;

    this.geometry = new THREE.BufferGeometry();
    this.positions = new THREE.BufferAttribute(new Float32Array(number * 3), 3);
    this.coordinates = new THREE.BufferAttribute(
      new Float32Array(number * 3),
      3
    );
    this.speed = new THREE.BufferAttribute(new Float32Array(number * 1), 1);
    this.offset = new THREE.BufferAttribute(new Float32Array(number * 1), 1);
    this.direction = new THREE.BufferAttribute(new Float32Array(number * 1), 1);
    this.press = new THREE.BufferAttribute(new Float32Array(number * 1), 1);

    this.material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: false,
      depthTest: false,
      depthWrite: false,

      fragmentShader: fragment,
      vertexShader: vertex,
      uniforms: {
        progress: { type: "f", value: 0 },
        t1: { type: "t", value: this.textures[0] },
        t1: { type: "t", value: this.textures[1] },
        mask: { type: "t", value: this.mask },
        mousePressed: { type: "f", value: 0 },
        mouse: { type: "v2", value: null },
        move: { type: "f", value: 0 },
        time: { type: "f", value: 0 },
      },
    });
    let index = 0;
    function rand(a, b) {
      return a + (b - a) * Math.random();
    }
    for (let i = 0; i < 512; i++) {
      let posX = i - 256;
      for (let j = 0; j < 512; j++) {
        this.positions.setXYZ(index, posX * 2, (j - 256) * 2, 0);
        this.coordinates.setXYZ(index, i, j, 0);
        this.offset.setX(index, rand(-1000, 1000));
        this.speed.setX(index, rand(0.4, 1));
        this.direction.setX(index, Math.random() > 0.5 ? 1 : -1);
        this.press.setX(index, rand(0.4, 1));
        index++;
      }
    }

    this.geometry.setAttribute("position", this.positions);
    this.geometry.setAttribute("aCoordinates", this.coordinates);
    this.geometry.setAttribute("aSpeed", this.speed);
    this.geometry.setAttribute("aOffset", this.offset);
    this.geometry.setAttribute("aPress", this.press);
    this.geometry.setAttribute("aDirection", this.direction);

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
  render() {
    this.time++;

    this.material.uniforms.time.value = this.time;
    this.material.uniforms.move.value = this.move;
    this.material.uniforms.mouse.value = this.points;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
