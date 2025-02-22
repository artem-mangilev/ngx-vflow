export type EdgeLabelType = 'default' | 'html-template';
export type EdgeLabelPosition = 'start' | 'center' | 'end';

export type EdgeLabel<T = unknown> = TextEdgeLabel | HtmlTemplateEdgeLabel<T>;

interface TextEdgeLabel {
  type: 'default';
  text: string;
  style?: Partial<CSSStyleDeclaration>;
}

interface HtmlTemplateEdgeLabel<T = unknown> {
  type: 'html-template';
  data?: T;
}
