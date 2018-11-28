### 2018-11-28

* Emitter’s `parent` property is actually the `Proton` instance, this is set in the `Proton.addEmitter` method
* I think the `initialize` naming convention should change to `properties` and this should become a sub module of `emitter`
* The `behaviour` module should also become a sub module of `emitter`
* The `Emitter` class is the one wiring up the particle event handlers that the renderers use