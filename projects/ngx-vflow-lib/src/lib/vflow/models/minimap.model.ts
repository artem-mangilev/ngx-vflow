import { signal, TemplateRef } from "@angular/core";

export class MinimapModel {
  public template = signal<TemplateRef<unknown> | null>(null)
}
