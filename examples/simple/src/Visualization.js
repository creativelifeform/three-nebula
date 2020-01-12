//import * as THREE from "./three.js";
//import StatsJs from "./stats.js";

/**
 * Sets up three js and particle system environment
 *
 */
class Visualization {
  constructor({ canvas, init, shouldRotateCamera }) {
    this.canvas = canvas;
    this.init = init;
    this.shouldAnimate = true;
    this.shouldRotateCamera = shouldRotateCamera || false;
    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);
  }

  /**
   * Starts the visualization.
   *
   * @return {Promise<Visualization>}
   */
  start() {
    this.shouldAnimate = true;

    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });


    this.updater = new Visualization.FPSLockedUpdater( ()=>{
        this.particleSystem.update();
        this.rotateCamera();
      this.stats.end();
    }, vars.fps ? parseInt(vars.fps) : undefined, 100)
    this.stats.begin();
    return this.makeScene()
      .makeCamera()
      .makeLights()
      .makeWebGlRenderer()
      .makeParticleSystem();
  }

  /**
   * Stops the visualisation.
   *
   * @return void
   */
  stop() {
    this.shouldAnimate = false;
    this.particleSystem.destroy();
  }

  /**
   * Renders the visualization.
   *
   * @return {Visualization}
   */
  render() {
    const animate = (time) => {
      if (!this.shouldAnimate) {
        return;
      }
      requestAnimationFrame(animate); //Do this first to maximize the possibility of scheduling our animation frame at the display rate.
      //Doing this after the app render creates the possibility of missing the scheduling window and losing a frame, creating stutter

      const { canvas: { clientWidth, clientHeight } } = this;
      if(this.lastWidth !== clientWidth || this.lastHeight !== clientHeight){
          this.resize();
          this.lastWidth = clientWidth;
          this.lastHeight = clientHeight;
      }
      this.updater.update( time );
      this.webGlRenderer.render(this.scene, this.camera);
    };
    requestAnimationFrame(animate);
    return this;
  }
  resize() {
    const {
      camera,
      webGlRenderer,
      canvas: { clientWidth, clientHeight },
    } = this;

    webGlRenderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
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
    spotLight.lookAt(scene);

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

    this.webGlRenderer = this.webGlRenderer || new THREE.WebGLRenderer({ canvas, ...options });
    this.webGlRenderer.setSize(clientWidth, clientHeight, false);
    this.webGlRenderer.setClearColor('black');
    return this;
  }

  async makeParticleSystem() {
    const { scene, camera, webGlRenderer } = this;

    this.particleSystem = await this.init({
      scene,
      camera,
      renderer: webGlRenderer,
    });

    return Promise.resolve(this.render());
  }
}

Visualization.FPSLockedUpdater = class 
{
  constructor( onUpdate, fps = 60 , maxUpdates = 10 ){
    this.cumulativeTime = 0;
    this.timeSlice = 1000/fps;
    this.maxUpdates = maxUpdates;
    this.onUpdate = onUpdate;
  }
  update( now = performance.now() ){
    let numUpdates = 1;
    if( ! this.lastTime )
      this.lastTime = now;
    else{
      var elapsed = now - this.lastTime;
      this.cumulativeTime += elapsed;
      numUpdates = (this.cumulativeTime / this.timeSlice) | 0;
      this.cumulativeTime -= numUpdates * this.timeSlice;
      if(numUpdates > this.maxUpdates) numUpdates = this.maxUpdates;
      this.lastTime = now;
    }
    while(numUpdates-->0)
      this.onUpdate()
  }
}