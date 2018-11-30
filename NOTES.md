### 2018-12-01

- The `initialize` module is weird, you can initialize each one of the classes via calling the `init` method which has two arguments, `emitter` and `particle`... I'm not sure how it's supposed to work honestly, still delving deeper

### 2018-11-28

- Emitter’s `parent` property is actually the `Proton` instance, this is set in the `Proton.addEmitter` method
- I think the `initialize` naming convention should change to `properties` and this should become a sub module of `emitter`
- The `behaviour` module should also become a sub module of `emitter`
- The `Emitter` class is the one wiring up the particle event handlers that the renderers use
