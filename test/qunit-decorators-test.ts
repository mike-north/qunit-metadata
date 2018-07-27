import { suite, test } from 'qunit-decorators';
import { AugmentedQunitConfig } from './types';

@suite('Test of qunit-decorators', { tokens: 14 })
class DecoratorsTest {
  @test('test that suite metadata is stored properly', { tea: 'oolong' })
  moduleMetadataStorageTest(a: Assert) {
    let mods: any = (QUnit.config as any).modules;
    let matches = mods.filter((m: any) => m.meta && m.meta.tokens);
    a.equal(matches.length, 1, 'One module found with {tokens} in metadata');
    a.propEqual(matches[0].meta, { tokens: 14 }, 'Metadata is an exact match');
  }
  @test('test that test metadata is stored properly', { beverage: 'water' })
  testMetadataStorageTest(a: Assert) {
    let mods: any = (QUnit.config as AugmentedQunitConfig).modules.filter(
      (m: any) => m.name === 'Test of qunit-decorators'
    );
    a.equal(mods.length, 1, 'One module found with this module\'s title');
    let [mod] = mods;
    let matches = mod.tests.filter((t: any) => t.meta && t.meta.beverage);
    a.equal(matches.length, 1, 'One test found with metadata key { beverage }');
    let [tst] = matches;
    a.propEqual(tst.meta, { beverage: 'water' }, 'Metadata is an exact match');
  }
}
