import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

export const fuzz: SketchDefinition = {
  id: 'fuzz',
  name: 'Fuzz',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    const rotationNoiseResolution = 120; // TODO figure out why some outputs look very similar
    const controlPointNoiseResolution1 = 500;
    const controlPointNoiseResolution2 = 500;
    const strokeNoiseResolution = 100;
    const sizeNoiseResolution = 180;
    let rotationNoiseFunc;
    let controlPointNoiseFunc1;
    let controlPointNoiseFunc2;
    let strokeNoiseFunc;
    let sizeNoiseFunc;
    let minSize;
    let maxSize;

    function fuzz(x, y, w, h, num, colorArray) {
      num = p.sqrt(num);
      for (let i = 0; i < num; i++) {
        for (let j = 0; j < num; j++) {
          let p0 = p.createVector(p.map(i, 0, num, x, x + w), p.map(j, 0, num, y, y + h));
          while (!arePointsInsideRect(x, y, w, h, [p0])) {
            p0 = getRandomVector();
          }
    
          const size = p.map(sizeNoiseFunc(p0.x / sizeNoiseResolution, p0.y / sizeNoiseResolution), 0, 1, minSize, maxSize);
    
          const angle1 = p.map(controlPointNoiseFunc1(p0.x / controlPointNoiseResolution1, p0.y / controlPointNoiseResolution1), 0, 1, 0, p.TWO_PI);
          const xOffset1 = p.cos(angle1) * size / 3;
          const yOffset1 = p.sin(angle1) * size / 3;
          const p1 = p.createVector(p0.x + xOffset1, p0.y + yOffset1);
    
          const angle2 = p.map(controlPointNoiseFunc1(p0.x / controlPointNoiseResolution2, p0.y / controlPointNoiseResolution2), 0, 1, 0, p.TWO_PI);
          const xOffset2 = p.cos(angle2) * size * 2/3;
          const yOffset2 = p.sin(angle2) * size * 2/3;
          const p2 = p.createVector(p0.x + xOffset2, p0.y + yOffset2);
    
          const angle3 = p.map(rotationNoiseFunc(p0.x / rotationNoiseResolution, p0.y / rotationNoiseResolution, 0, p0.x, p0.y), 0, 1, 0, p.TWO_PI);
          // console.log(angle3);
          const xOffset3 = p.cos(angle3) * size;
          const yOffset3 = p.sin(angle3) * size;
          const p3 = p.createVector(p0.x + xOffset3, p0.y + yOffset3);
          // const mid = p0.lerp(p3, .5);
          // stroke(colorArray[floor(p.map(strokeNoiseFunc(mid.x / strokeNoiseResolution, mid.y / strokeNoiseResolution), 0, 1, 0, colorArray.length - .0000001))]);
          // line(p0.x, p0.y, p3.x, p3.y);
          // let clr = color(random(255), random(255), random(255));
          const clr = p.random(colorArray);
          p.fill(clr);
          p.stroke(clr);
          p.bezier(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
        }
      }
    }

    function getRandomVector() {
      return p.createVector(p.random(p.width), p.random(p.height));
    }
    
    function arePointsInsideRect(x, y, w, h, pArray) {
      for (let i = 0; i < pArray.length; i++) {
        const p = pArray[i];
        if (p.x < x || p.x > x + w || p.y < y || p.y > y + h) {
    
          return false;
        }
      }
      return true;
    }
    
    function getCustomNoiseFunc(x, y, w, h) {
      // const terraces = floor(random(5, 10));
      const terraces = 5;
      // const func1 = (xOff, yOff, zOff) => {
      //   function ridgeNoise(nx, ny, nz) {
      //     return 2 * (0.5 - abs(0.5 - noise(nx, ny, nz)));
      //   }
      //   return Math.pow(ridgeNoise(xOff, yOff, zOff), 5);
      // };
      // const func1 = noise;
      const easingFunc = getRandomEasingFunction();
      const func1 = (xOff, yOff, zoff, x, y, centerX = p.width/2, centerY = p.height/2, startFadeDistance = 0, fullInDistance = p.height / 2) => {
        const d1 = p.constrain(p.map(p.dist(x, y, centerX, centerY), startFadeDistance, fullInDistance, 1, 0), 0, 1);  
        // console.log(xOff, yOff, zoff, x, y, centerX = width/2, centerY = height/2, startFadeDistance = height/4, fullInDistance = height * 5/12);
        return p.map(p.noise(xOff, yOff) * easingFunc(d1), 0, 1, .5, 1);
      };
      const func2 = (xOff, yOff, zOff) => {
        return p.ceil(p.noise(xOff, yOff, zOff) * terraces)/terraces;
      };
      // const func2 = noise;
      const maxDist = p.dist(x, y, x + w, y + h);
      const exp = 1;
      return (xoff, yoff, zoff, x, y) => {
        const d = p.dist(x, y, 0, 0);
        return func1(xoff, yoff, zoff, x, y) * p.map(p.pow(d, exp), 0, p.pow(maxDist, exp), 1, 0) + func2(xoff, yoff, zoff) * p.map(p.pow(d, exp), 0, p.pow(maxDist, exp), 0, 1);
      };
    }
    
    function getNoiseFunc() {
      const terraces = p.floor(p.random(5, 10));
      // const easingFunc = random(easingFunctions);
      const noiseOptions = [
        (xOff, yOff, zOff) => {
          return p.noise(xOff, yOff, zOff)
        },
        (xOff, yOff, zOff) => {
          function ridgeNoise(nx, ny, nz) {
            return 2 * (0.5 - p.abs(0.5 - p.noise(nx, ny, nz)));
          }
          return Math.pow(ridgeNoise(xOff, yOff, zOff), 5);
        },
        (xOff, yOff, zOff) => {
          return p.ceil(p.noise(xOff, yOff, zOff) * terraces)/terraces;
        },
      ];
      return p.random(noiseOptions);
    }
    
    const easingFunctions = {
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
        return 1 - easingFunctions.easeOutBounce(1 - x);
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
        ? (1 - easingFunctions.easeOutBounce(1 - 2 * x)) / 2
        : (1 + easingFunctions.easeOutBounce(2 * x - 1)) / 2;
      },
      bounce: (x) => {
        if (x <= .5) {
          return x * 2;
        } else {
          return (.5 - (x - .5)) * 2;
        }
      }
    };
    
    function getRandomEasingFunction() {
      return easingFunctions[p.random(Object.keys(easingFunctions))];
    }

    return {
      setup: (ctx) => {
        p = ctx.p;
        p.colorMode(p.HSB);
        p.noFill();
        p.stroke(0);
        const x = 0;
        const y = 0;
        const w = p.width - x * 2;
        const h = p.height - y * 2;
        rotationNoiseFunc = getCustomNoiseFunc(x, y, w, h);
        controlPointNoiseFunc1 = getNoiseFunc();
        controlPointNoiseFunc2 = getNoiseFunc();
        strokeNoiseFunc = getNoiseFunc();
        sizeNoiseFunc = getNoiseFunc();
        minSize = p.width / 100;
        maxSize = p.width / 25;
        // strokeWeight(3);
        const num = 25600;
        // const colorArray = [color(255, 0, 255), color(0, 0, 255)];
        const colorArray = [];
        const numColors = 8;
        // colorArray.push(0);
        for (let i = 0; i < numColors; i++) {
          // colorArray.push(color(map(i, 0, numColors, 0, 360), 100, 100));
          colorArray.push(p.color(p.random(220, 320), p.random(50, 100), p.random(50, 100)));
        }
        p.background(255);
        fuzz(x, y, w, h, num, colorArray);
      },
      draw: () => {
      }
    }
  }
}