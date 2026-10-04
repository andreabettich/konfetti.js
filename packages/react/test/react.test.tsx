import { act, StrictMode, useEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const stopStream = vi.fn();

vi.mock('@konfetti-js/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@konfetti-js/core')>();
  return {
    ...actual,
    fire: vi.fn(),
    firePreset: vi.fn(),
    reset: vi.fn(),
    continuous: vi.fn(() => stopStream),
  };
});

import { continuous, fire, firePreset } from '@konfetti-js/core';
import { Konfetti, useKonfetti } from '../src';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  root = createRoot(document.createElement('div'));
});

afterEach(() => {
  act(() => root.unmount());
});

describe('<Konfetti>', () => {
  it('fires a preset with only the props you passed, once, even in StrictMode', () => {
    const onFired = vi.fn();

    act(() =>
      root.render(
        <StrictMode>
          <Konfetti fire preset="cannon" colors={['#f00']} onFired={onFired} />
        </StrictMode>
      )
    );

    expect(firePreset).toHaveBeenCalledTimes(1);
    expect(firePreset).toHaveBeenCalledWith('cannon', { colors: ['#f00'] });
    expect(onFired).toHaveBeenCalledTimes(1);
  });

  it('does not fire while `fire` is false', () => {
    act(() => root.render(<Konfetti fire={false} particleCount={10} />));

    expect(fire).not.toHaveBeenCalled();
  });

  it('fires again each time `fire` turns true', () => {
    function Celebration() {
      const [on, setOn] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOn(true)}>
            again
          </button>
          <Konfetti fire={on} particleCount={10} onFired={() => setOn(false)} />
        </>
      );
    }

    const container = document.createElement('div');
    document.body.appendChild(container);
    const localRoot = createRoot(container);
    act(() => localRoot.render(<Celebration />));
    act(() => container.querySelector('button')?.click());

    expect(fire).toHaveBeenCalledTimes(2);
    expect(fire).toHaveBeenLastCalledWith({ particleCount: 10 });
    act(() => localRoot.unmount());
  });
});

describe('useKonfetti()', () => {
  it('stops its stream when the component unmounts', () => {
    function Stream() {
      const { continuous: start } = useKonfetti();
      useEffect(() => {
        start();
      }, [start]);
      return null;
    }

    act(() => root.render(<Stream />));
    expect(continuous).toHaveBeenCalledTimes(1);

    act(() => root.render(null));
    expect(stopStream).toHaveBeenCalled();
  });

  it('returns the same functions on every render', () => {
    const seen: unknown[] = [];
    function Probe({ n }: { n: number }) {
      seen.push(useKonfetti());
      return <span>{n}</span>;
    }

    act(() => root.render(<Probe n={1} />));
    act(() => root.render(<Probe n={2} />));

    expect(seen[0]).toBe(seen[1]);
  });
});
