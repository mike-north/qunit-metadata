import { defineQUnitModule, defineQUnitTest } from './define';
import './qunit';
import { PartOfQunit } from './types';

function patchQUnitTest(
  q: PartOfQunit,
  original: typeof QUnit.test | typeof QUnit.skip | typeof QUnit.todo
) {
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

export * from './query';
export * from './types';
export { Locator } from './locator';