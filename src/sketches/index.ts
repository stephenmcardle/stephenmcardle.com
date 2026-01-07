import type { SketchDefinition } from "./types";
import { bubbles } from "@/sketches/bubbles";
import { gradientShift } from "@/sketches/gradientShift";
import { attempt } from '@/sketches/attempt';

export const SKETCHES: SketchDefinition[] = [
  bubbles,
  gradientShift,
  attempt,
]

export function defaultSketch() {
  return gradientShift;
}

export function getSketchById(id: string) {
  return SKETCHES.find(s => s.id === id) ?? SKETCHES[0];
}