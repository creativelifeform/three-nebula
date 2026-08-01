export default {
  _id: 0,
  _uids: new Map<unknown, string>(),
  getNewId: function (): string {
    return `PUID_${++this._id}`;
  },
  id: function (functionOrObject: unknown): string {
    if (this._uids.has(functionOrObject)) {
      return this._uids.get(functionOrObject) as string;
    }

    const newId = this.getNewId();

    this._uids.set(functionOrObject, newId);

    return newId;
  },
};
