(function(Proton, undefined) {
    var Util = Util || {
        initValue: function(value, defaults) {
            var value = (value != null && value != undefined) ? value : defaults;
            return value;
        },

        isArray: function(value) {
            return Object.prototype.toString.call(value) === '[object Array]';
        },

        destroyArray: function(array) {
            array.length = 0;
        },

        destroyObject: function(obj) {
            for (var o in obj) delete obj[o];
        },

        isUndefined: function() {
            for (var id in arguments) {
                var arg = arguments[id];
                if (arg !== undefined)
                    return false;
            }

            return true;
        },

        setVectorByObj: function(target, pOBJ) {
            if (pOBJ["x"] !== undefined) target.p.x = pOBJ["x"];
            if (pOBJ["y"] !== undefined) target.p.y = pOBJ["y"];
            if (pOBJ["z"] !== undefined) target.p.z = pOBJ["z"];

            if (pOBJ["vx"] !== undefined) target.v.x = pOBJ["vx"];
            if (pOBJ["vy"] !== undefined) target.v.y = pOBJ["vy"];
            if (pOBJ["vz"] !== undefined) target.v.z = pOBJ["vz"];

            if (pOBJ["ax"] !== undefined) target.a.x = pOBJ["ax"];
            if (pOBJ["ay"] !== undefined) target.a.y = pOBJ["ay"];
            if (pOBJ["az"] !== undefined) target.a.z = pOBJ["az"];

            if (pOBJ["p"] !== undefined) target.p.copy(pOBJ["p"]);
            if (pOBJ["v"] !== undefined) target.v.copy(pOBJ["v"]);
            if (pOBJ["a"] !== undefined) target.a.copy(pOBJ["a"]);

            if (pOBJ["position"] !== undefined) target.p.copy(pOBJ["position"]);
            if (pOBJ["velocity"] !== undefined) target.v.copy(pOBJ["velocity"]);
            if (pOBJ["accelerate"] !== undefined) target.a.copy(pOBJ["accelerate"]);
        },

        //set prototype
        setPrototypeByObj: function(target, proObj, filters) {
            for (var key in proObj) {
                if (target.hasOwnProperty(key)) {
                    if (filters) {
                        if (filters.indexOf(key) < 0) target[key] = Util._getValue(proObj[key]);
                    } else {
                        target[key] = Util._getValue(proObj[key]);
                    }
                }
            }

            return target;
        },

        _getValue: function(pan) {
            if (pan instanceof Span)
                return pan.getValue();
            else
                return pan;
        },

        inherits: function(subClass, superClass) {
            subClass._super_ = superClass;
            if (Object['create']) {
                subClass.prototype = Object.create(superClass.prototype, {
                    constructor: { value: subClass }
                });
            } else {
                var F = function() {};
                F.prototype = superClass.prototype;
                subClass.prototype = new F();
                subClass.prototype.constructor = subClass;
            }
        }
    };

    Proton.Util = Util;
})(Proton);
