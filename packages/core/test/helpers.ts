import { afterEach, beforeEach, vi } from 'vitest';

/** One drawn particle, in CSS pixels */
export interface Draw {
  x: number;
  y: number;
  fillStyle: string;
  alpha: number;
}

type Matrix = [number, number, number, number, number, number];

/**
 * A 2D context that tracks the current transform, so tests can see where each
 * particle was drawn regardless of how the renderer builds its transforms.
 */
export class FakeContext {
  fillStyle = '#000000';
  globalAlpha = 1;
  /** Draws since the last clearRect (one animation frame) */
  draws: Draw[] = [];
  clears = 0;
  private matrix: Matrix = [1, 0, 0, 1, 0, 0];
  private stack: Matrix[] = [];

  constructor(private readonly dpr: () => number) {}

  private multiply(m: Matrix): void {
    const [a, b, c, d, e, f] = this.matrix;
    this.matrix = [
      a * m[0] + c * m[1],
      b * m[0] + d * m[1],
      a * m[2] + c * m[3],
      b * m[2] + d * m[3],
      a * m[4] + c * m[5] + e,
      b * m[4] + d * m[5] + f,
    ];
  }

  private record(): void {
    const scale = this.dpr();
    this.draws.push({
      x: this.matrix[4] / scale,
      y: this.matrix[5] / scale,
      fillStyle: String(this.fillStyle),
      alpha: this.globalAlpha,
    });
  }

  save(): void {
    this.stack.push([...this.matrix]);
  }
  restore(): void {
    this.matrix = this.stack.pop() ?? [1, 0, 0, 1, 0, 0];
  }
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.matrix = [a, b, c, d, e, f];
  }
  resetTransform(): void {
    this.matrix = [1, 0, 0, 1, 0, 0];
  }
  transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.multiply([a, b, c, d, e, f]);
  }
  translate(x: number, y: number): void {
    this.multiply([1, 0, 0, 1, x, y]);
  }
  rotate(angle: number): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    this.multiply([cos, sin, -sin, cos, 0, 0]);
  }
  scale(x: number, y: number): void {
    this.multiply([x, 0, 0, y, 0, 0]);
  }
  clearRect(): void {
    this.clears++;
    this.draws = [];
  }
  beginPath(): void {}
  closePath(): void {}
  arc(): void {}
  ellipse(): void {}
  rect(): void {}
  moveTo(): void {}
  lineTo(): void {}
  fill(): void {
    this.record();
  }
  fillRect(): void {
    this.record();
  }
}

/** Controls requestAnimationFrame so tests decide when frames run and how far apart */
export class FrameClock {
  now = 0;
  private queue = new Map<number, FrameRequestCallback>();
  private nextId = 1;

  request = (callback: FrameRequestCallback): number => {
    const id = this.nextId++;
    this.queue.set(id, callback);
    return id;
  };

  cancel = (id: number): void => {
    this.queue.delete(id);
  };

  get pending(): number {
    return this.queue.size;
  }

  /** Run one frame, `interval` ms after the previous one */
  step(interval = 1000 / 60): void {
    this.now += interval;
    const callbacks = [...this.queue.values()];
    this.queue.clear();
    for (const callback of callbacks) callback(this.now);
  }

  /** Run frames until nothing is scheduled; returns how many frames ran */
  runToEnd(interval = 1000 / 60, max = 10_000): number {
    let frames = 0;
    while (this.queue.size > 0 && frames < max) {
      this.step(interval);
      frames++;
    }
    return frames;
  }
}

export interface Env {
  clock: FrameClock;
  /** Context for each canvas the library asked for, in creation order */
  contexts: FakeContext[];
  /** The most recently created context */
  readonly ctx: FakeContext;
  setHidden(hidden: boolean): void;
  setReducedMotion(reduce: boolean): void;
  setDevicePixelRatio(ratio: number): void;
}

/** Installs the fake canvas, animation clock and media queries for each test */
export function useFakeBrowser(): Env {
  const env = {
    clock: new FrameClock(),
    contexts: [] as FakeContext[],
    get ctx() {
      const last = this.contexts[this.contexts.length - 1];
      if (!last) throw new Error('No canvas context was created');
      return last;
    },
    setHidden(hidden: boolean) {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => (hidden ? 'hidden' : 'visible'),
      });
      document.dispatchEvent(new Event('visibilitychange'));
    },
    setReducedMotion(reduce: boolean) {
      reducedMotion = reduce;
    },
    setDevicePixelRatio(ratio: number) {
      dpr = ratio;
    },
  } satisfies Env & { contexts: FakeContext[] };

  let reducedMotion = false;
  let dpr = 1;

  beforeEach(() => {
    env.clock = new FrameClock();
    env.contexts = [];
    reducedMotion = false;
    dpr = 1;

    vi.stubGlobal('requestAnimationFrame', env.clock.request);
    vi.stubGlobal('cancelAnimationFrame', env.clock.cancel);
    vi.spyOn(performance, 'now').mockImplementation(() => env.clock.now);
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, get: () => dpr });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : false,
      media: query,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
    window.innerWidth = 800;
    window.innerHeight = 600;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (
      this: HTMLCanvasElement
    ) {
      const ctx = new FakeContext(() => dpr);
      env.contexts.push(ctx);
      return ctx as unknown as CanvasRenderingContext2D;
    } as unknown as HTMLCanvasElement['getContext']);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  return env;
}

/** A canvas element with a fixed CSS size, for create() */
export function makeCanvas(width = 400, height = 300): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.getBoundingClientRect = () =>
    ({ width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0 }) as DOMRect;
  document.body.appendChild(canvas);
  return canvas;
}
