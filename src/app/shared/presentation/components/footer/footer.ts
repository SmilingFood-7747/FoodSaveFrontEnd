import { Component } from '@angular/core';
import { UI } from '../../ui';
@Component({
  selector: 'app-footer',
  imports: UI,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly year = new Date().getFullYear();
}
