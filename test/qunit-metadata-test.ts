import { suite, test } from 'qunit-decorators';
import md from 'qunit-metadata';

const { unpatch } = md(QUnit);

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
