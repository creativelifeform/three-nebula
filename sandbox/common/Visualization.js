import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Stats from 'three/addons/libs/stats.module.js';

export class Visualization {
  constructor({
    canvas,
    init,
    shouldRotateCamera,
    shouldAddCameraControls,
    maxTicks = Infinity,
  }) {
    this.canvas = canvas;
    this.init = init;
    this.shouldAnimate = true;
    this.shouldRotateCamera = shouldRotateCamera;
    this.shouldAddCameraControls = shouldAddCameraControls;
    this.stats = new Stats();
    this.hasStats = false;
    this.maxTicks = maxTicks;
    this.renderTicks = 0;
    this.rafId = undefined;
    // Deterministic offline capture mode (?capture=1): drive the sim one fixed
    // step at a time from an external driver instead of the realtime rAF/tick
    // loop, for frame-perfect 60fps video regardless of render speed. See the
    // nebula-preview skill.
    this.capture =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('capture');
  }

  /**
   * Starts the visualization.
   *
   * @return {Promise<Visualization>}
   */
  start() {
    this.shouldAnimate = true;

    return this.makeScene()
      .makeCamera()
      .makeLights()
      .makeWebGlRenderer()
      .makeCameraControls()
      .makeParticleSystem();
  }

  /**
   * Stops the visualisation.
   *
   * @return void
   */
  stop() {
    this.shouldAnimate = false;
    window.removeEventListener('resize', this.resize);
    cancelAnimationFrame(this.rafId);
    this.particleSystem.destroy();
  }

  restart(system) {
    this.particleSystem = system;
    this.shouldAnimate = true;

    this.render();
  }

  /**
   * Renders the visualization.
   *
   * @return {Visualization}
   */
  render() {
    let requestId;

    if (!this.hasStats) {
      document.getElementById('app').appendChild(this.stats.dom);
      this.stats.begin();
      this.hasStats = true;
    }

    window.addEventListener('resize', () => this.resize());

    // Real-time playback: drive the sim with `tick(realDeltaSeconds)`, not
    // `update()`. `tick` consumes actual elapsed time in fixed steps, so speed
    // is correct regardless of the display's refresh rate — calling `update()`
    // once per frame would run ~2x too fast on a 120Hz display. (Deterministic /
    // offline stepping, e.g. the VR harness, uses `update()` instead.)
    const animate = (now = performance.now()) => {
      if (!this.shouldAnimate) {
        return;
      }

      if (this.maxTicks !== Infinity && this.renderTicks >= this.maxTicks) {
        console.log('REACHED MAX TICKS');

        return cancelAnimationFrame(this.rafId);
      }

      this.rafId = requestAnimationFrame(animate);

      const last = this._lastFrameTime ?? now;

      this._lastFrameTime = now;
      this.renderTicks++;
      this.particleSystem.tick((now - last) / 1000);
      this.rotateCamera();
      this.webGlRenderer.render(this.scene, this.camera);
      this.stats.end();
    };

    try {
      animate();
    } catch (e) {
      console.error(e);
      cancelAnimationFrame(requestId);
    }

    return this;
  }

  resize() {
    const {
      camera,
      webGlRenderer,
      canvas: { clientWidth, clientHeight },
    } = this;

    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    webGlRenderer.setSize(clientWidth, clientHeight, false);
  }

  makeScene() {
    this.scene = new THREE.Scene();

    return this;
  }

  makeCamera() {
    const cameraState = {
      type: 'PerspectiveCamera',
      params: {
        fov: 70,
        nearPlane: 0.1,
        farPlane: 1000,
      },
      position: {
        x: 0,
        y: 0,
        z: 50,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 0,
      },
      controller: {
        enabled: true,
      },
    };
    const {
      canvas: { clientWidth, clientHeight },
    } = this;
    const { params, position, rotation } = cameraState;
    const { fov, nearPlane, farPlane } = params;

    this.camera = new THREE.PerspectiveCamera(
      fov,
      clientWidth / clientHeight,
      nearPlane,
      farPlane
    );

    this.camera.position.copy(position);
    this.camera.rotation.set(rotation.x, rotation.y, rotation.z);
    this.camera.userData.tha = 0;

    return this;
  }

  rotateCamera() {
    const { scene, camera, shouldRotateCamera } = this;

    if (!shouldRotateCamera) {
      return;
    }

    camera.userData.tha += 0.005;
    camera.lookAt(scene.position);
    camera.position.x = Math.sin(camera.userData.tha) * 500;
    camera.position.z = Math.cos(camera.userData.tha) * 500;
  }

  makeLights() {
    const { scene } = this;
    const ambientLight = new THREE.AmbientLight(0x101010);
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000, 1);
    const spotLight = new THREE.SpotLight(0xffffff, 0.5);

    pointLight.position.set(0, 200, 200);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene.position);

    scene.add(ambientLight);
    scene.add(pointLight);
    scene.add(spotLight);

    return this;
  }

  makeWebGlRenderer(options = { alpha: true, antialias: true }) {
    const {
      canvas,
      canvas: { clientWidth, clientHeight },
    } = this;

    // Capture mode needs a readable back-buffer (canvas.toDataURL after render).
    const opts = this.capture
      ? { ...options, preserveDrawingBuffer: true }
      : options;

    this.webGlRenderer =
      this.webGlRenderer || new THREE.WebGLRenderer({ canvas, ...opts });
    this.webGlRenderer.setSize(clientWidth, clientHeight, false);
    this.webGlRenderer.setClearColor('black');

    return this;
  }

  makeCameraControls() {
    if (!this.shouldAddCameraControls) {
      return this;
    }

    this.cameraControls = new OrbitControls(
      this.camera,
      this.webGlRenderer.domElement
    );

    return this;
  }

  async makeParticleSystem() {
    const { scene, camera, webGlRenderer } = this;

    this.particleSystem = await this.init({
      scene,
      camera,
      renderer: webGlRenderer,
    });

    if (this.capture) {
      return Promise.resolve(this.enableCaptureMode());
    }

    return Promise.resolve(this.render());
  }

  /**
   * Deterministic offline capture: no rAF/tick loop. An external driver (the
   * nebula-preview capture script) advances the sim one fixed step at a time via
   * `window.__nebulaCapture.step(dt)` and reads the canvas between steps, so the
   * output is frame-perfect 60fps no matter how slowly headless renders. Uses
   * `update(dt)` (the deterministic primitive), not `tick`. Note: effects that
   * animate via their own `requestAnimationFrame` loop (e.g. a scripted moving
   * emitter) won't be captured deterministically — drive those from the sim, or
   * capture them with the realtime fallback.
   *
   * @return {Visualization}
   */
  enableCaptureMode() {
    this.shouldAnimate = false;

    const self = this;

    window.__nebulaCapture = {
      step(dt = 1 / 60) {
        self.particleSystem.update(dt);
        self.rotateCamera();
        self.webGlRenderer.render(self.scene, self.camera);
      },
    };

    return this;
  }
}
