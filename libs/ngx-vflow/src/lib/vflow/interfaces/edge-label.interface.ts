export type EdgeLabelPosition = 'start' | 'center' | 'end';

/** Edge labels render through the `edgeLabelHtml` template; the presentation belongs to the consumer. */
export type EdgeLabel<T = unknown> = HtmlTemplateEdgeLabel<T>;

export interface HtmlTemplateEdgeLabel<T = unknown> {
  type: 'html-template';
  data?: T;
}
