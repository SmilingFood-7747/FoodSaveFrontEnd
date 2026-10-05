import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UI } from '../../ui';
@Component({
  selector: 'app-not-found',
  imports: UI,
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './not-found.css',
})
export class NotFound {}
