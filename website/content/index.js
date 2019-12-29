const content = {
  callout: {
    small: 'Download',
    large: 'See Examples',
  },
  home: {
    title: 'three-nebula',
    text: 'A lightweight, modular and powerful particle system engine for ',
  },
  features: {
    items: [
      {
        title: 'Simple, Powerful API',
        text:
          'Choose from a wide variety of particle initializers & behaviors to create truly expressive, dynamic particle systems from textures or 3D objects.',
      },
      {
        title: 'Loadable & Portable via JSON',
        text:
          'Load your entire system from a JSON object which you can easily share with others or modify for a fast and user friendly development feedback loop.',
      },
      {
        title: 'MIT Licensed',
        text:
          'MIT licensed for you to fork and make changes to yourself, PRs welcome!',
      },
    ],
  },
  about: {
    title:
      "Comes with it's own GUI so you don't have to design your particle systems in code!",
    text: {
      items: [
        ' is a GUI/editor for Windows, Mac and Linux which allows you fully design three-nebula particle systems, visually.',
        'Control all aspects of the API with an intuitive, user friendly interface, then simply export your creations as JSON',
      ],
    },
  },
  footer: {},
};

const { home } = content;

export const pages = [home];

export default content;
