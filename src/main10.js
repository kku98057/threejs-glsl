import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import dat from "dat.gui";

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

camera.position.set(0, 20, 200);
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

// set glb
const glbGeo1 = new THREE.BufferGeometry();
const glbGeo2 = new THREE.BufferGeometry();
const particlesMap = {
  min: -45,
  max: 45,
};
const pointMaterial = new THREE.PointsMaterial({
  size: 0.1,
  color: 0xffffff,
});

const dataList = [
  {
    vertices: [],
    src: "./asset/img/duck/Duck.glb",
  },
  {
    vertices: [],
    src: "./asset/img/fox/Fox.glb",
  },
];
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
}

const delay = (time, value) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), time);
  });

const pointsMaterial = new THREE.PointsMaterial({
  size: 1,
  map: texture,
  transparent: true,
  sizeAttenuation: true,
  vertexColors: true,
});

async function asdf() {
  await delay(0);
  loader.load(dataList[0].src, (duck) => {
    if (duck) {
      let length01 = 0;
      let duckArray =
        duck.scene.children[0].children[1].geometry.attributes.position.array;
      let length = duckArray.length + 900;
      let duckColors = new Float32Array(duckArray);
      length01 += length;

      for (let i = 0; i < duckArray.length; i += 3) {
        let x = duckArray[i + 0],
          y = duckArray[i + 1],
          z = duckArray[i + 2];
        duckColors[i] = Math.random();

        if (x === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;
        if (y === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;
        if (z === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;

        dataList[0].vertices.push(x, y, z);
      }

      glbGeo1.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(dataList[0].vertices, 3)
      );
      glbGeo1.setAttribute("color", new THREE.BufferAttribute(duckColors, 3));
    }
    console.log("1");
  });

  await delay(500);
  loader.load(dataList[1].src, (fox) => {
    if (fox) {
      let foxArray = fox.scene.children[0].geometry.attributes.position.array;
      let foxColors = new Float32Array(foxArray);
      for (let i = 0; i < foxArray.length; i += 3) {
        let x = foxArray[i],
          y = foxArray[i + 1],
          z = foxArray[i + 2];
        foxColors[i] = Math.random();
        if (x === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;
        if (y === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;
        if (z === undefined)
          x = getRandomInt(particlesMap.min, particlesMap.max) * 0.1;

        dataList[1].vertices.push(x, y, z);
      }

      glbGeo2.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(dataList[1].vertices, 3)
      );
      glbGeo2.setAttribute("color", new THREE.BufferAttribute(foxColors, 3));
    }
    console.log(glbGeo2);
  });

  await delay(500);
  const group = new THREE.Group();

  const mesh1 = new THREE.Points(glbGeo1, pointsMaterial);
  const mesh2 = new THREE.Points(glbGeo2, pointsMaterial);

  group.add(mesh1, mesh2);
  scene.add(mesh1);
}
asdf();

const intensity = 0.5;
const color = 0xffffff;
const light = new THREE.AmbientLight(color, intensity);
light.position.set(0, 0, 0);
scene.add(light);

const light2 = new THREE.DirectionalLight({
  color: 0xffffff,
  intensity: 1,
});
light2.position.set(11, 1, 29);
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
  // setTimeout(() => {
  //   update();
  // }, 1000);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
}
animation();
