import { suite, test } from 'qunit-decorators';
import {
  getAllModuleData,
  getAllTestData,
  getModuleData,
  getTestData
} from 'qunit-metadata';

@suite({ pencil: 'mechanical' })
class DataRetrivalTests {
  @test('getTestData - by id', { marker: 'sharpie' })
  getTestDataById(a: Assert) {
    const tst = (QUnit.config as any).modules.reduce(
      (acc: any, m: any) => {
        return acc.concat(
          m.tests.filter((t: any) => t.meta && t.meta.marker === 'sharpie')
        );
      },
      [] as any[]
    )[0];
    let data = getTestData({ testId: tst.testId as string });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.equal(data.name, tst.name);
  }

  @test('getModuleData - by id   #purple')
  getModuleDataById(a: Assert) {
    const mod = (QUnit.config as any).modules.filter(
      (m: any) => m.meta && m.meta.pencil === 'mechanical'
    )[0];
    let data = getModuleData({ moduleId: mod.moduleId });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.equal(data.name, mod.name);
  }

  @test('getModuleData - name w/ RegExp')
  getModuleDataByNameRegexp(a: Assert) {
    const mod = (QUnit.config as any).modules.filter(
      (m: any) => m.meta && m.meta.pencil === 'mechanical'
    )[0];
    let data = getModuleData({ name: /ecorators/ });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.ok(data.name.indexOf('ecorators') >= 0, 'Correct module found');
  }

  @test('getTestData - by name w/ RegExp')
  getTestDataByNameRegExp(a: Assert) {
    const tst = (QUnit.config as any).modules.reduce(
      (acc: any, m: any) => {
        return acc.concat(
          m.tests.filter((t: any) => t.meta && t.meta.marker === 'sharpie')
        );
      },
      [] as any[]
    )[0];
    let data = getTestData({ name: /#purple/ });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.ok(data.name.indexOf('#purple') >= 0, 'Correct test was found');
  }

  @test('getModuleData - by metadata predicate')
  getModuleDataByMetaFilter(a: Assert) {
    const mod = (QUnit.config as any).modules.filter(
      (m: any) => m.meta && m.meta.pencil === 'mechanical'
    )[0];
    let data = getModuleData({
      meta: m => m && m.pencil === 'mechanical'
    });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.equal(data.name, mod.name);
  }

  @test('getTestData - by metadata predicate')
  getTestDataByMetaFilter(a: Assert) {
    const tst = (QUnit.config as any).modules.reduce(
      (acc: any, m: any) => {
        return acc.concat(
          m.tests.filter((t: any) => t.meta && t.meta.marker === 'sharpie')
        );
      },
      [] as any[]
    )[0];
    let data = getTestData({
      meta: m => m && m.marker === 'sharpie'
    });
    a.ok(data, 'it returns data');
    if (data === null) return; // never happens while tests pass, but makes TS happy
    a.equal(data.name, tst.name);
  }

  @test
  getAllModuleDataNoArgs(a: Assert) {
    const allModules = getAllModuleData();
    a.ok(allModules, 'returned something truthy');
    a.ok(allModules instanceof Array, 'looks like it returned an array');
    a.ok(allModules.length > 3, 'the array has a few things in it');
    a.ok(allModules[0].name, 'the first item has a name property');
    a.ok(
      allModules[0].tests instanceof Array,
      'the first item has a tests[] property'
    );
    a.equal(
      typeof allModules[0].meta,
      'object',
      'the first item has a meta{} property'
    );
  }

  @test
  getAllTestDataNoArgs(a: Assert) {
    const allTests = getAllTestData();
    a.ok(allTests, 'returned something truthy');
    a.ok(allTests instanceof Array, 'looks like it returned an array');
    a.ok(allTests.length > 3, 'the array has a few things in it');
    a.ok(allTests[0].name, 'the first item has a name property');
    a.equal(
      typeof allTests[0].testId,
      'string',
      'the first item has a testId property'
    );
    a.equal(
      typeof allTests[0].meta,
      'object',
      'the first item has a meta{} property'
    );
  }

  @test
  getAllModuleDataWithFilter(a: Assert) {
    const allModules = getAllModuleData();
    const someModules = getAllModuleData({
      meta: m => m && m.pencil === 'mechanical'
    });
    a.ok(someModules, 'returned something truthy');
    a.ok(someModules instanceof Array, 'looks like it returned an array');
    a.equal(someModules.length, 1, 'the array has a 1 thing in it');
    a.ok(someModules[0].name, 'the first item has a name property');
    a.ok(
      someModules[0].tests instanceof Array,
      'the first item has a tests[] property'
    );
    a.equal(
      typeof someModules[0].meta,
      'object',
      'the first item has a meta{} property'
    );
    a.ok(
      someModules.length < allModules.length,
      'the filtered set is samller than the full set of modules'
    );
  }

  @test
  getAllTestDataWithFilter(a: Assert) {
    const allTests = getAllTestData();
    const someTests = getAllTestData({
      meta: m => m && m.marker === 'sharpie'
    });
    a.ok(someTests, 'returned something truthy');
    a.ok(someTests instanceof Array, 'looks like it returned an array');
    a.equal(someTests.length, 1, 'the array has one thing in it');
    a.ok(someTests[0].name, 'the first item has a name property');
    a.equal(
      typeof someTests[0].testId,
      'string',
      'the first item has a testId property'
    );
    a.equal(
      typeof someTests[0].meta,
      'object',
      'the first item has a meta{} property'
    );
  }

  @test
  getAllTestDataWithModuleAndTestFilters(a: Assert) {
    const someTests = getAllTestData([
      {
        meta: m => m && m.pencil === 'mechanical'
      },
      {
        meta: m => m && m.marker === 'sharpie'
      }
    ]);
    a.ok(someTests, 'returned something truthy');
    a.ok(someTests instanceof Array, 'looks like it returned an array');
    a.equal(someTests.length, 1, 'the array has one thing in it');
    const otherTests = getAllTestData([
      {
        meta: m => m === {}
      },
      {
        meta: m => m && m.marker === 'sharpie'
      }
    ]);
    a.ok(otherTests, 'returned something truthy');
    a.ok(otherTests instanceof Array, 'looks like it returned an array');
    a.equal(otherTests.length, 0, 'the array has nothing in it');
  }

  @test
  'get all test data via function filters'(a: Assert) {
    const someTests = getAllTestData([
      m => !!(m.meta && m.meta.pencil === 'mechanical'),
      m => !!(m.meta && m.meta.marker === 'sharpie')
    ]);
    a.ok(someTests, 'returned something truthy');
    a.ok(someTests instanceof Array, 'looks like it returned an array');
    a.equal(someTests.length, 1, 'the array has one thing in it');
  }
}
