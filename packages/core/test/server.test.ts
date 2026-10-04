// @vitest-environment node
import { describe, expect, it } from 'vitest';
import {
  cannon,
  continuous,
  destroy,
  fire,
  firePreset,
  fireworks,
  Konfetti,
  reset,
} from '../src/index';

describe('on the server', () => {
  it('does nothing instead of throwing', () => {
    expect(() => {
      fire();
      cannon();
      fireworks();
      firePreset('snow');
      continuous()();
      reset();
      destroy();
      new Konfetti().fire();
    }).not.toThrow();
  });
});
