export interface QUnitPartialConfigModuleInfo {
  name: string;
  tests: QUnitPartialConfigTestInfo[];
  meta?: any;
}

export interface QUnitPartialConfigTestInfo {
  module: string;
  name: string;
  meta?: any;
}

export interface QUnitPartialConfig {
  currentModule?: QUnitPartialConfigModuleInfo;
  current: {
    module: QUnitPartialConfigModuleInfo;
  };
}

export type PartOfQunit = Pick<
  typeof QUnit,
  | 'test'
  | 'module'
  | 'todo'
  | 'skip'
> & {
  config: QUnitPartialConfig;
};

export interface QUnitModuleDetails {
  meta: { [k: string]: any };
  moduleId: string;
  name: string;
  parentModule: string;
  skip?: boolean;
  stats?: { all: number; bad: number; started: number };
  suiteReport?: QUnitSuiteReport;
  tests: QUnitTestDetails[];
  testsRun?: number;
  unskippedTestsRun?: number;
}

export interface QUnitTestDetails {
  meta: { [k: string]: any };
  module: string;
  name: string;
  testId: string;
}

export interface QUnitSuiteReport {
  fullName: string[];
  name: string;
  tests: QUnitTestReport[];
}

export interface QUnitTestReport {
  assertions: QUnitAssertionReport[];
  fullName: string[];
  name: string;
  runtime: number;
  skipped: boolean;
  todo: boolean;
  valid: boolean;
}

export interface QUnitAssertionReport {
  message: string;
  passed: boolean;
  todo: boolean;
}

type ReplaceProps<T, S, K extends (keyof T & keyof S)> = {
  [P in keyof T]: P extends K ? S[P] : T[P];
};

export interface AugmentedQunitConfig extends ReplaceProps<Config, QUnitPartialConfig, 'current'>, QUnitPartialConfig  {
  modules: QUnitModuleDetails[];
}
export interface AugmentedQunit {

}

export interface AugmentedQUnit extends QUnit {
  config: AugmentedQunitConfig;
}
