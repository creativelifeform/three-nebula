var configArr = ["../lib/domReady"];
var configObj = { baseUrl: "../src/" };
var shim = {};

var paths = {
    "Proton": "core/Proton",
    "EventDispatcher": "events/EventDispatcher",
    "Util": "utils/Util",
    "PUID": "utils/PUID",
    "ColorUtil": "utils/ColorUtil",
    "THREEUtil": "utils/THREEUtil",
    "Particle": "core/Particle",
    "Pool": "core/Pool",

    "MathUtils": "math/MathUtils",
    "Integration": "math/Integration",
    "Vector3D": "math/Vector3D",
    "Polar3D": "math/Polar3D",
    "Quaternion": "math/Quaternion",
    "Span": "math/Span",
    "ArraySpan": "math/ArraySpan",
    "Behaviour": "behaviour/Behaviour",

    "Rate": "initialize/Rate",
    "Initialize": "initialize/Initialize",
    "InitializeUtil": "initialize/InitializeUtil",
    "Life": "initialize/Life",
    "Position": "initialize/Position",
    "Velocity": "initialize/Velocity",
    "Mass": "initialize/Mass",
    "Radius": "initialize/Radius",
    "Body": "initialize/Body",

    "Force": "behaviour/Force",
    "Attraction": "behaviour/Attraction",
    "RandomDrift": "behaviour/RandomDrift",
    "Repulsion": "behaviour/Repulsion",
    "Gravity": "behaviour/Gravity",
    "Collision": "behaviour/Collision",
    "CrossZone": "behaviour/CrossZone",
    "Alpha": "behaviour/Alpha",
    "Scale": "behaviour/Scale",
    "Rotate": "behaviour/Rotate",
    "Color": "behaviour/Color",
    "Spring": "behaviour/Spring",

    "Emitter": "emitter/Emitter",
    "BehaviourEmitter": "emitter/BehaviourEmitter",
    "FollowEmitter": "emitter/FollowEmitter",

    "ease": "ease/ease",

    "BaseRender": "render/BaseRender",
    "MeshRender": "render/MeshRender",
    "SpriteRender": "render/SpriteRender",
    "CustomRender": "render/CustomRender",

    "Zone": "zone/Zone",
    "LineZone": "zone/LineZone",
    "SphereZone": "zone/SphereZone",
    "PointZone": "zone/PointZone",
    "BoxZone": "zone/BoxZone",
    "ScreenZone": "zone/ScreenZone",
    "MeshZone": "zone/MeshZone",

    "log": "debug/log",
    "Debug": "debug/Debug"
}

for (var index in paths) {
    configArr.push(index);

    //*****************Proton*****************//
    if (index == "Proton") {
        shim[index] = {
            exports: "Proton"
        };
    }
    //*****************math*****************//
    else if (index == "Span") {
        shim[index] = {
            deps: ["Proton", "MathUtils"]
        };
    } else if (index == "ArraySpan" || index == "SpanAB") {
        shim[index] = {
            deps: ["Proton", "Util", "Span"]
        };
    } else if (index == "Polar3D") {
        shim[index] = {
            deps: ["Proton", "Vector3D"]
        };
    } else if (index == "Integration") {
        shim[index] = {
            deps: ["Proton", "Util"]
        };
    }
    //*****************util*****************//
    else if (index == "Util") {
        shim[index] = {
            deps: ["Proton", "Vector3D"]
        };
    }
    //*****************core*****************//
    else if (index == "Particle") {
        shim[index] = {
            deps: ["Proton", "Vector3D", "Util"]
        };
    } else if (index == "ParticlePool") {
        shim[index] = {
            deps: ["Proton", "Particle"]
        };
    }
    //*****************emitter*****************//
    else if (index == "Emitter") {
        shim[index] = {
            deps: ["Proton", "InitializeUtil", "Util", "EventDispatcher", "Particle", "Rate"]
        };
    } else if (index == "BehaviourEmitter" || index == "FollowEmitter") {
        shim[index] = {
            deps: ["Proton", "Util", "Emitter"]
        };
    }
    //*****************initialize*****************//
    else if (index == "InitializeUtil") {
        shim[index] = {
            deps: ["Proton", "Util"]
        };
    } else if (index == "Initialize") {
        shim[index] = {
            deps: ["Proton", "InitializeUtil"]
        };
    } else if (index == "Color" || index == "Radius" || index == "Life" || index == "Mass" || index == "Position" || index == "Rate" || index == "Body") {
        shim[index] = {
            deps: ["Proton", "Util", "Initialize", "ColorUtil"]
        };
    } else if (index == "Velocity") {
        shim[index] = {
            deps: ["Proton", "Util", "Initialize", "Vector3D"]
        };
    } else if (index == "Spring") {
        shim[index] = {
            deps: ["Proton", "Util", "Initialize"]
        };
    }
    
    //*****************behaviour*****************//
    else if (index == "Behaviour") {
        shim[index] = {
            deps: ["Proton", "Util"]
        };
    } else if (index == "CrossZone" || index == "Attraction" || index == "Collision" || index == "Force" || index == "CrossZone" || index == "RandomDrift" || index == "Scale" || index == "Alpha" || index == "Rotate") {
        shim[index] = {
            deps: ["Proton", "Util", "Behaviour", "Vector3D"]
        };
    } else if (index == "Gravity") {
        shim[index] = {
            deps: ["Proton", "Util", "Force"]
        };
    } else if (index == "Repulsion") {
        shim[index] = {
            deps: ["Proton", "Util", "Attraction"]
        };
    }
    //*****************zone*****************//
    else if (index == "Zone") {
        shim[index] = {
            deps: ["Proton", "Vector3D", "THREEUtil"]
        };
    } else if (index == "SphereZone" || index == "LineZone" || index == "PointZone" || index == "ScreenZone" || index == "MeshZone" || index == "BoxZone") {
        shim[index] = {
            deps: ["Proton", "Util", "Zone"]
        };
    }
    //*****************render*****************//
    else if (index == "BaseRender") {
        shim[index] = {
            deps: ["Proton", "Util"]
        };
    } else if (index == "MeshRender") {
        shim[index] = {
            deps: ["Proton", "Util", "BaseRender"]
        };
    } else if (index == "SpriteRender") {
        shim[index] = {
            deps: ["MeshRender"]
        };
    } else if (index == "CustomRender") {
        shim[index] = {
            deps: ["Proton", "Util", "BaseRender"]
        };
    } else if (index == "Debug") {
        shim[index] = {
            deps: ["Proton", "Util"]
        };
    } else {
        //EventDispatcher\Vector3D\MathUtils\BaseRender\Rectangle\all-plus
        shim[index] = {
            deps: ["Proton"]
        };
    }
}

configObj.paths = paths;
configObj.shim = shim;
configObj.out = 'Proton.js';
configObj.urlArgs = 'bust=' + Math.random();
require.config(configObj);
require(configArr, function(domReady, Proton) {
    domReady(function() {
        init(Proton);
    });
});
