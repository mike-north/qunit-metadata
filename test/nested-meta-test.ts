
QUnit.module('Nested tests work with metadata', (_hooks: NestedHooks) => {
  QUnit.test('test with no metadata', assert => assert.ok(true));
  QUnit.test('test with some metadata', assert => assert.ok(true)).meta({month: 'November'});

  QUnit.test('module metadata ends up in the right place', assert => {
    let mods: any = (QUnit.config as any).modules;
    let matches = mods.filter((m: any) => m.meta && m.meta.year);
    assert.equal(matches.length, 1, 'One module with metadata { year }');
    assert.propEqual(matches[0].meta, { year: 1999 }, 'Metadata is an exact match');
  });
}).meta({ year: 1999 });
