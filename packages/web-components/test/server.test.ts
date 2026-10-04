// @vitest-environment node
import { describe, expect, it } from 'vitest';

describe('on the server', () => {
  it('can be imported and defined without a DOM', async () => {
    const elements = await import('../src');

    expect(() => elements.defineAllElements()).not.toThrow();
  });
});
