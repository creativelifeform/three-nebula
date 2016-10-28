(function(Proton, undefined) {
    function Body(body, w, h) {
        Body._super_.call(this);
        this.body = Proton.createArraySpan(body);
        this.w = w;
        this.h = Proton.Util.initValue(h, this.w);
    }

    Proton.Util.inherits(Body, Proton.Initialize);

    Body.prototype.initialize = function(particle) {
        var body = this.body.getValue();
        if (!!this.w) {
            particle.body = {
                width: this.w,
                height: this.h,
                body: body
            };
        } else {
            particle.body = body;
        }
    };

    Proton.Body = Body;
})(Proton);

