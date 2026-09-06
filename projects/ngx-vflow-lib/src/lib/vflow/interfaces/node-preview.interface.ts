/** @deprecated Canvas previews are no longer rendered. Retained for source compatibility. */
export interface NodePreview {
  style: Pick<Partial<CSSStyleDeclaration>, 'backgroundColor' | 'borderColor' | 'borderWidth' | 'borderRadius'>;
}
