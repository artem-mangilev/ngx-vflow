import { signal, TemplateRef } from "@angular/core";
import { Position } from "../types/position.type";

export class ToolbarModel {
  public visible = signal(false)
  public position = signal<Position>('top')
  public template = signal<TemplateRef<unknown> | null>(null)
}
