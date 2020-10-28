const sitemap = require('nextjs-sitemap-generator');

sitemap({
  baseUrl: 'https://three-nebula.org',
  pagesDirectory: __dirname + '/../pages',
  targetDirectory: 'public/',
  sitemapFilename: 'sitemap.xml',
  nextConfigPath: __dirname + '/../next.config.js',
  ignoredExtensions: ['png', 'jpg'],
});

console.log(`✅ sitemap.xml generated!`);
