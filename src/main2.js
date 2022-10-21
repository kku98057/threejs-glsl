import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import dat from "dat.gui";
import { Material, Object3D } from "three";

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

camera.position.set(0, 2500, 0);
camera.rotation.set(-5.41, -0.8, -0.08);
camera.lookAt(0, 0, 0);
camera.updateMatrixWorld();
scene.add(camera);
const controls = new OrbitControls(camera, renderer.domElement);
// let sampler;
// const loader = new GLTFLoader();
// loader.load("./asset/img/scene.glb", (glb) => {
//   glb.scene.scale.set(0.01, 0.01, 0.01);
//   console.log(glb.scene.scale);
//   glb.scene.traverse((obj) => {
//     console.log(obj);
//     if (obj.isMesh) {
//       sampler = new MeshSurfaceSampler(obj).build();
//     }
//   });
//   trf();
//   // zoomFit(glb.scene, camera);
//   // sampler = new MeshSurfaceSampler(glb).build();
//   // trf();
//   // scene.add(glb.scene);
// });

const stlLoader = new STLLoader();
const setStl = () => {
  stlLoader.load("./asset/img/asdf.stl", (stl) => {
    let stlPosition = new THREE.Float32BufferAttribute();
    const stlMeterial = new THREE.PointsMaterial({
      size: 0.01,
      vertexColors: true,
    });
    stlPosition = stl.attributes.position.array;
    const points = new THREE.Points(stl, stlMeterial);
    const colors = new Float32Array(stlPosition);

    for (let i = 0; i < stlPosition.length; i += 3) {
      points.position.x = stlPosition[i];
      points.position.y = stlPosition[i + 1];
      points.position.z = stlPosition[i + 2];
      colors[i] = Math.random();
      scene.add(points);
    }
    stl.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  });
};
setStl();
const group = new THREE.Group();
const geo = new THREE.TorusGeometry(4, 1.3, 100, 16);
// const mesh = new THREE.Mesh(geo);
// let sampler = new MeshSurfaceSampler(mesh).build();

const vertices = [];
const colors = new Float32Array(18000);
const temPosition = new THREE.Vector3();
const pointsGeo = new THREE.BufferGeometry();

let points;
function trf() {
  for (let i = 0; i < 18000; i++) {
    sampler.sample(temPosition);
    vertices.push(temPosition.x, temPosition.y, temPosition.z);
    colors[i] = Math.random();
  }

  const pointerMaterial = new THREE.PointsMaterial({
    size: 5,
    blending: THREE.AdditiveBlending,
    // transparent: true,
    // opacity: 0.8,
    depthWrite: false,
    sizeAttenuation: true,
    vertexColors: true,
  });
  pointsGeo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  pointsGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  console.log(pointsGeo);
  points = new THREE.Points(pointsGeo, pointerMaterial);

  // group.add(points);
  scene.add(points);

  // const tl2 = gsap
  //   .timeline({
  //     scrollTrigger: {
  //       trigger: ".s3",
  //       scrub: 2,
  //     },
  //   })
  //   .from(points.rotation, {
  //     z: 1,
  //   });
}
console.log(pointsGeo);
// const geo = new THREE.BoxGeometry(1, 1, 1);
// const mat = new THREE.MeshNormalMaterial();
// const mesh = new THREE.Mesh(geo, mat);
// scene.add(mesh);

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

function zoomFit(Object3D, camera) {
  const box = new THREE.Box3().setFromObject(Object3D);
  const sizeBox = box.getSize(new THREE.Vector3()).length();
  const centerBox = box.getCenter(new THREE.Vector3());
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
