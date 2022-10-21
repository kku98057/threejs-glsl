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
  DoubleSide,
  Points,
  TriangleFanDrawMode,
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
  5000
);

camera.position.set(0, 0, 20);
camera.rotation.set(0, 0, 0);

camera.updateMatrixWorld();
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);

let circle;
const texture = new THREE.TextureLoader().load("./asset/img/blue_circle.svg");

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("./three/examples/js/libs/draco/");
loader.setDRACOLoader(dracoLoader);

const loader2 = new GLTFLoader();
const dracoLoader2 = new DRACOLoader();
dracoLoader2.setDecoderPath("./three/examples/js/libs/draco/");
loader2.setDRACOLoader(dracoLoader2);

const pointsMaterial = new THREE.PointsMaterial({
  size: 0.5,
  map: texture,
  transparent: true,

  sizeAttenuation: true,
  vertexColors: true,
});

function zoomFit(object3D, camera, viewMode, bFront) {
  const box = new THREE.Box3().setFromObject(object3D);
  const sizeBox = box.getSize(new THREE.Vector3()).length();
  const centerBox = box.getCenter(new THREE.Vector3());
  let offsetX = 0,
    offsetY = 0,
    offsetZ = 0;
  viewMode === "X"
    ? (offsetX = 1)
    : viewMode === "Y"
    ? (offsetY = 1)
    : (offsetZ = 1);
  if (!bFront) {
    offsetX *= -1;
    offsetY *= -1;
    offsetZ *= -1;
  }
  camera.position.set(
    centerBox.x + offsetX,
    centerBox.y + offsetY,
    centerBox.z + offsetZ
  );
  const halfSizeModel = sizeBox * 0.5;
  const halfFov = THREE.MathUtils.degToRad(camera.fov * 0.5);
  const distance = halfSizeModel / Math.tan(halfFov);
  const direction = new THREE.Vector3()
    .subVectors(camera.position, centerBox)
    .normalize();
  const position = direction.multiplyScalar(distance).add(centerBox);
  camera.position.copy(position);
  camera.near = sizeBox / 100;
  camera.far = sizeBox * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(centerBox.x, centerBox.y, centerBox.z);
}

const geomatry = new THREE.SphereGeometry(5, 64, 64);
const material = new THREE.MeshStandardMaterial({
  color: "orangered",
});

const geoArray = geomatry.attributes.position.array;
const randomArray = [];
const point = new THREE.PointsMaterial({
  size: 0.1,
  sizeAttenuation: false,
});
const mesh = new THREE.Points(geomatry, point);

scene.add(mesh);

// loader.load("./asset/img/duck/Duck.glb", (glb) => {
//   const glbMesh = glb.scene.children[0].children[1];
//   const glbGeo = glb.scene.children[0].children[1].geometry;
//   const glbMeshPositionArray = glbGeo.attributes.position.array;
//   const pointer = new THREE.Points(glbGeo, pointsMaterial);
//   const colors = new Float32Array(glbMeshPositionArray);
//   const ca = glb.scene.children[0].children[0];
//   console.log(glbGeo);
//   glbGeo.setAttribute("color", new BufferAttribute(colors, 3));
//   zoomFit(pointer, camera, "Z", false);
//   console.log(camera);
//   scene.add(pointer);
// });
// loader2.load("./asset/img/fox/Fox.glb", (glb) => {
//   console.log(glb);
//   const glbMesh = glb.scene.children[0];
//   const glbGeo = glbMesh.geometry;
//   const glbMeshPositionArray = glbGeo.attributes.position.array;
//   const pointer = new THREE.Points(glbGeo, pointsMaterial);
//   const colors = new Float32Array(glbMeshPositionArray);
//   console.log(glbGeo);
//   glbGeo.setAttribute("color", new BufferAttribute(colors, 3));
//   zoomFit(pointer, camera, "X", false);
//   scene.add(pointer);
// });
// light
const intensity = 0.5;
const color = 0xffffff;
const light = new THREE.AmbientLight(color, intensity);
light.position.set(0, 0, 0);
scene.add(light);

const light2 = new THREE.DirectionalLight({
  color: 0xffffff,
  intensity: 1,
});
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
const clock = new THREE.Clock();
function update() {
  const delta = clock.getElapsedTime() * 3;
  for (let i = 0; i < geoArray.length; i += 3) {
    geoArray[i] += Math.sin(delta + randomArray[i] * 100) * 0.002;
    geoArray[i + 1] += Math.sin(delta + randomArray[i + 1] * 100) * 0.002;
    geoArray[i + 2] += Math.sin(delta + randomArray[i + 2] * 100) * 0.002;
  }
  geomatry.attributes.position.needsUpdate = true;
}
function animation(randomArray) {
  requestAnimationFrame(animation);
  renderer.render(scene, camera);
  // update();
}
animation();
