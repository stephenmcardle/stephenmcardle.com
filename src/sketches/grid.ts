import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from './types';

export const grid: SketchDefinition = {
  id: 'grid',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    return {
      setup: (ctx) => {
        p = ctx.p;
        p.noSmooth();
      },
      draw: () => {
        p.background(0);
        p.stroke(255);
        const step = p.width / 10;
        for (let x = 0; x < p.width; x += step) p.line(x, 0, x, p.height);
        for (let y = 0; y < p.height; y += step) p.line(0, y, p.width, y);
      }
    }
  }
};