import React, { Component } from 'react';
import { array, bool, func, number, shape, string } from 'prop-types';

import { Stats } from './Stats';

export class Nebula extends Component {
  state = {
    width: 0,
    height: 0,
  };

  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();
    this.containerRef = React.createRef();
  }

  async componentDidMount() {
    // guards against nextjs errors for window being undefined on the server
    if (typeof window === 'undefined') {
      return;
    }

    this.setCanvasSize(async () => {
      const { canvas } = this;
      const { json, init, shouldRotateCamera } = this.props;

      if (json) {
        const { Renderer } = require('./Renderer/Json');

        this.renderer = await new Renderer({
          canvas,
          json,
          shouldRotateCamera,
        }).start();
      }

      if (init) {
        const { Renderer } = require('./Renderer/Procedural');

        this.renderer = await new Renderer({
          canvas,
          init,
          shouldRotateCamera,
        }).start();
      }

      window.addEventListener('resize', this.handleResize);
    });
  }

  componentWillUnmount() {
    const { renderer } = this;

    if (!renderer) {
      return;
    }

    renderer.stop();
    window.removeEventListener('resize', this.handleResize);
  }

  setCanvasSize(callback) {
    const { offsetWidth: width = 0, offsetHeight: height = 0 } =
      this.container || {};

    this.setState({ width, height }, callback);
  }

  handleResize = e => {
    const { renderer } = this;

    this.setCanvasSize(() => renderer && renderer.resize());
  };

  get canvas() {
    return this.canvasRef.current;
  }

  get container() {
    return this.containerRef.current;
  }

  render() {
    const { width, height } = this.state;
    const { shouldShowStats } = this.props;

    return (
      <div className="canvas-container" ref={this.containerRef}>
        {shouldShowStats && <Stats />}
        <canvas
          ref={this.canvasRef}
          className="canvas"
          width={width}
          height={height}
        />
      </div>
    );
  }
}

Nebula.defaultProps = {
  shouldRotateCamera: false,
  shouldShowStats: true,
};

Nebula.propTypes = {
  shouldRotateCamera: bool,
  shouldShowStats: bool,
  init: func,
  json: shape({
    headerState: shape({
      projectName: string,
    }),
    particleSystemState: shape({
      preParticles: number,
      integrationType: string,
      emitters: array,
    }),
  }),
};
