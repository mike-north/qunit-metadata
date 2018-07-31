import { qunitConfig } from './config';
import { Locator, locatorToPredicate, validateLocator } from './locator';
import { QUnitModuleDetails, QUnitTestDetails } from './types';

export interface QueryOptions {
  QUnit?: QUnit;
}

export function getModuleData(
  loc: Locator<QUnitModuleDetails>,
  opts?: QueryOptions
): QUnitModuleDetails | null {
  validateLocator(loc);
  let pred = locatorToPredicate(loc);
  let mods = qunitConfig(opts && opts.QUnit).modules;
  for (let m of mods) {
    if (pred(m)) return m;
  }
  return null;
}

export function getTestData(
  loc:
    | Locator<QUnitTestDetails>
    | [Locator<QUnitModuleDetails>, Locator<QUnitTestDetails>],
  opts?: QueryOptions
): QUnitTestDetails | null {
  let testLoc = loc instanceof Array ? loc[1] : loc;
  let modLoc = loc instanceof Array ? loc[0] : null;
  if (modLoc) validateLocator(modLoc);
  validateLocator(testLoc);
  let mods = qunitConfig(opts && opts.QUnit).modules;
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
  loc?: Locator<QUnitModuleDetails>,
  opts?: QueryOptions
): QUnitModuleDetails[] {
  if (loc) validateLocator(loc);
  let mods = qunitConfig(opts && opts.QUnit).modules;
  if (loc === void 0) return mods;
  let pred = locatorToPredicate(loc);
  return mods.filter(pred);
}

export function getAllTestData(
  loc?:
    | Locator<QUnitTestDetails>
    | [Locator<QUnitModuleDetails>, Locator<QUnitTestDetails>],
  opts?: QueryOptions
): QUnitTestDetails[] {
  let testLoc = loc && loc instanceof Array ? loc[1] : loc || null;
  let modLoc = loc && loc instanceof Array ? loc[0] : null;
  if (modLoc) validateLocator(modLoc);
  validateLocator(testLoc);
  let mods = qunitConfig(opts && opts.QUnit).modules;
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
