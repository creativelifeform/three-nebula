export const withoutTextureAtlas = shader =>
  shader
    .split('\n')
    .filter(e => !e.endsWith('//GPU'))
    .join('\n');
