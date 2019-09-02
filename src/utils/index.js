export { default as ColorUtil } from './ColorUtil';
export { default as PUID } from './PUID';
export { default as THREEUtil } from './THREEUtil';
export { default as Util, shouldBeInfinite } from './Util';
export { default as uid } from './uid';

export const withDefaults = (defaults, properties) => ({
  ...defaults,
  ...properties,
});
