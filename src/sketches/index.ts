import type { SketchDefinition } from './types';
import { bubbles } from '@/sketches/bubbles';
import { homeGradientShift } from '@/sketches/homeGradientShift';
import { gradientShift } from '@/sketches/gradientShift';
import { patchwork } from '@/sketches/patchwork';
import { graphite } from '@/sketches/graphite';
import { fuzz } from '@/sketches/fuzz';
import { quest } from '@/sketches/quest';

export const SKETCHES: SketchDefinition[] = [
  gradientShift,
  quest,
  patchwork,
  fuzz,
  graphite,
  bubbles,
]

export function defaultSketch() {
  return homeGradientShift;
}

export function getSketchById(id: string) {
  return SKETCHES.find(s => s.id === id) ?? SKETCHES[0];
}