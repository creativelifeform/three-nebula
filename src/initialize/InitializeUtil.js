(function(Proton, undefined) {
    var InitializeUtil = {

        initialize: function(emitter, particle, initializes) {
            var i = initializes.length;
            while (i--) {
                var initialize = initializes[i];
                if (initialize instanceof Proton.Initialize)
                    initialize.init(emitter, particle);
                else
                    InitializeUtil.init(emitter, particle, initialize);
            }

            InitializeUtil.bindEmitter(emitter, particle);
        },

        //////////////////////init//////////////////////
        init: function(emitter, particle, initialize) {
            Proton.Util.setPrototypeByObj(particle, initialize);
            Proton.Util.setVectorByObj(particle, initialize);
        },

        bindEmitter: function(emitter, particle) {
            if (emitter.bindEmitter) {
                particle.p.add(emitter.p);
                particle.v.add(emitter.v);
                particle.a.add(emitter.a);
                particle.v.applyEuler(emitter.rotation);
            }
        }
    }

    Proton.InitializeUtil = InitializeUtil;
})(Proton);
