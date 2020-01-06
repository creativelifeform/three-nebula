import ParticleSystem, { SpriteRenderer } from 'three-nebula';

import json from './data';

export default async (three, { scene, camera }) => {
  const system = await ParticleSystem.fromJSONAsync(
    json.particleSystemState,
    three,
    { shouldAutoEmit: false }
  );

  system.addRenderer(new SpriteRenderer(scene, three)).emit({
    onStart: () => console.log('START'),
    onUpdate: () => console.log('UPDATE'),
    onEnd: () => console.log('END'),
  });

  return system;
};
