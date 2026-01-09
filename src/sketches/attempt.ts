import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

type ColorPalettesObject = Record<string, string[]>;

export const attempt: SketchDefinition = {
  id: 'attempt',
  name: 'Groove',
  renderer: 'p2d',
  create: (): SketchInstance => {
    let p!: p5;
    let ctx2d!: CanvasRenderingContext2D;
    let palette: p5.Color[] = [];
    let bgColor: p5.Color;
    let oldWidth: number, oldHeight: number;
    const gradients: Gradient[] = [];

    class Gradient {
      x: number;
      y: number;
      w: number;
      h: number;
      type: number;
      xSpeed = p.random();
      ySpeed = p.random();
      xDirection = p.random([-1, 1]);
      yDirection = p.random([-1, 1]);
      colors: p5.Color[] = [];
      gradient: CanvasGradient;

      constructor(x: number, y: number, w: number, h: number, type: number, numColors: number) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.type = type;
        for (let i = 0; i < numColors; i++) {
          this.colors.push(getRandomColor(this.colors));
        }
        this.gradient = ctx2d.createLinearGradient(x, y, x + w, y + h);
        for (let i = 0; i < this.colors.length; i++) {
          this.gradient.addColorStop(i / numColors, this.colors[i]!.toString());
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
        const f = amt / 50;
        this.x += f * this.xSpeed * this.xDirection;
        this.y += f * this.ySpeed * this.yDirection;
        if (this.x < -this.w/2 || this.x > p.width + this.w/2) {
          this.xDirection *= -1;
        }
        if (this.y < -this.h/2 || this.y > p.height + this.h/2) {
          this.yDirection *= -1;
        }
      }
    
      draw() {
        p.push();
        ctx2d.fillStyle = this.gradient;
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
    
    function getRandomColor(otherColors: p5.Color[]) {
      let clr = p.random(palette);
      while (otherColors.includes(clr)) {
        clr = p.random(palette);
      }
      return clr;
    }
    
    function setColorPalette() {
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
      const paletteName = p.random(Object.keys(colorPalettes));
      const selected = colorPalettes[paletteName]!;
      bgColor = p.color(p.random(selected));
      for (let i = 0; i < selected.length; i++) {
        let c = p.color(selected[i]!);
        let r = p.red(c);
        let g = p.green(c);
        let b = p.blue(c);
        c = p.color(r, g, b, 30);
        palette.push(c);
      }
    }


    return {
      setup: (ctx) => {
        p = ctx.p;
        ctx2d = p.drawingContext as CanvasRenderingContext2D;
        oldWidth = p.width;
        oldHeight = p.height;
        setColorPalette();
        p.noStroke();
        p.ellipseMode(p.CORNER);

        const numGradients = p.round(p.random(32, 48));
        console.log(numGradients)
        const sd = p.min(p.width, p.height);
        for (let i = 0; i < numGradients; i++) {
          let x = sd * p.random(-.25, 1.25);
          let y = sd * p.random(-.25, 1.25);
          const w = p.width * p.random(.1, .4) * p.random([-1, 1]);
          const h = w * p.random(.6, 1.4) * p.random([-1, 1]);
          if (x + w < 0) {
            x = 1;
          }
          if (x - w > p.width) {
            x = p.width - 1;
          }
          if (y + h < 0) {
            y = 1;
          }
          if (y - h > p.height) {
            y = p.height - 1;
          }
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
    }
  }
}