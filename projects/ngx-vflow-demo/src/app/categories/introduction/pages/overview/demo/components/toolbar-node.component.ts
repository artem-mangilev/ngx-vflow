import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomNodeComponent, HandleComponent, NodeToolbarComponent } from 'ngx-vflow';

const emojis = ['🌞', '💡', '💻'];

@Component({
  template: `
    {{ emoji }}

    <handle type="target" position="left" />
    <handle type="source" position="right" />

    <node-toolbar>
      <div class="emoji-toolbar">
        @for (emoji of emojis; track $index) {
          <span (click)="selectEmoji(emoji)">{{ emoji }}</span>
        }
      </div>
    </node-toolbar>
  `,
  styles: [
    `
      :host {
        width: 150px;
        height: 100px;
        border: 1.5px solid #1b262c;
        border-radius: 5px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: black;
        background-color: white;
      }

      .emoji-toolbar {
        height: 25px;
        background-color: #122c26;
        border-radius: 5px;
        text-align: center;
        padding-left: 5px;
        padding-right: 5px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NodeToolbarComponent, HandleComponent],
})
export class ToolbarNodeComponent extends CustomNodeComponent {
  public emojis = emojis;
  public emoji = emojis[0];

  selectEmoji(emoji: string) {
    this.emoji = emoji;
  }
}
