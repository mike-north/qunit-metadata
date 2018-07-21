import { suite, test } from 'qunit-decorators';

@suite
class MetaFunctionsTest {
  @test
  moduleMeta(assert: Assert) {
    assert.equal(typeof QUnit.module('foo').meta, 'function', 'QUnit.module().meta');
  }
  @test
  testMeta(assert: Assert) {
    assert.equal(typeof QUnit.test('foo', a => {
      a.ok(true);
    }).meta, 'function', 'QUnit.test().meta');
  }
}
