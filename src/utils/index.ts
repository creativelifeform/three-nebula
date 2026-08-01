export { default as ColorUtil } from './ColorUtil';
export { default as PUID } from './PUID';
export { default as THREEUtil } from './THREEUtil';
export { default as Util } from './Util';
export { default as uid } from './uid';

export const withDefaults = <D extends object, P extends object>(
  defaults: D,
  properties: P
): D & P => ({
  ...defaults,
  ...properties,
});
