/*global describe, it */

import * as Proton from '../../src';

import Particles from '../../src/core/Proton';
import chai from 'chai';
import domino from 'domino';
import eightdiagramsAsync from './fixtures/json/eightdiagramsAsync.json';

const { expect } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('fromJSONAsync', () => {
  it('should instantiate the eightdiagramsAsync example', async () => {
    const proton = await Particles.fromJSONAsync(eightdiagramsAsync);

    console.log(proton);
  });
});
