import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import dat from "dat.gui";
import {
  AdditiveBlending,
  BufferAttribute,
  Float32BufferAttribute,
  Points,
} from "three";

const container = document.querySelector(".s1");
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio > 2 ? 2 : 1);
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

camera.position.set(0, 0, 5);
camera.rotation.set(0, 0, 0);

camera.updateMatrixWorld();
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);

const buffer = new THREE.BufferGeometry();
const boxGeo = new THREE.BoxGeometry(1, 1, 1, 100, 100, 100);
const arrayPosition = boxGeo.attributes.position.array;
const vector = new THREE.Vector3();
const vetecies = [];
const floatArray = new Float32Array();
const material = new THREE.PointsMaterial({
  vertexColors: true,
  size: 0.001,
});

const points = new THREE.Points(buffer, material);
const boxArray = boxGeo.attributes.position.array;
const array = new THREE.Float32BufferAttribute();
let colors = new Float32Array(boxArray);
for (let i = 0; i < boxArray.length; i++) {
  vetecies.push(boxArray[i]);
  colors[i] = Math.random().toFixed(0) * 255;
}
buffer.setAttribute("position", new THREE.Float32BufferAttribute(vetecies, 3));
buffer.setAttribute("color", new THREE.BufferAttribute(colors, 3));
scene.add(points);

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

const clock = new THREE.Clock();

function update() {
  const delta = clock.getDelta();
}
function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function animation() {
  requestAnimationFrame(animation);
  update();
  renderer.render(scene, camera);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
}
animation();
