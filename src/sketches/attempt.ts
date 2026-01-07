import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

export const attempt: SketchDefinition = {
  id: 'attempt',
  name: 'Groove',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    let palette, bgColor;
    let oldWidth, oldHeight;
    const gradients = [];

    class Gradient {
      constructor(x, y, w, h, type, numColors) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.xSpeed = p.random();
        this.ySpeed = p.random();
        this.xDirection = p.random([-1, 1]);
        this.yDirection = p.random([-1, 1]);
        this.type = type;
        this.colors = [];
        for (let i = 0; i < numColors; i++) {
          this.colors.push(getRandomColor(this.colors));
        }
        this.gradient = p.drawingContext.createLinearGradient(x, y, x + w, y + h);
        for (let i = 0; i < this.colors.length; i++) {
          this.gradient.addColorStop(i / numColors, this.colors[i]);
        }
        if (this.type === 1) {
          if (this.w < 0) {
            this.x += this.w;
            this.w = -this.w;
          }
          if (this.h < 0) {
            this.y += this.h;
            this.h = -this.h;
          }
        }
      }

      step(amt = 0) {
        const f = amt / 10;
        this.x += f * this.xSpeed * this.xDirection;
        this.y += f * this.ySpeed * this.yDirection;
        if (this.x < -this.w/2 || this.x > p.width + this.w/2) { // TODO figure these out to keep shapes on screen
          this.xDirection *= -1;
        }
        if (this.y < -this.h/2 || this.y > p.height + this.h/2) {
          this.yDirection *= -1;
        }
      }
    
      draw() {
        p.push();
        p.drawingContext.fillStyle = this.gradient;
        if (this.type === 0) {
          p.rect(this.x, this.y, this.w, this.h, p.width / 64);
        } else if (this.type === 1) {
          p.ellipse(this.x, this.y, this.w, this.h);
        }
        p.pop();
      }

      resize() {
        const xScale = p.width / oldWidth;
        const yScale = p.height / oldHeight;
        this.x *= xScale;
        this.y *= yScale;
        this.w *= xScale;
        this.h *= yScale;
      }
    }
    
    function getRandomColor(otherColors) {
      let clr = p.random(palette);
      while (otherColors.includes(clr)) {
        clr = p.random(palette);
      }
      return clr;
    }
    
    function setColorPalette() {
      const colorPalettes = {
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
        FANTASTIC_THREE: [p.color('#2466A3'), p.color('#67F665'), p.color('#B454B6')]
      };
      const paletteName = p.random(Object.keys(colorPalettes));
      palette = colorPalettes[paletteName];
      bgColor = p.random(palette);
      for (let i = 0; i < palette.length; i++) {
        let c = p.color(palette[i]);
        let r = p.red(c);
        let g = p.green(c);
        let b = p.blue(c);
        c = p.color(r, g, b, 30);
        palette[i] = c;
      }
    }


    return {
      setup: (ctx) => {
        p = ctx.p;
        oldWidth = p.width;
        oldHeight = p.height;
        setColorPalette();
        p.noStroke();
        p.ellipseMode(p.CORNER);

        const numGradients = p.round(p.random(50, 100));
        const sd = p.min(p.width, p.height);
        for (let i = 0; i < numGradients; i++) {
          const x = sd * p.random(-.25, 1.25);
          const y = sd * p.random(-.25, 1.25);
          const w = p.abs(p.random(-p.abs(x), sd - p.abs(x)));
          const h = p.abs(p.random(-p.abs(y), sd - p.abs(y)));
          const numColors = p.floor(p.random(p.min(palette.length, 3), palette.length - .00001));
          if (p.random() < 0.33) {
            gradients.push(new Gradient(x, y, w, h, 0, numColors));
          } else {
            gradients.push(new Gradient(x, y, w, h, 1, numColors));
          }
  }
      },
      draw: () => {
        p.background(bgColor);
        for (let g of gradients) {
          g.draw();
          g.step(p.deltaTime);
        }
      },
      windowResized: () => {
        gradients.forEach((g) => g.resize());
        oldWidth = p.width;
        oldHeight = p.height;
      }
    }
  }
}