export type Background = ColorBackground | DotsBackground | ImageBackground | GridBackground;

export interface ColorBackground {
  type: 'solid';
}

export interface DotsBackground {
  type: 'dots';
  /**
   * Gap between dots
   */
  gap?: number;
}

export interface ImageBackground {
  type: 'image';
  /**
   * Path to image. Passes as a href to this element:
   *
   * https://developer.mozilla.org/en-US/docs/Web/SVG/Element/image
   */
  src: string;

  /**
   * If true, image will be fixed on the background (not moving with the flow, zoom also doesn't affect it)
   */
  fixed?: boolean;

  /**
   * If true, image will be repeated
   */
  repeat?: boolean;

  /**
   * Scale relative to natural image size.
   *
   * For example, if image is 100x100 and scale is 0.5, it will be rendered as 50x50
   */
  scale?: number;
}

export interface GridBackground {
  type: 'grid';

  /**
   * Size of the grid squares
   */
  size?: number;
}
