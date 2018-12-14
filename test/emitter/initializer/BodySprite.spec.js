/*global describe, it */

import * as Proton from '../../../src';

import { Sprite, SpriteMaterial, Texture } from 'three';

import chai from 'chai';
import domino from 'domino';

const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('initializer -> BodySprite', () => {
  const texture = '../fixtures/dot.png';

  it('should have the correct properties after instantiation', done => {
    const bodySprite = new Proton.BodySprite(texture);

    assert.instanceOf(bodySprite.texture, Texture);
    assert.instanceOf(bodySprite.material, SpriteMaterial);
    assert.instanceOf(bodySprite.sprite, Sprite);
    assert.deepEqual(bodySprite.material.map, bodySprite.texture);

    done();
  });

  it('should set the particle body to the sprite when initializing', done => {
    const particle = new Proton.Particle();
    const bodySprite = new Proton.BodySprite(texture);

    bodySprite.initialize(particle);

    assert.deepEqual(particle.body, bodySprite.sprite);

    done();
  });

  it('should construct the initializer from a JSON object', done => {
    const instance = Proton.BodySprite.fromJSON({
      texture,
      materialProperties: {
        fog: false,
        color: 0xffffff
      }
    });

    assert.instanceOf(instance, Proton.BodySprite);
    assert.instanceOf(instance.texture, Texture);
    assert.instanceOf(instance.material, SpriteMaterial);
    assert.isFalse(instance.material.fog);
    assert.deepEqual(Object.values(instance.material.color), [1, 1, 1]);
    assert.instanceOf(instance.sprite, Sprite);
    assert.deepEqual(instance.material.map, instance.texture);

    done();
  });
});
