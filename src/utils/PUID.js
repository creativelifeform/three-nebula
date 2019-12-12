export default {
  _id: 0,
  _uids: {},
  getNewId: function() {
    return `PUID_${this._id++}`;
  },
  id: function(functionOrObject) {
    if (this._uids.has(functionOrObject)) {
      return this._uids.get(functionOrObject);
    }

    const newId = this.getNewId();

    this._uids.set(functionOrObject, newId);

    return newId;
  },
};
