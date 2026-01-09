import type { SketchDefinition } from './types';
import { homeGradientShift } from '@/sketches/homeGradientShift';
import { gradientShift } from '@/sketches/gradientShift';
import { lava } from '@/sketches/lava';
import { lavaSmooth } from '@/sketches/lavaSmooth';
import { patchwork } from '@/sketches/patchwork';
import { graphite } from '@/sketches/graphite';
import { fuzz } from '@/sketches/fuzz';
import { quest } from '@/sketches/quest';

export const SKETCHES: SketchDefinition[] = [
  gradientShift,
  lava,
  lavaSmooth,
  quest,
  patchwork,
  fuzz,
  graphite,
]

export function defaultSketch() {
  return homeGradientShift;
}

export function getSketchById(id: string) {
  return SKETCHES.find(s => s.id === id) ?? SKETCHES[0];
}