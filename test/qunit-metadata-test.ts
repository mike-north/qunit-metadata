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
class InstallTest {
  @test
  apiSurfaceExists(assert: Assert) {
    assert.ok(md, 'Default export exists');
    assert.equal(typeof md, 'function', 'Default export is a function');
    assert.ok(unpatch, 'unpatch exists');
    assert.equal(typeof unpatch, 'function', 'unpatch is a function');
  }
}
