import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

type ColorPalettesObject = Record<string, string[]>;

export const quest: SketchDefinition = {
  id: 'quest',
  name: 'Quest',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    const numShapes = 200;
    let iterations: number;
    const yp = 0;
    const xp = 0;
    const shapes: [number, number][][] = [];
    const colors: p5.Color[] = [];
    let bgColor: p5.Color;

    function getWaveFnAndBoundaries() {
      const options = [
        {
          fn: Math.sin,
          low: -1,
          high: 1
        },
        {
          fn: Math.cos,
          low: -1,
          high: 1
        },
        {
          fn: (a: number) => Math.pow(Math.cos(a), 2),
          low: 0,
          high: 1
        },
        {
          fn: (a: number) => Math.pow(Math.sin(a), 3),
          low: 1,
          high: -1
        },
        {
          fn: (a: number) => Math.sin(a) * Math.cos(a),
          low: -1,
          high: 1
        },
      ];
      return p.random(options);
    }

    function getColorPalette() {
      const colorPalettes: ColorPalettesObject = {
        ACID: [
          '#820263',
          '#D90368',
          '#EADEDA',
          '#2E294E',
          '#FFD400',
        ],
        LEGO: [
          '#FF595E',
          '#FFCA3A',
          '#8AC926',
          '#1982C4',
          '#6A4C93',
        ],
        SEAFOAM: [
          '#34eba4',
          '#b4a9d1',
          '#6333e8',
          '#f0e9df',
          '#6b8574',
        ],
        LAVENDER: [
          '#a064fa',
          '#64f0fa',
          '#c896c8',
          '#ccf59d',
          '#4e3f57',
        ],
        BW: ['#141414', '#f3f3f3'],
        REEF: [
          '#0D3D63',
          '#1D9275',
          '#25B7C3',
          '#EFE5AD',
          '#E35123',
        ],
        BRICK: [
          '#563621',
          '#CF4B3B',
          '#D59273',
          '#ECC0AE',
          '#A5988F',
        ],
        DOLPHIN: [
          '#11304F',
          '#365558',
          '#6DBDD7',
          '#D8E2DE',
          '#FEFEFD',
        ],
        OAXACA: [
          '#E4572E',
          '#17BEBB',
          '#2E282A',
          '#FFC914',
          '#76B041',
        ],
        MERCIA: [
          '#D41c1c',
          '#DDFFDD',
          '#1111BB',
          '#d4ba5b',
        ],
        WHO_ATE_THE_CRANS: [
          '#FF9FB2',
          '#FBDCE2',
          '#0ACDFF',
          '#60AB9A',
          '#A17AB8',
        ],
        MOSS_AGATE: [
          '#F5FBEF',
          '#92AD94',
          '#748B75',
          '#503D42',
          '#C6EF80',
        ],
        FIREWATER: [
          '#F0A202',
          '#581F18',
          '#F18805',
          '#D95D39',
          '#202C59',
        ],
        FAST_Ag: [
          '#46E0E0',
          '#878D94',
          '#636E7D',
          '#47C4AD',
          '#9DA3A1',
        ],
      };
      const selection = colorPalettes[p.random(Object.keys(colorPalettes))]!;
      const palette = [];
      for (const c of selection) {
        palette.push(p.color(c));
      }
      return palette;
    }

    function getSimilarColor(clr: p5.Color, amt = 10, lowAlpha = true) {
      const getOffset = () => p.random([p.random(-amt, -amt/2), p.random(amt/2, amt)]);
      return p.color(
        p.hue(clr),// + random(-amt, amt),
        p.saturation(clr) + getOffset(),
        p.brightness(clr) + getOffset(),
        // lowAlpha ? random(.02, .1) : 1
        lowAlpha ? p.random(.2, .4) : 1
      )
    }

    return {
      setup: (ctx) => {
        p = ctx.p;
        p.colorMode(p.HSB);
        p.noFill();
        p.strokeWeight(5 * p.width / 1080);
        iterations = p.random([400, 500, 600]);
        const halfHeight = (p.width / iterations) * p.random([16, 32, 64]);
        const colorPalette = getColorPalette();
        bgColor = p.random(colorPalette);
        for (let i = 0; i < numShapes; i++) {
          colors.push(getSimilarColor(p.random(colorPalette)));
          const shape: [number, number][] = [];
          const baseY = p.map(i, 0, numShapes, yp, p.height - yp);
          const { fn, low, high } = getWaveFnAndBoundaries();
          for (let a = 0; a < iterations; a++) {
            const y = baseY + p.map(p.pow(fn(a), 2), low, high, -halfHeight, halfHeight);
            const x = p.map(a, 0, iterations, xp, p.width - xp);
            shape.push([x, y]);
          }
          shapes.push(shape);
        }
      },
      draw: () => {
        p.background(bgColor);
        for (let i = 0; i < shapes.length; i++) {
          const shape = shapes[i]!;
          p.stroke(colors[i]!);
          p.beginShape();
          for (let j = 0; j < shape?.length; j++) {
            p.vertex(...shape[j]!);
          }
          p.endShape();
        }
        p.noLoop();
      }
    }
  }
}