import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { Header } from '../header/header';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, TranslatePipe, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  readonly menuOpen = signal(false);
}
