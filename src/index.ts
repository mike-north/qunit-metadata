interface ModuleInfo {
  name: string;
  tests: TestInfo[];
  meta?: any;
}
interface TestInfo {
  module: string;
  name: string;
  meta?: any;
}
interface PrivateConfig {
  currentModule?: ModuleInfo;
  current: {
    module: ModuleInfo;
  };
}

type PartOfQunit = Pick<
  typeof QUnit,
  | 'test'
  | 'module'
  | 'testStart'
  | 'testDone'
  | 'moduleDone'
  | 'moduleStart'
  | 'begin'
  | 'done'
> & {
  config: PrivateConfig;
};

function qUnitCurrentModule(q: PartOfQunit): ModuleInfo {
  if (q.config.current && q.config.current.module) {
    return q.config.current.module;
  } else {
    if (!q.config.currentModule) {
      throw new Error('QUnit.config.currentModule not found');
    }
    return q.config.currentModule;
  }
}

function patchQUnitTest(q: PartOfQunit, original: typeof QUnit.test) {
  return (name: string, callback: (assert: Assert) => void) => {
    original(name, callback);
    return defineQUnitTest(q, name);
  };
}
function patchQUnitModule(q: PartOfQunit, original: typeof QUnit.module) {
  return (
    name: string,
    hooksOrNested?: Hooks | ((hooks: NestedHooks) => void),
    nested?: (hooks: NestedHooks) => void
  ) => {
    if (typeof hooksOrNested === 'function') {
      original(name, hooksOrNested);
    } else {
      original(name, hooksOrNested, nested);
    }
    return defineQUnitModule(q, name);
  };
}

function defineQUnitTest(q: PartOfQunit, name: string) {
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
function defineQUnitModule(q: PartOfQunit, _name: string) {
  let m = qUnitCurrentModule(q);
  const api = {
    meta(obj: { [k: string]: any }) {
      Object.assign(m.meta, obj);
      return this;
    }
  };
  if (!m.meta) m.meta = {};
  return api;
}

export default function patch(q: PartOfQunit & { __patched?: any }) {
  if (q.__patched) return q.__patched;

  let originalQunitTest: typeof q.test = q.test;
  let originalQunitModule: typeof q.module = q.module;

  q.module = patchQUnitModule(q, originalQunitModule);
  q.test = patchQUnitTest(q, originalQunitTest);
  const api = {
    unpatch() {
      q.test = originalQunitTest;
      q.module = originalQunitModule;
    }
  };
  q.__patched = api;
  return api;
}
