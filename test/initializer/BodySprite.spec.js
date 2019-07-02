/*global describe, it */

import * as Nebula from '../../src';
import * as THREE from 'three';

import chai from 'chai';
import domino from 'domino';
import { getDefaultMaterialProperties } from '../../src/initializer/constants';
import sinon from 'sinon';

const { NormalBlending, TextureLoader } = THREE;
const DEFAULT_MATERIAL_PROPERTIES = getDefaultMaterialProperties(THREE);
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
    const bodySprite = new Nebula.BodySprite(THREE, texture);

    assert.equal(bodySprite.type, 'BodySprite');
    assert(textureLoaderSpy.calledOnceWith(texture));

    textureLoaderSpy.restore();

    done();
  });

  it('should construct the initializer from a JSON object and set the default blending mode', done => {
    const textureLoaderSpy = spy(TextureLoader.prototype, 'load');
    const instance = Nebula.BodySprite.fromJSON(THREE, {
      texture,
      materialProperties: {
        fog: false,
        color: 0xffff33,
      },
    });

    assert.instanceOf(instance, Nebula.BodySprite);
    assert.strictEqual(
      instance.materialProperties.blending,
      DEFAULT_MATERIAL_PROPERTIES.blending
    );
    assert(textureLoaderSpy.calledOnceWith(texture));
    assert.isTrue(instance.isEnabled);

    textureLoaderSpy.restore();

    done();
  });

  it('should set the material blending properties correctly when loaded from a JSON object', done => {
    const instance = Nebula.BodySprite.fromJSON(THREE, {
      texture,
      materialProperties: {
        fog: false,
        color: 0xffffff,
        blending: 'NormalBlending',
      },
    });

    assert.instanceOf(instance, Nebula.BodySprite);
    assert.strictEqual(instance.materialProperties.blending, NormalBlending);

    done();
  });
});
