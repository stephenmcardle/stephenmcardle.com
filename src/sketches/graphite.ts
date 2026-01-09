import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

export const graphite: SketchDefinition = {
  id: 'graphite',
  name: 'Graphite',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    const numLines = 10000;
    const simWidth = 100, simHeight = 100;
    const outerPoints: p5.Vector[] = [];
    const indices: [number, number][] = [];
    const colors: p5.Color[] = [];

    return {
      setup: (ctx) => {
        p = ctx.p;
        p.stroke(0, 15);
        const radius = simWidth/1.2;
        const maxNoise = p.random(simWidth / 4, simWidth / 15);
        const numPoints = 5000;
        const noiseResolution = p.random(simWidth / 5, simWidth / 10);
        for (let a = 0; a < p.TWO_PI; a += p.TWO_PI / numPoints) {
          const x = p.map(p.cos(a), -1, 1, -radius, radius);
          const y = p.map(p.sin(a), -1, 1, -radius, radius);
          const nx = p.map(p.noise(x / noiseResolution, y / noiseResolution), 0, 1, -maxNoise, maxNoise);
          const ny = p.map(p.noise(x / noiseResolution, y / noiseResolution), 0, 1, -maxNoise, maxNoise);
          outerPoints.push(p.createVector(x + nx, y + ny));
        }
        for (let i = 0; i < numLines; i++) {
          colors.push(p.color(p.random(100), p.random(100), p.random(100), 15));
          const index1 = p.floor(p.random(outerPoints.length));
          let index2 = p.floor(p.random(outerPoints.length));
          while (index1 === index2 || p.abs(index1 - index2) < outerPoints.length / 3) {
            index2 = p.floor(p.random(outerPoints.length));
          }
          indices.push([index1, index2]);
        }
      },
      draw: () => {
        p.background(240);
        p.push();
        p.translate(p.width/2, p.height/2);
        if (p.width > p.height) {
          p.scale(p.width / simWidth);
          p.strokeWeight(simWidth / p.width);
        } else {
          p.scale(p.height / simHeight);
          p.strokeWeight(simHeight / p.height);
        }
        for (let i = 0; i < numLines; i++) {
          const [index1, index2] = indices[i]!;
          const v1 = outerPoints[index1]!;
          const v2 = outerPoints[index2]!;
          p.stroke(colors[i]!);
          p.line(v1.x, v1.y, v2.x, v2.y);
        }
        p.pop();
        p.noLoop();
      },
      windowResized: () => {
        p.loop();
      }
    }
  }
}