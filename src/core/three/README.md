# Three Dependencies

## Why?

This module exists to ensure that `three` is not shipped with `three-nebula`. Because this library requires the consumer to have `three` installed already, if we bundle it we will be increasing the bundle size by a large amount, which is unnecessary since we only need a few dependencies internally which cannot easily be passed in as arguments to constructors or regular functions.

## Version

The current version these classes have been pulled from is `r146`.

## Updating

In order to update this module, you will need to copy all the relevant files from the correct version of three. You shouldn't need more than what is already in this module.
