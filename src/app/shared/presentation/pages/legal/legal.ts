import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../ui';
@Component({
  selector: 'app-legal',
  encapsulation: ViewEncapsulation.None,
  imports: UI,
  templateUrl: './legal.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './legal.css',
})
export class Legal {
  readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as 'terms' | 'privacy';
}
