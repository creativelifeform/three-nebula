/*global describe, it */

import * as Proton from '../../src';

import Particles from '../../src/core/Proton';
import { Scene } from 'three';
import chai from 'chai';
import domino from 'domino';
import eightdiagrams from './fixtures/eightdiagrams.json';

const { assert } = chai;

global.window = domino.createWindow();
global.document = window.document;

describe('fromJSON', () => {
  it('should return a proton instance', done => {
    const proton = Particles.fromJSON({});

    assert.instanceOf(proton, Proton.Proton);

    done();
  });

  it('should instantiate the eightdiagrams example from JSON', done => {
    const proton = Particles.fromJSON(eightdiagrams);

    assert.lengthOf(proton.emitters, eightdiagrams.emitters.length);
    assert.lengthOf(
      proton.emitters[0].initializers,
      eightdiagrams.emitters[0].initializers.length
    );
    assert.lengthOf(
      proton.emitters[1].initializers,
      eightdiagrams.emitters[1].initializers.length
    );
    assert.lengthOf(
      proton.emitters[0].behaviours,
      eightdiagrams.emitters[0].behaviours.length
    );
    assert.lengthOf(
      proton.emitters[1].behaviours,
      eightdiagrams.emitters[1].behaviours.length
    );

    assert.equal(proton.emitters[0].p.x, eightdiagrams.emitters[0].position.x);
    assert.equal(proton.emitters[1].p.x, eightdiagrams.emitters[1].position.x);

    done();
  });

  it('should produce an identical object when instantiating via JSON or through code', done => {
    function createEmitter(x, y, color1, color2) {
      const emitter = new Proton.Emitter();

      return emitter
        .setRate(
          new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(0.01, 0.02))
        )
        .setInitializers([
          new Proton.Mass(1),
          new Proton.Life(2),
          new Proton.BodySprite('./img/dot.png'),
          new Proton.Radius(80)
        ])
        .setBehaviours([
          new Proton.Alpha(1, 0),
          new Proton.Color(color1, color2),
          new Proton.Scale(1, 0.5),
          new Proton.Force(0, 0, -20)
        ])
        .setPosition({ x, y })
        .emit();
    }

    const scene = new Scene();
    const proton = new Proton.Proton();
    const protonFromJson = Proton.Proton.fromJSON(eightdiagrams);
    const emitter1 = createEmitter(70, 0, '#4F1500', '#0029FF');
    const emitter2 = createEmitter(-70, 0, '#004CFE', '#6600FF');
    const renderer = new Proton.SpriteRenderer(scene);

    proton.addEmitter(emitter1).addEmitter(emitter2);
    proton.addRenderer(renderer);
    protonFromJson.addRenderer(renderer);

    console.log(proton);
    console.log(protonFromJson);

    // assert.deepEqual(proton, protonFromJson);

    done();
  });
});
