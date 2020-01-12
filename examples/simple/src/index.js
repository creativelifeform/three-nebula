//import "./styles.css";
//import Visualization from "./Visualization.js";
//import init from "./example.js";

async function run() {
  const canvas = document.getElementById('canvas');
  const vis = await new Visualization({ canvas, init: threeNebulaExample });

  vis.start();
}

run();
