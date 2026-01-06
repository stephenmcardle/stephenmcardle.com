import type { SketchDefinition } from "./types";
import { bubbles } from "@/sketches/bubbles";
import { grid } from "@/sketches/grid";
import { gradientShift } from "@/sketches/gradientShift";
import { attempt } from '@/sketches/attempt';

export const SKETCHES: SketchDefinition[] = [
  bubbles,
  grid,
  gradientShift,
  attempt,
]

export function defaultSketch() {
  return gradientShift;
}

export function randomSketch() {
  return SKETCHES[Math.floor(Math.random() * SKETCHES.length)]!;
}
