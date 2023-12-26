import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ContainerStyleSheet, HtmlStyleSheet, VDocComponent, provideComponent } from 'projects/ngx-vflow-lib/src/public-api';

@Component({
  selector: '[app-form]',
  template: `
    <svg:foreignObject vdoc-html [styleSheet]="styles.header">
      <h3 class="header">Block title</h3>
    </svg:foreignObject>

    <svg:foreignObject vdoc-html [styleSheet]="styles.controls">
      <div>
        <label class="label">Input Label</label>
        <input type="text" class="text-input">

        <label class="label">Select Label</label>
        <select class="select">
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
        </select>
      </div>
    </svg:foreignObject>

    <svg:svg app-button [styleSheet]="styles.button" text="Action"></svg:svg>
  `,
  styles: [`
    .header {
      margin: 0;
      color: #FFFFFF;
      font: 0.8rem "Fira Sans", sans-serif;
      border-bottom: 1px solid #3C3C3C;
      padding-left: 10px;
      padding-right: 10px;
      padding-bottom: 5px;
      padding-top: 5px;
    }

    .text-input {
      box-sizing: border-box;
      width: 100%;
      height: 40px;
      background-color: #323232;
      border-radius: 5px;
      border: 1px solid #323232;
      font: 0.8rem "Fira Sans", sans-serif;
      color: #fff;
    }

    .select {
      display: block;
      box-sizing: border-box;
      width: 100%;
      height: 40px;
      background-color: #323232;
      border-radius: 5px;
      border: 1px solid #323232;
      color: #fff;
    }

    .label {
      color: #ADADAD;
      font: 0.6rem "Fira Sans", sans-serif;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideComponent(FormComponent)]
})
export class FormComponent extends VDocComponent {
  protected styles = styles
}

export const styles = {
  controls: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  } satisfies HtmlStyleSheet,

  header: {
    marginBottom: 5,
  } satisfies HtmlStyleSheet,

  button: {
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  } satisfies ContainerStyleSheet
}
