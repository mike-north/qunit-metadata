class QUnitMetaState {
  lastModuleName: string = "";
  lastModuleMeta: { [k: string]: any } = {};
  testMeta: { [k: string]: any } = {};
}

interface QUnitModuleStartCallbackDetails {
  name: string;
}
interface QUnitModuleDoneCallbackDetails {
  name: string;
  failed: number;
  passed: number;
  total: number;
  runtime: number;
}
interface QUnitTestStartCallbackDetails {
  name: string;
  module: string;
}
interface QUnitTestDoneCallbackDetails {
  name: string;
  module: string;
  failed: number;
  passed: number;
  total: number;
  runtime: number;
}
type QUnitCallbackDetails =
  | QUnitModuleDoneCallbackDetails
  | QUnitModuleStartCallbackDetails
  | QUnitTestDoneCallbackDetails
  | QUnitTestStartCallbackDetails;

class QUnitMetaManager {
  private state = new QUnitMetaState();
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
      if (typeof hooksOrNested === "function") {
        original(name, hooksOrNested);
      } else {
        original(name, hooksOrNested, nested);
      }
      return this.defineQUnitModule(name);
    };
  }

  patchQUnitCallbacks(originals: {
    testStart: typeof QUnit.testStart;
    testDone: typeof QUnit.testDone;
    moduleDone: typeof QUnit.moduleDone;
    moduleStart: typeof QUnit.moduleStart;
  }): {
    testStart: typeof QUnit.testStart;
    testDone: typeof QUnit.testDone;
    moduleDone: typeof QUnit.moduleDone;
    moduleStart: typeof QUnit.moduleStart;
  } {
    return Object.keys(originals).reduce(
      (patched, key) => {
        patched[key] = (cb: any) => {
          (originals as any)[key]((details: QUnitCallbackDetails) => {
            cb(this.augmentCallbackDetails(key, details));
          });
        };
        return patched;
      },
      {} as any
    );
  }
  private augmentCallbackDetails(
    cbName: string,
    details: QUnitCallbackDetails
  ) {
    switch (cbName) {
      default:
        console.warn(
          `[QUnit Metadata]: Attempt to augment unknown callback: "${cbName}"`
        );
        break;
    }
    return { ...details };
  }
  private defineQUnitTest(name: string) {
    let state = this.state;
    return {
      meta(obj: { [k: string]: any }) {
        state.testMeta[`${state.lastModuleName}/${name}`] = {
          ...obj,
          ...state.lastModuleMeta
        };
        return this;
      }
    };
  }
  private defineQUnitModule(name: string) {
    let { state } = this;
    state.lastModuleName = name;
    return {
      meta(obj: { [k: string]: any }) {
        state.lastModuleMeta = obj;
        return this;
      }
    };
  }
}

export default function patchQunit(q: typeof QUnit) {
  const man = new QUnitMetaManager();

  let originalQunitTest: typeof QUnit.test = q.test;
  let originalQunitModule: typeof QUnit.module = q.module;
  let originalQunitEvents: {
    testStart: typeof QUnit.testStart;
    testDone: typeof QUnit.testDone;
    moduleDone: typeof QUnit.moduleDone;
    moduleStart: typeof QUnit.moduleStart;
  } = {
    testStart: q.testStart,
    testDone: q.testDone,
    moduleDone: q.moduleDone,
    moduleStart: q.moduleStart
  };
  q.module = man.patchQUnitModule(originalQunitModule);
  q.test = man.patchQUnitTest(originalQunitTest);
  let {
    testStart,
    testDone,
    moduleStart,
    moduleDone
  } = man.patchQUnitCallbacks(originalQunitEvents);
  q.testStart = testStart;
  q.testDone = testDone;
  q.moduleStart = moduleStart;
  q.moduleDone = moduleDone;
  return {
    unpatch() {
      q.test = originalQunitTest;
      q.module = originalQunitModule;
      q.moduleDone = originalQunitEvents.moduleDone;
      q.moduleStart = originalQunitEvents.moduleStart;
      q.testStart = originalQunitEvents.testStart;
      q.testDone = originalQunitEvents.testDone;
    }
  };
}
