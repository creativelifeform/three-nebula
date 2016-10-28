(function(Proton, undefined) {
    function Emitter(pObj) {
        this.initializes = [];
        this.particles = [];
        this.behaviours = [];
        this.currentEmitTime = 0;
        this.totalEmitTimes = -1;

        /**
         * @property {Number} damping -The friction coefficient for all particle emit by This;
         * @default 0.006
         */
        this.damping = .006;
        /**
         * If bindEmitter the particles can bind this emitter's property;
         * @property bindEmitter
         * @type {Boolean}
         * @default true
         */
        this.bindEmitter = true;
        /**
         * The number of particles per second emit (a [particle]/b [s]);
         * @property rate
         * @type {Rate}
         * @default Rate(1, .1)
         */
        this.rate = new Proton.Rate(1, .1);
        Emitter._super_.call(this, pObj);
        /**
         * The emitter's id;
         * @property id
         * @type {String} id
         */
        this.id = 'emitter_' + Emitter.ID++;
        this.cID = 0;
        this.name = 'Emitter';
    };
    Emitter.ID = 0;

    Proton.Util.inherits(Emitter, Proton.Particle);
    Proton.EventDispatcher.initialize(Emitter.prototype);

    /**
     * start emit particle
     * @method emit
     * @param {Number} totalEmitTimes total emit times;
     * @param {String} life the life of this emitter
     */
    Emitter.prototype.emit = function(totalEmitTimes, life) {
        this.currentEmitTime = 0;
        this.totalEmitTimes = Proton.Util.initValue(totalEmitTimes, Infinity);

        if (life == true || life == 'life' || life == 'destroy') {
            this.life = totalEmitTimes == 'once' ? 1 : this.totalEmitTimes;
        } else if (!isNaN(life)) {
            this.life = life;
        }

        this.rate.init();
    };

    /**
     * stop emiting
     * @method stopEmit
     */
    Emitter.prototype.stopEmit = function() {
        this.totalEmitTimes = -1;
        this.currentEmitTime = 0;
    };

    /**
     * remove current all particles
     * @method removeAllParticles
     */
    Emitter.prototype.removeAllParticles = function() {
        var i = this.particles.length;
        while (i--) this.particles[i].dead = true;
    };

    /**
     * create single particle;
     * 
     * can use emit({x:10},new Gravity(10),{'particleUpdate',fun}) or emit([{x:10},new Initialize],new Gravity(10),{'particleUpdate',fun})
     * @method removeAllParticles
     */
    Emitter.prototype.createParticle = function(initialize, behaviour) {
        var particle = this.parent.pool.get(Proton.Particle);
        this.setupParticle(particle, initialize, behaviour);
        this.parent && this.parent.dispatchEvent("PARTICLE_CREATED", particle);
        Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_CREATED", particle);

        return particle;
    };
    /**
     * add initialize to this emitter
     * @method addSelfInitialize
     */
    Emitter.prototype.addSelfInitialize = function(pObj) {
        if (pObj['init']) {
            pObj.init(this);
        } else {
            this.initAll();
        }
    };


    /**
     * add the Initialize to particles;
     * 
     * you can use initializes array:for example emitter.addInitialize(initialize1,initialize2,initialize3);
     * @method addInitialize
     * @param {Initialize} initialize like this new Radius(1, 12)
     */
    Emitter.prototype.addInitialize = function() {
        var i = arguments.length;
        while (i--) this.initializes.push(arguments[i]);
    };


    /**
     * remove the Initialize
     * @method removeInitialize
     * @param {Initialize} initialize a initialize
     */
    Emitter.prototype.removeInitialize = function(initializer) {
        var index = this.initializes.indexOf(initializer);
        if (index > -1) this.initializes.splice(index, 1);
    };

    /**
     * remove all Initializes
     * @method removeInitializers
     */
    Emitter.prototype.removeInitializers = function() {
        Proton.Util.destroyArray(this.initializes);
    };
    /**
     * add the Behaviour to particles;
     * 
     * you can use Behaviours array:emitter.addBehaviour(Behaviour1,Behaviour2,Behaviour3);
     * @method addBehaviour
     * @param {Behaviour} behaviour like this new Color('random')
     */
    Emitter.prototype.addBehaviour = function() {
        var i = arguments.length;
        while (i--) this.behaviours.push(arguments[i]);
    };
    /**
     * remove the Behaviour
     * @method removeBehaviour
     * @param {Behaviour} behaviour a behaviour
     */
    Emitter.prototype.removeBehaviour = function(behaviour) {
        var index = this.behaviours.indexOf(behaviour);
        if (index > -1) this.behaviours.splice(index, 1);
    };
    /**
     * remove all behaviours
     * @method removeAllBehaviours
     */
    Emitter.prototype.removeAllBehaviours = function() {
        Proton.Util.destroyArray(this.behaviours);
    };

    Emitter.prototype.integrate = function(time) {
        var damping = 1 - this.damping;
        Proton.integrator.integrate(this, time, damping);

        var i = this.particles.length;
        while (i--) {
            var particle = this.particles[i];
            particle.update(time, i);
            Proton.integrator.integrate(particle, time, damping);

            this.parent && this.parent.dispatchEvent("PARTICLE_UPDATE", particle);
            Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_UPDATE", particle);
        }
    };

    Emitter.prototype.emitting = function(time) {
        if (this.totalEmitTimes == 'once') {
            var i = this.rate.getValue(99999);
            if (i > 0) this.cID = i;
            while (i--) this.createParticle();
            this.totalEmitTimes = 'none';

        } else if (!isNaN(this.totalEmitTimes)) {
            this.currentEmitTime += time;
            if (this.currentEmitTime < this.totalEmitTimes) {
                var i = this.rate.getValue(time);
                if (i > 0) this.cID = i;
                while (i--) this.createParticle();
            }
        }
    }

    Emitter.prototype.update = function(time) {
        this.age += time;
        if (this.dead || this.age >= this.life) {
            this.destroy();
        }

        this.emitting(time);
        this.integrate(time);

        var particle, i = this.particles.length;
        while (i--) {
            particle = this.particles[i];
            if (particle.dead) {
                this.parent && this.parent.dispatchEvent("PARTICLE_DEAD", particle);
                Proton.bindEmtterEvent && this.dispatchEvent("PARTICLE_DEAD", particle);

                this.parent.pool.expire(particle.reset());
                this.particles.splice(i, 1);
            }
        }
    };

    Emitter.prototype.setupParticle = function(particle, initialize, behaviour) {
        var initializes = this.initializes;
        var behaviours = this.behaviours;

        if (initialize) {
            if (Proton.Util.isArray(initialize))
                initializes = initialize;
            else
                initializes = [initialize];
        }

        if (behaviour) {
            if (Proton.Util.isArray(behaviour))
                behaviours = behaviour;
            else
                behaviours = [behaviour];
        }

        Proton.InitializeUtil.initialize(this, particle, initializes);
        particle.addBehaviours(behaviours);
        particle.parent = this;
        this.particles.push(particle);
    };

    /**
     * Destory this Emitter
     * @method destroy
     */
    Emitter.prototype.destroy = function() {
        this.dead = true;
        this.energy = 0;
        this.totalEmitTimes = -1;

        if (this.particles.length == 0) {
            this.removeInitializers();
            this.removeAllBehaviours();

            this.parent && this.parent.removeEmitter(this);
        }
    }


    Proton.Emitter = Emitter;
})(Proton);
