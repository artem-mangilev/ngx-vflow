import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgDocPageLinkComponent } from '@ng-doc/app';
import { Octokit } from 'octokit';
import { from, map, Observable } from 'rxjs';

@Component({
  templateUrl: './roadmap-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, NgDocPageLinkComponent],
  styleUrl: './roadmap-list.component.scss',
})
export class RoadmapListComponent {
  private octokit = new Octokit();

  issues$ = this.getIssues();

  private getIssues(): Observable<any[]> {
    return from(
      this.octokit.request('GET /repos/{owner}/{repo}/issues', {
        owner: 'artem-mangilev',
        repo: 'ngx-vflow',
        state: 'open',
      }),
    ).pipe(
      map((response: any) => response.data as any[]),
      map((issues) => issues.filter((issue) => !!issue.labels.find((label: any) => label.name === 'enhancement'))),
    );
  }
}
