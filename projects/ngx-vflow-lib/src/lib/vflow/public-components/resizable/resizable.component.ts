import { Component, Directive, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NodeComponent } from '../../components/node/node.component';

@Component({
  selector: '[resizable]',
  templateUrl: './resizable.component.html'
})
export class ResizableComponent implements OnInit {
  private parentNode = inject(NodeComponent)

  @ViewChild('resizer', { static: true })
  private resizer!: TemplateRef<unknown>

  protected get model() {
    return this.parentNode.nodeModel
  }


  public ngOnInit(): void {
    this.model.resizable.set(true)
    this.model.resizerTemplate.set(this.resizer)
  }
}
