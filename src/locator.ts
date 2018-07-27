export type Locator<T, K extends keyof T = keyof T> = {
  [KK in K]?: string | RegExp | ((val: T[KK]) => boolean)
};

export function validateLocator(l: any) {
  if (typeof l !== 'object') throw new Error(`Invalid locator ${l}`);
}

export function locatorToPredicate<T>(loc: Locator<T>): (item: T) => boolean {
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
