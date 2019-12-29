# Three Nebula Website

This is source code for the [`three-nebula`](https://github.com/creativelifeform/three-nebula) website. It's been built with [`next.js`](https://github.com/zeit/next.js), so please check their docs before opening issues.

## Parallel Development

In order to develop the `three-nebula` source code and the website in parallel with all the live update goodness, you just need to do three things.

1. Open two terminal windows/tabs
2. In the first tab, run the following commands

```
cd /path/to/three-nebula
npm run dev
```

3. Now from the second tab run these commands

```
cd /path/to/three-nebula/website
npm run link-src && npm run dev
```

This will make sure that changes to `three-nebula/src` will appear in `three-nebula/website` in dev mode.

Just visit `http://localhost:3000` and start hacking!
