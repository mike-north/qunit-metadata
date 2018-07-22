# qunit-metadata

Add metadata to your QUnit tests, with your choice of ES5, ES6 or TypeScript syntax

[![Build Status](https://travis-ci.org/mike-north/qunit-metadata.svg?branch=master)](https://travis-ci.org/mike-north/qunit-metadata)
[![Version](https://img.shields.io/npm/v/qunit-decorators.svg)](https://www.npmjs.com/package/qunit-metadata)

## Setup

### Step 1: Install

Install this library in your project. If you use npm
```sh
npm install --save-dev qunit-metadata
```
or if you use yarn
```sh
yarn add -D qunit-metadata
```

### Step 2: Enhance QUnit

Augment QUnit with metadata support

```js
import QUnit from 'qunit';
import qunitMetadata from 'qunit-metadata';

qunitMetadata(QUnit);

```

## Adding metadata to your tests

This library works well with [qunit-decorators](https://github.com/mike-north/qunit-decorators). Metadata can be added to suites or tests by passing arguments to the respective decorators 

```ts
import { suite, test } from 'qunit-decorators';

@suite('A description for my suite', { writtenBy: 'Mike' }/* <-- module metadata */)
class MyTests {

  @test('Make sure 1 is more than 0', { toRemove: true }/* <-- test metadata */)
  verifyOne(assert: Assert) {
    assert.ok(1 > 0, 'One should be more than zero');
  }
}

```

If you prefer to use this library without decorators, you are free to do so 
```js
import { module, test } from 'qunit';

module('A description for my suite')
  .meta({ writtenBy: 'Mike' });/* <-- module metadata */

test('Make sure 1 is more than 0', assert => {
  assert.ok(1 > 0, 'One should be more than zero');
}).meta({ toRemove: true });/* <-- test metadata */

```

or the more modern "nested" syntax

```js
import { module, test } from 'qunit';

module('A description for my suite', hooks => {
  
  test('Make sure 1 is more than 0', assert => {
    assert.ok(1 > 0, 'One should be more than zero');
  }).meta({ toRemove: true });/* <-- test metadata */

})
.meta({ writtenBy: 'Mike' });/* <-- module metadata */
```

## Retrieving Metadata

This library comes with a family of functions you can use to retrieve data

```ts
import {
  getAllModuleData,  // get information about a collection of modules
  getAllTestData,    // get information about a collection of tests
  getModuleData,     // get information about a single module
  getTestData        // get information about a single test
} from 'qunit-metadata';
```

All four of these functions take a single argument: an object that's used to describe the desired condition for the item or subset of interest using strings, regular expressions and/or predicates. You may filter on multiple properties if you wish

#### Example: Find all tests with metadata `{ toRemove: true }`
```ts
let testsToRemove = getAllTestData({
  meta: tst => tst.toRemove === true
});

```

#### Example: Find tests whose name contains the word "interesting"`
```ts
let testsToRemove = getAllTestData({
  name: /interesting/
});
```

#### Example: Find a module whose name is "Authentication tests"`
```ts
let testsToRemove = getAllModuleData({
  name: "Authentication tests"
});
```

### What does the data look like?

I plan to add more later, but for now it looks like

```ts
interface QUnitModuleDetails {
  moduleId: string;
  name: string;
  tests: QUnitTestDetails[];
  meta: { [k: string]: any };
}
interface QUnitTestDetails {
  module: string;
  name: string;
  testId: string;
  meta: { [k: string]: any };
}
```

## Copyright

(c) 2018 LinkedIn