const content = {
  callout: {
    small: 'Download',
    large: 'See Examples',
  },
  home: {
    title: 'Three Nebula',
    text: 'A particle system engine for ',
  },
  guide: {
    items: [
      {
        title: 'Simple, Powerful API',
        text:
          'Choose from a wide variety of particle initializers & behaviors to create truly expressive, dynamic particle systems from textures or 3D objects',
      },
      {
        title: 'Loadable & Portable via JSON',
        text:
          'Load your entire system from a JSON object which you can easily share with others or modify for a fast and user friendly development feedback look',
      },
      {
        title: 'MIT Licensed',
        text:
          'Completely free and MIT licensed for you to fork and make changes to yourself, PRs welcome!',
      },
    ],
  },
};

const { home } = content;

export const pages = [home];

export default content;
