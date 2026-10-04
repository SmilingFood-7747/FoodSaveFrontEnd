import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UI } from '../../ui';
@Component({
  selector: 'app-legal',
  imports: UI,
  templateUrl: './legal.html',
  styleUrl: './legal.css',
})
export class Legal {
  readonly kind = inject(ActivatedRoute).snapshot.data['kind'] as 'terms' | 'privacy';
}
