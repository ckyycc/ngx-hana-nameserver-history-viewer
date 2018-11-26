import { ColorRgba } from '../types';


function _randomColorFactor(): number {
  return Math.round(Math.random() * 255);
}

/**
 * generate random color
 * @param opacity alpha
 */
export function randomColor(opacity: number): string {
  return 'rgba(' + _randomColorFactor() + ',' + _randomColorFactor() + ',' + _randomColorFactor() + ',' + (opacity || '.3') + ')';
}

/**
 * generate the rgba string from ColorRgba
 */
export function getColorString(rgbaColor: ColorRgba): string {
  return `rgba(${rgbaColor['red']}, ${rgbaColor['green']}, ${rgbaColor['blue']}, ${rgbaColor['alpha']})`;
}
