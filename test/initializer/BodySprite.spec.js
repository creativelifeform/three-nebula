/*global describe, it */

import * as Proton from '../../src';

import { TextureLoader } from 'three';
import chai from 'chai';
import domino from 'domino';
import sinon from 'sinon';

const { assert } = chai;
const { spy } = sinon;

global.window = domino.createWindow();
global.document = window.document;

// NOTE This spec is a bit challenging because it seems like for some reason when testing with node
// the TextureLoader's callback method never gets entered.

describe('initializer -> BodySprite', () => {
  const texture = '../fixtures/dot.png';

  it('should set the type and call the TextureLoader.load method passing the texture on instantiation', done => {
    const textureLoaderSpy = spy(TextureLoader.prototype, 'load');
    const bodySprite = new Proton.BodySprite(texture);

    assert.equal(bodySprite.type, 'BodySprite');
    assert(textureLoaderSpy.calledOnceWith(texture));

    textureLoaderSpy.restore();

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const textureLoaderSpy = spy(TextureLoader.prototype, 'load');
    const instance = Proton.BodySprite.fromJSON({
      texture,
      materialProperties: {
        fog: false,
        color: 0xffffff,
      },
    });

    assert.instanceOf(instance, Proton.BodySprite);
    assert(textureLoaderSpy.calledOnceWith(texture));
    assert.isTrue(instance.isEnabled);

    textureLoaderSpy.restore();
    done();
  });
});
