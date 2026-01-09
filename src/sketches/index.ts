import type { SketchDefinition } from './types';
import { bubbles } from '@/sketches/bubbles';
import { homeGradientShift } from '@/sketches/homeGradientShift';
import { gradientShift } from '@/sketches/gradientShift';
import { attempt } from '@/sketches/attempt';
import { patchwork } from '@/sketches/patchwork';
import { graphite } from '@/sketches/graphite';
import { fuzz } from '@/sketches/fuzz';

export const SKETCHES: SketchDefinition[] = [
  fuzz,
  graphite,
  patchwork,
  bubbles,
  gradientShift,
  attempt,
]

export function defaultSketch() {
  return homeGradientShift;
}

export function getSketchById(id: string) {
  return SKETCHES.find(s => s.id === id) ?? SKETCHES[0];
}