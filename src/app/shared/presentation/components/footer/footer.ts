import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UI } from '../../ui';
@Component({
  selector: 'app-footer',
  imports: UI,
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.css',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
