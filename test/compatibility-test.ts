import { suite, test } from 'qunit-decorators';
import './test-helpers';

@suite('QUnit compatibility')
class QUnitCompatibilityTests {
  @test('QUnit.config.current.module')
  configCurrentModule(assert: Assert) {
    assert.ok(QUnit.config.current.module, 'exists');
    assert.equal(
      QUnit.config.current.module.name,
      'QUnit compatibility',
      '.name property is correct'
    );
  }
  @test('QUnit.config.modules')
  modules(assert: Assert) {
    assert.ok((QUnit.config as any).modules, 'exists');
    assert.equal(
      typeof (QUnit.config as any).modules.indexOf,
      'function',
      'looks like an array'
    );
  }
  @test('QUnit.config.modules[0].tests')
  moduleTests(assert: Assert) {
    assert.ok((QUnit.config as any).modules[0].tests, 'exists');
    assert.equal(
      typeof (QUnit.config as any).modules[0].tests.indexOf,
      'function',
      'looks like an array'
    );
  }
  @test('QUnit.config.modules[0].tests[0]')
  moduleTest(assert: Assert) {
    assert.ok((QUnit.config as any).modules[0].tests[0], 'exists');
    assert.equal(
      typeof (QUnit.config as any).modules[0].tests[0].name,
      'string',
      'has a name that\'s a string'
    );
  }
}
