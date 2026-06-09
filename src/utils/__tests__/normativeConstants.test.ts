import { describe, expect, it } from 'vitest';
import {
  getResistivity,
  checkThermalCompliance,
  isNormalizedSection,
  getVoltageDropLimit,
  VOLTAGE_DROP_LIMITS
} from '../normativeConstants';

describe('normativeConstants utilities', () => {
  it('returns service resistivity for ambient temperatures other than 20°C', () => {
    expect(getResistivity('copper', 30)).toBe(0.0175 * 1.25);
    expect(getResistivity('aluminum', 40)).toBe(0.028 * 1.25);
  });

  it('returns base resistivity at 20°C', () => {
    expect(getResistivity('copper', 20)).toBe(0.0175);
    expect(getResistivity('aluminum', 20)).toBe(0.028);
  });

  it('checks thermal compliance using normative correction factors', () => {
    const result = checkThermalCompliance(16, 16, 'copper', 'B1', 30, 'PVC', 1);
    expect(result.izCorrected).toBeCloseTo(57 * 0.85, 2);
    expect(result.isCompliant).toBe(true);
  });

  it('marks non-compliant sections as thermal non-conformant', () => {
    const result = checkThermalCompliance(80, 16, 'copper', 'B1', 30, 'PVC', 1);
    expect(result.isCompliant).toBe(false);
  });

  it('validates normalized sections', () => {
    expect(isNormalizedSection(16)).toBe(true);
    expect(isNormalizedSection(3)).toBe(false);
  });

  it('computes voltage drop limits with length correction', () => {
    expect(getVoltageDropLimit('A', 'lighting', 50)).toBe(VOLTAGE_DROP_LIMITS.A.lighting);
    expect(getVoltageDropLimit('A', 'lighting', 150)).toBeCloseTo(VOLTAGE_DROP_LIMITS.A.lighting + 0.0025);
  });
});
