import React from "react";

const date = new Date();

export default () => (
  <footer className="Footer">
    © <a href="http://creativelifeform.com">Creativelifeform</a>{" "}
    {date.getFullYear()}, Nebula is powered by the open source{" "}
    <a href="https://github.com/creativelifeform/three-nebula">three-nebula</a>{" "}
    particle engine.
  </footer>
);
