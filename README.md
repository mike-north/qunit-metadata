# qunit-metadata

Add metadata to your QUnit tests, with your choice of ES5, ES6 or TypeScript syntax

[![Build Status](https://travis-ci.org/mike-north/qunit-metadata.svg?branch=master)](https://travis-ci.org/mike-north/qunit-metadata)
[![Version](https://img.shields.io/npm/v/qunit-metadata.svg)](https://www.npmjs.com/package/qunit-metadata)

## Why might you want to use this library

Motivations for associating metadata with tests includes
* Running a subset of tests, which match a particular criteria
  * All acceptance tests, except those which involve mutating data
  * All tests that involve a particular UI component
  * (In a training workshop) all tests that are flagged with `level === 'beginner'`
* Gathering data on a subset of tests, before during or after a run
  * (In a training workshop) Attach `points: number` to tests in modules, and display the student's "score" based on how many tests their code passes
  * After a test run, storing elapsed time for each test to disk, for comparison against future test runs.

QUnit is very limited in terms of being able to attach some of these kinds of data to tests in a sustainable way. The best you can do is apply something like a hashtag, or invent your own microsyntax (all of which would be placed in the test/module titles). This library appends custom metadata as a JavaScript object to QUnit's own data structures, allowing for greater flexibility and maintainability.

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
  meta: { [k: string]: any };
  moduleId: string;
  name: string;
  parentModule: string;
  skip?: boolean;
  stats?: { all: number, bad: number, started: number};
  suiteReport?: SuiteReport;
  tests: QUnitTestDetails[];
  testsRun?: number;
  unskippedTestsRun?: number;
}

interface QUnitTestDetails {
  meta: { [k: string]: any };
  module: string;
  name: string;
  testId: string;
}

interface SuiteReport {
  fullName: string[];
  name: string;
  tests: TestReport[];
}

interface TestReport {
  assertions: AssertionReport[];
  fullName: string[];
  name: string;
  runtime: number;
  skipped: boolean;
  todo: boolean;
  valid: boolean;
}

interface AssertionReport {
  message: string;
  passed: boolean;
  todo: boolean;
}
```

## Copyright

(c) 2018 LinkedIn