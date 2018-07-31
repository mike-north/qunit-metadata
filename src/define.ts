import { qunitConfig } from './config';
import { PartOfQunit, QUnitPartialConfigModuleInfo } from './types';

let lastModule: QUnitPartialConfigModuleInfo;

function qUnitCurrentModule(q: PartOfQunit): QUnitPartialConfigModuleInfo {
  if (q.config.currentModule) return q.config.currentModule;
  if (q.config.current && q.config.current.module) {
    return q.config.current.module;
  }
  throw new Error(
    'QUnit.config.currentModule and QUnit.config.current.module were both unavailable'
  );
}

export function defineQUnitTest(q: PartOfQunit, name: string) {
  let t = qUnitCurrentModule(q).tests.filter(
    (tt: { name: string }) => tt.name === name
  )[0];
  const api = {
    meta(obj: { [k: string]: any }) {
      if (!t) return this; // Testing qunit-metadata its self
      Object.assign(t.meta, obj);
      return this;
    }
  };
  if (!t) {
    // tslint:disable-next-line:no-console
    console.info(
      `defineQUnitTest: Couldn't find test "${name}" in QUnit state. Probably testing qunit-metadata its self`
    );
  } else if (!t.meta) {
    t.meta = {};
  }
  return api;
}
export function defineQUnitModule(_q: PartOfQunit, name: string) {
  // TODO remove global use of QUnit
  let m = (qunitConfig(QUnit).modules as QUnitPartialConfigModuleInfo[]).filter(
    mo => mo.name === name
  )[0];

  const api = {
    meta(obj: { [k: string]: any }) {
      Object.assign(m.meta, obj);
      return this;
    }
  };
  if (!m) {
    // tslint:disable-next-line:no-console
    console.info(
      `defineQUnitModule: Couldn't find module "${name}" in QUnit state. Probably testing qunit-metadata its self`
    );
  } else if (!m.meta) {
    m.meta = {};
  }
  return api;
}
