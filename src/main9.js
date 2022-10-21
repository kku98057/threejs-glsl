import * as THREE from "three";

// ▼ partiles ▼
import fragmentShader from "../../shaders/fragment/fragment.glsl";
import vertexShader from "../../shaders/vertex/vertex.glsl";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Mesh {
  constructor(stage, body, bool) {
    this.body = body;
    this.stage = stage;
    this.bool = bool;

    this.params = {
      w: window.innerWidth,
      h: window.innerHeight,
      depth: 100,
      color: "#fff",
      addRotate: 0,
      longer: 0,
      invert: {
        color: 1,
      },
    };

    this.params.longer =
      this.params.w > this.params.h ? this.params.w : this.params.h;

    this.uniforms = {
      u_texture: {
        type: "t",
        value: new THREE.TextureLoader().load("assets/img/p.png"),
      },
      u_time: { type: "f", value: 0.0 },
      u_scale: { type: "f", value: 1.0 },
      // u_add_scale : { type: "f", value: 4.0 },
      u_add_scale: {
        type: "f",
        value: this.stage.safari_of_macbook ? 4.0 : 10.0,
      },
      u_move: { type: "f", value: 0.01 }, //0.0075
      u_set1: { type: "f", value: 0.0 },
      u_set2: { type: "f", value: 0.0 },
      u_set3: { type: "f", value: 0.0 },
      u_set4: { type: "f", value: 0.0 },

      u_progress: { type: "f", value: 1.0 },
      u_color: { type: "v3", value: new THREE.Color("#00b3ff") },
    };

    this.group = null;
    this.glbMesh = null;
    this.smokeGroup = null;
    this.init();
  }

  setGroup() {
    // ▼ パーティクルグループ ▼
    this.group = new THREE.Group();
    const scale = this.bool.isWidthMatch
      ? 80
      : 100 * this.stage.toComparisonVw(this.params.w);
    this.group.scale.set(scale, scale, scale);
    this.stage.scene.add(this.group);

    // ▼ 背景煙グループ ▼
    this.smokeGroup = new THREE.Group();
    // this.smokeGroup.scale.set(
    //   this.params.longer * 2,
    //   this.params.longer * 2,
    //   this.params.longer * 2
    // );
    this.smokeGroup.scale.set(
      this.params.longer,
      this.params.longer,
      this.params.longer
    );
    this.stage.scene.add(this.smokeGroup);
  }

  onResize(w, h, isWidthMatch) {
    this.bool.isWidthMatch = isWidthMatch;
    this.params.w = w;
    this.params.h = h;

    const scale = this.bool.isWidthMatch
      ? 80
      : 100 * this.stage.toComparisonVw(this.params.w);
    this.group.scale.set(scale, scale, scale);

    this.params.longer =
      this.params.w > this.params.h ? this.params.w : this.params.h;
    // this.smokeGroup.scale.set(
    //   this.params.longer * 2,
    //   this.params.longer * 2,
    //   this.params.longer * 2
    // );

    this.smokeGroup.scale.set(
      this.params.longer,
      this.params.longer,
      this.params.longer
    );
  }

  setDev() {
    // setGui
    const gui = GUI;
    // gui.open();
    gui.close();

    const color = gui.addFolder("Color");
    color.open();
    color.close();
    color
      .addColor(this.uniforms.u_color, "value")
      .name("particles base color")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_color.value = new THREE.Color(value);
      });

    const params = gui.addFolder("params");
    params.close();
    params
      .add(this.uniforms.u_move, "value", 0.0, 1.0)
      .name("u_move")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_move.value = value;
      });
    params
      .add(this.uniforms.u_scale, "value", 0.0, 10.0)
      .name("u_scale")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_scale.value = value;
      });
    params
      .add(this.uniforms.u_add_scale, "value", 0.0, 100.0)
      .name("u_add_scale")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_add_scale.value = value;
      });

    const set = gui.addFolder("set");
    set.close();
    set
      .add(this.uniforms.u_set1, "value", 0.0, 1.0)
      .name("u_set1")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_set1.value = value;
      });
    set
      .add(this.uniforms.u_set2, "value", 0.0, 1.0)
      .name("u_set2")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_set2.value = value;
      });
    set
      .add(this.uniforms.u_set3, "value", 0.0, 1.0)
      .name("u_set3")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_set3.value = value;
      });
    set
      .add(this.uniforms.u_set4, "value", 0.0, 1.0)
      .name("u_set4")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_set4.value = value;
      });

    const deve = gui.addFolder("deve");
    deve.close();
    deve
      .add(this.uniforms.u_progress, "value", 0.0, 1.0)
      .name("u_progress")
      .onChange((value) => {
        this.glbMesh.material.uniforms.u_progress.value = value;
      });

    // ▼ PostProcessing ▼
    const pp = gui.addFolder("postprocessing");
    // pp.close();
    pp.add(this.stage.composer.passes[1], "strength", 0.0, 20.0)
      .name("strength")
      .onChange((value) => {
        this.stage.composer.passes[1].strength = value;
      });
    pp.add(this.stage.bloom_params, "bloomThreshold", 0.0, 5.0)
      .name("threshold")
      .onChange((value) => {
        this.stage.composer.passes[1].threshold = value;
      });
    pp.add(this.stage.bloom_params, "bloomRadius", 0.0, 5.0)
      .name("radius")
      .onChange((value) => {
        this.stage.composer.passes[1].radius = value;
      });
    pp.add(this.stage.composer.passes[1], "enabled")
      .name("enabled")
      .onChange((value) => {
        this.stage.composer.passes[1].enabled = value;
      });
  }

  onRaf() {
    // time
    const second = performance.now() / 1000;

    // ▼ glbグループ ▼
    if (this.glbMesh != null) {
      this.glbMesh.material.uniforms.u_time.value = second;

      this.glbMesh.rotation.y += 0.01 + this.params.addRotate;
    }

    //▼ 背景煙グループ ▼
    if (this.smokeGroup != null) {
      this.smokeGroup.rotation.z += 0.005;

      // ▼ 背景煙: 青色のパラメーターをアニメーション ▼
      if (this.smokeGroup.children[0].material.color.b < 0.5)
        this.params.invert.color = 1;
      if (this.smokeGroup.children[0].material.color.b > 1.2)
        this.params.invert.color = -1;
      this.smokeGroup.children[0].material.color.b +=
        0.005 * this.params.invert.color;
    }
  }

  /**
   * ランダムな整数を返す
   * @param {*} min 最小値
   * @param {*} max 最大値
   * @returns int number
   */
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  setGlb() {
    this.glbGeometry = new THREE.BufferGeometry();

    this.particlesMap = {
      // min: -50,
      // max: 50
      min: -45,
      max: 45,
    };
    const dataList = [
        {
          vertices: [],
          src: "assets/glb/lizards.glb?v=4",
        },
        {
          vertices: [],
          src: "assets/glb/blacky.glb?v=8",
        },
        {
          vertices: [],
          src: "assets/glb/cerf.glb?v=2",
        },
        {
          vertices: [],
          src: "assets/glb/shark.glb?v=4",
        },
        {
          vertices: [],
          src: "assets/glb/bird.glb?v=5",
        },
      ],
      glb_loader = new GLTFLoader(),
      vertices2D = []; //particlesのtranslate値（ランダム生成）

    this.body.classList.add("-load-start");

    !(async () => {
      await G.delay(0);
      // トカゲ
      glb_loader.load(dataList[0].src, (data) => {
        if (data) {
          this.length01 = 0;
          let verticesArray01 =
            data.scene.children[0].geometry.attributes.position.array;

          // ▼ 最大パーティクル数を更新 ▼
          const length = verticesArray01.length + 900; //420 → 3で割り切れる数（vec3）
          this.length01 += length;

          // ▼ 頂点座標を割り当てる | モデルの頂点 or 90*90*90の立方体からランダム生成 ▼
          for (let i = 0; i < length; i += 3) {
            let x = verticesArray01[i + 0],
              y = verticesArray01[i + 1],
              z = verticesArray01[i + 2];

            if (x === undefined)
              x =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (y === undefined)
              y =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (z === undefined)
              z =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;

            dataList[0].vertices.push(x, y, z);
          }

          // ▼ 座標データ追加 ▼
          this.glbGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(dataList[0].vertices, 3)
          );
        }
      });

      await G.delay(1000);
      // ブラッキーシルエット
      glb_loader.load(dataList[1].src, (data) => {
        if (data) {
          for (let i = 0; i < data.scene.children[0].children.length; i++) {
            let verticesArray02 =
              data.scene.children[0].children[i].geometry.attributes.position
                .array;

            // ▼ 頂点座標を割り当てる | モデルの頂点 or 90*90*90の立方体からランダム生成 ▼
            for (let i = 0; i < this.length01; i += 3) {
              let x = verticesArray02[i + 0],
                y = verticesArray02[i + 1],
                z = verticesArray02[i + 2];

              if (x === undefined)
                x =
                  this.getRandomInt(
                    this.particlesMap.min,
                    this.particlesMap.max
                  ) * 0.3;
              if (y === undefined)
                y =
                  this.getRandomInt(
                    this.particlesMap.min,
                    this.particlesMap.max
                  ) * 0.3;
              if (z === undefined)
                z =
                  this.getRandomInt(
                    this.particlesMap.min,
                    this.particlesMap.max
                  ) * 0.3;

              dataList[1].vertices.push(x, y, z);
            }
          }
          // ▼ 座標データ追加 ▼
          this.glbGeometry.setAttribute(
            "position2",
            new THREE.Float32BufferAttribute(dataList[1].vertices, 3)
          );
        }
      });

      await G.delay(0);
      // ウルフウルフ → 鹿
      glb_loader.load(dataList[2].src, (data) => {
        if (data) {
          let verticesArray03 =
            data.scene.children[0].geometry.attributes.position.array;

          // ▼ 頂点座標を割り当てる | モデルの頂点 or 90*90*90の立方体からランダム生成 ▼
          for (let i = 0; i < this.length01; i += 3) {
            let x = verticesArray03[i + 0],
              y = verticesArray03[i + 1],
              z = verticesArray03[i + 2];

            if (x === undefined)
              x =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (y === undefined)
              y =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (z === undefined)
              z =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;

            dataList[2].vertices.push(x, y, z);
          }

          // ▼ 座標データ追加 ▼
          this.glbGeometry.setAttribute(
            "position3",
            new THREE.Float32BufferAttribute(dataList[2].vertices, 3)
          );
        }
      });

      await G.delay(0);
      // サメキャラクター
      glb_loader.load(dataList[3].src, (data) => {
        if (data) {
          let verticesArray04 =
            data.scene.children[1].geometry.attributes.position.array;

          // ▼ 頂点座標を割り当てる | モデルの頂点 or 90*90*90の立方体からランダム生成 ▼
          for (let i = 0; i < this.length01; i += 3) {
            let x = verticesArray04[i + 0],
              y = verticesArray04[i + 1],
              z = verticesArray04[i + 2];

            if (x === undefined)
              x =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (y === undefined)
              y =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;
            if (z === undefined)
              z =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.1;

            dataList[3].vertices.push(x, y, z);
          }

          // ▼ 座標データ追加 ▼
          this.glbGeometry.setAttribute(
            "position4",
            new THREE.Float32BufferAttribute(dataList[3].vertices, 3)
          );
        }
      });

      await G.delay(0);
      // 鳥
      glb_loader.load(dataList[4].src, (data) => {
        if (data) {
          let verticesArray05 =
            data.scene.children[0].geometry.attributes.position.array;

          // ▼ 頂点座標を割り当てる | モデルの頂点 or 90*90*90の立方体からランダム生成 ▼
          for (let i = 0; i < this.length01; i += 3) {
            let x = verticesArray05[i + 0],
              y = verticesArray05[i + 1],
              z = verticesArray05[i + 2];

            if (x === undefined)
              x =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.2;
            if (y === undefined)
              y =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.2;
            if (z === undefined)
              z =
                this.getRandomInt(
                  this.particlesMap.min,
                  this.particlesMap.max
                ) * 0.2;

            dataList[4].vertices.push(x, y, z);
          }

          // ▼ 座標データ追加 ▼
          this.glbGeometry.setAttribute(
            "position5",
            new THREE.Float32BufferAttribute(dataList[4].vertices, 3)
          );
        }
      });

      await G.delay(2000);

      // ▼ Create: ランダム値 ▼
      for (let i = 0; i < this.length01; i++) {
        const x = this.getRandomInt(-10, 10) * 0.1,
          y = this.getRandomInt(-10, 10) * 0.1;
        vertices2D.push(x, y);
      }
      this.glbGeometry.setAttribute(
        "rand",
        new THREE.Float32BufferAttribute(vertices2D, 2)
      );

      // ▼ Create: マテリアル ▼
      this.glbMaterial = new THREE.RawShaderMaterial({
        fragmentShader: fragmentShader,
        vertexShader: vertexShader,
        uniforms: this.uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthTest: false,
        alphaTest: false,
        blending: THREE.AdditiveBlending,
      });

      // ▼ Create: メッシュ ▼
      this.glbMesh = new THREE.Points(this.glbGeometry, this.glbMaterial);

      // ▼ メッシュをGroupに追加 ▼
      this.group.add(this.glbMesh);

      if (this.bool.isDev) {
        this.setDev();
      }

      await G.delay(200);
      this.body.classList.add("-loaded");

      await G.delay(1800);
      // ▼ アニメーション ▼
      this.setTimeLine();
      this.body.classList.remove("-load-start");
    })();
  }

  setTimeLine() {
    const time = {
      sec: 10,
      delay: {
        sec: 1,
      },
    };

    const ease = {
      in: "power1.in",
      out: "power1.out",
      inOut: "power1.inOut",
    };

    const sec = {
      value: 1.0,
      duration: time.sec,
      delay: time.sec * 0.5,
      ease: ease.inOut,
    };

    const init = {
      sec: {
        value: 0.0,
        duration: time.sec,
        // delay: time.sec * .5,
        delay: time.sec * 0.3,
        ease: ease.inOut,
      },
    };

    const composer = {
      target: this.stage.composer.passes[1],
      in: {
        strength: this.stage.bloomPass.strength * 1.5,
        ease: ease.in,
        duration: time.sec * 0.5,
      },
      out: {
        strength: this.stage.bloomPass.strength,
        ease: ease.in,
        duration: time.sec * 0.5,
      },
    };

    const move = {
      target: this.glbMesh.material.uniforms.u_move,
      in: {
        value: 0.3,
        duration: time.sec * 0.5,
        ease: ease.in,
      },
      out: {
        value: this.uniforms.u_move.value,
        duration: time.sec * 0.5,
        delay: time.sec * 0.5,
        ease: ease.out,
      },
    };

    const rotate = {
      target: this.params,
      in: {
        addRotate: 0.005,
        duration: time.sec * 0.5,
        ease: ease.in,
      },
      out: {
        addRotate: 0,
        duration: time.sec * 0.5,
        // delay: time.sec * .5,
        ease: ease.out,
      },
    };

    this.tl = GSAP.timeline({
      repeat: -1,
      repeatDelay: 0.0,
    });
    this.tl
      // Scene01
      .to(this.glbMesh.material.uniforms.u_set1, sec)
      .to(move.target, move.in, "<")
      .to(composer.target, composer.in, "<")
      .to(rotate.target, rotate.in, "<")
      .to(move.target, move.out, "<")
      .to(composer.target, composer.out, "<")
      .to(rotate.target, rotate.out, "<")

      // Scene02
      .to(this.glbMesh.material.uniforms.u_set2, sec)
      .to(move.target, move.in, "<")
      .to(composer.target, composer.in, "<")
      .to(rotate.target, rotate.in, "<")
      .to(move.target, move.out, "<")
      .to(composer.target, composer.out, "<")
      .to(rotate.target, rotate.out, "<")

      // Scene03
      .to(this.glbMesh.material.uniforms.u_set3, sec)
      .to(move.target, move.in, "<")
      .to(composer.target, composer.in, "<")
      .to(rotate.target, rotate.in, "<")
      .to(move.target, move.out, "<")
      .to(composer.target, composer.out, "<")
      .to(rotate.target, rotate.out, "<")

      // Scene04
      .to(this.glbMesh.material.uniforms.u_set4, sec)
      .to(move.target, move.in, "<")
      .to(composer.target, composer.in, "<")
      .to(rotate.target, rotate.in, "<")
      .to(move.target, move.out, "<")
      .to(composer.target, composer.out, "<")
      .to(rotate.target, rotate.out, "<")

      // init
      .to(this.glbMesh.material.uniforms.u_set1, init.sec)
      .to(this.glbMesh.material.uniforms.u_set2, init.sec, "<")
      .to(this.glbMesh.material.uniforms.u_set3, init.sec, "<")
      .to(this.glbMesh.material.uniforms.u_set4, init.sec, "<")
      .to(move.target, move.in, "<")
      .to(composer.target, composer.in, "<")
      .to(rotate.target, rotate.in, "<")
      .to(move.target, move.out, "<")
      .to(composer.target, composer.out, "<")
      .to(rotate.target, rotate.out, "<");
  }

  setSmokeMesh() {
    const geometry = new THREE.SphereGeometry(1, 32, 16);
    // const geometry = new THREE.PlaneBufferGeometry(1, 1, this.params.depth);
    // const geometry = new THREE.PlaneBufferGeometry(2, 2, 1);

    const material = new THREE.MeshBasicMaterial({
      // map: new THREE.TextureLoader().load("assets/img/bg_smoke.png"),
      map: new THREE.TextureLoader().load("assets/img/fog.png"),
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      alphaTest: false,
      // opacity: 0.1,
      // opacity: .05,
      // opacity: .25,
      // opacity: .1,
      opacity: 0.25,
      // opacity: .75,
    });
    material.color.b = 0.0;

    const mesh = new THREE.Mesh(geometry, material);

    this.smokeGroup.add(mesh);
  }

  init() {
    this.setGroup();
    this.setGlb();
    this.setSmokeMesh();
  }
}
