window.Visualization = class {
  constructor({ canvas, init, shouldRotateCamera }) {
    this.canvas = canvas;
    this.init = init;
    this.shouldAnimate = true;
    this.shouldRotateCamera = shouldRotateCamera || true;
    this.stats = window.Stats ? new window.Stats() : null;
    this.container = document.getElementById('app');
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
    window.addEventListener('resize', () => this.resize());

    this.addStats();

    const animate = () => {
      if (!this.shouldAnimate) {
        return;
      }

      requestAnimationFrame(animate);

      this.particleSystem.update();
      this.rotateCamera();
      this.webGlRenderer.render(this.scene, this.camera);
      this.updateStats();
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

  addStats() {
    if (!this.stats) {
      return;
    }

    this.container.appendChild(this.stats.dom);
    this.stats.begin();
  }

  updateStats() {
    if (!this.stats) {
      return;
    }

    this.stats.end();
  }

  makeScene() {
    //this.scene = new THREE.Scene();
    
    class BufferedScene extends THREE.Scene
    {
        constructor(){
            super()
            //this.sprites=[]
            this.system = new ParticlePool({depthTest:false,depthWrite:false,transparent:true})
            //this.system.points.material.wireframe = true;
            
            var sys = this.system;
            var points = sys.points;
            var ti=0;
            var textureReferences={}
            this.updateFn = (p)=>{
                var sp=p.spr;
                //sp.visible = false;
                p.px = sp.position.x;//+(p.sys.srnd()*100)
                p.py = sp.position.y;//+(p.sys.srnd()*100);// + 300
                p.pz = sp.position.z;//+(p.sys.srnd()*100);
                var c= sp.material.color;
                p.cr = c.r;
                p.cg = c.g;
                p.cb = c.b;
                var map = sp.material.map;
                if(map._tileIndex==undefined){
                    if(map.image && map.image.complete){
                        var v = textureReferences[map.uuid]
                        if(!v)v=textureReferences[map.uuid]=ti++
                        map._tileIndex = v;
                        p.t0=p.t1b=map._tileIndex;
                    }
                }else                 
                    p.t0=p.t1b=map._tileIndex;
                p.ca=sp.material.opacity;
                p.s=sp.scale.x*.2;
                if(p.dead)
                    return false;
            }
            this.system.points.onBeforeRender = (a,b,c,d,e,f)=>{
                var rendering = true;
                sys.transform(this.updateFn)
            }
            this.add(this.system.points)
            //this.add(this.system.ribbons)
        }
        remove(e){
            if(e.isSprite){
                //var pos = this.sprites.indexOf(e)
                //var p  = this.sprites.pop();
                //if(pos<this.sprites.length)this.sprites[pos]=p;
                e.userData.particle.dead = true;
                e.userData.particle.s = 0;
                //this.system.dealloc(this.system,e.userData.particle)
            }
          } else p.t0 = p.t1b = map._tileIndex;
          p.ca = sp.material.opacity;
          p.s = sp.scale.x * 2;
          if (p.dead) return false;
        };
        this.system.points.onBeforeRender = (a, b, c, d, e, f) => {
          var rendering = true;
          sys.transform(this.updateFn);
        };
        this.add(this.system.points);
        //this.add(this.system.ribbons)
      }
      remove(e) {
        if (e.isSprite) {
          //var pos = this.sprites.indexOf(e)
          //var p  = this.sprites.pop();
          //if(pos<this.sprites.length)this.sprites[pos]=p;
          e.userData.particle.dead = true;
          //this.system.dealloc(this.system,e.userData.particle)
        }
        add(e){
            if(e.isSprite){
                e.visible = false;
                e.userData.particle = this.system.alloc((p)=>{
                    p.spr=e;
                    //this.updateFn(p);
                    //p.s = 100;
                })
                //this.sprites.push(e)
            }            
            super.add(e)
        }
        super.add(e);
      }
    }
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}
var vars = getUrlVars();

    this.scene = new THREE.Scene()
    if(vars.buffered)
        this.scene = new BufferedScene()

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

    this.webGlRenderer =
      this.webGlRenderer || new THREE.WebGLRenderer({ canvas, ...options });
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
};
