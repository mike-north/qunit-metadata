import './test-helpers';

QUnit.module('A module with metadata').meta({ difficulty: 3 });

QUnit.test('A test without meta', assert => {
  assert.ok(true);
});

QUnit.test('A test with meta', assert => {
  assert.ok(true);
}).meta({ points: 999 });

QUnit.test('Module metadata ends up on QUnit state', assert => {
  const { modules } = (QUnit.config as any);
  const mods = modules.filter((m: any) => m.name === 'A module with metadata');
  assert.equal(mods.length, 1, 'Only one module of this name is found');
  const [ mod ] = mods;
  assert.ok(mod, 'module found');
  assert.equal(typeof mod.meta, 'object', 'metadata object exists on module');
  assert.equal(typeof mod.meta.difficulty, 'number', 'meta.difficulty is a number');
  assert.equal(mod.meta.difficulty, 3, 'meta.difficulty is 3');
});

QUnit.test('Test metadata ends up on QUnit state', assert => {
  const { modules } = (QUnit.config as any);
  const mods = modules.filter((m: any) => m.name === 'A module with metadata');
  assert.equal(mods.length, 1, 'Only one module of this name is found');
  const [ mod ] = mods;
  assert.ok(mod, 'module found');
  const tests = mod.tests.filter((t: any) => t.name === 'A test with meta');
  assert.equal(tests.length, 1, 'Only one test of this name is found');
  const [ tst ] = tests;
  assert.equal(typeof tst.meta, 'object', 'metadata object exists on test');
  assert.equal(typeof tst.meta.points, 'number', 'meta.points is a number');
  assert.equal(tst.meta.points, 999, 'meta.points is 999');
});
