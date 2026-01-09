import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

type NoiseFunction = (xOff: number, yOff: number, zOff?: number) => number;
type EasingFunction = (x: number) => number;
type EasingFunctionsObject = Record<string, EasingFunction>;
type ColorPalettesObject = Record<string, string[]>;

export const fuzz: SketchDefinition = {
  id: 'fuzz',
  name: 'Fuzz',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;

    let rotationNoiseResolution: number;
    let controlPointNoiseResolution1: number;
    let controlPointNoiseResolution2: number;
    let colorNoiseResolution: number;
    let sizeNoiseResolution: number;

    let rotationNoiseResolutionMult: number;
    let controlPointNoiseResolution1Mult: number;
    let controlPointNoiseResolution2Mult: number;
    let colorNoiseResolutionMult: number;
    let sizeNoiseResolutionMult: number;

    let rotationNoiseFunc: (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number) => number;
    let controlPointNoiseFunc1: NoiseFunction;
    let controlPointNoiseFunc2: NoiseFunction;
    let colorNoiseFunc: NoiseFunction;
    let sizeNoiseFunc: NoiseFunction;

    let minSize = 0;
    let maxSize = 0;
    let bgColor: p5.Color;
    let colorArray: p5.Color[] = [];

    function setNoiseResolutions() {
      if (!rotationNoiseResolutionMult) {
        rotationNoiseResolutionMult = p.random(.8, 1.2);
      }
      if (!controlPointNoiseResolution1Mult) {
        controlPointNoiseResolution1Mult = p.random(.8, 1.2);
      }
      if (!controlPointNoiseResolution2Mult) {
        controlPointNoiseResolution2Mult = p.random(.8, 1.2);
      }
      if (!colorNoiseResolutionMult) {
        colorNoiseResolutionMult = p.random(.8, 1.2);
      }
      if (!sizeNoiseResolutionMult) {
        sizeNoiseResolutionMult = p.random(.8, 1.2);
      }
      rotationNoiseResolution = 120 * rotationNoiseResolutionMult * p.width / 1080;
      controlPointNoiseResolution1 = 500 * controlPointNoiseResolution1Mult * p.width / 1080;
      controlPointNoiseResolution2 = 500 * controlPointNoiseResolution2Mult * p.width / 1080;
      colorNoiseResolution = 20 * colorNoiseResolutionMult * p.width / 1080;
      sizeNoiseResolution = 180 * sizeNoiseResolutionMult * p.width / 1080;
    }

    function generateBackgroundColor(): p5.Color {
      const selectedClr = p.random(colorArray);
      const bgColor = p.color(
        p.hue(selectedClr),
        p.saturation(selectedClr),
        p.brightness(selectedClr),
        .2
      );
      return bgColor;
    }

    function fuzz(x = 0, y = 0, w = p.width, h = p.height, num = 140) {
      for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
          let p0 = p.createVector(p.map(i, 0, num-2, x, x + w), p.map(j, 0, num-2, y, y + h));
    
          const size = p.map(sizeNoiseFunc(p0.x / sizeNoiseResolution, p0.y / sizeNoiseResolution), 0, 1, minSize, maxSize);
    
          const angle1 = p.map(controlPointNoiseFunc1(p0.x / controlPointNoiseResolution1, p0.y / controlPointNoiseResolution1), 0, 1, 0, p.TWO_PI);
          const xOffset1 = p.cos(angle1) * size / 3;
          const yOffset1 = p.sin(angle1) * size / 3;
          const p1 = p.createVector(p0.x + xOffset1, p0.y + yOffset1);
    
          const angle2 = p.map(controlPointNoiseFunc2(p0.x / controlPointNoiseResolution2, p0.y / controlPointNoiseResolution2), 0, 1, 0, p.TWO_PI);
          const xOffset2 = p.cos(angle2) * size * 2/3;
          const yOffset2 = p.sin(angle2) * size * 2/3;
          const p2 = p.createVector(p0.x + xOffset2, p0.y + yOffset2);
    
          const angle3 = p.map(rotationNoiseFunc(p0.x / rotationNoiseResolution, p0.y / rotationNoiseResolution, 0, p0.x, p0.y), 0, 1, 0, p.TWO_PI);
          const xOffset3 = p.cos(angle3) * size;
          const yOffset3 = p.sin(angle3) * size;
          const p3 = p.createVector(p0.x + xOffset3, p0.y + yOffset3);
          const mid = p0.lerp(p3, .5);
          const clr = (colorArray[p.floor(p.map(colorNoiseFunc(mid.x / colorNoiseResolution, mid.y / colorNoiseResolution), 0, 1, 0, colorArray.length - .0000001))]);
          p.fill(clr!);
          p.bezier(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
      }
    }
    
    function getCustomNoiseFunc() {
      const x = 0;
      const y = 0;
      const w = p.width;
      const h = p.height;
      const terraces = p.floor(p.random(3, 8));
      const easingFunc = getRandomEasingFunction();
      const func1 = (xOff: number, yOff: number, zOff: number, x: number, y: number, centerX = p.width/2, centerY = p.height/2, startFadeDistance = 0, fullInDistance = p.height / 2) => {
        const d1 = p.constrain(p.map(p.dist(x, y, centerX, centerY), startFadeDistance, fullInDistance, 1, 0), 0, 1);  
        return p.map(p.noise(xOff, yOff) * easingFunc(d1), 0, 1, .5, 1);
      };
      const func2: NoiseFunction = (xOff, yOff, zOff) => {
        return p.ceil(p.noise(xOff, yOff, zOff) * terraces)/terraces;
      };
      const maxDist = p.dist(x, y, x + w, y + h);
      const exp = 1;
      return (xOff: number, yOff: number, zOff: number, x: number, y: number) => {
        const d = p.dist(x, y, 0, 0);
        return (
          (
            func1(xOff, yOff, zOff, x, y)
            * p.map(p.pow(d, exp), 0, p.pow(maxDist, exp), 1, 0)
          )
          +
          (
            func2(xOff, yOff, zOff)
            * p.map(p.pow(d, exp), 0, p.pow(maxDist, exp), 0, 1)
          )
        );
      };
    }
    
    function getNoiseFunc (): NoiseFunction {
      const terraces = p.floor(p.random(5, 10));
      const noiseOptions: NoiseFunction[] = [
        (xOff, yOff, zOff = 0) => {
          return p.noise(xOff, yOff, zOff)
        },
        (xOff, yOff, zOff = 0) => {
          function ridgeNoise(nx: number, ny: number, nz: number) {
            return 2 * (0.5 - p.abs(0.5 - p.noise(nx, ny, nz)));
          }
          return Math.pow(ridgeNoise(xOff, yOff, zOff), 5);
        },
        (xOff, yOff, zOff = 0) => {
          return p.ceil(p.noise(xOff, yOff, zOff) * terraces)/terraces;
        },
      ];
      return p.random(noiseOptions);
    }
    
    const easingFunctions: EasingFunctionsObject = {
      linear: (x) => {
        return x;
      },
      easeInOutQuad: (x) => {
        return x < 0.5 ? 2 * x * x : 1 - p.pow(-2 * x + 2, 2) / 2;
      },
      easeInQuad: (x) => {
        return x * x;
      },
      easeOutQuad: (x) => {
        return 1 - (1 - x) * (1 - x);
      },
      easeInBounce: (x) => {
        return 1 - easingFunctions.easeOutBounce!(1 - x);
      },
      easeOutBounce: (x) => {
        const n1 = 7.5625;
        const d1 = 2.75;
    
        if (x < 1 / d1) {
            return n1 * x * x;
        } else if (x < 2 / d1) {
            return n1 * (x -= 1.5 / d1) * x + 0.75;
        } else if (x < 2.5 / d1) {
            return n1 * (x -= 2.25 / d1) * x + 0.9375;
        } else {
            return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
      },
      easeInOutBounce: (x) => {
        return x < 0.5
        ? (1 - easingFunctions.easeOutBounce!(1 - 2 * x)) / 2
        : (1 + easingFunctions.easeOutBounce!(2 * x - 1)) / 2;
      },
      bounce: (x) => {
        if (x <= .5) {
          return x * 2;
        } else {
          return (.5 - (x - .5)) * 2;
        }
      }
    };
    
    function getRandomEasingFunction(): EasingFunction {
      return easingFunctions[p.random(Object.keys(easingFunctions))]!;
    }

    function getColorPalette(): p5.Color[] {
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
        PLAID_COUCH_FROM_70S: [
          '#FFCB47',
          '#A1770D',
          '#F0BB37',
          '#967B36',
          '#BD8802',
        ],
        THIN_JAMES: [
          '#40191D',
          '#E66A78',
          '#82333C',
          '#CC7680',
          '#8A0F1D',
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
      for (let c of selection) {
        palette.push(p.color(c));
      }
      return palette;
    }

    return {
      setup: (ctx) => {
        p = ctx.p;
        p.colorMode(p.HSB);
        p.noFill();
        p.noStroke();
        rotationNoiseFunc = getCustomNoiseFunc();
        controlPointNoiseFunc1 = getNoiseFunc();
        controlPointNoiseFunc2 = getNoiseFunc();
        colorNoiseFunc = getNoiseFunc();
        sizeNoiseFunc = getNoiseFunc();
        setNoiseResolutions();
        minSize = p.width / 100;
        maxSize = p.width / 25;
        colorArray = getColorPalette();
        bgColor = generateBackgroundColor();
      },
      draw: () => {
        p.background(bgColor);
        fuzz();
        p.noLoop();
      },
      windowResized: () => {
        setNoiseResolutions();
        fuzz();
      }
    }
  }
}