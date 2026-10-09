import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { UI } from '../../ui';
import { RouterOutlet } from '@angular/router';
import { ApiDatabase } from '../../../infrastructure/api-database';
@Component({
  selector: 'app-content',
  encapsulation: ViewEncapsulation.None,
  imports: [...UI, RouterOutlet],
  templateUrl: './content.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content.css',
})
export class Content {
  readonly database = inject(ApiDatabase);
}
