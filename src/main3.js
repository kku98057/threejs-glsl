import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import dat from "dat.gui";

const container = document.querySelector(".s1");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  5000
);

camera.position.set(0, 0, 100);
camera.rotation.set(-5.41, -0.8, -0.08);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);
let sampler;
let vertices = [];
let arrayPosition = new THREE.Float32BufferAttribute();
const pointerMaterial = new THREE.PointsMaterial({
  size: 0.01,
  vertexColors: true,
});
const loader = new STLLoader();
loader.load("./asset/img/asdf.stl", (glb) => {
  arrayPosition = glb.attributes.position.array;
  const points = new THREE.Points(glb, pointerMaterial);
  const colors = new Float32Array(arrayPosition);

  for (let i = 0; i < arrayPosition.length; i += 3) {
    points.position.x = arrayPosition[i];
    points.position.y = arrayPosition[i + 1];
    points.position.z = arrayPosition[i + 2];

    colors[i] = Math.random();

    scene.add(points);
  }
  glb.setAttribute("color", new THREE.BufferAttribute(colors, 3));
});

// light
const intensity = 5;
const color = 0xffffff;
const light = new THREE.AmbientLight(color, intensity);
light.position.set(0, 0, 0);
scene.add(light);

const light2 = new THREE.DirectionalLight(color, intensity);
const light2helper = new THREE.DirectionalLightHelper(light2);

// gui
const gui = new dat.GUI();

let light2s = gui.addFolder("light2s");
light2s.add(light2.position, "x", -50, 50, 1).name("light2 X");
light2s.add(light2.position, "y", -50, 50, 1).name("light2 Y");
light2s.add(light2.position, "z", -50, 50, 1).name("light2 Z");
light2s.open();

let camearGui = gui.addFolder("camera");
camearGui.add(camera.position, "x", -1000, 1000, 0.1).name("x");
camearGui.add(camera.position, "y", -1000, 1000, 0.1).name("y");
camearGui.add(camera.position, "z", -1000, 1000, 0.1).name("z");

scene.add(light2, light2helper);
window.addEventListener("resize", resize);
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  requestAnimationFrame(animation);
  renderer.render(scene, camera);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
}
animation();
