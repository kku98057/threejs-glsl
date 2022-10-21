import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import dat from "dat.gui";
import { DoubleSide } from "three";

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

camera.position.set(0, 0, 10);

camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);

let asdfPosition = new THREE.Float32BufferAttribute();
let azitPosition = new THREE.Float32BufferAttribute();

let material = new THREE.PointsMaterial({
  size: 0.001,
  sizeAttenuation: true,
  vertexColors: true,
  side: DoubleSide,
});

const asdfLoader = new STLLoader();
asdfLoader.load("./asset/img/asdf.stl", (asdf) => {
  const points = new THREE.Points(asdf, material);
  asdfPosition = asdf.attributes.position.array;
  const colors = new Float32Array(asdfPosition);

  for (let i = 0; i < asdfPosition.length; i += 3) {
    points.position.x = asdfPosition[i];
    points.position.y = asdfPosition[i + 1];
    points.position.z = asdfPosition[i + 2];
    colors[i] = (30 + Math.random()) * 100;
    scene.add(points);
  }
  asdf.setAttribute("color", new THREE.BufferAttribute(colors, 3));
});

const azitLoader = new STLLoader();
azitLoader.load("./asset/img/azit.stl", (azit) => {
  const points = new THREE.Points(azit, material);
  azitPosition = azit.attributes.position.array;
  const colors = new Float32Array(azitPosition);

  for (let i = 0; i < azitPosition.length; i += 3) {
    points.position.x = azitPosition[i];
    points.position.y = azitPosition[i + 1];
    points.position.z = azitPosition[i + 2];
    colors[i] = (30 + Math.random()) * 100;
    scene.add(points);
  }
  azit.setAttribute("color", new THREE.BufferAttribute(colors, 3));
});

// light
const intensity = 5;
const color = 0xffffff;

const light = new THREE.AmbientLight(color, intensity);
light.position.set(0, 0, 0);

const light2 = new THREE.DirectionalLight(color, intensity);
const light2helper = new THREE.DirectionalLightHelper(light2);

scene.add(light, light2, light2helper);
// gui
const gui = new dat.GUI();

let light2s = gui.addFolder("light2s");
light2s.add(light2.position, "x", -50, 50, 1).name("light2 X");
light2s.add(light2.position, "y", -50, 50, 1).name("light2 Y");
light2s.add(light2.position, "z", -50, 50, 1).name("light2 Z");
light2s.open();

let camearGui = gui.addFolder("camera");
camearGui.add(camera.position, "x", -50, 50, 0.1).name("x");
camearGui.add(camera.position, "y", -50, 50, 0.1).name("y");
camearGui.add(camera.position, "z", -50, 50, 0.1).name("z");

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
// console.log(points);

// gsap.registerPlugin(ScrollTrigger);

// const tl = gsap
//   .timeline({
//     scrollTrigger: {
//       trigger: ".s2",
//       scrub: 2,
//     },
//   })
//   .from(camera.position, {
//     x: 0,
//     y: 0,
//     z: 0,
//   });
// const tl3 = gsap
//   .timeline({
//     scrollTrigger: {
//       trigger: ".s4",
//       scrub: 2,
//     },
//   })
//   .to(camera.position, {
//     z: 1200,
//   });
