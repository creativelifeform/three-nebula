// three-nebula/webgpu — renderers that require three's WebGPURenderer.
//
// This entry pulls in node-material / TSL code (three/webgpu, three/tsl) which
// must NOT leak into the core WebGL bundle, so it is a separate subpath export.
//
//   import { GPURenderer } from 'three-nebula/webgpu';   // WebGPU host
//
export { default as GPURenderer } from './GPURenderer';
