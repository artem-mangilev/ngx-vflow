import { signal, TemplateRef } from '@angular/core';

export class AlignmentHelperModel {
  public template = signal<TemplateRef<unknown> | null>(null);
}
