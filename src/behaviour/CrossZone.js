(function(Proton, undefined) {
    function CrossZone(a, b, life, easing) {
        CrossZone._super_.call(this, life, easing);
        this.reset(a, b);
        ///dead /bound /cross
        this.name = "CrossZone";
    }


    Proton.Util.inherits(CrossZone, Proton.Behaviour);
    CrossZone.prototype.reset = function(a, b, life, easing) {
        var zone, crossType;
        if (typeof a == "string") {
            crossType = a;
            zone = b;
        } else {
            crossType = b;
            zone = a;
        }
        
        this.zone = zone;
        this.zone.crossType = Proton.Util.initValue(crossType, "dead");
        if (life)
            CrossZone._super_.prototype.reset.call(this, life, easing);
    }

    CrossZone.prototype.applyBehaviour = function(particle, time, index) {
        CrossZone._super_.prototype.applyBehaviour.call(this, particle, time, index);
        this.zone.crossing.call(this.zone, particle);
    };

    Proton.CrossZone = CrossZone;
})(Proton);
