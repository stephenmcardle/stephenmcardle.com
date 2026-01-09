import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

type ColorPalettesObject = Record<string, string[]>;
type LinearGradientArgs = [number, number, number, number];
type RadialGradientArgs = [number, number, number, number, number, number];

export const homeGradientShift: SketchDefinition = {
  id: 'homeGradientShift',
  name: 'Shifting Gradients',
  renderer: 'webgl',
  create: (): SketchInstance => {
    let p!: p5;
    let bgImgShader: p5.Shader;
    let bufferShader: p5.Shader;
    let smearShader: p5.Shader;
    let bgImg: p5.Graphics;
    let sim0: p5.Framebuffer;
    let sim1: p5.Framebuffer;
    let col0: p5.Framebuffer;
    let col1: p5.Framebuffer;
    
    let palette: p5.Color[];
    let bgColor: p5.Color;
    let u_hueRotation: number
    let u_saturation: number
    let u_brightness: number;
    
    const layers: ShiftingGradient[] = [];

    let oldWidth: number;
    let oldHeight: number;
    const durations = [5000, 10000];

    function getNewFramebuffer() {
      const fb = p.createFramebuffer({ width: p.width, height: p.height });
      fb.begin();
      p.background(0);
      fb.end();
      return fb;
    }
    
    class ShiftingGradient {
      type = p.random([0, 1]);
      originalColors = palette;
      colors = [...this.originalColors];
      coords = new Coordinates(this.type);
      colorUpdateDuration = p.random(durations);
      stops: number[] = [];
      img = p.createGraphics(p.width, p.height);
      imgCtx: CanvasRenderingContext2D;
      gradient: CanvasGradient | null = null;
      constructor() {
        this.imgCtx = this.img.drawingContext as CanvasRenderingContext2D;
        for (let i = 0; i <= this.colors.length * 2; i++) {
          this.stops.push(i / this.colors.length / 2);
        }
        this.step(0);
      }
    
      setup() {
        if (this.type === 0) {
          this.gradient = this.imgCtx.createLinearGradient(...this.coords.linearGradientArgs);
        } else {
          this.gradient = this.imgCtx.createRadialGradient(...this.coords.radialGradientArgs);
        }
        for (let i = 0; i < this.stops.length; i++) {
          const clr = this.colors[i % this.colors.length]!;
          this.gradient.addColorStop(this.stops[i]!, clr.toString()!);
        }
      }
    
      step(elapsedTime: number) {
        const ratio = elapsedTime / this.colorUpdateDuration;
        this.updateColors(ratio % 1, p.floor(ratio));
        this.coords.step(elapsedTime);
        this.setup();
      }
    
      shiftStops() {
        for (let i = 0; i < this.stops.length; i++) {
          let amt = 1 / this.colors.length * p.random(-.01, .01);
          let check = this.stops[i]! + amt;
          while (
            check < 0
            || check > 1
            || (this.stops[i - 1] !== undefined && check < this.stops[i - 1]!)
            || (this.stops[i + 1] !== undefined && check > this.stops[i + 1]!)
          ) {
            amt = 1 / this.colors.length * p.random(-.01, .01);
            check = this.stops[i]! + amt;
          }
          this.stops[i] += amt;
        }
      }
    
      updateColors(amt: number, offset: number) {
        if (amt < 0) {
          amt = 1 + amt;
        }
        this.colors = [];
        for (let i = 0; i < this.originalColors.length; i++) {
          let ind = i + offset;
          if (ind < 0) {
            ind = this.originalColors.length - (p.abs(ind) % this.originalColors.length);
          }
          const c1 = this.originalColors[(ind) % this.originalColors.length]!;
          const c2 = this.originalColors[(ind + 1) % this.originalColors.length]!;
          this.colors.push(p.lerpColor(c1, c2, amt));
        }
        this.colors.push(p.lerpColor(this.colors[0]!, this.colors[this.originalColors.length - 1]!, .5));
      }
    
      draw() {
        this.img.clear();
        this.imgCtx.fillStyle = this.gradient!;
        this.imgCtx.fillRect(0, 0, p.width, p.height);
        return this.img;
      }

      resize() {
        const pg = p.createGraphics(p.width, p.height);
        const oldPg = this.img;
        this.img = pg;
        this.imgCtx = this.img.drawingContext as CanvasRenderingContext2D;
        this.coords.resize();
        this.draw();
        oldPg.remove();
      }
    }

    class Coordinates {
      type: number;
      positionDuration = p.random(durations);
      xDir = p.random([-1, 1]);
      yDir = p.random([-1, 1]);
      positionOffset = p.random(9999);

      maxXShiftFactor = p.random();
      maxYShiftFactor = p.random();
      maxXShift: number;
      maxYShift: number;

      radiusDuration = p.random(durations);
      radiusDir = p.random([-1, 1]);
      radiusOffset = p.random(9999);
      maxRShiftFactor = p.random();
      maxRShift: number;

      x0 = 0;
      y0 = 0;
      x1 = 0;
      y1 = 0;
      r0 = 0;
      r1 = 0;

      linearGradientArgs: LinearGradientArgs = [0, 0, 0, 0];
      radialGradientArgs: RadialGradientArgs = [0, 0, 0, 0, 0, 0];

      constructor(type: number) {
        const dim = p.min(p.width, p.height);
        this.type = type;
        
        this.maxXShift = this.maxXShiftFactor * dim;
        this.maxYShift = this.maxYShiftFactor * dim;

        
        this.maxRShift = this.maxRShiftFactor * (dim / 2);

        if (this.type === 0) {
          this.x0 = p.random(-dim / 8, 0);
          this.y0 = p.random(-dim / 8, 0);
          this.x1 = p.random(dim, dim * 9/8);
          this.y1 = p.random(dim, dim * 9/8);
        } else {
          this.x0 = p.random(dim);
          this.y0 = p.random(dim);
          this.r0 = p.random(dim / 64, dim / 8);
          this.r1 = p.random(dim, dim * 1.5);
        }

        this.setArgs();
      }

      setArgs(xShift = 0, yShift = 0, rShift = 0) {
          this.linearGradientArgs = [
            this.x0 + xShift,
            this.y0 + yShift,
            this.x1 + xShift,
            this.y1 + yShift
          ];
          this.radialGradientArgs = [
            this.x0 + xShift,
            this.y0 + yShift,
            p.max(this.r0 + rShift, 0),
            this.x0 + xShift,
            this.y0 + yShift,
            p.max(this.r1 + rShift, 0)
          ];
      }

      step(elapsedTime: number) {
        const xShift = p.sin((elapsedTime + this.positionOffset) / this.positionDuration) * this.maxXShift * this.xDir;
        const yShift = p.cos((elapsedTime + this.positionOffset) / this.positionDuration) * this.maxYShift * this.yDir;
        const rShift = p.sin((elapsedTime + this.radiusOffset) / this.radiusDuration) * this.maxRShift * this.radiusDir;
        this.setArgs(xShift, yShift, rShift);
      }

      resize() {
        const dim = p.min(p.width, p.height);
        this.maxXShift = this.maxXShiftFactor * dim;
        this.maxYShift = this.maxYShiftFactor * dim;
        this.maxRShift = this.maxRShiftFactor * (dim / 2);
        this.x0 *= p.width / oldWidth;
        this.x1 *= p.width / oldWidth;
        this.y0 *= p.height / oldHeight;
        this.y1 *= p.height / oldHeight;
      }
    }

    function setupColors() {
      palette = getColorPalette();
      bgColor = p.random(palette);
      u_hueRotation = p.random();
      u_saturation = p.random(.7, 3);
      u_brightness = p.random(.8, 2);
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
        FANTASTIC_THREE: [
          '#2466A3',
          '#67F665',
          '#B454B6'
        ],
      };
      const selection = colorPalettes[p.random(Object.keys(colorPalettes))]!;
      const palette = [];
      for (const c of selection) {
        palette.push(p.color(c));
      }
      return palette;
    }
    
    // Shaders
    const vertSrc = `
    #ifdef GL_ES
    precision highp float;
    #endif
    
    attribute vec3 aPosition;
    attribute vec2 aTexCoord;
    
    varying vec2 vTexCoord;
    
    void main() {
      vTexCoord = aTexCoord;
      vTexCoord.y = 1.0 - vTexCoord.y;
      vec4 positionVec4 = vec4(aPosition, 1.0);
      positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
      gl_Position = positionVec4;
    }
    `;
    
    const bgImgFragSrc = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    #define PI 3.1415
    
    varying vec2 vTexCoord;
    uniform sampler2D tex0;
    uniform sampler2D tex1;
    uniform sampler2D tex2;
    uniform sampler2D tex3;
    uniform sampler2D tex4;
    uniform sampler2D tex5;
    uniform sampler2D tex6;
    uniform sampler2D tex7;
    uniform float u_saturation;
    uniform float u_brightness;
    uniform float u_hueRotation;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    
    vec4 blend(vec4 clr1, vec4 clr2) {
    
      float a1 = clr1.a;
      float a2 = clr2.a;
      float aFinal = (a1 + a2 - a1*a2);
    
      float ra1 = clr1.r * a1;
      float ra2 = clr2.r * a2;
      float ga1 = clr1.g * a1;
      float ga2 = clr2.g * a2;
      float ba1 = clr1.b * a1;
      float ba2 = clr2.b * a2;
    
      // difference
      float red = (ra1 + ra2 - 2.0 * min( ra1*a2, ra2*a1 )) * aFinal;
      float green = (ga1 + ga2 - 2.0 * min( ga1*a2, ga2*a1 )) * aFinal;
      float blue = (ba1 + ba2 - 2.0 * min( ba1*a2, ba2*a1 )) * aFinal;
    
      return vec4(red, green, blue, aFinal);
    }
    
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    
    vec3 filterColor(vec3 color) {
      return vec3(mod(color.x + u_hueRotation, 1.0), min(color.y * u_saturation, 1.0), min(color.z * u_brightness, 1.0));
    }
    
    vec4 convolute(sampler2D tex, mat3 kernel) {
      vec4 color = vec4(0);
      const vec3 direction = vec3(-1.0, 0.0, 1.0);    
      for (int x = 0; x < 3; x++) {
        for (int y = 0; y < 3; y++) {
          vec2 offset = vec2(direction[x], direction[y]) / u_resolution.xy;
          color += texture2D(tex, vTexCoord+offset) * kernel[x][y];
        }
      }
      return color;
    }
    
    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 st = fragCoord / u_resolution;

      vec4 clr0 = texture2D(tex0, vTexCoord);
      vec4 clr1 = texture2D(tex1, vTexCoord);
      vec4 clr2 = texture2D(tex2, vTexCoord);
      vec4 clr3 = texture2D(tex3, vTexCoord);
      vec4 clr4 = texture2D(tex4, vTexCoord);
      vec4 clr5 = texture2D(tex5, vTexCoord);
      vec4 clr6 = texture2D(tex6, vTexCoord);
      vec4 clr7 = texture2D(tex7, vTexCoord);
        
      // mat3 sharpen = mat3(0, -1, 0, -1, 5, -1, 0, -1, 0);
      // mat3 gaussianBlur = mat3(1, 2, 1, 2, 4, 2, 1, 2, 1) * 0.0625;
      // mat3 boxBlur = mat3(1, 1, 1, 1, 1, 1, 1, 1, 1) * 0.1111;
    
      // mat3 kernel = sharpen;
    
      // vec4 clr0 = convolute(tex0, kernel);
      // vec4 clr1 = convolute(tex1, kernel);
      // vec4 clr2 = convolute(tex2, kernel);
      // vec4 clr3 = convolute(tex3, kernel);
      // vec4 clr4 = convolute(tex4, kernel);
      // vec4 clr5 = convolute(tex5, kernel);
      // vec4 clr6 = convolute(tex6, kernel);
      // vec4 clr7 = convolute(tex7, kernel);
        
      vec4 color = clr0;
      color = blend(color, clr1);
      color = blend(color, clr2);
      color = blend(color, clr3);
      color = blend(color, clr4);
      color = blend(color, clr5);
      color = blend(color, clr6);
      color = blend(color, clr7);
    
      vec3 hsvColor = rgb2hsv(color.rgb);
      hsvColor = filterColor(hsvColor);
      vec4 rgbColor = vec4(hsv2rgb(hsvColor), color.a);

      rgbColor = vec4(rgbColor.r, clamp(rgbColor.g, 0.0, 0.8), rgbColor.ba);
      
      gl_FragColor = rgbColor;
    }
    `;

    const bufferFragSrc = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec2 vTexCoord;
    uniform sampler2D u_prev;
    uniform vec2 u_resolution;
    uniform float u_delta;
    uniform float u_frame;
    uniform vec4 u_mouse;
    uniform float u_dt;

    void main() {
      vec2 uv = vTexCoord;
      uv.y = 1.0 - uv.y;
      vec2 fragCoord = uv * u_resolution;

      vec2 texelSize = 1.0 / u_resolution;

      if (u_frame < 0.5) {
        gl_FragColor = vec4(0.0);
        return;
      }

      vec4 data = texture2D(u_prev, uv);
      float pressure = data.x;
      float pVel = data.y;

      // float vDamp = exp(-6.0 * u_dt);
      // float pDamp = exp(-4.0 * u_dt);

      // pVel *= vDamp;
      // pressure *= pDamp;

      float p_left = texture2D(u_prev, uv + vec2(texelSize.x, 0.0)).x;
      float p_right = texture2D(u_prev, uv - vec2(texelSize.x, 0.0)).x;
      float p_up = texture2D(u_prev, uv + vec2(0.0, texelSize.y)).x;
      float p_down = texture2D(u_prev, uv - vec2(0.0, texelSize.y)).x;

      if (fragCoord.x < 1.0) p_left = p_right;
      if (fragCoord.x > u_resolution.x - 1.0) p_right = p_left;
      if (fragCoord.y < 1.0) p_down = p_up;
      if (fragCoord.y > u_resolution.y - 1.0) p_up = p_down;

      pVel += u_delta * (-2.0 * pressure + p_right + p_left) / 4.0;
      pVel += u_delta * (-2.0 * pressure + p_up + p_down) / 4.0;

      pressure += u_delta * pVel;

      pVel -= 0.005 * u_delta * pressure;

      pVel *= 1.0 - 0.002 * u_delta;
      pressure *= 0.999;

      vec2 grad = vec2((p_right - p_left) * 0.5, (p_up - p_down) * 0.5);

      vec4 outClr = vec4(pressure, pVel, grad.x, grad.y);

      if (u_mouse.z > 0.5) {
        float dist = distance(fragCoord, u_mouse.xy);
        if (dist <= 20.0) {
          outClr += 1.0 - dist / 20.0;
        }
      }

      gl_FragColor = outClr;
    }
    `;

    // const renderFragSrc = `
    // #ifdef GL_ES
    // precision highp float;
    // #endif

    // varying vec2 vTexCoord;
    // uniform sampler2D u_data;
    // uniform sampler2D u_tex;
    // uniform vec2 u_resolution;

    // void main() {
    //   vec2 uv = vTexCoord;

    //   vec4 data = texture2D(u_data, uv);

    //   vec4 clr = texture2D(u_tex, uv + 0.08 * data.zw);

    //   vec3 normal = normalize(vec3(-data.z, 0.2, -data.w));
    //   vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));
    //   float spec = pow(max(0.0, dot(normal, lightDir)), 30.0);

    //   clr += vec4(1.0) * (0.25 * spec);
    //   gl_FragColor = clr;

    // }
    // `;

    const smearFragSrc = `
    #ifdef GL_ES
    precision highp float;
    #endif

    varying vec2 vTexCoord;
    uniform sampler2D u_data;
    uniform sampler2D u_bg;
    uniform sampler2D u_prevColor;
    uniform vec2 u_resolution;

    uniform float u_smearStrength;
    uniform float u_deposit;
    uniform float u_fade;

    void main() {
      vec2 uv = vTexCoord;
      uv.y = 1.0 - uv.y;
      
      vec4 data = texture2D(u_data, uv);

      vec2 flow = data.zw;

      flow *= u_smearStrength;

      vec2 texelSize = 1.0 / u_resolution;
      vec2 offset = flow * texelSize;

      vec4 advected = 
        0.5 * texture2D(u_prevColor, uv - 1.0*offset);
        0.3 * texture2D(u_prevColor, uv - 2.0*offset);
        0.2 * texture2D(u_prevColor, uv - 3.0*offset);

      vec4 fresh = texture2D(u_bg, uv);

      // float paint = clamp(abs(data.x) * 0.8, 0.0, 1.0);
      vec4 clr = advected * u_fade;
      clr = mix(clr, fresh, u_deposit);

      clr.rgb *= u_fade;
      clr.rgb = pow(clr.rgb, vec3(1.02));

      gl_FragColor = clr;
    }
    `;

    return {
      setup: (ctx) => {
        p = ctx.p;
        oldWidth = p.width;
        oldHeight = p.height;
        setupColors();
        p.smooth();
        for (let i = 0; i < 8; i++) {
          const sg = new ShiftingGradient();
          sg.step(0);
          layers.push(sg);
        }
        bgImg = p.createGraphics(p.width, p.height, p.WEBGL);
        bgImgShader = bgImg.createShader(vertSrc, bgImgFragSrc);

        sim0 = getNewFramebuffer();
        sim1 = getNewFramebuffer();
        col0 = getNewFramebuffer();
        col1 = getNewFramebuffer();

        bufferShader = p.createShader(vertSrc, bufferFragSrc);
        smearShader = p.createShader(vertSrc, smearFragSrc);
      },
      draw: () => {
        p.clear();

        // Update and draw gradients
        for (const l of layers) {
          l.step(p.millis()/12);
          l.draw();
        }

        // Image pass
        bgImg.background(bgColor);
        for (let i = 0; i < layers.length; i++) {
          bgImgShader.setUniform(`tex${i}`, layers[i]!.img);
        }
        bgImgShader.setUniform('u_hueRotation', u_hueRotation);
        bgImgShader.setUniform('u_saturation', u_saturation);
        bgImgShader.setUniform('u_brightness', u_brightness);
        bgImgShader.setUniform('u_resolution', [p.width, p.height]);
        bgImg.shader(bgImgShader);
        bgImg.rect(0, 0, p.width, p.height);


        // Sim pass
        const isMousePressed = p.mouseIsPressed ? 1.0: 0.0;
        sim1.begin();
        p.shader(bufferShader);
        bufferShader.setUniform('u_prev', sim0);
        bufferShader.setUniform('u_resolution', [p.width, p.height]);
        bufferShader.setUniform('u_frame', p.frameCount - 1);
        bufferShader.setUniform('u_delta', 1.4);
        bufferShader.setUniform('u_mouse', [p.mouseX, p.mouseY, isMousePressed, 0.0]);
        bufferShader.setUniform('u_dt', p.deltaTime / 1000);
        p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
        sim1.end();

        [sim0, sim1] = [sim1, sim0];

        // Smear pass      
        col1.begin();
        p.shader(smearShader);
        smearShader.setUniform('u_data', sim0);
        smearShader.setUniform('u_prevColor', col0);
        smearShader.setUniform('u_bg', bgImg);
        smearShader.setUniform('u_resolution', [p.width, p.height]);
        smearShader.setUniform('u_smearStrength', 1.2);
        smearShader.setUniform('u_deposit', 0.06);
        smearShader.setUniform('u_fade', 0.985);
        p.rect(-p.width / 2, -p.height / 2, p.width, p.height);
        col1.end();

        [col0, col1] = [col1, col0];

        // Display pass
        p.resetShader();
        p.image(col0, -p.width/2, -p.height/2, p.width, p.height);
      },
      windowResized: () => {
        for (const l of layers) {
          l.resize();
        }
        sim0.resize(p.width, p.height);
        sim1.resize(p.width, p.height);
        col0.resize(p.width, p.height);
        col1.resize(p.width, p.height);
        oldWidth = p.width;
        oldHeight = p.height;
      },
      dispose: () => {
        for (const l of layers) {
          l.img.remove();
        }
        sim0.remove();
        sim1.remove();
        col0.remove();
        col1.remove();
      }
    }
  }
}
