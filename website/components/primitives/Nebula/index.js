import { JsonRenderer, ProceduralRenderer } from './renderer';
import React, { Component } from 'react';
import { array, bool, func, number, shape, string } from 'prop-types';

import { Stats } from './Stats';
import { ViewSource } from './ViewSource';

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
    this.setCanvasSize(async () => {
      const THREE = await import('three');
      const { canvas } = this;
      const { json, init, shouldRotateCamera } = this.props;

      // Prevents very odd bug where canvas is sometimes null.
      // No idea how this could happen inside componentDidMount
      if (!canvas) {
        return;
      }

      if (json) {
        this.renderer = await new JsonRenderer(THREE, {
          canvas,
          json,
          shouldRotateCamera,
        }).start();
      }

      if (init) {
        this.renderer = await new ProceduralRenderer(THREE, {
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
    const { shouldShowStats, srcHref } = this.props;

    return (
      <div className="canvas-container" ref={this.containerRef}>
        {shouldShowStats && <Stats />}
        {srcHref && <ViewSource href={srcHref} />}
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
  srcHref: string,
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
