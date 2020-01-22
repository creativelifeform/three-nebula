export default {
  _id: 0,
  _uids: {},
  getNewId: function() {
    return `PUID_${this._id++}`;
  },
  /**
   * Gets a numeric representation of the object's PUID.
   *
   * TODO COVERAGE
   * @return {integer}
   */
  getIndex: pooledItem => {
    if (!pooledItem.__puid) {
      return 0;
    }

    if (pooledItem.__poolIndex) {
      return pooledItem.__poolIndex;
    }

    return parseInt(pooledItem.__puid.replace('PUID_', ''), 0);
  },
  id: function(functionOrObject) {
    for (let id in this._uids) {
      if (this._uids[id] == functionOrObject) {
        return id;
      }
    }

    const newId = this.getNewId();

    this._uids[newId] = functionOrObject;

    return newId;
  },
};
