import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-content',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterOutlet],
  templateUrl: './content.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './content.css',
})
export class Content {}
