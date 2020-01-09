import React, { Component } from 'react';

import { Nebula } from '../../primitives';
import { feedbackRef } from './refs';
import { getSrcHref } from '../utils';
import init from './init';

class Feedback extends Component {
  state = {
    hasStarted: false,
    isUpdating: false,
    hasEnded: false,
  };

  componentDidMount() {
    feedbackRef.component = this;
  }

  componentWillUnmount() {
    feedbackRef.component = null;
  }

  render() {
    const { hasStarted, isUpdating, hasEnded } = this.state;

    return (
      <ul className="LifeCycleApiFeedback">
        <li>
          {!hasStarted && (
            <span role="img" aria-label="cross-mark">
              ❌Started
            </span>
          )}
          {hasStarted && (
            <span role="img" aria-label="check-mark-button">
              ✅Started
            </span>
          )}
        </li>
        <li>
          {isUpdating && (
            <span role="img" aria-label="check-mark-button">
              ✅Updating
            </span>
          )}
          {!isUpdating && (
            <span role="img" aria-label="cross-mark">
              ❌Updating
            </span>
          )}
        </li>
        <li>
          {hasEnded && (
            <span role="img" aria-label="check-mark-button">
              ✅Ended
            </span>
          )}
          {!hasEnded && (
            <span role="img" aria-label="cross-mark">
              ❌Ended
            </span>
          )}
        </li>
      </ul>
    );
  }
}

export default () => (
  <Nebula srcHref={getSrcHref('LifeCycleApi/init.js')} init={init}>
    <Feedback />
  </Nebula>
);
