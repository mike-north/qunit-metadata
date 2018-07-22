// tslint:disable no-empty
import { suite, test } from 'qunit-decorators';
import md from 'qunit-metadata';

const MockQ = {
  module(..._args: any[]): any {},
  test(..._args: any[]): any {},
  todo(..._args: any[]): any {},
  skip(..._args: any[]): any {},
  // testDone(..._args: any[]): any {},
  // testStart(..._args: any[]): any {},
  // moduleDone(..._args: any[]): any {},
  // moduleStart(..._args: any[]): any {},
  // begin(..._args: any[]): any {},
  // done(..._args: any[]): any {},
  config: {
    current: {
      module: {
        name: 'fooModule',
        tests: [] as any[]
      }
    }
  }
};

const { unpatch } = md(MockQ);

@suite
class MetaFunctionsTest {
  @test
  moduleMeta(assert: Assert) {
    assert.equal(
      typeof MockQ.module('foo').meta,
      'function',
      'QUnit.module().meta'
    );
  }
  @test
  testMeta(assert: Assert) {
    assert.equal(
      typeof MockQ.test('foo', (a: Assert) => {
        a.ok(true);
      }).meta,
      'function',
      'QUnit.test().meta'
    );
  }
}
