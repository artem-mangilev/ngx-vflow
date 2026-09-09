export type EdgeLabelPosition = 'start' | 'center' | 'end';

export type EdgeLabel<T = unknown> = HtmlTemplateEdgeLabel<T>;

export interface HtmlTemplateEdgeLabel<T = unknown> {
  type: 'html-template';
  data?: T;
}
