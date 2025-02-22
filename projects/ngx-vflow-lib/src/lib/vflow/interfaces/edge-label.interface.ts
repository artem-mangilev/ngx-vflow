export type EdgeLabelType = 'default' | 'html-template';
export type EdgeLabelPosition = 'start' | 'center' | 'end';

export type EdgeLabel<T = unknown> = DefaultEdgeLabel | HtmlTemplateEdgeLabel<T>;

interface DefaultEdgeLabel {
  type: 'default';
  text: string;
  style?: Partial<CSSStyleDeclaration>;
}

interface HtmlTemplateEdgeLabel<T = unknown> {
  type: 'html-template';
  data?: T;
}
