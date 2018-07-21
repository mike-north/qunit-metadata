declare module 'qunit' {
  interface QUnitMetaEnabled {
    meta(data: {[k: string]: any}): QUnitMetaEnabled;
  }

  global {
    interface QUnit {
      module(name: string, hooks?: Hooks, nested?: (hooks: NestedHooks) => void): QUnitMetaEnabled;
      module(name: string, nested?: (hooks: NestedHooks) => void): QUnitMetaEnabled;
      test(name: string, callback: (assert: Assert) => void): QUnitMetaEnabled;
    }
  }
}
