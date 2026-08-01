import PUID from '../utils/PUID';
import { CORE_TYPE_POOL as type } from './types';

// A pooled object carries a `__puid` tag and may be cloneable.
interface Poolable {
  __puid?: string;
  clone?: () => Poolable;
}

/**
 * An object pool implementation. Used for pooling objects to avoid unnecessary
 * garbage collection.
 */
export default class Pool {
  type: string;
  cID: number;
  list: Record<string, Poolable[]>;

  constructor() {
    this.type = type;
    this.cID = 0;
    this.list = {};
  }

  /**
   * Attempts to create a new object either by creating a new instance or calling
   * its clone method.
   */
  create(functionOrObject: unknown, ...constructorArgs: unknown[]): unknown {
    if (!this.canCreateNewObject(functionOrObject)) {
      throw new Error(
        'The pool is unable to create or clone the object supplied'
      );
    }

    this.cID++;

    if (this.canInstantiateObject(functionOrObject)) {
      return new (functionOrObject as new (...args: unknown[]) => unknown)(
        ...constructorArgs
      );
    }

    if (this.canCloneObject(functionOrObject)) {
      return (functionOrObject as Poolable).clone!();
    }
  }

  /**
   * Determines if the object is able to be instantiated or not.
   */
  canInstantiateObject(object: unknown): boolean {
    return typeof object === 'function';
  }

  /**
   * Determines if the object is able to be cloned or not.
   */
  canCloneObject(object: unknown): boolean {
    const clone = (object as Poolable).clone;

    return Boolean(clone) && typeof clone === 'function';
  }

  /**
   * Determines if a new object is able to be created.
   */
  canCreateNewObject(object: unknown): boolean {
    return this.canInstantiateObject(object) || this.canCloneObject(object)
      ? true
      : false;
  }

  /**
   * Gets a count of all objects in the pool.
   */
  getCount(): number {
    var count = 0;

    for (var id in this.list) count += this.list[id].length;

    return count++;
  }

  /**
   * Gets an object either by creating a new one or retrieving it from the pool.
   * The pooled object is either constructed from `obj` (when it is a class) or a
   * clone of `obj`; either way the result is a `T`, so callers no longer cast.
   */
  get<T>(obj: (new (...args: never[]) => T) | T, ...args: unknown[]): T {
    var p,
      puid = (obj as Poolable).__puid || PUID.id(obj);

    if (this.list[puid] && this.list[puid].length > 0)
      p = this.list[puid].pop();
    else p = this.create(obj, ...args);

    (p as Poolable).__puid = (obj as Poolable).__puid || puid;

    return p as T;
  }

  /**
   * Pushes an object into the pool.
   */
  expire(obj: unknown): number {
    return this._getList((obj as Poolable).__puid).push(obj as Poolable);
  }

  /**
   * Destroys all pools.
   */
  destroy(): void {
    for (var id in this.list) {
      this.list[id].length = 0;
      delete this.list[id];
    }
  }

  /**
   * Gets the pool mapped to the UID.
   */
  _getList(uid?: string): Poolable[] {
    uid = uid || 'default';
    if (!this.list[uid]) this.list[uid] = [];

    return this.list[uid];
  }
}
