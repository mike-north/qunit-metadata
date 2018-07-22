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
  | 'todo'
  | 'skip'
> & {
  config: PrivateConfig;
};

function qunitModules(): QUnitModuleDetails[] {
  return (QUnit.config as any).modules;
}

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

function patchQUnitTest(q: PartOfQunit, original: typeof QUnit.test | typeof QUnit.skip | typeof QUnit.todo) {
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
function defineQUnitModule(_q: PartOfQunit, name: string) {
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

export default function patch(q: PartOfQunit & { __patched?: any } = QUnit) {
  if (q.__patched) return q.__patched;

  let originalQunitTest: typeof q.test = q.test;
  let originalQunitTodo: typeof q.todo = q.todo;
  let originalQunitSkip: typeof q.skip = q.skip;
  let originalQunitModule: typeof q.module = q.module;

  q.module = patchQUnitModule(q, originalQunitModule);
  q.test = patchQUnitTest(q, originalQunitTest);
  q.todo = patchQUnitTest(q, originalQunitTodo);
  q.skip = patchQUnitTest(q, originalQunitSkip);
  const api = {
    unpatch() {
      q.test = originalQunitTest;
      q.module = originalQunitModule;
    }
  };
  q.__patched = api;
  return api;
}

type Locator<T, K extends keyof T = keyof T> = {
  [KK in K]?: string | RegExp | ((val: T[KK]) => boolean)
};

function validateLocator(l: any) {
  if (typeof l !== 'object') throw new Error(`Invalid locator ${l}`);
}

interface QUnitModuleDetails {
  moduleId: string;
  name: string;
  tests: QUnitTestDetails[];
  meta: { [k: string]: any };
}
interface QUnitTestDetails {
  module: string;
  name: string;
  testId: string;
  meta: { [k: string]: any };
}

function locatorToPredicate<T>(loc: Locator<T>): (item: T) => boolean {
  return (item: T) => {
    let checks: boolean[] = [];
    for (let k in loc) {
      let locVal = loc[k];
      if (locVal === void 0) continue;
      checks.push(
        typeof locVal === 'string'
          ? (item as any)[k] === locVal
          : locVal instanceof RegExp
            ? locVal.test((item as any)[k])
            : locVal(item[k])
      );
    }
    return checks.every(Boolean);
  };
}

export function getModuleData(
  loc: Locator<QUnitModuleDetails>
): QUnitModuleDetails | null {
  validateLocator(loc);
  let pred = locatorToPredicate(loc);
  let mods = qunitModules();
  for (let m of mods) {
    if (pred(m)) return m;
  }
  return null;
}

export function getTestData(
  loc:
    | Locator<QUnitTestDetails>
    | [Locator<QUnitModuleDetails>, Locator<QUnitTestDetails>]
): QUnitTestDetails | null {
  let testLoc = loc instanceof Array ? loc[1] : loc;
  let modLoc = loc instanceof Array ? loc[0] : null;
  if (modLoc) validateLocator(modLoc);
  validateLocator(testLoc);
  let mods = qunitModules();
  const modPredicate = modLoc ? locatorToPredicate(modLoc) : null;
  const testPredicate = locatorToPredicate(testLoc);
  for (let m of mods) {
    if (modPredicate && !modPredicate(m)) continue;
    for (let t of m.tests) {
      if (testPredicate(t)) return t;
    }
  }
  return null;
}

export function getAllModuleData(
  loc?: Locator<QUnitModuleDetails>
): QUnitModuleDetails[] {
  if (loc) validateLocator(loc);
  let mods = qunitModules();
  if (loc === void 0) return mods;
  let pred = locatorToPredicate(loc);
  return mods.filter(pred);
}

export function getAllTestData(
  loc?: Locator<QUnitTestDetails> | [Locator<QUnitModuleDetails>, Locator<QUnitTestDetails>]
): QUnitTestDetails[] {
  let testLoc = loc && loc instanceof Array ? loc[1] : loc || null;
  let modLoc = loc && loc instanceof Array ? loc[0] : null;
  if (modLoc) validateLocator(modLoc);
  validateLocator(testLoc);
  let mods = qunitModules();
  const modPredicate = modLoc ? locatorToPredicate(modLoc) : null;
  const testPredicate = testLoc ? locatorToPredicate(testLoc) : null;

  return (modPredicate ? mods.filter(modPredicate) : mods).reduce(
    (acc, m) => {
      return acc.concat(
        testPredicate ? m.tests.filter(testPredicate) : m.tests
      );
    },
    [] as QUnitTestDetails[]
  );
}
