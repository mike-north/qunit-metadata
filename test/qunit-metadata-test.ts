import { module, test } from 'qunit-decorators';
import hello from 'qunit-metadata';

@module
class FirstModule {
  @test
  helloTest(assert: Assert) {
    assert.equal(hello(), 'Hello from qunit-metadata');
  }
}
