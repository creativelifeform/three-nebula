import React, { Component } from 'react';

export default class Canvas extends Component {
  state = {
    width: 100,
    height: 100,
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

    const { offsetWidth: width = 0, offsetHeight: height = 0 } =
      this.container || {};

    this.setState({ width, height }, async () => {
      const { Visualisation } = require('./Visualisation');

      this.visualisation = await new Visualisation(this.canvas).start();

      window.addEventListener('resize', this.handleResize);
    });
  }

  componentWillUnmount() {
    const { visualisation } = this;

    visualisation && visualisation.stop();
  }

  handleResize = e => {
    const { visualisation } = this;

    visualisation && visualisation.resize();
  };

  get canvas() {
    return this.canvasRef.current;
  }

  get container() {
    return this.containerRef.current;
  }

  render() {
    const { width, height } = this.state;

    return (
      <div
        ref={this.containerRef}
        style={{ width: '100%', height: 250, position: 'relative' }}
      >
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
