const content = {
  favicon: {
    title: 'Three Nebula',
    description: 'A WebGL-based 3D particle system engine for Three.js',
    url: 'https://three-nebula.org',
    twitterName: 'three-nebula',
    twitterImage: '',
  },
  callout: {
    small: 'Download',
    large: 'See Examples',
  },
  home: {
    title: 'Three Nebula',
    text: 'A WebGL-based 3D particle system engine for ',
  },
  features: {
    items: [
      {
        title: 'Simple, Powerful API',
        text:
          'Choose from a wide range of particle initializers and behaviors to create expressive, dynamic particle systems from textures or 3D objects.',
        link: {
          text: 'Get Started',
          href: 'https://codesandbox.io/s/three-nebula-quickstart-kz6uv',
        },
      },
      {
        title: 'Loadable & Portable via JSON',
        text:
          'Load your entire system from a JSON file, making it easy to share with others or tweak for a fast, user-friendly development workflow.',
        link: {
          text: 'Read the Docs',
          href: 'https://three-nebula-docs.netlify.app/',
        },
      },
      {
        title: 'MIT Licensed',
        text:
          'Released under the MIT License — fork it, modify it, and make it your own. Pull requests are welcome!',
        link: {
          text: 'View the Source',
          href: 'https://github.com/creativelifeform/three-nebula',
        },
      },
    ],
  },
  about: {
    title:
      "Comes with its own GUI so you don't have to design particle systems in code!",
    text: {
      items: [
        'A cross-platform GUI editor for Windows, macOS, and Linux that lets you visually design Three Nebula particle systems.',
        'Control every aspect of the API with an intuitive, user-friendly interface, then export your creations as JSON.',
      ],
    },
  },
  footer: {},
};

const { home } = content;

export const pages = [home];

export default content;
