export type EdgeLabelType = 'html-template';
export type EdgeLabelPosition = 'start' | 'center' | 'end';

export interface EdgeLabel<T = unknown> {
  type: EdgeLabelType;
  data?: T;
}
