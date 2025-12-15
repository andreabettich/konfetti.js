import { fire } from './konfetti';
import type { KonfettiOptions } from './types';

/**
 * Preset effect functions
 */

/**
 * Cannon - burst of confetti from bottom center shooting up
 */
export function cannon(options?: Partial<KonfettiOptions>): void {
  fire({
    particleCount: 100,
    angle: 90,
    spread: 70,
    startVelocity: 50,
    decay: 0.91,
    gravity: 1,
    origin: { x: 0.5, y: 1 },
    ...options,
  });
}

/**
 * Explosion - 360 degree burst from center
 */
export function explosion(options?: Partial<KonfettiOptions>): void {
  fire({
    particleCount: 150,
    angle: 90,
    spread: 360,
    startVelocity: 40,
    decay: 0.92,
    gravity: 0.8,
    origin: { x: 0.5, y: 0.5 },
    ...options,
  });
}

/**
 * Rain - particles falling from top
 */
export function rain(options?: Partial<KonfettiOptions>): void {
  fire({
    particleCount: 50,
    angle: 270,
    spread: 60,
    startVelocity: 10,
    decay: 0.95,
    gravity: 0.5,
    drift: 0,
    origin: { x: 0.5, y: 0 },
    ticks: 300,
    ...options,
  });
}

/**
 * Snow - gentle falling particles
 */
export function snow(options?: Partial<KonfettiOptions>): void {
  fire({
    particleCount: 30,
    angle: 270,
    spread: 120,
    startVelocity: 5,
    decay: 0.98,
    gravity: 0.3,
    drift: 1,
    origin: { x: 0.5, y: -0.1 },
    ticks: 400,
    colors: ['#ffffff', '#e0e0e0', '#c0c0c0'],
    shapes: ['circle'],
    ...options,
  });
}

/**
 * Fireworks - rising burst that explodes at peak
 */
export function fireworks(options?: Partial<KonfettiOptions>): void {
  // Launch from bottom
  const colors = options?.colors ?? ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#ff00ff'];

  // First burst - left side
  setTimeout(() => {
    fire({
      particleCount: 80,
      angle: 90,
      spread: 360,
      startVelocity: 35,
      decay: 0.91,
      gravity: 1,
      origin: { x: 0.3, y: 0.4 },
      colors,
      ...options,
    });
  }, 0);

  // Second burst - center
  setTimeout(() => {
    fire({
      particleCount: 80,
      angle: 90,
      spread: 360,
      startVelocity: 35,
      decay: 0.91,
      gravity: 1,
      origin: { x: 0.5, y: 0.3 },
      colors,
      ...options,
    });
  }, 150);

  // Third burst - right side
  setTimeout(() => {
    fire({
      particleCount: 80,
      angle: 90,
      spread: 360,
      startVelocity: 35,
      decay: 0.91,
      gravity: 1,
      origin: { x: 0.7, y: 0.4 },
      colors,
      ...options,
    });
  }, 300);
}

/**
 * Continuous - ongoing stream of particles
 * Returns a stop function
 */
export function continuous(options?: Partial<KonfettiOptions>, interval: number = 250): () => void {
  const mergedOptions: KonfettiOptions = {
    particleCount: 10,
    angle: 90,
    spread: 55,
    startVelocity: 45,
    origin: { x: 0.5, y: 1 },
    ...options,
  };

  const id = setInterval(() => {
    fire(mergedOptions);
  }, interval);

  // Return stop function
  return () => clearInterval(id);
}

/**
 * Side cannons - burst from both sides
 */
export function sideCannons(options?: Partial<KonfettiOptions>): void {
  // Left side
  fire({
    particleCount: 50,
    angle: 60,
    spread: 55,
    startVelocity: 50,
    origin: { x: 0, y: 0.7 },
    ...options,
  });

  // Right side
  fire({
    particleCount: 50,
    angle: 120,
    spread: 55,
    startVelocity: 50,
    origin: { x: 1, y: 0.7 },
    ...options,
  });
}

/**
 * Pride - rainbow colors
 */
export function pride(options?: Partial<KonfettiOptions>): void {
  const prideColors = [
    '#e40303', // red
    '#ff8c00', // orange
    '#ffed00', // yellow
    '#008026', // green
    '#004dff', // blue
    '#750787', // purple
  ];

  fire({
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: prideColors,
    ...options,
  });
}
