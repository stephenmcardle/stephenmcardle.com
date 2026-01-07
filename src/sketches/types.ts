// sketches/types.ts
import type p5 from "p5";

export type Renderer = "p2d" | "webgl";

export type SketchContext = {
  p: p5;
  width: number;
  height: number;
  renderer: Renderer;
};

export type SketchInstance = {
  setup?: (ctx: SketchContext) => void;
  draw: (ctx: SketchContext) => void;
  windowResized?: (ctx: SketchContext) => void;
  dispose?: () => void;
};

export type SketchDefinition = {
  id: string;
  name: string,
  renderer: Renderer;
  create: () => SketchInstance;
};
