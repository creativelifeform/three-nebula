(function(Proton, undefined) {
    var THREEUtil = {
        toScreenPos: function() {
            var vector = new THREE.Vector3();

            return function(pos, camera, canvas) {
                vector.copy(pos);
                // map to normalized device coordinate (NDC) space
                vector.project(camera);
                // map to 2D screen space
                vector.x = Math.round((vector.x + 1) * canvas.width / 2);
                vector.y = Math.round((-vector.y + 1) * canvas.height / 2);
                vector.z = 0;

                return vector;
            }
        }(),

        toSpacePos: function() {
            var vector = new THREE.Vector3(),
                dir = new THREE.Vector3(),
                distance;

            return function(pos, camera, canvas) {
                vector.set((pos.x / canvas.width) * 2 - 1, -(pos.y / canvas.height) * 2 + 1, 0.5);
                vector.unproject(camera);

                dir.copy(vector.sub(camera.position).normalize());
                distance = -camera.position.z / dir.z;
                vector.copy(camera.position);
                vector.add(dir.multiplyScalar(distance));
                return vector;
            }
        }(),

        getTexture: function() {
            var store = {};

            return function(img) {
                if (img instanceof THREE.Texture) {
                    return img;
                } else if (typeof img == "string") {
                    var id = Proton.PUID.hash(img);
                    if (!store[id]) store[id] = new THREE.Texture(img);;
                    return store[id];
                } else if (img instanceof Image) {
                    var id = Proton.PUID.hash(img.src);
                    if (!store[id]) store[id] = new THREE.Texture(img);;
                    return store[id];
                }
            }
        }()
    };

    Proton.THREEUtil = THREEUtil;
})(Proton);
