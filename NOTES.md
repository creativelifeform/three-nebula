### 2018-12-01

- The `initialize` module is weird, you can initialize each one of the classes via calling the `init` method which has two arguments, `emitter` and `particle`... I'm not sure how it's supposed to work honestly, still delving deeper
- Okay so, after looking further into it, I think I've got it. It's called `initialize` because these classes setup initial particle properties such as the particle body, its life, its mass, etc., They get added to an initializers array within the emitter, then whenever a particle is created, each initializer's `initialize` method is run on that particle. After this, behaviours control what the particle does.
- So based on this, it doesn't make sense to change the name of the module to `properties`. However, it would be good to change the module name from `initialize` to `initializer`. It's making more sense to have a `particle` module I think

### 2018-11-28

- Emitter’s `parent` property is actually the `Proton` instance, this is set in the `Proton.addEmitter` method
- I think the `initialize` naming convention should change to `properties` and this should become a sub module of `emitter`
- The `behaviour` module should also become a sub module of `emitter`
- The `Emitter` class is the one wiring up the particle event handlers that the renderers use
