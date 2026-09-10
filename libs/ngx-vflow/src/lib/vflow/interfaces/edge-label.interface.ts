export type EdgeLabelPosition = 'start' | 'center' | 'end';

export type EdgeLabel<T = unknown> = DefaultEdgeLabel | HtmlTemplateEdgeLabel<T>;

export interface DefaultEdgeLabel {
  type: 'default';
  text: string;
}

export interface HtmlTemplateEdgeLabel<T = unknown> {
  type: 'html-template';
  data?: T;
}
