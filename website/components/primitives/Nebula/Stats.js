import React, { Component } from 'react';

import StatsJs from 'stats-js';

export const stats = typeof document === 'undefined' ? {} : new StatsJs();
export class Stats extends Component {
  componentDidMount() {
    this.node.appendChild(stats.dom);
  }

  componentWillUnmount() {
    this.node.removeChild(stats.dom);
  }

  get node() {
    return document.getElementById(this.id);
  }

  get id() {
    return 'stats';
  }

  render() {
    return <div id={this.id} />;
  }
}
