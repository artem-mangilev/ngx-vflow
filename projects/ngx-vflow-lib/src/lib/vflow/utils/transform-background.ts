import { Background } from "../types/background.type";

export function transformBackground(background: Background | string): Background {
  return typeof background === 'string'
    ? { type: 'solid', color: background }
    : background
}
