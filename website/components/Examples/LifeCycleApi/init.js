import ParticleSystem, { SpriteRenderer } from 'three-nebula';

import { feedbackRef } from './refs';
import json from './data';

export default async (three, { scene, camera }) => {
  const system = await ParticleSystem.fromJSONAsync(
    json.particleSystemState,
    three,
    { shouldAutoEmit: false }
  );

  system.addRenderer(new SpriteRenderer(scene, three)).emit({
    onStart: () => feedbackRef.component.setState({ hasStarted: true }),
    onUpdate: () => feedbackRef.component.setState({ isUpdating: true }),
    onEnd: () =>
      feedbackRef.component.setState({ hasEnded: true, isUpdating: false }),
  });

  return system;
};
