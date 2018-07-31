import { AugmentedQUnit, AugmentedQunitConfig } from './types';

export function qunitConfig(qUnit: QUnit = QUnit): AugmentedQunitConfig {
  return (qUnit as AugmentedQUnit).config;
}
