import FpsLocker from 'fps-locker';
import { stats } from '../Stats';

/**
 * Sets up three js and particle system environment so that they can be rendered
 * into the editor's Stage component.
 *
 */
export default class {
  constructor(THREE, { canvas, shouldRotateCamera, webGlRendererOptions }) {
    this.THREE = THREE;
    this.canvas = canvas;
    this.shouldAnimate = true;
    this.shouldRotateCamera = shouldRotateCamera || false;
    this.stats = stats;
    this.webGlRendererOptions = webGlRendererOptions;
    this.rafId = undefined;
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
      .makeWebGlRenderer(this.webGlRendererOptions)
      .makeParticleSystem();
  }

  /**
   * Stops the visualisation.
   *
   * @return void
   */
  stop() {
    this.shouldAnimate = false;
    cancelAnimationFrame(this.rafId);
    this.particleSystem.destroy();
  }

  /**
   * Renders the visualization.
   *
   * @return {Visualization}
   */
  render() {
    this.stats.begin();

    const updater = new FpsLocker(() => {
      this.particleSystem.update();
      this.rotateCamera();
    });
    const animate = now => {
      if (!this.shouldAnimate) {
        return;
      }

      this.rafId = requestAnimationFrame(animate);

      updater.update();
      this.webGlRenderer.render(this.scene, this.camera);

      this.stats.end();
    };

    animate();

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
    this.scene = new this.THREE.Scene();

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

    this.camera = new this.THREE.PerspectiveCamera(
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
    const ambientLight = new this.THREE.AmbientLight(0x101010);
    const pointLight = new this.THREE.PointLight(0xffffff, 2, 1000, 1);
    const spotLight = new this.THREE.SpotLight(0xffffff, 0.5);

    pointLight.position.set(0, 200, 200);
    spotLight.position.set(0, 500, 100);
    spotLight.lookAt(scene);

    scene.add(ambientLight);
    scene.add(pointLight);
    scene.add(spotLight);

    return this;
  }

  makeWebGlRenderer(
    options = { alpha: true, antialias: true, clearColor: undefined }
  ) {
    const {
      canvas,
      canvas: { clientWidth, clientHeight },
    } = this;

    this.webGlRenderer =
      this.webGlRenderer ||
      new this.THREE.WebGLRenderer({ canvas, ...options });
    this.webGlRenderer.setSize(clientWidth, clientHeight, false);
    options.clearColor &&
      this.webGlRenderer.setClearColor(options.clearColor, 1);

    return this;
  }

  async makeParticleSystem() {
    throw new Error('Your renderer is missing a makeParticleSystem function');
  }
}
