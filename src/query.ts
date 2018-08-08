import { PredicateObject, toPredicate } from 'object-predicate';
import { qunitConfig } from './config';
import { QUnitModuleDetails, QUnitTestDetails } from './types';

export interface QueryOptions {
  QUnit?: QUnit;
}

export function getModuleData(
  loc:
    | PredicateObject<Partial<QUnitModuleDetails>>
    | ((md: Partial<QUnitModuleDetails>) => boolean),
  opts?: QueryOptions
): QUnitModuleDetails | null {
  let pred = typeof loc === 'function' ? loc : toPredicate(loc);
  let mods = qunitConfig(opts && opts.QUnit).modules;
  for (let m of mods) {
    if (pred(m)) return m;
  }
  return null;
}

export type PredicatePair =
  | (
      | PredicateObject<Partial<QUnitTestDetails>>
      | ((mod: Partial<QUnitTestDetails>) => boolean))
  | [
      (
        | PredicateObject<Partial<QUnitModuleDetails>>
        | ((mod: Partial<QUnitModuleDetails>) => boolean)),
      (
        | PredicateObject<Partial<QUnitTestDetails>>
        | ((mod: Partial<QUnitTestDetails>) => boolean))
    ];

export function getTestData(
  loc: PredicatePair,
  opts?: QueryOptions
): QUnitTestDetails | null {
  let testLoc = loc instanceof Array ? loc[1] : loc;
  let modLoc = loc instanceof Array ? loc[0] : null;

  let mods = qunitConfig(opts && opts.QUnit).modules;
  const modPredicate = modLoc
    ? typeof modLoc === 'function'
      ? modLoc
      : toPredicate(modLoc)
    : null;
  const testPredicate =
    typeof testLoc === 'function' ? testLoc : toPredicate(testLoc);
  for (let m of mods) {
    if (modPredicate && !modPredicate(m)) continue;
    for (let t of m.tests) {
      if (testPredicate(t)) return t;
    }
  }
  return null;
}

export function getAllModuleData(
  loc?:
    | PredicateObject<Partial<QUnitModuleDetails>>
    | ((loc: Partial<QUnitModuleDetails>) => boolean),
  opts?: QueryOptions
): QUnitModuleDetails[] {
  let mods = qunitConfig(opts && opts.QUnit).modules;
  if (loc === void 0) return mods;
  let pred = typeof loc === 'function' ? loc : toPredicate(loc);
  return mods.filter(pred);
}

export function getAllTestData(
  loc?: PredicatePair,
  opts?: QueryOptions
): QUnitTestDetails[] {
  let testLoc = loc && loc instanceof Array ? loc[1] : loc || null;
  let modLoc = loc && loc instanceof Array ? loc[0] : null;
  let mods = qunitConfig(opts && opts.QUnit).modules;
  const modPredicate = modLoc
    ? typeof modLoc === 'function'
      ? modLoc
      : toPredicate(modLoc)
    : null;
  const testPredicate = testLoc
    ? typeof testLoc === 'function'
      ? testLoc
      : toPredicate(testLoc)
    : null;

  return (modPredicate ? mods.filter(modPredicate) : mods).reduce(
    (acc, m) => {
      return acc.concat(
        testPredicate ? m.tests.filter(testPredicate) : m.tests
      );
    },
    [] as QUnitTestDetails[]
  );
}
