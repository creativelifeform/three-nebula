import PUID from '../utils/PUID';
import { CORE_TYPE_POOL as type } from './types';
/**
 * An object pool implementation. Used for pooling objects to avoid unnecessary
 * garbage collection.
 *
 */
export default class Pool {
  /**
   * Constructs a Pool instance.
   *
   * @return void
   */
  constructor() {
    /**
     * @desc The class type.
     * @type {string}
     */
    this.type = type;
    /**
     * @desc Incrementing id that keeps a count of the number of objects created
     * @type {integer}
     */
    this.cID = 0;

    /**
     * @desc Map of pools in the format of PUID<String>: pool<Array>
     * @type {object}
     */
    this.list = {};
  }

  /**
   * Attempts to create a new object either by creating a new instance or calling its
   * clone method.
   *
   * NOTE If unable to create an object this method will simply return undefined
   * it should possibly throw an error in this case.
   *
   * @param {function|object} functionOrObject - The object to instantiate or clone
   * @return {object|undefined}
   */
  create(functionOrObject) {
    if (!this.canCreateNewObject(functionOrObject)) {
      // TODO throw an error here
      return;
    }

    this.cID++;

    if (this.canInstantiateObject(functionOrObject)) {
      return new functionOrObject();
    }

    if (this.canCloneObject(functionOrObject)) {
      return functionOrObject.clone();
    }
  }

  /**
   * Determines if the object is able to be instantiated or not.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canInstantiateObject(object) {
    return typeof object === 'function';
  }

  /**
   * Determines if the object is able to be cloned or not.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canCloneObject(object) {
    return object.clone && typeof object.clone === 'function';
  }

  /**
   * Determines if a new object is able to be created.
   *
   * @param {object} object - The object to check
   * @return {boolean}
   */
  canCreateNewObject(object) {
    return this.canInstantiateObject(object) || this.canCloneObject(object)
      ? true
      : false;
  }

  /**
   * Gets a count of all objects in the pool.
   *
   * @return {integer}
   */
  getCount() {
    var count = 0;

    for (var id in this.list) count += this.list[id].length;

    return count++;
  }

  /**
   * Gets an object either by creating a new one or retrieving it from the pool.
   *
   * @param {function|object} obj - The function or object to get
   * @return {object}
   */
  get(obj) {
    var p,
      puid = obj.__puid || PUID.id(obj);

    if (this.list[puid] && this.list[puid].length > 0)
      p = this.list[puid].pop();
    else p = this.create(obj);

    p.__puid = obj.__puid || puid;

    return p;
  }

  /**
   * Pushes an object into the pool.
   *
   * @param {object} obj - The object to expire
   * @return {integer}
   */
  expire(obj) {
    return this._getList(obj.__puid).push(obj);
  }

  /**
   * Destroys all pools.
   *
   * @return void
   */
  destroy() {
    for (var id in this.list) {
      this.list[id].length = 0;
      delete this.list[id];
    }
  }

  /**
   * Gets the pool mapped to the UID.
   *
   * @param {string} uid - The pool uid
   * @return {array}
   */
  _getList(uid) {
    uid = uid || 'default';
    if (!this.list[uid]) this.list[uid] = [];

    return this.list[uid];
  }
}
