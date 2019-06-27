# Three Dependencies

## Why?

This module exists to ensure that `three` ca is not shipped with `three-nebula`. Because this library requires the consumer to have `three` installed already, if we bundle it we will be increasing the bundle size by a large amount, which is totally unnecessary.

## Version

The current version these classes have been pulled from is `r106`.

## Update

In order to update this module, you will need to copy all the relevant files from the
