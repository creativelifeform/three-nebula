/*eslint no-prototype-builtins: 0*/

const THREE = window.THREE;

window.BufferGeometrySorter = function(frameSkip) {
  this.frameSkip = frameSkip || 0;
};

window.BufferGeometrySorter.prototype.sort = (function() {
  var distances = [],
    tmpPos = new THREE.Vector3(0, 0, 0),
    currFrame = 0; // This will result in the first frame getting sorted

  return function(bufferGeomAttributes, cameraPosition) {
    if (currFrame > 0) {
      if (currFrame > this.frameSkip) {
        // Render next frame
        currFrame = 0;
      } else {
        currFrame += 1;
      }

      return;
    }
    currFrame += 1;

    var attributes = bufferGeomAttributes,
      numPoints = attributes.position.count;

    for (let i = 0; i < numPoints; ++i) {
      tmpPos.set(
        attributes.position.array[i * 3],
        attributes.position.array[i * 3 + 1],
        attributes.position.array[i * 3 + 2]
      );

      distances[i] = [cameraPosition.distanceTo(tmpPos), i];
    }

    distances.sort(function(a, b) {
      return b[0] - a[0];
    });

    for (const val in attributes) {
      if (!attributes.hasOwnProperty(val)) {
        continue;
      }

      var itemSize = attributes[val].itemSize;
      var newArray = new Float32Array(itemSize * numPoints);

      for (let i = 0; i < numPoints; ++i) {
        const index = distances[i][1];

        for (var j = 0; j < itemSize; ++j) {
          const srcIndex = index * itemSize + j;
          const dstIndex = i * itemSize + j;

          newArray[dstIndex] = attributes[val].array[srcIndex];
        }
      }

      attributes[val].array = newArray;
      attributes[val].needsUpdate = true;
    }
  };
})();
