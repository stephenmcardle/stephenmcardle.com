import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

export const bubbles: SketchDefinition = {
  id: 'bubbles',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    const numShapes = 12;

    return {
      setup: (ctx) => {
        p = ctx.p;
        p.fill(255);
        p.noStroke();
      },
      draw: () => {
        p.background(20);
        const d = p.max(p.width, p.height) * 0.1;
        const t = p.millis() / 10000;
        for (let i = 0; i < numShapes; i++) {
          const progress = t + 2*i*p.PI / numShapes;
          const x0 = p.map(p.cos(progress), -1, 1, d / 2, p.width - d/2);
          const y0 = p.map(p.sin(progress), -1, 1, d / 2, p.height - d/2);
          p.circle(x0, y0, d);
  
          const x1 = p.map(p.sin(progress), -1, 1, d / 2, p.width - d/2);
          const y1 = p.map(p.cos(progress), -1, 1, d / 2, p.height - d/2);
          p.circle(x1, y1, d);
        }
      }
    }
  }
}