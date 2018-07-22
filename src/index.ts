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

class QUnitMetaManager {
  constructor(private q: PartOfQunit) {}
  patchQUnitTest(original: typeof QUnit.test) {
    return (name: string, callback: (assert: Assert) => void) => {
      original(name, callback);
      return this.defineQUnitTest(name);
    };
  }
  patchQUnitModule(original: typeof QUnit.module) {
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
      return this.defineQUnitModule(name);
    };
  }

  private defineQUnitTest(name: string) {
    let t = qUnitCurrentModule(this.q).tests.filter(
      (tt: { name: string }) => tt.name === name
    )[0];
    let met = {};
    const api = {
      meta(obj: { [k: string]: any }) {
        if (!t) return this; // Testing qunit-metadata its self
        Object.assign(met, obj);
        return this;
      }
    };
    if (t && !t.meta) {
      Object.defineProperty(t, 'meta', {
        value: met,
        writable: false
      });
    } else if (!t) {
      // tslint:disable-next-line:no-console
      console.info(
        `defineQUnitTest: Couldn't find test "${name}" in QUnit state. Probably testing qunit-metadata its self`
      );
    }
    return api;
  }
  private defineQUnitModule(_name: string) {
    let m = qUnitCurrentModule(this.q);
    let met = {};
    const api = {
      meta(obj: { [k: string]: any }) {
        Object.assign(met, obj);
        return this;
      }
    };
    if (!m.meta) {
      Object.defineProperty(m, 'meta', {
        value: met,
        writable: false
      });
    }
    return api;
  }
}

export default function patchQunit(q: PartOfQunit & { __patched?: any }) {
  if (q.__patched) return q.__patched;
  const man = new QUnitMetaManager(q);

  let originalQunitTest: typeof q.test = q.test;
  let originalQunitModule: typeof q.module = q.module;

  q.module = man.patchQUnitModule(originalQunitModule);
  q.test = man.patchQUnitTest(originalQunitTest);
  const api = {
    unpatch() {
      q.test = originalQunitTest;
      q.module = originalQunitModule;
    }
  };
  q.__patched = api;
  return api;
}
