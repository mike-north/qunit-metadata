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
let lastModule: any;
function qUnitCurrentModule(q: PartOfQunit): ModuleInfo {
  if (q.config.currentModule) return q.config.currentModule;
  if (q.config.current && q.config.current.module) {
    return q.config.current.module;
  }
  throw new Error(
    'QUnit.config.currentModule and QUnit.config.current.module were both unavailable'
  );
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
function defineQUnitModule(q: PartOfQunit, name: string) {
  let m = ((QUnit.config as any).modules as ModuleInfo[]).filter(
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
