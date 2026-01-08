import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';


type Rectangle = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const patchwork: SketchDefinition = {
  id: 'patchwork',
  name: 'Patchwork',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    let simWidth = 100;
    let simHeight = 100;
    let colors: string[];
    let minW: number, minH: number;
    let patternIndex: number;
    const root2 = 1.4142135623730951;
    const bgRects: Rectangle[] = [];
    const patternFuncs = [drawGrid, drawMandalas, drawTesselation, drawStripes]; 
    // const patternFuncs = [drawMandalas];
    const blocks: Block[] = [];

    class Block {
      bgColor: string;
      clipPath: Path2D;
      patternFunc: () => void;

      constructor(bgColor: string, clipPath: Path2D, patternFunc: () => void) {
        this.bgColor = bgColor;
        this.clipPath = clipPath;
        this.patternFunc = patternFunc;
      }

      draw() {
        p.drawingContext.save();
        p.drawingContext.clip(this.clipPath);
        p.background(this.bgColor);
        this.patternFunc();
        p.drawingContext.restore();
      }
    }

    const palettes = [
      ['#413C58', '#A3C4BC', '#BFD7B5', '#E7EFC5', '#F2DDA4', '#FF6F59', '#EF3054', '#4B644A', '#F4989C', '#DB5461'],
      ['#C97B84', '#A85751', '#7D2E68', '#251351', '#040926', '#87F5FB', '#EEE5BF', '#E8F8C1', '#D1FFC6', '#6F9283'],
      ['#BCE784', '#5DD39E', '#348AA7', '#525174', '#513B56', '#A53F2B', '#4C230A', '#280004', '#6E2594', '#000000'],
    ];

    function ench(x: number, y: number, w: number, h: number, arr: Rectangle[]) {
      const k = p.random();
      if (k < .5 && w/2 > minW) {
        ench(x, y, w/2, h, arr);
        ench(x + w/2, y, w/2, h, arr);
      } else if (k >= .5 && h/2 > minH) {
        ench(x, y, w, h / 2, arr);
        ench(x, y + h/2, w, h/2, arr);
      } else {
        arr.push({x, y, w, h});
      }
    }

    function getPatternFunc() {
      return patternFuncs[patternIndex++ % patternFuncs.length]!();
    }

    function getValidNumColors() {
      return p.floor(p.random(p.min(3, colors.length), p.min(6, colors.length)));
    }

    function drawMandalas() {
      const gridSize = p.floor(p.random(15, 21)) * 2;
      const numSubShapes = p.floor(p.random(3, 9));
      const numShapesPerSubShape: number[] = [];
      const sizes: number[] = [];
      const types: number[] = [];
      for (let i = 0; i < numSubShapes; i++) {
        const type = p.random([0, 1]);
        // const type = 1;
        types.push(type);
        if (type === 0) {
          numShapesPerSubShape.push(1);
        } else {
          numShapesPerSubShape.push(p.random([4, 6, 8, 10]));
        }
        const size = simWidth / gridSize * p.map(i, 0, numSubShapes, 1, .25) * p.random(.8, 1.2);
        sizes.push(size);
      }
      const colorOffset = p.floor(p.random(colors.length));
      return () => {
        p.push();
        p.noStroke();
        p.rectMode(p.CENTER);
        for (let k = 0; k < numSubShapes; k++) {
          for (let i = 0; i < gridSize; i++) {
            const x = p.map(i, 0, gridSize - 1, 0, simWidth);
            for (let j = 0; j < gridSize; j++) {
              const y = p.map(j, 0, gridSize - 1, 0, simHeight);
              p.push();
              p.translate(x, y);
              p.fill(colors[(colorOffset + k) % colors.length]!);
              mandala(types[k]!, numShapesPerSubShape[k]!, sizes[k]!);
              p.pop();
            }
          }
        }
        p.pop();
      }
    }
    
    function mandala(type: number, numShapes: number, size: number) {
      for (let i = 0; i < numShapes; i++) {
        p.push();
        p.rotate(p.map(i, 0, numShapes, 0, 2*p.PI));
        if (type === 0) {
          p.circle(0, 0, size);
        } else {
          p.rect(size/3, 0, size/2, size/4);
        }
        p.pop();
      }
    }
    
    function drawStripes() {
      const theta = p.PI * p.random([0, .25, .5, .75]);
      const numSets = p.floor(p.random(24, 48)) * 2;
      const setSize = 2 * simWidth * p.random(1, root2) / numSets;
      const numColors = getValidNumColors();
      return () => {
        p.push();
        p.strokeWeight(1);
        p.translate(simWidth / 2, simHeight / 2);
        p.rotate(theta);
        for (let i = 0; i < numSets; i++) {
          const y = p.map(i, 0, numSets, -simHeight, simHeight * 2);
          for (let j = 0; j < numColors; j++) {
            p.stroke(colors[j]!);
            const yOffset = setSize * j / numColors;
            p.line(-simWidth, y + yOffset, simWidth * 2, y + yOffset);
          }
        }
        p.pop();
      };
    }
    
    function drawGrid() {
      const colorOffset = p.floor(p.random(colors.length));
      const numColors = getValidNumColors();
      const gridSizesX: number[] = [];
      const gridSizesY: number[] = [];
      for (let i = 0; i < numColors; i++) {
        gridSizesX.push(2 ** p.random([6, 7, 8]));
        gridSizesY.push(2 ** p.random([6, 7, 8]));
      }
      return () => {
        p.push();
        p.noStroke();
        for (let i = 0; i < numColors; i++) {
          const clr = colors[(colorOffset + i) % colors.length]!;
          p.fill(clr);
          const gridSizeX = gridSizesX[i]!;
          const gridSizeY = gridSizesY[i]!;
          const sizeX = simWidth / gridSizeX;
          const sizeY = simHeight / gridSizeY;
          const d = p.min(sizeX, sizeY) * .5;
          const offset = sizeX/2;
          for (let i = 0; i <= gridSizeY; i++) {
            const y = i / gridSizeY * simHeight;
            for (let j = 0; j <= gridSizeX; j++) {
              const x = j / gridSizeX * simWidth + offset * (i % 2);
              p.circle(x, y, d);
            }
          }
        }
        p.pop();
      };
    }
    
    function drawTesselation() {
      const gridSize = 41;
      const size = simWidth / gridSize;
      const points = getTesselationShape(size, p.floor(p.random(4, 13)), size / p.random(3, 6));
      const numColors = getValidNumColors();
      const tesselationColors = colors.slice(0, numColors);
      const iFunc = getIteratorModifier();
      const jFunc = getIteratorModifier();
      return () => {
        p.push();
        p.strokeWeight(1);
        for (let i = -1; i < gridSize + 1; i++) {
          const x = p.map(i, -1, gridSize + 1, -size/2, simWidth + size/2);
          for (let j = -1; j < gridSize + 1; j++) {
            const ind = iFunc(i) + jFunc(j) + 2;
            const c = tesselationColors[ind % tesselationColors.length]!;
            p.fill(c);
            p.stroke(c);
            const y = p.map(j, -1, gridSize + 1, -size/2, simHeight + size/2);
            drawShape(points, x, y);
          }
        }
        p.pop();
      }
    }
    
    function getIteratorModifier() {
      const f = p.random([2, 3]);
      return p.random([
        (i: number) => i,
        (i: number) => (i + 1) * f,
      ])
    }
    
    function getTesselationShape(s: number, numPoints: number, maxWiggle = s/4): [number, number][] {
      const points: [number, number][] = [];
      const offsets1: number[] = [];
      const offsets2: number[] = [];
      for (let i = 0; i < numPoints; i++) {
        const newX = s * i / numPoints;
        let yOffset = 0;
        const wiggle = i < numPoints / 2 ? p.map(i, 0, numPoints/2, 0, maxWiggle) : p.map(i, numPoints / 2, numPoints, maxWiggle, 0);
        if (i > 1 && i < numPoints - 1) {
          yOffset = p.random(-wiggle, wiggle);
        }
        const newY = yOffset;
        points.push([newX, newY]);
        offsets1.push(yOffset);
      }
      for (let i = 0; i < numPoints; i++) {
        const newY = p.map(i, 0, numPoints - 1, 0, s)
        let xOffset = 0;
        const wiggle = i < numPoints / 2 ? p.map(i, 0, numPoints/2, 0, maxWiggle) : p.map(i, numPoints / 2, numPoints, maxWiggle, 0);
        if (i > 1 && i < numPoints - 1) {
          xOffset = -p.random(-wiggle, wiggle);
        }
        const newX = s + xOffset;
        points.push([newX, newY]);
        offsets2.push(xOffset);
      }
      for (let i = offsets1.length - 1; i >= 0; i--) {
        const yOffset = offsets1[i]!;
        const newX = s * i / numPoints;
        const newY = s + yOffset;
        points.push([newX, newY]);
      }
      for (let i = offsets2.length - 1; i >= 0; i--) {
        const xOffset = offsets2[i]!;
        const newX = xOffset;
        const newY = p.map(i, 0, offsets2.length - 1, 0, s);
        points.push([newX, newY]);
      }
      return points;
    }
    
    function drawShape(points: [number, number][], tx: number, ty: number) {
      p.push();
      p.translate(tx, ty);
      p.beginShape();
      for (let pt of points) {
        p.vertex(pt[0], pt[1]);
      }
      p.endShape();
      p.pop();
    }

    return {
      setup: (ctx) => {
        p = ctx.p;
        simHeight = simWidth * (p.height / p.width);
        colors = p.random(palettes);
        p.noStroke();
        minW = simWidth / 8;
        minH = simHeight / 8;
        patternIndex = 0;
        p.shuffle(patternFuncs, true);
        p.shuffle(colors, true);
        ench(0, 0, simWidth, simHeight, bgRects);
        for (let r of bgRects) {
          const path = new Path2D();
          path.rect(r.x, r.y, r.w, r.h);
          const patternFunc = getPatternFunc();
          blocks.push(new Block(p.random(colors), path, patternFunc));
        }
      },
      draw: () => {
        p.clear();
        p.push();
        p.scale(p.width / simWidth, p.height / simHeight);
        for (let b of blocks) {
          b.draw();
        }
        p.pop();
        p.noLoop();
      },
      windowResized: () => {
        p.loop();
      }
    }
  }
};