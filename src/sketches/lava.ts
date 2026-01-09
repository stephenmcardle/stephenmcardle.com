import type p5 from 'p5';
import type { SketchDefinition, SketchInstance } from '@/sketches/types';

export const lava: SketchDefinition = {
  id: 'lava',
  name: 'Lava',
  renderer: 'webgl',
  create: (): SketchInstance => {
    let p!: p5;
    let theShader: p5.Shader;
    let colorPalette: number[][];

    function initializeShader() {
      const vertexShader = getVertexShader();
      const fragmentShader = getFragmentShader();
    
      theShader = p.createShader(vertexShader, fragmentShader);
    }
    
    function getVertexShader() {
      return `
      #ifdef GL_ES
      precision mediump float;
      #endif
      
      attribute vec3 aPosition;
      attribute vec2 aTexCoord;
      
      varying vec2 vTexCoord;
      
      void main() {
        vTexCoord = aTexCoord;
        vec4 positionVec4 = vec4(aPosition, 1.0);
        positionVec4.xy = positionVec4.xy * 2.0 - 1.0;
        gl_Position = positionVec4;
      
      }
      `;
    }
    
    function getFragmentShader() {
      const easingFunc = getEasingFunc();
      const noiseFunc = getNoiseFunc();
      const modValue = p.random(0.5, 1.5);
      const noiseCoordMult = p.random(['8.0', '12.0', '16.0']);
      return `
      #ifdef GL_ES
      precision mediump float;
      #endif
      
      #define PI 3.14159265359
      
      uniform vec2 u_resolution;
      uniform vec3 u_color;
      uniform float u_time;
      uniform vec3 u_color0;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      uniform vec3 u_color4;
      uniform vec3 u_color5;
      
      varying vec2 vTexCoord;
      
      ${easingFunc}
      ${noiseFunc}
      
      void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy;
      
        float nv = mod(noiseFunc(vec3(st.xy * ${noiseCoordMult}, u_time / 4.0)), ${modValue});
    
        vec3 color = u_color0 * (1.0 - nv);
        color = mix(color, u_color1 * (1.0 - abs(nv - 0.2)), 1.0);
        color = mix(color, u_color2 * (1.0 - abs(nv - 0.4)), 1.0);
        color = mix(color, u_color3 * (1.0 - abs(nv - 0.6)), 1.0);
        color = mix(color, u_color4 * (1.0 - abs(nv - 0.8)), 1.0);
        color = mix(color, u_color5 * (1.0 - abs(nv - 1.0)), 1.0);
    
        gl_FragColor = vec4(vec3(0.9) - color, 1.0);
      }
      `;
    }
    
    function getEasingFunc() {
      const arr = [
        'return 1.0 - cos((x * PI) / 2.0)',
        'return sin((x * PI) / 2.0)',
        'return -(cos(PI * x) - 1.0) / 2.0',
        'return 1.0 - (1.0 - x) * (1.0 - x)',
        'return (2.0 * x * x) * when_lt(x, 0.5) + (1.0 - pow(-2.0 * x + 2.0, 2.0) / 2.0) * when_gt(x, 0.5)',
      ]
      return `
      float when_lt(float x, float y) {
        return max(sign(y - x), 0.0);
      }
      
      float when_gt(float x, float y) {
        return max(sign(x - y), 0.0);
      }
    
      float when_ge(float x, float y) {
        return 1.0 - when_lt(x, y);
      }
    
      float easingFunc(float x) {
        ${p.random(arr)};
      }
      `;
    }
    
    function getNoiseFunc() {
      const perlin = getBaseNoiseFunc();
      const terraces = p.floor(p.random([p.random(4, 8), p.random(16, 32), p.random(54, 64)]));
      const octaveBase = '(baseNoiseFunc(P) + 0.5 * baseNoiseFunc(2.0 * P) + 0.25 * baseNoiseFunc(4.0 * P))';
      const cosMultiplier = p.random(2, 8);
      const sinMultiplier = p.random(2, 8);
      const arr = [
        'return baseNoiseFunc(P)', // classic
        'return 2.0 * (0.5 - abs(0.5 - baseNoiseFunc(P)))', // ridge
        `return ceil(baseNoiseFunc(P) * ${terraces}.0) / ${terraces}.0`, // terraces
        `return ${octaveBase} / (1.75)`, // octaves
        `
          float baseVal = baseNoiseFunc(P) * 30.0;
          float decimals = fract(baseVal);
          return (baseVal - (decimals * when_lt(decimals, 0.5)) + ((1.0 - decimals) * when_ge(decimals, 0.5))) / 30.0;
        `, // steps
        `return map(ceil((sin(P.x * ${sinMultiplier}) * cos(P.y * ${cosMultiplier}) + baseNoiseFunc(P) * 3.0) * ${terraces}.0) / ${terraces}.0, -1.0, 5.0, 0.0, 1.0);`, // sin & cos
      ]
      const selected = p.random(arr);
      return `
      ${perlin}
    
      float map(float value, float min1, float max1, float min2, float max2) {
        return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
      }
    
      float noiseFunc(vec3 P) {
        ${selected};
      }
      `
    }
    
    function getBaseNoiseFunc() {
      const noiseUtils = getNoiseUtils();
      return `
      ${noiseUtils}
      //
      //	Perlin Noise 3D  ( gradient noise )
      //	Return value range of -1.0->1.0
      //	http://briansharpe.files.wordpress.com/2011/11/perlinsample.jpg
      //
      float baseNoiseFunc( vec3 P )
      {
          //	establish our grid cell and unit position
          vec3 Pi = floor(P);
          vec3 Pf = P - Pi;
          vec3 Pf_min1 = Pf - 1.0;
      
      #if 1
          //
          //	classic noise.
          //	requires 3 random values per point.  with an efficent hash function will run faster than improved noise
          //
      
          //	calculate the hash.
          //	( various hashing methods listed in order of speed )
          vec4 hashx0, hashy0, hashz0, hashx1, hashy1, hashz1;
          FAST32_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );
          //SGPP_hash_3D( Pi, hashx0, hashy0, hashz0, hashx1, hashy1, hashz1 );
      
          //	calculate the gradients
          vec4 grad_x0 = hashx0 - 0.49999;
          vec4 grad_y0 = hashy0 - 0.49999;
          vec4 grad_z0 = hashz0 - 0.49999;
          vec4 grad_x1 = hashx1 - 0.49999;
          vec4 grad_y1 = hashy1 - 0.49999;
          vec4 grad_z1 = hashz1 - 0.49999;
          vec4 grad_results_0 = inversesqrt( grad_x0 * grad_x0 + grad_y0 * grad_y0 + grad_z0 * grad_z0 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x0 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y0 + Pf.zzzz * grad_z0 );
          vec4 grad_results_1 = inversesqrt( grad_x1 * grad_x1 + grad_y1 * grad_y1 + grad_z1 * grad_z1 ) * ( vec2( Pf.x, Pf_min1.x ).xyxy * grad_x1 + vec2( Pf.y, Pf_min1.y ).xxyy * grad_y1 + Pf_min1.zzzz * grad_z1 );
      
      #if 1
          //	Classic Perlin Interpolation
          vec3 blend = Interpolation_C2( Pf );
          vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );
          vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
          float final = dot( res0, blend2.zxzx * blend2.wwyy );
          final *= 1.1547005383792515290182975610039;		//	(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/sqrt(0.75)
          return final;
      #else
          //	Classic Perlin Surflet
          //	http://briansharpe.wordpress.com/2012/03/09/modifications-to-classic-perlin-noise/
          Pf *= Pf;
          Pf_min1 *= Pf_min1;
          vec4 vecs_len_sq = vec4( Pf.x, Pf_min1.x, Pf.x, Pf_min1.x ) + vec4( Pf.yy, Pf_min1.yy );
          float final = dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf.zzzz ) ), grad_results_0 ) + dot( Falloff_Xsq_C2( min( vec4( 1.0 ), vecs_len_sq + Pf_min1.zzzz ) ), grad_results_1 );
          final *= 2.3703703703703703703703703703704;		//	(optionally) scale things to a strict -1.0->1.0 range    *= 1.0/cube(0.75)
          return final;
      #endif
      
      #else
          //
          //	improved noise.
          //	requires 1 random value per point.  Will run faster than classic noise if a slow hashing function is used
          //
      
          //	calculate the hash.
          //	( various hashing methods listed in order of speed )
          vec4 hash_lowz, hash_highz;
          FAST32_hash_3D( Pi, hash_lowz, hash_highz );
          //BBS_hash_3D( Pi, hash_lowz, hash_highz );
          //SGPP_hash_3D( Pi, hash_lowz, hash_highz );
      
          //
          //	"improved" noise using 8 corner gradients.  Faster than the 12 mid-edge point method.
          //	Ken mentions using diagonals like this can cause "clumping", but we'll live with that.
          //	[1,1,1]  [-1,1,1]  [1,-1,1]  [-1,-1,1]
          //	[1,1,-1] [-1,1,-1] [1,-1,-1] [-1,-1,-1]
          //
          hash_lowz -= 0.5;
          vec4 grad_results_0_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_lowz );
          hash_lowz = abs( hash_lowz ) - 0.25;
          vec4 grad_results_0_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_lowz );
          vec4 grad_results_0_2 = Pf.zzzz * sign( abs( hash_lowz ) - 0.125 );
          vec4 grad_results_0 = grad_results_0_0 + grad_results_0_1 + grad_results_0_2;
      
          hash_highz -= 0.5;
          vec4 grad_results_1_0 = vec2( Pf.x, Pf_min1.x ).xyxy * sign( hash_highz );
          hash_highz = abs( hash_highz ) - 0.25;
          vec4 grad_results_1_1 = vec2( Pf.y, Pf_min1.y ).xxyy * sign( hash_highz );
          vec4 grad_results_1_2 = Pf_min1.zzzz * sign( abs( hash_highz ) - 0.125 );
          vec4 grad_results_1 = grad_results_1_0 + grad_results_1_1 + grad_results_1_2;
      
          //	blend the gradients and return
          vec3 blend = Interpolation_C2( Pf );
          vec4 res0 = mix( grad_results_0, grad_results_1, blend.z );
          vec4 blend2 = vec4( blend.xy, vec2( 1.0 - blend.xy ) );
          return dot( res0, blend2.zxzx * blend2.wwyy ) * (2.0 / 3.0);	//	(optionally) mult by (2.0/3.0) to scale to a strict -1.0->1.0 range
      #endif
      
      }
      `;
    }
    
    function getNoiseUtils() {
      const largeFloat1 = 100 * p.random(1, 10);
      const largeFloat2 = 100 * p.random(1, 10);
      const largeFloat3 = 100 * p.random(1, 10);
      return `
      void FAST32_hash_3D( vec3 gridcell, out vec4 lowz_hash, out vec4 highz_hash )	//	generates a random number for each of the 8 cell corners
      {
          //    gridcell is assumed to be an integer coordinate
      
          //	TODO: 	these constants need tweaked to find the best possible noise.
          //			probably requires some kind of brute force computational searching or something....
          const vec2 OFFSET = vec2( 50.0, 161.0 );
          const float DOMAIN = 69.0;
          // const float SOMELARGEFLOAT = 635.298681;
          const float SOMELARGEFLOAT = ${largeFloat1};
          const float ZINC = 48.500388;
      
          //	truncate the domain
          gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
          vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );
      
          //	calculate the noise
          vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
          P *= P;
          P = P.xzxz * P.yyww;
          highz_hash.xy = vec2( 1.0 / ( SOMELARGEFLOAT + vec2( gridcell.z, gridcell_inc1.z ) * ZINC ) );
          lowz_hash = fract( P * highz_hash.xxxx );
          highz_hash = fract( P * highz_hash.yyyy );
      }
      
      void FAST32_hash_3D( 	vec3 gridcell,
        out vec4 lowz_hash_0,
        out vec4 lowz_hash_1,
        out vec4 lowz_hash_2,
        out vec4 highz_hash_0,
        out vec4 highz_hash_1,
        out vec4 highz_hash_2	)		//	generates 3 random numbers for each of the 8 cell corners
      {
        //    gridcell is assumed to be an integer coordinate
      
        //	TODO: 	these constants need tweaked to find the best possible noise.
        //			probably requires some kind of brute force computational searching or something....
        const vec2 OFFSET = vec2( 50.0, 161.0 );
        const float DOMAIN = 69.0;
        // const vec3 SOMELARGEFLOATS = vec3( 635.298681, 682.357502, 668.926525 );
        const vec3 SOMELARGEFLOATS = vec3( ${largeFloat1}, ${largeFloat2}, ${largeFloat3} );
        const vec3 ZINC = vec3( 48.500388, 65.294118, 63.934599 );
      
        //	truncate the domain
        gridcell.xyz = gridcell.xyz - floor(gridcell.xyz * ( 1.0 / DOMAIN )) * DOMAIN;
        vec3 gridcell_inc1 = step( gridcell, vec3( DOMAIN - 1.5 ) ) * ( gridcell + 1.0 );
      
        //	calculate the noise
        vec4 P = vec4( gridcell.xy, gridcell_inc1.xy ) + OFFSET.xyxy;
        P *= P;
        P = P.xzxz * P.yyww;
        vec3 lowz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell.zzz * ZINC.xyz ) );
        vec3 highz_mod = vec3( 1.0 / ( SOMELARGEFLOATS.xyz + gridcell_inc1.zzz * ZINC.xyz ) );
        lowz_hash_0 = fract( P * lowz_mod.xxxx );
        highz_hash_0 = fract( P * highz_mod.xxxx );
        lowz_hash_1 = fract( P * lowz_mod.yyyy );
        highz_hash_1 = fract( P * highz_mod.yyyy );
        lowz_hash_2 = fract( P * lowz_mod.zzzz );
        highz_hash_2 = fract( P * highz_mod.zzzz );
      }
      
      vec3 Interpolation_C2( vec3 x ) { return x * x * x * (x * (x * 6.0 - 15.0) + 10.0); }
      `
    }
    
    function getColorPalette() {
      const arr = [
        [
          'ABAD5F',
          '81D1D4',
          'F52AEE',
          'C9CC81',
          'E7ED2F',
          '05E0E8',
        ],
        [
          '06207b',
          'fcfb00',
          'fed404',
          'fe71bf',
          'faf2b4',
          'fcb410',
          'fd8f02',
          '123ab3',
          '592309',
          'f50913'
        ],
        [
          'DACC3E',
          'BC2C1A',
          '7D1538',
          '5398BE',
          'F2CD5D',
          'DEA54B',
          'ACC196',
        ],
        [
          '609E8E',
          '9CBA70',
          '37FAC6',
          '92BA56',
          'D0D9D6',
          'B1E85E',
        ],
        [
          'E1EFF0',
          'FFAEA8',
          '5DBA63',
          '7F9799',
          '30EFFC',
          '9E2C97',
          'B55851',
        ],
      ];
      const colors = p.shuffle(p.random(arr));
      const vec3Colors: number[][] = [];
      for (let i = 0; i < colors.length; i++) {
        const c = colors[i];
        const subarr = [];
        subarr.push(p.round(parseInt(c.substr(0, 2), 16) / 255, 12));
        subarr.push(p.round(parseInt(c.substr(2, 2), 16) / 255, 12));
        subarr.push(p.round(parseInt(c.substr(4, 2), 16) / 255, 12));
        vec3Colors.push(subarr);
      }
      return vec3Colors;
    }

    return {
      setup: (ctx) => {
        p = ctx.p;
        initializeShader();
        colorPalette = getColorPalette();
        p.noStroke();
      },
      draw: () => {
        for (let i = 0; i < colorPalette.length; i++) {
          theShader.setUniform(`u_color${i}`, colorPalette[i]!);
        }
        theShader.setUniform('u_resolution', [p.width, p.height]);
        theShader.setUniform('u_time', p.millis() / 1000);
        p.shader(theShader);
        p.rect(0, 0, p.width, p.height);
      },
    }
  }
}