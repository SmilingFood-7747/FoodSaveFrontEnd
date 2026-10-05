import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { UI } from '../../ui';
@Component({
  selector: 'app-not-found',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './not-found.css',
})
export class NotFound {}
