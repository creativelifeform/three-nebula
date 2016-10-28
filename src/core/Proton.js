(function(window, undefined) {
    //the max particle number in pool
    Proton.POOL_MAX = 500;
    Proton.TIME_STEP = 60;
    Proton.PI = 3.142;
    Proton.DR = Proton.PI / 180;

    //1:100
    Proton.MEASURE = 100;
    Proton.EULER = 'euler';
    Proton.RK2 = 'runge-kutta2';
    Proton.RK4 = 'runge-kutta4';
    Proton.VERLET = 'verlet';

    Proton.PARTICLE_CREATED = 'partilcleCreated';
    Proton.PARTICLE_UPDATE = 'partilcleUpdate';
    Proton.PARTICLE_SLEEP = 'particleSleep';
    Proton.PARTICLE_DEAD = 'partilcleDead';
    Proton.PROTON_UPDATE = 'protonUpdate';
    Proton.PROTON_UPDATE_AFTER = 'protonUpdateAfter';
    Proton.EMITTER_ADDED = 'emitterAdded';
    Proton.EMITTER_REMOVED = 'emitterRemoved';

    Proton.bindEmtterEvent = false;

    /**
     * @name Proton is a particle engine for three.js
     *
     * @class Proton
     * @param {number} preParticles input any number
     * @param {number} integrationType input any number
     * @example var proton = new Proton(200);
     */

    function Proton(preParticles, integrationType) {
        this.preParticles = Proton.Util.initValue(preParticles, Proton.POOL_MAX);
        this.integrationType = Proton.Util.initValue(integrationType, Proton.EULER);

        this.emitters = [];
        this.renderers = [];

        this.pool = new Proton.Pool();
        Proton.integrator = new Proton.Integration(this.integrationType);
    }


    Proton.prototype = {
        /**
         * @name add a type of Renderer
         *
         * @method addRender
         * @param {Renderer} render
         */
        addRender: function(renderer) {
            this.renderers.push(renderer);
            renderer.init(this);
        },

        /**
         * @name add a type of Renderer
         *
         * @method addRender
         * @param {Renderer} render
         */
        removeRender: function(renderer) {
            this.renderers.splice(this.renderers.indexOf(renderer), 1);
            renderer.remove(this);
        },

        /**
         * add the Emitter
         *
         * @method addEmitter
         * @param {Emitter} emitter
         */
        addEmitter: function(emitter) {
            this.emitters.push(emitter);
            emitter.parent = this;
            this.dispatchEvent("EMITTER_ADDED", emitter);
        },

        removeEmitter: function(emitter) {
            if (emitter.parent != this) return;

            this.emitters.splice(this.emitters.indexOf(emitter), 1);
            emitter.parent = null;
            this.dispatchEvent("EMITTER_REMOVED", emitter);
        },

        update: function($delta) {
            this.dispatchEvent("PROTON_UPDATE", this);

            var delta = $delta || 0.0167;
            if (delta > 0) {
                var i = this.emitters.length;
                while (i--) this.emitters[i].update(delta);
            }

            this.dispatchEvent("PROTON_UPDATE_AFTER", this);
        },

        /**
         * getCount
         * @name get the count of particle
         * @return (number) particles count
         */
        getCount: function() {
            var total = 0;
            var i, length = this.emitters.length;
            for (i = 0; i < length; i++) total += this.emitters[i].particles.length;
            return total;
        },

        /**
         * destroy
         * @name destroy the proton
         */
        destroy: function() {
            var i = 0,
                length = this.emitters.length;

            for (i; i < length; i++) {
                this.emitters[i].destroy();
                delete this.emitters[i];
            }

            this.emitters.length = 0;
            this.particlePool.destroy();
        }
    };

    window.Proton = Proton;
})(window);
